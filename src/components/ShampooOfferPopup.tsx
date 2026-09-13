import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import shampooOffer from "@/assets/solura-hibiglow-shampoo-offer.jpeg";

const ShampooOfferPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 p-4" role="dialog" aria-modal="true" aria-label="Hibiglow shampoo offer">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-background shadow-2xl">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => setOpen(false)}
          aria-label="Close offer"
          className="absolute right-2 top-2 z-10 shadow-md"
        >
          <X className="h-4 w-4" />
        </Button>
        <Link to="/shop" onClick={() => setOpen(false)} aria-label="Shop the Hibiglow shampoo ₹99 offer">
          <img
            src={shampooOffer}
            alt="Solura Hibiglow anti-dandruff shampoo offer price ₹99, valid September 14 and 15"
            className="block h-auto w-full"
            width={1024}
            height={1024}
            decoding="async"
          />
        </Link>
      </div>
    </div>
  );
};

export default ShampooOfferPopup;