import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import {
  FLASH_SALE_END,
  FLASH_SALE_START,
  getFlashSalePhase,
} from "@/lib/flashSale";
import { trackBogoBannerClick } from "@/lib/analytics";

/**
 * Anniversary 27-Minute Flash Sale strip (below the hero).
 * Before 7:00 PM IST Oct 27: counts down to the start.
 * 7:00–7:27 PM: counts down to the end. After that: hidden.
 */
const FlashSaleBanner = () => {
  const [, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = getFlashSalePhase();
  if (phase === "over") return null;

  return (
    <section className="relative overflow-hidden border-y border-diwali-gold/40 bg-gradient-to-r via-foreground/95 to-primary from-foreground text-primary-foreground">
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-diwali-gold/15 blur-3xl hidden md:block" />
      <div className="container relative py-5 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-diwali-gold/20 flex items-center justify-center shrink-0">
              <Zap className="h-6 w-6 text-diwali-gold" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] opacity-90">
                1st Anniversary · Mega Sale
              </p>
              <h2 className="font-display text-xl md:text-3xl font-semibold leading-tight">
                {phase === "before" ? (
                  <>27-Minute <span className="italic text-diwali-gold">Flash Sale</span> Starts In</>
                ) : (
                  <>Flash Sale <span className="italic text-diwali-gold">is LIVE</span></>
                )}
              </h2>
              <p className="text-xs md:text-sm opacity-90 mt-0.5">
                Lipsticks &amp; soap ₹27 · Shampoo, face wash &amp; cream ₹127 · Today 7:00–7:27 PM only
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <CountdownTimer end={phase === "before" ? FLASH_SALE_START : FLASH_SALE_END} noLoop />
            <Link
              to="/shop"
              onClick={() => trackBogoBannerClick("flash_sale_banner")}
              className="text-[11px] md:text-xs font-semibold bg-diwali-gold text-foreground px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              {phase === "before" ? "Get Ready — Shop Now →" : "Grab Deals Before 7:27 PM →"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
