import { describe, expect, it } from "vitest";
import { getDhanterasPrice, isDhanterasActive, DHANTERAS_END, DHANTERAS_START, computeDhanterasGifts } from "@/lib/dhanteras";
import { selectDhanterasPrize } from "@/lib/dhanterasWheel";

const products = {
  nudePink: { slug: "solura-nude-pink-lipstick", price: 185, sale_price: 170 },
  hotRed: { slug: "solura-hot-red-lipstick", price: 185, sale_price: 120 },
  shampoo: {
    id: "166f4b7e-2c21-4565-931f-d4f96c19e747",
    slug: "hibiglow-hair-cleanser-anti-dandruff-shampoo",
    name: "Hibiglow Shampoo",
    price: 280,
    sale_price: 259,
    description: null,
    images: [],
    category: "Haircare",
    specs: null,
    brand: null,
    product_type: null,
    net_quantity: null,
    skin_type: null,
    key_benefits: null,
    texture: null,
    usage_time: null,
    how_to_use: null,
    expected_result: null,
    storage_info: null,
    safety_info: null,
    package_type: null,
    country_of_origin: "India",
    is_out_of_stock: false,
    is_bogo: true,
  },
};

describe("Dhanteras offers", () => {
  it("is active only from Nov 6 through Nov 8, 2026 in India", () => {
    expect(isDhanterasActive(new Date("2026-11-05T23:59:59+05:30"))).toBe(false);
    expect(isDhanterasActive(DHANTERAS_START)).toBe(true);
    expect(isDhanterasActive(DHANTERAS_END)).toBe(true);
    expect(isDhanterasActive(new Date("2026-11-09T00:00:00+05:30"))).toBe(false);
  });

  it("sets Nude Pink to ₹99 and Hot Red to ₹49 during the offer", () => {
    const during = new Date("2026-11-07T12:00:00+05:30");
    expect(getDhanterasPrice(products.nudePink, during)).toBe(99);
    expect(getDhanterasPrice(products.hotRed, during)).toBe(49);
    expect(getDhanterasPrice(products.nudePink, new Date("2026-11-09T00:00:00+05:30"))).toBe(170);
    expect(getDhanterasPrice(products.hotRed, new Date("2026-11-09T00:00:00+05:30"))).toBe(120);
  });

  it("adds exactly one free shampoo for each paid shampoo in the cart", () => {
    const one = computeDhanterasGifts([{ product: products.shampoo, quantity: 1 }], new Date("2026-11-07T12:00:00+05:30"));
    const two = computeDhanterasGifts([{ product: products.shampoo, quantity: 2 }], new Date("2026-11-07T12:00:00+05:30"));
    expect(one[0]?.quantity).toBe(1);
    expect(two[0]?.quantity).toBe(2);
    expect(computeDhanterasGifts([{ product: products.shampoo, quantity: 1 }], new Date("2026-11-09T00:00:00+05:30"))).toHaveLength(0);
  });
});

describe("Diwali wheel prize distribution", () => {
  it("assigns exactly 90 outcomes to 15%, 9 to 10%, and 1 to 20%, with no 5% prize", () => {
    const counts = new Map<number, number>();
    for (let i = 0; i < 100; i++) {
      const prize = selectDhanterasPrize((i + 0.5) / 100);
      counts.set(prize.value, (counts.get(prize.value) ?? 0) + 1);
    }
    expect(counts.get(15)).toBe(90);
    expect(counts.get(10)).toBe(9);
    expect(counts.get(20)).toBe(1);
    expect(counts.has(5)).toBe(false);
  });
});