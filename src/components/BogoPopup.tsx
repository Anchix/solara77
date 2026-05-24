import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Gift, Sparkles } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { isBogoActive } from "@/lib/bogo";

const STORAGE_KEY = "bogo-popup-dismissed-v1";

const BogoPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isBogoActive()) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/70 animate-fade-in" onClick={close}>
      <div
        className="relative w-full max-w-md bg-background rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-6 md:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-4">
            <Gift className="h-8 w-8" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3" /> Exclusive Offer
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
            Buy 1, Get 1<br />
            <span className="text-4xl md:text-5xl">FREE</span>
          </h2>
          <p className="text-sm opacity-95 mt-3">
            Stock up on your Solura favourites. <br />Add 2 of any BOGO item — pay for just 1.
          </p>
        </div>

        <div className="p-6 space-y-4 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Hurry — Offer ends in</p>
            <CountdownTimer variant="dark" className="justify-center" />
          </div>
          <Link
            to="/shop"
            onClick={close}
            className="block w-full bg-foreground text-background font-medium py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Shop BOGO Now →
          </Link>
          <button onClick={close} className="text-xs text-muted-foreground hover:underline">
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
};

export default BogoPopup;
