import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";
import popupAsset from "@/assets/solura-beauty-sale-popup.jpeg.asset.json";
import popupFallback from "@/assets/solura-beauty-sale-fallback.webp";
import diwaliPopup from "@/assets/diwali-gifts-popup.png";
import { WEEKEND_OFFER_END } from "@/lib/weekendOffer";
import { isDiwaliTheme } from "@/lib/diwali";
import { DHANTERAS_END, isDhanterasActive } from "@/lib/dhanteras";
import { trackBogoPopupCTA, trackBogoPopupOpen } from "@/lib/analytics";
import type { SyntheticEvent } from "react";

const WeekendOfferPopup = () => {
  const diwali = isDiwaliTheme();
  const dhanteras = isDhanterasActive();
  const SESSION_KEY = dhanteras ? "dhanteras_offer_nov_2026_dismissed" : diwali ? "diwali_gifts_oct_2026_dismissed" : "bogo_offer_oct_2026_dismissed";
  const [open, setOpen] = useState(false);

  const fallbackToSale = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = popupFallback;
  };

  useEffect(() => {
    if (!dhanteras && !diwali) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      trackBogoPopupOpen();
    }, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) sessionStorage.setItem(SESSION_KEY, "1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-xl gap-0 overflow-hidden border-primary/20 bg-card p-0 shadow-2xl">
        <DialogTitle className="sr-only">{dhanteras ? "Solura Dhanteras Special Offers" : diwali ? "Solura Diwali Gift Offers" : "Solura Beauty Sale"}</DialogTitle>
        <DialogDescription className="sr-only">
          {dhanteras ? "Dhanteras offers: Nude Pink lipstick ₹99, Hot Red lipstick ₹49, and buy one Hibiglow shampoo get one free." : diwali ? "Diwali Gift Offers are live." : "Solura Beauty Sale is now live."}
        </DialogDescription>
        {dhanteras ? (
          <div className="bg-gradient-to-b from-primary/15 via-background to-secondary/40 px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">🪔 Dhanteras · November 6–8</p>
            <h2 className="mt-2 font-display text-3xl font-light">A little Diwali, a lot of glow</h2>
            <div className="mx-auto mt-5 max-w-sm divide-y divide-border border-y border-border text-left">
              <p className="flex justify-between gap-4 py-3 text-sm"><span>Nude Pink Lipstick</span><span className="font-semibold">₹99 <del className="ml-1 text-muted-foreground">₹185</del></span></p>
              <p className="flex justify-between gap-4 py-3 text-sm"><span>Hot Red Lipstick</span><span className="font-semibold">₹49 <del className="ml-1 text-muted-foreground">₹185</del></span></p>
              <p className="flex justify-between gap-4 py-3 text-sm"><span>Hibiglow Shampoo</span><span className="font-semibold">Buy 1, Get 1 Free</span></p>
            </div>
          </div>
        ) : (
          <img
            src={diwali ? diwaliPopup : popupAsset.url}
            onError={diwali ? undefined : fallbackToSale}
            alt={diwali ? "Solura Diwali gifting" : "Solura Beauty Sale"}
            className="max-h-[66vh] w-full object-contain"
            width={diwali ? 1024 : 768}
            height={diwali ? 1024 : 768}
          />
        )}
        <div className="flex flex-col items-center gap-3 border-t border-border bg-background p-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{dhanteras ? "Dhanteras ends in" : "Festival offers end in"}</span>
            <CountdownTimer end={dhanteras ? DHANTERAS_END : WEEKEND_OFFER_END} compact noLoop />
          </div>
          <Button asChild size="lg" className="w-full">
            <Link
              to="/shop"
              onClick={() => {
                trackBogoPopupCTA();
                onOpenChange(false);
              }}
            >
              {dhanteras ? "Shop Dhanteras Offers" : "Shop Diwali Gifts"}
            </Link>
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">{dhanteras ? "No code needed · Shampoo gift is added automatically" : diwali ? "No code needed · Free gifts added automatically at checkout" : "No code needed · Free items appear automatically"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeekendOfferPopup;