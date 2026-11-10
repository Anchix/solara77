import { computeWeekendOffer } from "@/lib/weekendOffer";
import { DHANTERAS_END, isDhanterasActive } from "@/lib/dhanteras";

export const BOGO_END = DHANTERAS_END;
export const isBogoActive = isDhanterasActive;
export const computeBogo = computeWeekendOffer;
