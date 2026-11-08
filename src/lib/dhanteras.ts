import type { CartItem } from "@/data/products";

export const DHANTERAS_START = new Date("2026-11-06T00:00:00+05:30");
export const DHANTERAS_END = new Date("2026-11-08T23:59:59.999+05:30");

export const DHANTERAS_PRODUCTS = {
  nudePink: "solura-nude-pink-lipstick",
  hotRed: "solura-hot-red-lipstick",
  shampoo: "hibiglow-hair-cleanser-anti-dandruff-shampoo",
} as const;

export const isDhanterasActive = (now = new Date()) =>
  now >= DHANTERAS_START && now <= DHANTERAS_END;

export const getDhanterasPrice = (
  product: { slug: string; price: number; sale_price: number | null },
  now = new Date(),
) => {
  if (!isDhanterasActive(now)) return product.sale_price ?? product.price;
  if (product.slug === DHANTERAS_PRODUCTS.nudePink) return 99;
  if (product.slug === DHANTERAS_PRODUCTS.hotRed) return 49;
  return product.sale_price ?? product.price;
};

export interface DhanterasGift {
  productId: string;
  productName: string;
  quantity: number;
  unitValue: number;
  label: string;
}

export const computeDhanterasGifts = (items: CartItem[], now = new Date()): DhanterasGift[] => {
  if (!isDhanterasActive(now)) return [];

  const quantity = items
    .filter((item) => item.product.slug === DHANTERAS_PRODUCTS.shampoo)
    .reduce((sum, item) => sum + item.quantity, 0);

  if (quantity <= 0) return [];
  return [{
    productId: "166f4b7e-2c21-4565-931f-d4f96c19e747",
    productName: "Hibiglow Hair Cleanser — Hibiscus Anti-Dandruff & Scalp Care Shampoo — Dhanteras Free Gift",
    quantity,
    unitValue: 259,
    label: "Hibiglow Shampoo: buy 1, get 1 free",
  }];
};