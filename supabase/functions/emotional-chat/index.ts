import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, image } = await req.json();
    console.log('Received chat request for conversation:', conversationId);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // System prompt for emotional support and sentiment analysis
    const systemPrompt = `You are a compassionate AI emotional wellness companion designed to provide empathetic support while analyzing emotional states.

Your responsibilities:
1. Listen actively and respond with genuine empathy
2. Analyze the emotional tone of each message
3. Provide supportive, non-judgmental responses
4. Suggest appropriate interventions when distress is detected
5. Track emotional patterns over conversations

Response Guidelines:
- Be warm, understanding, and never dismissive
- Ask thoughtful follow-up questions
- Validate emotions without offering quick fixes
- Use calming, supportive language
- If severe distress is detected, gently suggest professional help

Emotional State Analysis:
After each user message, internally assess:
- Sentiment: negative (-1.0) to positive (1.0)
- Emotional labels: positive, neutral, negative, distress
- Key triggers or themes
- Suggested interventions: music, journaling, mindfulness, breathing, professional_help

Remember: You're a supportive friend who truly listens, not a therapist. Your goal is to provide comfort and guide users toward helpful resources.`;

    // Prepare messages with image if provided
    const chatMessages = messages.map((msg: any) => ({ ...msg }));
    if (image) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage && lastMessage.role === "user") {
        lastMessage.content = [
          { type: "text", text: lastMessage.content },
          { type: "image_url", image_url: { url: image } }
        ];
      }
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response from AI');
    }

    // Analyze sentiment of the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const sentimentAnalysis = await analyzeSentiment(lastUserMessage, LOVABLE_API_KEY);

    console.log('Chat response generated successfully');
    console.log('Sentiment analysis:', sentimentAnalysis);

    return new Response(
      JSON.stringify({
        message: aiMessage,
        sentiment: sentimentAnalysis,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in emotional-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeSentiment(text: string, apiKey: string) {
  try {
    // Use AI to analyze sentiment with structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a sentiment analysis expert. Analyze the emotional tone of text and respond with ONLY a JSON object in this exact format:
{
  "score": <number between -1.0 and 1.0>,
  "label": "<positive|neutral|negative|distress>",
  "triggers": [<array of emotional triggers detected>],
  "suggested_intervention": "<music|journaling|mindfulness|breathing|professional_help|none>"
}

Distress indicators: suicidal thoughts, self-harm mentions, severe depression/anxiety, crisis language.
Score guide: -1.0 (severe distress) to 0 (neutral) to 1.0 (very positive)`
          },
          {
            role: 'user',
            content: `Analyze this message: "${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('Sentiment analysis API error:', response.status);
      return getDefaultSentiment();
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || '{}';
    
    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultSentiment();
    
    // Validate and normalize the analysis
    return {
      score: Math.max(-1, Math.min(1, analysis.score || 0)),
      label: ['positive', 'neutral', 'negative', 'distress'].includes(analysis.label) 
        ? analysis.label 
        : 'neutral',
      triggers: Array.isArray(analysis.triggers) ? analysis.triggers : [],
      suggested_intervention: analysis.suggested_intervention || 'none',
    };
    
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return getDefaultSentiment();
  }
}

function getDefaultSentiment() {
  return {
    score: 0,
    label: 'neutral',
    triggers: [],
    suggested_intervention: 'none',
  };
}