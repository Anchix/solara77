import { describe, it, expect } from "vitest";
import {
  FLASH_SALE_START,
  FLASH_SALE_END,
  getFlashSalePhase,
  isFlashSaleVisible,
} from "@/lib/flashSale";

describe("flash sale window", () => {
  it("starts at 7:00 PM IST on Oct 27, 2026 and ends 27 minutes later", () => {
    expect(FLASH_SALE_START.toISOString()).toBe("2026-10-27T13:30:00.000Z");
    expect(FLASH_SALE_END.toISOString()).toBe("2026-10-27T13:57:00.000Z");
  });

  it("is in the 'before' phase ahead of 7 PM IST", () => {
    expect(getFlashSalePhase(new Date("2026-10-27T12:00:00+05:30"))).toBe("before");
  });

  it("is 'live' between 7:00 and 7:27 PM IST", () => {
    expect(getFlashSalePhase(new Date("2026-10-27T19:10:00+05:30"))).toBe("live");
  });

  it("is 'over' and hidden after 7:27 PM IST", () => {
    expect(getFlashSalePhase(new Date("2026-10-27T19:30:00+05:30"))).toBe("over");
    expect(isFlashSaleVisible(new Date("2026-10-27T19:30:00+05:30"))).toBe(false);
  });

  it("is still visible while counting down before the sale", () => {
    expect(isFlashSaleVisible(new Date("2026-10-26T21:00:00+05:30"))).toBe(true);
  });
});
