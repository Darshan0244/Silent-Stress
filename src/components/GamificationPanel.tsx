import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loadGamification } from "@/lib/gamification";

function useGamificationLive() {
  const [state, setState] = useState(() => loadGamification());
  useEffect(() => {
    const onUpdate = () => setState(loadGamification());
    window.addEventListener("gamification:update", onUpdate);
    return () => window.removeEventListener("gamification:update", onUpdate);
  }, []);
  return state;
}

export default function GamificationPanel() {
  const state = useGamificationLive();
  const nextLevelXp = useMemo(() => {
    const currLevel = state.level;
    const currBase = (currLevel - 1) * (currLevel - 1) * 100;
    const nextBase = (currLevel) * (currLevel) * 100;
    const intoLevel = Math.max(0, state.xp - currBase);
    const span = Math.max(1, nextBase - currBase);
    const pct = Math.max(0, Math.min(100, Math.round((intoLevel / span) * 100)));
    return { pct, intoLevel, span };
  }, [state.level, state.xp]);

  return (
    <Card className="border-0 shadow-soft lg:col-span-2">
      <CardHeader>
        <CardTitle>Progress</CardTitle>
        <CardDescription>Your daily calm journey at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="p-3 rounded-lg border bg-card/80">
            <div className="text-xs text-muted-foreground">Streak</div>
            <div className="text-2xl font-semibold">{state.streak}d</div>
          </div>
          <div className="p-3 rounded-lg border bg-card/80">
            <div className="text-xs text-muted-foreground">Level</div>
            <div className="text-2xl font-semibold">{state.level}</div>
          </div>
          <div className="p-3 rounded-lg border bg-card/80">
            <div className="text-xs text-muted-foreground">XP</div>
            <div className="text-2xl font-semibold">{state.xp}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-1">Level progress</div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${nextLevelXp.pct}%` }} />
          </div>
        </div>

        {state.badges.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Badges</div>
            <div className="flex flex-wrap gap-2">
              {state.badges.map((b) => (
                <span key={b} className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">{b}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Daily Calm Quests</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {state.quests.map((q) => {
              const pct = Math.round((q.progress / q.target) * 100);
              return (
                <div key={q.id} className="p-3 rounded-lg border bg-card/80">
                  <div className="text-sm font-medium mb-1">{q.title}</div>
                  <div className="text-xs text-muted-foreground mb-1">{q.progress}/{q.target}</div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
