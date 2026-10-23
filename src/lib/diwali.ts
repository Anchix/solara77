// Diwali theme window (IST) — see AnnouncementBar, Navbar, BogoBanner, WeekendOfferPopup
export const DIWALI_THEME_START = new Date("2026-10-24T00:00:00+05:30");
export const DIWALI_THEME_END = new Date("2026-11-10T23:59:59+05:30");

export const isDiwaliTheme = (now = new Date()) =>
  now >= DIWALI_THEME_START && now <= DIWALI_THEME_END;
