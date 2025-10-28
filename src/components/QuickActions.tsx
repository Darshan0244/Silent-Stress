import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Heart, TrendingUp, Sparkles, Activity, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface QuickActionsProps {
  onClose?: () => void;
}

export default function QuickActions({ onClose }: QuickActionsProps) {
  const [moodScore, setMoodScore] = useState([5]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: moodLogs, error } = await supabase
        .from("mood_logs")
        .select("sentiment_score, sentiment_label")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (moodLogs && moodLogs.length > 0) {
        const avgScore = moodLogs.reduce((acc, log) => acc + (log.sentiment_score || 0), 0) / moodLogs.length;
        const labels = moodLogs.map(l => l.sentiment_label);
        const positiveCount = labels.filter(l => l === "positive").length;
        const negativeCount = labels.filter(l => l === "negative" || l === "distress").length;

        setStats({
          averageMood: avgScore,
          totalEntries: moodLogs.length,
          positiveRatio: (positiveCount / moodLogs.length) * 100,
          negativeRatio: (negativeCount / moodLogs.length) * 100,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const logQuickMood = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const normalizedScore = (moodScore[0] - 5) / 5; // Convert 0-10 to -1 to 1
      let label = "neutral";
      if (moodScore[0] >= 7) label = "positive";
      else if (moodScore[0] <= 3) label = "negative";

      await supabase.from("mood_logs").insert({
        user_id: user.id,
        sentiment_score: normalizedScore,
        sentiment_label: label,
        triggers: ["quick_mood_log"],
      });

      toast({
        title: "Mood logged",
        description: "Your mood has been recorded successfully",
      });

      loadStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const performWellnessCheck = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: recentMoods } = await supabase
        .from("mood_logs")
        .select("sentiment_label")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      let recommendation = "You're doing great! Keep up the positive momentum.";
      
      if (recentMoods && recentMoods.length > 0) {
        const negativeCount = recentMoods.filter(
          m => m.sentiment_label === "negative" || m.sentiment_label === "distress"
        ).length;

        if (negativeCount >= 3) {
          recommendation = "I've noticed some challenging moments lately. Consider taking time for mindfulness or journaling.";
        } else if (negativeCount >= 2) {
          recommendation = "Mixed emotions are normal. Try a short breathing exercise to center yourself.";
        }
      }

      toast({
        title: "Wellness Check Complete",
        description: recommendation,
        duration: 6000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return "😊";
    if (score >= 6) return "🙂";
    if (score >= 4) return "😐";
    if (score >= 2) return "😟";
    return "😢";
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Mood Score Card */}
      <Card className="border-2 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <CardTitle>Track Your Mood</CardTitle>
          </div>
          <CardDescription>How are you feeling right now?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-2">{getMoodEmoji(moodScore[0])}</div>
            <div className="text-2xl font-bold">{moodScore[0]}/10</div>
          </div>
          <Slider
            value={moodScore}
            onValueChange={setMoodScore}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Very Low</span>
            <span>Excellent</span>
          </div>
          <Button
            onClick={logQuickMood}
            disabled={loading}
            className="w-full shadow-soft"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Mood"}
          </Button>
        </CardContent>
      </Card>

      {/* Wellness Check */}
      <Card className="border-2 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <CardTitle>Quick Wellness Check</CardTitle>
          </div>
          <CardDescription>Get instant insights on your recent emotional patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={performWellnessCheck}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Perform Check"}
          </Button>
        </CardContent>
      </Card>

      {/* Stats Card */}
      {stats && (
        <Card className="border-2 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Your Mood Insights</CardTitle>
            </div>
            <CardDescription>Based on your recent activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Mood</span>
              <span className="font-semibold">
                {(stats.averageMood * 5 + 5).toFixed(1)}/10
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Entries</span>
              <span className="font-semibold">{stats.totalEntries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Positive Moments</span>
              <span className="font-semibold text-positive">
                {stats.positiveRatio.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Challenging Moments</span>
              <span className="font-semibold text-warning">
                {stats.negativeRatio.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      <Card className="border-2 shadow-card bg-gradient-calm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Personalized Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            {stats && stats.negativeRatio > 50
              ? "🧘‍♀️ Try a 5-minute mindfulness meditation to help center yourself"
              : stats && stats.positiveRatio > 70
              ? "🌟 You're doing amazing! Keep nurturing these positive habits"
              : "📝 Journaling about your day can help process emotions"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
