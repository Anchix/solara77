import type { CartItem } from "@/data/products";

// Buy One Get One Free promotion ends 26 May 2026 23:59:59 IST
export const BOGO_END = new Date("2026-05-26T23:59:59+05:30");

export const isBogoActive = () => new Date() < BOGO_END;

export interface BogoLine {
  productId: string;
  productName: string;
  freeUnits: number;
  unitPrice: number;
  saved: number;
}

export interface BogoResult {
  totalDiscount: number;
  lines: BogoLine[];
}

/**
 * BOGO logic: for any product flagged is_bogo, every 2 units in cart
 * makes 1 unit free (cheapest of the pair → since same product, same price).
 */
export const computeBogo = (items: CartItem[]): BogoResult => {
  if (!isBogoActive()) return { totalDiscount: 0, lines: [] };
  const lines: BogoLine[] = [];
  let totalDiscount = 0;
  for (const it of items) {
    if (!it.product.is_bogo) continue;
    const freeUnits = Math.floor(it.quantity / 2);
    if (freeUnits <= 0) continue;
    const unitPrice = it.product.sale_price ?? it.product.price;
    const saved = freeUnits * unitPrice;
    totalDiscount += saved;
    lines.push({
      productId: it.product.id,
      productName: it.product.name,
      freeUnits,
      unitPrice,
      saved,
    });
  }
  return { totalDiscount, lines };
};

export const formatTimeLeft = (target: Date = BOGO_END) => {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds, ended: ms === 0 };
};
