import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Send, Loader2, Heart, Volume2, VolumeX, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentiment_score?: number;
  sentiment_label?: string;
  created_at: string;
}

interface ChatInterfaceProps {
  conversationId: string;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Save user message
      const { data: savedMessage, error: saveError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "user",
          content: userMessage,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setMessages((prev) => [...prev, savedMessage as Message]);

      // Get AI response with sentiment analysis
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        "emotional-chat",
        {
          body: {
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: userMessage },
            ],
            conversationId,
          },
        }
      );

      if (functionError) throw functionError;

      const { message: aiResponse, sentiment } = functionData;

      // Save AI message with sentiment
      const { data: aiMessage, error: aiError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "assistant",
          content: aiResponse,
        })
        .select()
        .single();

      if (aiError) throw aiError;

      setMessages((prev) => [...prev, aiMessage as Message]);

      // Log mood if significant emotional content detected
      if (sentiment && sentiment.label !== "neutral") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("mood_logs").insert({
            user_id: user.id,
            sentiment_score: sentiment.score,
            sentiment_label: sentiment.label,
            triggers: sentiment.triggers,
          });
        }

        // Create intervention suggestion if needed
        if (sentiment.suggested_intervention !== "none" && user) {
          const interventionTitles: Record<string, string> = {
            music: "Listen to Calming Music",
            journaling: "Try Journaling Your Thoughts",
            mindfulness: "5-Minute Mindfulness Exercise",
            breathing: "Deep Breathing Exercise",
            professional_help: "Consider Professional Support",
          };

          await supabase.from("interventions").insert({
            user_id: user.id,
            intervention_type: sentiment.suggested_intervention,
            title: interventionTitles[sentiment.suggested_intervention],
            description: `Based on our conversation, this might help you feel better.`,
          });
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground">
                Share what's on your mind. I'm here to listen.
              </p>
            </div>
          )}
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`p-4 ${
                message.role === "user"
                  ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                  : "mr-auto max-w-[80%] bg-card"
              } shadow-card border transition-all duration-300`}
            >
              <div className="flex items-start gap-3">
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-calm flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed flex-1">{message.content}</p>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => {
                      if (isSpeaking) {
                        stop();
                      } else {
                        speak(message.content);
                      }
                    }}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message... (Press Enter to send)"
            disabled={loading}
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-[60px] w-[60px] shadow-soft"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}