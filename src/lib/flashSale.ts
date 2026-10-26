// 1st Anniversary 27-Minute Flash Sale window (IST)
// Countdown ticks to 7:00 PM Oct 27; the sale itself runs 7:00–7:27 PM.
export const FLASH_SALE_START = new Date("2026-10-27T19:00:00+05:30");
export const FLASH_SALE_END = new Date("2026-10-27T19:27:00+05:30");

export type FlashSalePhase = "before" | "live" | "over";

export const getFlashSalePhase = (now = new Date()): FlashSalePhase => {
  if (now < FLASH_SALE_START) return "before";
  if (now <= FLASH_SALE_END) return "live";
  return "over";
};

export const isFlashSaleVisible = (now = new Date()) =>
  getFlashSalePhase(now) !== "over";
