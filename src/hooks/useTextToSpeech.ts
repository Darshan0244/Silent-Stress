import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text.trim()) {
      return;
    }

    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use a natural-sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      voice => voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      // Only show error if it's not a cancellation
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        toast({
          title: "Speech error",
          description: "Failed to play text-to-speech",
          variant: "destructive",
        });
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
}
