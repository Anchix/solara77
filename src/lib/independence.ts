// Independence Day theme + Lucky Draw contest windows (IST)
export const INDEPENDENCE_THEME_END = new Date("2026-08-16T23:59:59+05:30");
export const LUCKY_DRAW_START = new Date("2026-08-14T00:00:00+05:30");
export const LUCKY_DRAW_END = new Date("2026-09-05T23:59:59+05:30");

export const isIndependenceTheme = () => new Date() <= INDEPENDENCE_THEME_END;

export const isLuckyDrawActive = () => {
  const now = new Date();
  return now >= LUCKY_DRAW_START && now <= LUCKY_DRAW_END;
};
