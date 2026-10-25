import { isDiwaliTheme } from "@/lib/diwali";

const COUNT = 7;

/**
 * Row of glowing clay diyas with flickering flames, shown under the hero
 * while the Diwali theme window (src/lib/diwali.ts) is active.
 */
const DiwaliDiyas = () => {
  if (!isDiwaliTheme()) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-10 select-none overflow-visible border-b border-diwali-gold/25 bg-gradient-to-b from-background to-secondary/50 py-2"
    >
      <div className="mx-auto flex max-w-3xl items-end justify-between gap-3 px-6 md:px-10">
        {Array.from({ length: COUNT }).map((_, i) => (
          <span
            key={i}
            className={`diya ${i % 2 ? "diya--small" : ""}`}
            style={{ ["--diya-delay" as string]: `${(i * 0.45).toFixed(2)}s` }}
          >
            <span className="diya-glow" />
            <span className="diya-flame" />
            <span className="diya-bowl" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default DiwaliDiyas;
