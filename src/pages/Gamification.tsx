import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGamificationState } from "@/lib/gamification";
import { useNavigate } from "react-router-dom";
import { Sparkles, Flame, Trophy, Lock, Star, Crown, MessageSquare } from "lucide-react";

export default function Gamification() {
  const nav = useNavigate();
  const state = useGamificationState();
  const levelLocks = [
    { id: "theme_ocean", title: "Ocean Theme", need: 3 },
    { id: "theme_forest", title: "Forest Theme", need: 5 },
    { id: "pattern_boxed", title: "Boxed Breathing Pro", need: 7 },
    { id: "sound_presets", title: "Sound Preset Pack", need: 9 },
  ];
  const conv = state.conversationStreak || 0;
  const convMilestones = [3, 7, 14];
  const nextConv = convMilestones.find((m) => conv < m) ?? convMilestones[convMilestones.length - 1];
  const convPct = Math.min(100, Math.round((conv / nextConv) * 100));

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="border-b bg-card/95 backdrop-blur-sm p-3 flex items-center justify-between">
        <Button variant="ghost" onClick={() => nav(-1)}>← Back</Button>
        <div className="font-semibold inline-flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Progress & Rewards
        </div>
        <div className="w-[64px]" />
      </div>

      <div className="container mx-auto px-4 py-4 flex-1">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Stats with glow */}
          <Card className="relative overflow-hidden border-0 shadow-soft">
            <span className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 blur-lg bg-gradient-to-br from-primary/30 via-fuchsia-500/20 to-emerald-500/20" />
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Journey
              </CardTitle>
              <CardDescription>Levels, XP, and streaks update as you practice</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="Level" value={state.level} icon={<Crown className="w-4 h-4" />} />
                <StatTile label="XP" value={state.xp} icon={<Star className="w-4 h-4" />} />
                <StatTile label="Activity Streak" value={`${state.streak}d`} icon={<Flame className="w-4 h-4" />} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3 mt-3">
                <StatTile label="Conversation Streak" value={`${state.conversationStreak || 0}d`} icon={<MessageSquare className="w-4 h-4" />} />
                <div className="p-3 rounded-lg border bg-card/80">
                  <div className="text-xs text-muted-foreground mb-1">Badges</div>
                  <div className="flex flex-wrap gap-2">
                    {state.badges.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No badges yet</span>
                    ) : (
                      state.badges.map((b) => (
                        <span key={b} className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(147,51,234,0.25)]">{b}</span>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-card/80">
                  <div className="text-xs text-muted-foreground mb-1">Tips</div>
                  <ul className="text-xs space-y-1">
                    <li>• Do a breathing cycle to earn XP</li>
                    <li>• Play an ambient sound</li>
                    <li>• Place emojis in ZenGarden</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unlockables with locks and glow */}
          <Card className="relative overflow-hidden border-0 shadow-soft">
            <span className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 blur-lg bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-fuchsia-500/20" />
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Unlockables
              </CardTitle>
              <CardDescription>Level up to unlock cosmetics and features</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid gap-3 sm:grid-cols-2">
                {levelLocks.map((lk) => {
                  const unlocked = state.level >= lk.need;
                  return (
                    <div key={lk.id} className={`p-3 rounded-lg border bg-card/80 relative ${unlocked ? "ring-1 ring-primary/40 shadow-[0_0_18px_rgba(34,197,94,0.35)]" : "opacity-90"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium">{lk.title}</div>
                        {unlocked ? (
                          <span className="text-xs text-emerald-500">Unlocked</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Lv {lk.need}</span>
                        )}
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${unlocked ? "bg-emerald-500" : "bg-primary/40"}`} style={{ width: `${Math.min(100, Math.round((state.level / lk.need) * 100))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quests with richer visuals */}
          <Card className="relative overflow-hidden border-0 shadow-soft lg:col-span-2">
            <span className="pointer-events-none absolute -inset-1 rounded-2xl opacity-60 blur-lg bg-gradient-to-br from-fuchsia-500/20 via-primary/25 to-emerald-500/20" />
            <CardHeader>
              <CardTitle>Daily Calm Quests</CardTitle>
              <CardDescription>Complete micro-quests to earn XP</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid gap-3 sm:grid-cols-3">
                {state.quests.map((q) => {
                  const pct = Math.round((q.progress / q.target) * 100);
                  const done = pct >= 100;
                  return (
                    <div key={q.id} className={`p-4 rounded-xl border bg-card/80 ${done ? "ring-1 ring-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.35)]" : "hover:shadow-[0_0_18px_rgba(147,51,234,0.3)]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{q.title}</div>
                        <div className={`text-xs ${done ? "text-emerald-500" : "text-muted-foreground"}`}>{q.progress}/{q.target}</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${done ? "bg-emerald-500" : "bg-primary/60"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Conversation Streak - Dedicated Section (moved below quests), full-width, amber theme */}
          <Card className="relative overflow-hidden border border-blue-500/30 shadow-soft lg:col-span-2">
            <span className="pointer-events-none absolute -inset-1 rounded-2xl opacity-50 blur-lg bg-gradient-to-br from-amber-400/20 via-orange-300/15 to-yellow-300/15" />
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                Chatbot Conversation Streak
              </CardTitle>
              <CardDescription>Keep the habit of checking in. Milestones unlock badges.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="p-4 rounded-xl border bg-card/80 flex items-center gap-3 min-w-[220px]">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/15 text-amber-300 inline-flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                    <div className="text-3xl font-semibold">{conv}d</div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="text-xs text-muted-foreground mb-1">Progress to next milestone ({nextConv}d)</div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${convPct}%` }} />
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {convMilestones.map((m) => (
                      <span key={m} className={`px-2 py-1 rounded-full text-xs border ${conv >= m ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" : "bg-amber-400/10 text-amber-300 border-amber-400/25"}`}>
                        {m}d {conv >= m ? "Unlocked" : "Locked"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg border bg-card/80 relative">
      <div className="absolute -inset-0.5 rounded-lg pointer-events-none opacity-30 blur-md bg-gradient-to-br from-primary/30 via-fuchsia-500/25 to-emerald-500/25" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
