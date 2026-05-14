import { Link } from "react-router-dom";
import { Gift, Flame } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { isBogoActive } from "@/lib/bogo";

const BogoBanner = () => {
  if (!isBogoActive()) return null;
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/30 blur-3xl" />
      </div>
      <div className="container relative py-8 md:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-start md:items-center gap-4">
            <div className="hidden md:flex w-14 h-14 rounded-full bg-white/15 backdrop-blur items-center justify-center shrink-0">
              <Gift className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Flame className="h-4 w-4 animate-pulse" />
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold">Limited Time · Hurry</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold leading-tight">
                Buy 1 Get 1 FREE
              </h2>
              <p className="text-sm md:text-base opacity-90 mt-1">
                On selected bestsellers. Auto-applied at checkout — no code needed.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">Offer ends in</p>
            <CountdownTimer variant="light" />
            <Link
              to="/shop"
              className="mt-1 inline-block bg-foreground text-background text-xs md:text-sm font-medium px-6 py-2.5 rounded-full hover:scale-105 transition-transform"
            >
              Shop the Offer →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BogoBanner;
