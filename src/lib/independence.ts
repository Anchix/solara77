// Independence Day theme window (IST)
export const INDEPENDENCE_THEME_END = new Date("2026-08-16T23:59:59+05:30");

export const isIndependenceTheme = () => new Date() <= INDEPENDENCE_THEME_END;
