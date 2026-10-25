import { isDiwaliTheme } from "@/lib/diwali";
import diyasRow from "@/assets/diwali-diyas-row.png";

/**
 * Row of lit clay diyas shown under the hero while the Diwali theme window
 * (src/lib/diwali.ts) is active. Artwork replaces the earlier CSS diyas.
 */
const DiwaliDiyas = () => {
  if (!isDiwaliTheme()) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-10 select-none overflow-visible border-b border-diwali-gold/25 bg-gradient-to-b from-background to-secondary/50"
    >
      <div className="mx-auto flex max-w-2xl justify-center px-6">
        <img
          src={diyasRow}
          alt=""
          className="diya-row-img w-full max-w-xl"
          width={1920}
          height={640}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
};

export default DiwaliDiyas;
