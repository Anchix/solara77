// Lightweight GA4 (gtag) event helper
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = "G-HSK4WT0MSH";

export const trackEvent = (name: string, params: Record<string, any> = {}) => {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: name, ...params });
    }
  } catch {
    /* no-op */
  }
};

// BOGO / offer specific helpers
export const trackBogoBannerClick = (location: string) =>
  trackEvent("bogo_banner_click", { promotion_id: "bogo_july_2026", promotion_name: "Buy 1 Get 1 Free", location });

export const trackBogoPopupOpen = () =>
  trackEvent("bogo_popup_open", { promotion_id: "bogo_july_2026", promotion_name: "Buy 1 Get 1 Free" });

export const trackBogoPopupCTA = () =>
  trackEvent("bogo_popup_cta_click", { promotion_id: "bogo_july_2026", promotion_name: "Buy 1 Get 1 Free" });

export const trackDiscountApplied = (params: {
  discount_type: "bogo" | "coupon";
  code?: string;
  value: number;
  currency?: string;
}) =>
  trackEvent("discount_applied", { currency: "INR", ...params });

export const trackPurchase = (params: {
  transaction_id: string;
  value: number;
  shipping?: number;
  coupon?: string;
  payment_method: "online" | "cod";
  items: { item_id: string; item_name: string; price: number; quantity: number }[];
}) => trackEvent("purchase", { currency: "INR", ...params });
