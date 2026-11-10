# Project Architecture Rules

- Keep September 2026 weekend promotion rules centralized in `src/lib/weekendOffer.ts` so cart, checkout, and product displays calculate identical gifts.
- Keep uploaded promotional artwork in asset pointers with optimized local image fallbacks when asset delivery fails, and render homepage campaign slides without text overlays so printed artwork remains readable.
- Keep seasonal theme windows in `src/lib/<season>.ts` (e.g. `independence.ts`, `diwali.ts`) so announcement bar, navbar, banners, popup and copy switch together automatically.
- Keep dated Dhanteras prices and gift eligibility in `src/lib/dhanteras.ts`, and keep the wheel's server prize odds aligned with its visual segment ranges so cart totals and rewards stay consistent.
