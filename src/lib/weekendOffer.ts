import type { CartItem } from "@/data/products";

export const WEEKEND_OFFER_START = new Date("2026-09-26T00:00:00+05:30");
export const WEEKEND_OFFER_END = new Date("2026-09-28T23:59:59+05:30");

const HOT_RED = {
  productId: "892a2392-7786-4a8e-a6e3-3996eee9ea82",
  productName: "Solura Hot Red Lipstick — FREE Weekend Offer",
  unitValue: 185,
};

const offerRules = [
  {
    triggerSlug: "glow-brightening-night-cream",
    paidQuantity: 1,
    gift: HOT_RED,
    label: "Brightening Cream + free Hot Red Lipstick",
  },
  {
    triggerSlug: "solura-nude-pink-lipstick",
    paidQuantity: 1,
    gift: HOT_RED,
    label: "Nude Pink Lipstick + free Hot Red Lipstick",
  },
  {
    triggerSlug: "solura-de-tan-soap-lemon-turmeric",
    paidQuantity: 2,
    gift: {
      productId: "f2448f3a-5bbc-42b9-9339-8f8f651e4afa",
      productName: "Solura Handmade De-Tan Soap — FREE Weekend Offer",
      unitValue: 260,
    },
    label: "Soap: buy 2, get 1 free",
  },
  {
    triggerSlug: "hibiglow-hair-cleanser-anti-dandruff-shampoo",
    paidQuantity: 1,
    gift: {
      productId: "166f4b7e-2c21-4565-931f-d4f96c19e747",
      productName: "Hibiglow Shampoo — FREE Weekend Offer",
      unitValue: 249,
    },
    label: "Shampoo: buy 1, get 1 free",
  },
] as const;

export interface WeekendGift {
  productId: string;
  productName: string;
  quantity: number;
  unitValue: number;
  label: string;
}

export interface WeekendOfferResult {
  freeUnits: number;
  savings: number;
  gifts: WeekendGift[];
}

export const isWeekendOfferActive = (now = new Date()) =>
  now >= WEEKEND_OFFER_START && now <= WEEKEND_OFFER_END;

export const isWeekendOfferProduct = (slug: string) =>
  offerRules.some((rule) => rule.triggerSlug === slug);

export const getWeekendOfferLabel = (slug: string) =>
  offerRules.find((rule) => rule.triggerSlug === slug)?.label;

export const computeWeekendOffer = (
  items: CartItem[],
  now = new Date(),
): WeekendOfferResult => {
  if (!isWeekendOfferActive(now)) return { freeUnits: 0, savings: 0, gifts: [] };

  const giftsByProduct = new Map<string, WeekendGift>();

  for (const rule of offerRules) {
    const quantity = items
      .filter((item) => item.product.slug === rule.triggerSlug)
      .reduce((sum, item) => sum + item.quantity, 0);
    const freeQuantity = Math.floor(quantity / rule.paidQuantity);
    if (freeQuantity === 0) continue;

    const existing = giftsByProduct.get(rule.gift.productId);
    if (existing) {
      existing.quantity += freeQuantity;
      existing.label = "Free Hot Red Lipstick with qualifying products";
    } else {
      giftsByProduct.set(rule.gift.productId, {
        ...rule.gift,
        quantity: freeQuantity,
        label: rule.label,
      });
    }
  }

  const gifts = [...giftsByProduct.values()];
  return {
    gifts,
    freeUnits: gifts.reduce((sum, gift) => sum + gift.quantity, 0),
    savings: gifts.reduce((sum, gift) => sum + gift.quantity * gift.unitValue, 0),
  };
};