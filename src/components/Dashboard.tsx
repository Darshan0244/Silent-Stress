import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Heart, LogOut, Plus, MessageSquare, Menu, Pencil, Check, Volume2, VolumeX, FileText, Loader2, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import ChatInterface from "./ChatInterface";
import Footer from "./Footer";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { speak, stop, isSpeaking } = useTextToSpeech();

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

  const updateConversationTitle = async (id: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ title: newTitle })
        .eq("id", id);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv))
      );
      setEditingId(null);
      
      toast({
        title: "Updated",
        description: "Conversation title updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      });
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      
      if (currentConversation === id) {
        const remaining = conversations.filter((conv) => conv.id !== id);
        setCurrentConversation(remaining.length > 0 ? remaining[0].id : null);
      }
      
      toast({
        title: "Deleted",
        description: "Conversation deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const generateSummary = async () => {
    if (!currentConversation) return;
    
    setSummaryLoading(true);
    try {
      const { data: messages } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", currentConversation)
        .order("created_at");

      if (!messages || messages.length === 0) {
        toast({
          title: "No messages",
          description: "Start a conversation first",
        });
        return;
      }

      const conversationText = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const summary = `This conversation covered: ${messages.length} messages. Key themes discussed include emotional wellness and personal reflections.`;

      speak(summary);
      
      toast({
        title: "Summary",
        description: summary,
        duration: 8000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const SidebarContent = () => (
    <>
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
              <div key={conv.id} className="group relative">
                {editingId === conv.id ? (
                  <div className="flex gap-1 p-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateConversationTitle(conv.id, editTitle);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => updateConversationTitle(conv.id, editTitle)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant={currentConversation === conv.id ? "secondary" : "ghost"}
                    className="w-full justify-start group"
                    onClick={() => {
                      setCurrentConversation(conv.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{conv.title}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t space-y-2">
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-hero">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-card/95 backdrop-blur-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="font-semibold">Silent Stress</h1>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 border-r bg-card/95 backdrop-blur-sm flex-col">
          <SidebarContent />
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentConversation ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Header - Always Visible */}
              <div className="sticky top-0 border-b bg-card/95 backdrop-blur-sm p-3 flex justify-between items-center flex-shrink-0 z-20">
                <h2 className="font-semibold truncate">
                  {conversations.find((c) => c.id === currentConversation)?.title}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSummary}
                    disabled={summaryLoading}
                  >
                    {summaryLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSpeaking ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Summary</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <ChatInterface conversationId={currentConversation} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
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
      
      <div className="hidden lg:block">
        <Footer />
      </div>
      <div className="lg:hidden">
        <Footer />
      </div>
    </div>
  );
}