import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Trophy, Ticket } from "lucide-react";
import { isLuckyDrawActive } from "@/lib/independence";

const prizes = [
  { medal: "🥇", label: "LED TV" },
  { medal: "🥈", label: "Air Cooler" },
  { medal: "🥉", label: "Smart Watch" },
  { medal: "🎒", label: "Travel Bag" },
  { medal: "🎧", label: "Air Buds" },
  { medal: "🔋", label: "Power Bank" },
  { medal: "🎁", label: "Solura Full Kit" },
];

const LuckyDrawPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isLuckyDrawActive()) return;
    const first = setTimeout(() => setOpen(true), 400);
    const loop = setInterval(() => setOpen(true), 120000); // every 2 minutes
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 hover:bg-secondary flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="p-6 text-center border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">🇮🇳 Solura Cosmetics</p>
          <h3 className="font-display text-2xl md:text-3xl font-light italic leading-tight">
            80th Independence Day<br />Lucky Draw Contest
          </h3>
          <p className="text-xs text-muted-foreground mt-3">15 August – 5 September 2026</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3">
            <Ticket className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Shop for ₹200 or more in a single order on soluracosmo.com and receive a Lucky Draw
              coupon number. Draw conducted on 11 September 2026.
            </p>
          </div>

          <div>
            <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3">
              <Trophy className="h-3.5 w-3.5 text-primary" /> Prizes
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {prizes.map((p) => (
                <li key={p.label} className="flex items-center gap-2 text-xs">
                  <span>{p.medal}</span>
                  <span className="text-foreground">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/shop"
            onClick={() => setOpen(false)}
            className="block w-full bg-foreground text-background text-center font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Shop Now & Enter the Draw
          </Link>
          <p className="text-[10px] text-center text-muted-foreground">
            Celebrate Freedom. Shop Solura. Win Big! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default LuckyDrawPopup;
