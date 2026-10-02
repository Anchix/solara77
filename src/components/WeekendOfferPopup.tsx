import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";
import popupImage from "@/assets/nude-pink-bogo-banner.png";
import { WEEKEND_OFFER_END } from "@/lib/weekendOffer";
import { trackBogoPopupCTA, trackBogoPopupOpen } from "@/lib/analytics";

const SESSION_KEY = "bogo_offer_oct_2026_dismissed";

const WeekendOfferPopup = () => {
  const [open, setOpen] = useState(false);

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
        <DialogTitle className="sr-only">Solura Buy 1 Get 1 Free offer</DialogTitle>
        <DialogDescription className="sr-only">
          Four limited-time beauty offers with free products added automatically at checkout.
        </DialogDescription>
        <img
          src={popupImage}
          alt="Solura Weekend Offer: free Hot Red Lipstick with Brightening Cream or Nude Pink Lipstick, buy two soaps get one free, and buy one shampoo get one free"
          className="max-h-[66vh] w-full object-contain"
          width={1200}
          height={1200}
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
              Shop Weekend Offers
            </Link>
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">No code needed · Free items appear automatically</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeekendOfferPopup;