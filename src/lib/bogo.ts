import { CartItem } from "@/data/products";

// Buy 1 Get 1 FREE ends 31st July 2026 (IST)
export const BOGO_END = new Date("2026-07-31T23:59:59+05:30");

export const isBogoActive = () => new Date() < BOGO_END;

export interface BogoResult {
  freeUnits: number;
  savings: number;
  eligibleItems: { name: string; freeCount: number; unitPrice: number }[];
}

export const computeBogo = (items: CartItem[]): BogoResult => {
  if (!isBogoActive()) return { freeUnits: 0, savings: 0, eligibleItems: [] };

  let freeUnits = 0;
  let savings = 0;
  const eligibleItems: BogoResult["eligibleItems"] = [];

  for (const item of items) {
    if (!item.product.is_bogo) continue;
    const free = Math.floor(item.quantity / 2);
    if (free <= 0) continue;
    const unit = item.product.sale_price ?? item.product.price;
    freeUnits += free;
    savings += free * unit;
    eligibleItems.push({ name: item.product.name, freeCount: free, unitPrice: unit });
  }

  return { freeUnits, savings, eligibleItems };
};
