import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Waves, Trees, Leaf, Wind, ArrowUp, ArrowDown, Pause, Play } from "lucide-react";
import { recordEvent } from "@/lib/gamification";

export default function AnxietyRelief() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <BreathingPatterns />
        <AmbientSounds />
        <MoodPlayground />
      </div>
    </div>
  );
}

function BreathingPatterns() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    const runCycle = () => {
      setPhase("inhale");
      timerRef.current = window.setTimeout(() => {
        setPhase("hold");
        timerRef.current = window.setTimeout(() => {
          setPhase("exhale");
          timerRef.current = window.setTimeout(() => {
            recordEvent("breathing_cycle");
            runCycle();
          }, 4000);
        }, 2000);
      }, 4000);
    };

    runCycle();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [running]);

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-emerald-500/10 border-0 shadow-soft">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" />
          <CardTitle>Breathing Patterns</CardTitle>
        </div>
        <CardDescription>Inhale 4s • Hold 2s • Exhale 4s</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
              {/* Core */}
              <div
                className={`absolute inset-1 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 opacity-90 transition-transform duration-700 ease-out flex items-center justify-center ${
                  phase === "inhale" ? "scale-105" : phase === "hold" ? "scale-100" : "scale-95"
                }`}
              >
                {phase === "inhale" && <ArrowUp className="w-8 h-8 text-white drop-shadow" />}
                {phase === "hold" && <Pause className="w-8 h-8 text-white drop-shadow" />}
                {phase === "exhale" && <ArrowDown className="w-8 h-8 text-white drop-shadow" />}
              </div>
              {/* Waves */}
              <div
                className={`absolute inset-0 rounded-full border border-cyan-400/40 blur-[1px] transition-all duration-700 ease-out ${
                  phase === "inhale" ? "scale-110 opacity-70" : phase === "hold" ? "scale-105 opacity-60" : "scale-95 opacity-40"
                }`}
              />
              <div
                className={`absolute inset-0 rounded-full border border-cyan-300/30 blur-[2px] transition-all duration-700 ease-out ${
                  phase === "inhale" ? "scale-130 opacity-60" : phase === "hold" ? "scale-120 opacity-50" : "scale-100 opacity-35"
                }`}
              />
              <div
                className={`absolute inset-0 rounded-full border border-cyan-200/20 blur-[3px] transition-all duration-700 ease-out ${
                  phase === "inhale" ? "scale-150 opacity-40" : phase === "hold" ? "scale-135 opacity-35" : "scale-110 opacity-25"
                }`}
              />
            </div>
            <div className="text-center mt-3 font-medium capitalize">{phase}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={running ? "secondary" : "default"} onClick={() => {
              setRunning((r) => {
                const next = !r;
                if (next) recordEvent("breathing_start");
                return next;
              });
            }}>
              {running ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" onClick={() => { setRunning(false); setPhase("inhale"); }}>Reset</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MoodPlayground() {
  // Combined mood slider + emoji playground (no AI)
  const [mood, setMood] = useState<number>(50);
  const palette = ["🌸", "🌳", "🪨", "✨"];
  const [current, setCurrent] = useState<string>(palette[0]);
  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; ch: string }>>([]);
  const nextId = useRef(1);
  const labels = ["Very Low", "Low", "Neutral", "Good", "Calm"];
  const emojis = ["😞", "😕", "😐", "🙂", "😌"];
  const idx = Math.max(0, Math.min(4, Math.round(mood / 25)));
  const label = labels[idx];
  const face = emojis[idx];
  const hue = 0 + (160 * (mood / 100));
  const bg = `linear-gradient(135deg, hsla(${hue},80%,60%,0.22), hsla(${hue + 20},80%,50%,0.12))`;

  const addAt = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setItems((prev) => [...prev, { id: nextId.current++, x, y, ch: current }]);
    recordEvent("emoji_place");
  };

  return (
    <Card className="border-0 shadow-soft lg:col-span-2" style={{ background: bg }}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M7 20c5 0 10-4 10-10V4l-3 3-3-3-3 3-3-3v6c0 6 5 10 10 10" />
                </svg>
              </span>
              ZenGarden
            </CardTitle>
            <CardDescription>Adjust mood and place emojis to create your calming scene.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            {palette.map((p) => (
              <Button key={p} size="sm" variant={current === p ? "secondary" : "outline"} onClick={() => setCurrent(p)}>
                <span className="text-lg leading-none">{p}</span>
              </Button>
            ))}
            <Button variant="destructive" size="sm" onClick={() => setItems([])}>Erase All</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-2xl" aria-label={label}>{face}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
        <div className="cursor-grab active:cursor-grabbing mb-3">
          <Slider value={[mood]} min={0} max={100} step={1} onValueChange={(v) => setMood(v[0] ?? 50)} />
        </div>
        <div
          className="relative h-48 sm:h-56 rounded-lg border bg-gradient-to-br from-blue-500/5 to-purple-500/5 overflow-hidden"
          onClick={addAt}
        >
          {items.map((it) => (
            <span
              key={it.id}
              className="absolute select-none"
              style={{ left: it.x, top: it.y, transform: "translate(-50%, -50%)", fontSize: 24 }}
            >
              {it.ch}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AmbientSounds() {
  const [stopAllSignal, setStopAllSignal] = useState(0);
  return (
    <Card className="bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-0 shadow-soft">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Calming Soundscape</CardTitle>
            <CardDescription>Play relaxing ambient sounds to unwind</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setStopAllSignal((n) => n + 1)}>Stop All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-3 gap-3">
          <AudioTile icon={<Trees className="w-5 h-5" />} label="Forest" type="forest" stopAllSignal={stopAllSignal} />
          <AudioTile icon={<Waves className="w-5 h-5" />} label="Ocean" type="ocean" stopAllSignal={stopAllSignal} />
          <AudioTile icon={<Leaf className="w-5 h-5" />} label="Garden" type="garden" stopAllSignal={stopAllSignal} />
        </div>
      </CardContent>
    </Card>
  );
}

type SoundType = "forest" | "ocean" | "garden";

function AudioTile({ icon, label, type, stopAllSignal }: { icon: React.ReactNode; label: string; type: SoundType; stopAllSignal: number }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosenSrc, setChosenSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState<number>(35);

  const sources = useMemo(() => {
    const base: Record<SoundType, string> = {
      forest: "/sounds/forest",
      ocean: "/sounds/ocean",
      garden: "/sounds/grass",
    };
    const b = base[type];
    // Prefer WAV first since you provided forest.wav
    return [".wav", ".mp3", ".ogg"].map((ext) => b + ext);
  }, [type]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.loop = true;
    el.volume = volume / 100;
    const onError = () => setError("Unable to play this audio. Ensure files exist under /public/sounds.");
    const onLoaded = () => {
      // Pick the first <source> that the browser chose
      const current = (el as any).currentSrc as string;
      setChosenSrc(current || sources[0] || null);
    };
    el.addEventListener("error", onError);
    el.addEventListener("loadeddata", onLoaded, { once: true });
    return () => {
      el.pause();
      el.removeEventListener("error", onError);
      el.removeEventListener("loadeddata", onLoaded as any);
    };
  }, [sources]);

  // Respond to Stop All button
  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
  }, [stopAllSignal]);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setError(null);
        setPlaying(true);
      } catch (e: any) {
        setError(e?.message || "Unable to play audio");
      }
    }
  };

  return (
    <div className="p-3 rounded-xl bg-card/80 backdrop-blur border hover:shadow-glow transition-all">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-calm flex items-center justify-center">{icon}</div>
        <div className="font-medium">{label}</div>
      </div>
      <audio ref={audioRef} preload="auto" className="hidden">
        {sources.map((s) => {
          const ext = s.split('.').pop();
          const type = ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
          return <source key={s} src={s} type={type} />;
        })}
      </audio>
      <Button onClick={() => { toggle(); if (!playing) recordEvent("ambient_play"); }} className="w-full" variant={playing ? "secondary" : "default"}>
        {playing ? (
          <span className="inline-flex items-center gap-2"><Pause className="w-4 h-4" /> Pause</span>
        ) : (
          <span className="inline-flex items-center gap-2"><Play className="w-4 h-4" /> Play</span>
        )}
      </Button>
      <div className="mt-2">
        <div className="text-xs text-muted-foreground mb-1">Volume</div>
        <Slider
          value={[volume]}
          onValueChange={(vals) => {
            const v = vals[0] ?? 35;
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v / 100;
          }}
          max={100}
          step={1}
        />
      </div>
      {/* Source path hidden per request */}
      {error && <div className="text-xs text-destructive mt-2">{error}</div>}
    </div>
  );
}

// Removed synthesized generator; using real audio files now.
