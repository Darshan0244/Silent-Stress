import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Heart, LogOut, Plus, MessageSquare } from "lucide-react";
import ChatInterface from "./ChatInterface";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations((data || []) as Conversation[]);
      
      if (data && data.length > 0) {
        setCurrentConversation(data[0].id);
      }
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: "New Conversation",
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversations((prev) => [data as Conversation, ...prev]);
      setCurrentConversation(data.id);
      
      toast({
        title: "New conversation",
        description: "Started a new conversation",
      });
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back whenever you need support",
    });
  };

  return (
    <div className="flex h-screen bg-gradient-hero">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card/95 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-calm flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Silent Stress</h1>
              <p className="text-sm text-muted-foreground">Wellness Companion</p>
            </div>
          </div>
          <Button onClick={createNewConversation} className="w-full shadow-soft">
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant={currentConversation === conv.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentConversation(conv.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="truncate">{conv.title}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <ChatInterface conversationId={currentConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Heart className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Welcome to The Silent Stress</h2>
              <p className="text-muted-foreground mb-6">
                Your personal emotional wellness companion. Start a new conversation to begin.
              </p>
              <Button onClick={createNewConversation} size="lg" className="shadow-soft">
                <Plus className="w-5 h-5 mr-2" />
                Start Your First Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}