import { isDiwaliTheme } from "@/lib/diwali";

const BULB_COUNT = 26;

/**
 * Hanging garland of glowing diya lights rendered under the navbar
 * while the Diwali theme window (src/lib/diwali.ts) is active.
 */
const DiwaliLights = () => {
  if (!isDiwaliTheme()) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-10 h-7 w-full select-none overflow-visible"
    >
      {/* garland wire */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-diwali-gold/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 md:px-10">
        {Array.from({ length: BULB_COUNT }).map((_, i) => {
          // gentle sag across the garland
          const dip = Math.sin((i / (BULB_COUNT - 1)) * Math.PI) * 6;
          return (
            <span
              key={i}
              className={`diwali-bulb ${i % 2 ? "diwali-bulb--ember" : ""}`}
              style={{
                transform: `translateY(${dip.toFixed(1)}px)`,
                animationDelay: `${((i % 6) * 0.35).toFixed(2)}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DiwaliLights;
