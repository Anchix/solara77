import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Copy, Check, Gift, Flame } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { isDhanterasActive } from "@/lib/dhanteras";

const STORAGE_KEY = "solura_dhanteras_spin_v2";

const SEGMENT_COUNT = 100;
const SEG_ANGLE = 360 / SEGMENT_COUNT;

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

const segmentFill = (index: number) =>
  index < 90
    ? "hsl(var(--primary))"
    : index < 99
      ? "hsl(var(--accent))"
      : "hsl(var(--diwali-gold))";

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
    if (!isDhanterasActive()) return;
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

      const target = 360 * 7 - (data.index * SEG_ANGLE + SEG_ANGLE / 2);
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

  if (!isDhanterasActive()) return null;

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
      <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden border-diwali-gold/50">
        <div className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-background to-secondary/50 px-5 pt-7 pb-6 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute left-4 top-4 text-diwali-gold/60"><Sparkles className="h-5 w-5" /></div>
          <div aria-hidden="true" className="pointer-events-none absolute right-4 top-4 text-diwali-gold/60"><Flame className="h-5 w-5" /></div>
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Dhanteras · Festival of Fortune
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-light italic mt-2">
            Spin for Your Diwali Glow
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Win 10%, 15%, or 20% off · One spin per browser</p>

          <div className="relative mx-auto mt-6 w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]">
            {/* pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-20">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow" />
            </div>

            <div className="absolute inset-0 rounded-full bg-diwali-gold/20 blur-xl" />

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
              <circle cx="100" cy="100" r="97" fill="hsl(var(--diwali-gold))" opacity="0.35" />
              {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
                <path key={i} d={wedgePath(i)} fill={segmentFill(i)} stroke="hsl(var(--background))" strokeWidth="0.7" />
              ))}
              {Array.from({ length: 40 }).map((_, i) => {
                const [dx, dy] = polar(100, 100, 95, i * 18);
                return <circle key={i} cx={dx} cy={dy} r="1.5" fill="hsl(var(--diwali-gold))" />;
              })}
              <circle cx="100" cy="100" r="20" fill="url(#hubGrad)" stroke="hsl(var(--diwali-gold))" strokeWidth="2" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-display text-xs font-semibold text-primary">🪔</span>
            </div>
          </div>

          <div className="mx-auto mt-4 flex max-w-sm justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-primary" />15% · 90 in 100</span>
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-accent" />10% · 9 in 100</span>
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-diwali-gold" />20% · 1 in 100</span>
          </div>

          {!result ? (
            <Button className="mt-6 w-full" size="lg" onClick={spin} disabled={spinning}>
              {spinning ? "Spinning..." : "Spin the Wheel"}
            </Button>
          ) : (
            <div className="mt-6 space-y-3 animate-fade-in">
              {result.code ? (
                <>
                    <p className="font-display text-xl font-light">You won {result.label}!</p>
                  <button
                    onClick={copy}
                    className="w-full border border-dashed border-primary/60 rounded-md py-3 px-4 flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-mono tracking-[0.2em] text-base font-semibold">{result.code}</span>
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <p className="text-[11px] text-muted-foreground">
                    Apply this single-use code at checkout within 7 days.
                  </p>
                </>
              ) : (
                <p className="font-display text-xl font-light">Your Dhanteras discount is ready.</p>
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
