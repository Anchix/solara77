import { Link } from "react-router-dom";
import { Gift, Flame } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { BOGO_END, isBogoActive } from "@/lib/bogo";
import { trackBogoBannerClick } from "@/lib/analytics";


const BogoBanner = () => {
  if (!isBogoActive()) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground">
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl hidden md:block" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-accent/40 blur-3xl hidden md:block" />
      <div className="container relative py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] opacity-90 flex items-center gap-1.5">
                <Flame className="h-3 w-3" /> Limited Time · September 26–28
              </p>
              <h2 className="font-display text-xl md:text-3xl font-semibold leading-tight">
                Weekend Gifts <span className="italic">FREE</span>
              </h2>
              <p className="text-xs md:text-sm opacity-90 mt-0.5">Lipstick, cream, soap & shampoo offers · No code needed</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <CountdownTimer end={BOGO_END} />
            <Link
              to="/shop"
              onClick={() => trackBogoBannerClick("home_hero_banner")}
              className="text-[11px] md:text-xs font-semibold bg-background text-foreground px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Shop Weekend Offers →
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
};

export default BogoBanner;
