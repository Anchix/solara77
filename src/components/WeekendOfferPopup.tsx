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
import { trackBogoPopupCTA, trackBogoPopupOpen } from "@/lib/analytics";
import type { SyntheticEvent } from "react";

const WeekendOfferPopup = () => {
  const diwali = isDiwaliTheme();
  const SESSION_KEY = diwali ? "diwali_gifts_oct_2026_dismissed" : "bogo_offer_oct_2026_dismissed";
  const [open, setOpen] = useState(false);

  const fallbackToSale = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = popupFallback;
  };

  useEffect(() => {
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
        <DialogTitle className="sr-only">{diwali ? "Solura Diwali Gift Offers" : "Solura Beauty Sale"}</DialogTitle>
        <DialogDescription className="sr-only">
          {diwali ? "Diwali Gift Offers are live — Buy 1, Get 1 FREE on selected bestsellers." : "Solura Beauty Sale is now live — up to 50% off."}
        </DialogDescription>
        <img
          src={diwali ? diwaliPopup : popupAsset.url}
          onError={diwali ? undefined : fallbackToSale}
          alt={diwali ? "Solura Diwali Gift Offers — Buy 1 Get 1 Free" : "Solura Beauty Sale — sale is now live, up to 50% off"}
          className="max-h-[66vh] w-full object-contain"
          width={diwali ? 1024 : 768}
          height={diwali ? 1024 : 768}
        />
        <div className="flex flex-col items-center gap-3 border-t border-border bg-background p-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Offer ends in</span>
            <CountdownTimer end={WEEKEND_OFFER_END} compact />
          </div>
          <Button asChild size="lg" className="w-full">
            <Link
              to="/shop"
              onClick={() => {
                trackBogoPopupCTA();
                onOpenChange(false);
              }}
            >
              Shop Diwali Gifts
            </Link>
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">{diwali ? "No code needed · Free gifts added automatically at checkout" : "No code needed · Free items appear automatically"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeekendOfferPopup;