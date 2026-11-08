import { isBogoActive } from "@/lib/bogo";
import { isIndependenceTheme } from "@/lib/independence";
import { isDiwaliTheme } from "@/lib/diwali";
import { isDhanterasActive } from "@/lib/dhanteras";

const baseMessages = [
  "🚚 Free shipping for all the Orders",
  "✨ Exclusive Offer: Save 10%–30% Today",
  "🌿 Innovative Herbal Products · Cruelty-Free · GMP Certified",
  "🤖 AI-Powered Skincare – Coming Soon",

];

const independenceMessages = [
  "🇮🇳 Happy 80th Independence Day — Celebrate with Solura",
];

const bogoMessages = [
  "🎁 BUY 1 GET 1 FREE on selected bestsellers",
  "⏰ Hurry! Buy 1 Get 1 FREE ending soon — Shop now",
];

const diwaliMessages = [
  "🪔 Happy Diwali from Solura — Festival of Glow",
  "🎁 Diwali Gift Offers: Buy 1, Get 1 FREE on selected bestsellers",
  "✨ Hand-crafted herbal gifts for your Diwali rituals",
];

const dhanterasMessages = [
  "🪔 Dhanteras · Nov 6–8 only: Nude Pink ₹99 · Hot Red ₹49",
  "🎁 Hibiglow Shampoo: Buy 1, Get 1 Free · Ends Nov 8",
];

const AnnouncementBar = () => {
  const independence = isIndependenceTheme();
  const diwali = isDiwaliTheme();
  const dhanteras = isDhanterasActive();
  const messages = [
    ...(dhanteras ? dhanterasMessages : []),
    ...(diwali ? diwaliMessages : []),
    ...(independence ? independenceMessages : []),
    ...(isBogoActive() && !diwali && !dhanteras ? bogoMessages : []),
    ...baseMessages,
  ];
  const loop = [...messages, ...messages];
  return (
    <div className="w-full bg-primary text-primary-foreground overflow-hidden border-b border-primary/20">
      {independence && (
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      )}
      {diwali && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-diwali-gold to-transparent" />
      )}
      <div className="relative flex whitespace-nowrap py-2">
        <div className="flex animate-marquee gap-12 pr-12">
          {loop.map((m, i) => (
            <span key={i} className="text-xs md:text-sm font-medium tracking-wide">
              {m}
            </span>
          ))}
        </div>
      </div>
      {diwali && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-diwali-gold to-transparent" />
      )}
      {independence && (
        <div className="h-1 w-full bg-gradient-to-r from-[#138808] via-white to-[#FF9933]" />
      )}
    </div>
  );
};

export default AnnouncementBar;
