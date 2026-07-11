import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, X } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { BOGO_END, isBogoActive } from "@/lib/bogo";
import { trackBogoPopupOpen, trackBogoPopupCTA } from "@/lib/analytics";


const SESSION_KEY = "bogo_popup_dismissed";

const BogoPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isBogoActive()) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      trackBogoPopupOpen();
    }, 6000);
    return () => clearTimeout(t);

  }, []);

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 hover:bg-secondary flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
            <Gift className="h-8 w-8" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-90 mb-2">Exclusive Offer</p>
          <h3 className="font-display text-3xl font-semibold mb-1">Buy 1 Get 1 FREE</h3>
          <p className="text-sm opacity-90">On selected bestsellers · Ends 15 July</p>
        </div>
        <div className="p-6 text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Hurry, offer ends in</p>
          <div className="flex justify-center text-foreground">
            <CountdownTimer end={BOGO_END} />
          </div>
          <Link
            to="/shop"
            onClick={() => { trackBogoPopupCTA(); close(); }}
            className="block w-full bg-foreground text-background font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Claim My Free Item
          </Link>

          <button onClick={close} className="text-xs text-muted-foreground hover:text-foreground">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default BogoPopup;
