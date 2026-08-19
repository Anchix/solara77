import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Copy, Check, Gift } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "solura_spin_v1";

const SEGMENTS = [
  { label: "20% OFF", sub: "code" },
  { label: "25% OFF", sub: "code" },
  { label: "Better luck", sub: "next time" },
  { label: "15% OFF", sub: "code" },
  { label: "80% OFF", sub: "code" },
];

const SEG_ANGLE = 360 / SEGMENTS.length;

const fills = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--muted))",
  "hsl(var(--accent))",
  "hsl(var(--primary))",
];
const texts = [
  "hsl(var(--primary-foreground))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--accent-foreground))",
  "hsl(var(--primary-foreground))",
];

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};

const wedgePath = (i: number) => {
  const start = i * SEG_ANGLE;
  const end = start + SEG_ANGLE;
  const [x1, y1] = polar(100, 100, 92, start);
  const [x2, y2] = polar(100, 100, 92, end);
  return `M100,100 L${x1},${y1} A92,92 0 0,1 ${x2},${y2} Z`;
};

interface Result {
  index: number;
  label: string;
  code: string | null;
}

const SpinWheel = () => {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResult({ index: 0, label: parsed.label, code: parsed.code ?? null });
      } catch { /* ignore */ }
      return;
    }
    timer.current = window.setTimeout(() => {
      setOpen(true);
      trackEvent("spin_wheel_open");
    }, 1200);
    return () => window.clearTimeout(timer.current);
  }, []);

  const spin = async () => {
    if (spinning || result) return;
    setSpinning(true);
    try {
      const { data, error } = await supabase.functions.invoke("spin-wheel", { body: {} });
      if (error || !data || data.error) throw new Error("spin failed");

      const target = 360 * 6 - (data.index * SEG_ANGLE + SEG_ANGLE / 2);
      setRotation(target);

      window.setTimeout(() => {
        setResult({ index: data.index, label: data.label, code: data.code ?? null });
        setSpinning(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ label: data.label, code: data.code ?? null }));
        trackEvent("spin_wheel_result", { prize: data.label, code: data.code ?? "none" });
      }, 4600);
    } catch {
      setSpinning(false);
      toast.error("Could not spin right now. Please try again.");
    }
  };

  const copy = async () => {
    if (!result?.code) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <button
      onClick={() => { setOpen(true); trackEvent("spin_wheel_open", { source: "floating_button" }); }}
      aria-label="Spin and win a discount"
      className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 hover:scale-105 transition-transform"
    >
      <Gift className="h-4 w-4" />
      <span className="text-xs font-medium tracking-wide">Spin & Win</span>
    </button>

    <Dialog open={open} onOpenChange={(o) => { if (!spinning) setOpen(o); }}>
      <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden border-primary/30">
        <div className="bg-gradient-to-b from-secondary/70 via-background to-background px-5 pt-7 pb-6 text-center">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Solura Beauty Spin
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-light italic mt-2">
            Spin & Unlock Your Glow Offer
          </h2>
          <p className="text-xs text-muted-foreground mt-1">One spin per visitor · Code valid for 7 days</p>

          <div className="relative mx-auto mt-6 w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]">
            {/* pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-20">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow" />
            </div>

            <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl" />

            <svg
              viewBox="0 0 200 200"
              className="relative w-full h-full drop-shadow-xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning || rotation ? "transform 4.5s cubic-bezier(0.15,0.9,0.2,1)" : undefined,
              }}
            >
              <defs>
                <radialGradient id="hubGrad" cx="50%" cy="35%">
                  <stop offset="0%" stopColor="hsl(var(--background))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="97" fill="hsl(var(--accent))" opacity="0.35" />
              {SEGMENTS.map((s, i) => {
                const mid = i * SEG_ANGLE + SEG_ANGLE / 2;
                const [tx, ty] = polar(100, 100, 58, mid);
                return (
                  <g key={s.label}>
                    <path d={wedgePath(i)} fill={fills[i]} stroke="hsl(var(--background))" strokeWidth="1.5" />
                    <text
                      x={tx}
                      y={ty}
                      fill={texts[i]}
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                      transform={`rotate(${mid} ${tx} ${ty})`}
                    >
                      {s.label}
                    </text>
                    <text
                      x={tx}
                      y={ty + 11}
                      fill={texts[i]}
                      fontSize="7"
                      opacity="0.8"
                      textAnchor="middle"
                      transform={`rotate(${mid} ${tx} ${ty})`}
                    >
                      {s.sub}
                    </text>
                  </g>
                );
              })}
              {Array.from({ length: 20 }).map((_, i) => {
                const [dx, dy] = polar(100, 100, 95, i * 18);
                return <circle key={i} cx={dx} cy={dy} r="2" fill="hsl(var(--accent))" />;
              })}
              <circle cx="100" cy="100" r="20" fill="url(#hubGrad)" stroke="hsl(var(--primary))" strokeWidth="2" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Gift className="h-5 w-5 text-primary" />
            </div>
          </div>

          {!result ? (
            <Button className="mt-6 w-full" size="lg" onClick={spin} disabled={spinning}>
              {spinning ? "Spinning..." : "Spin the Wheel"}
            </Button>
          ) : (
            <div className="mt-6 space-y-3 animate-fade-in">
              {result.code ? (
                <>
                  <p className="font-display text-xl font-light">🎉 You won {result.label}!</p>
                  <button
                    onClick={copy}
                    className="w-full border border-dashed border-primary/60 rounded-md py-3 px-4 flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-mono tracking-[0.2em] text-base font-semibold">{result.code}</span>
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <p className="text-[11px] text-muted-foreground">
                    Apply this code at checkout. Single use, valid for 7 days.
                  </p>
                </>
              ) : (
                <p className="font-display text-xl font-light">Better luck next time 💐</p>
              )}
              <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SpinWheel;
