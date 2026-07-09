import { isBogoActive } from "@/lib/bogo";

const baseMessages = [
  "✨ Get 10% OFF on your first purchase — use code WELCOME10",
  "🚚 Free shipping on prepaid orders above ₹999",
  "🌿 100% Chemical-Free · Cruelty-Free · GMP Certified",
];

const bogoMessages = [
  "🎁 BUY 1 GET 1 FREE on selected bestsellers — Ends 15 July!",
  "⏰ Hurry! Buy 1 Get 1 FREE ending soon — Shop now",
];

const AnnouncementBar = () => {
  const messages = isBogoActive() ? [...bogoMessages, ...baseMessages] : baseMessages;
  const loop = [...messages, ...messages];
  return (
    <div className="w-full bg-primary text-primary-foreground overflow-hidden border-b border-primary/20">
      <div className="relative flex whitespace-nowrap py-2">
        <div className="flex animate-marquee gap-12 pr-12">
          {loop.map((m, i) => (
            <span key={i} className="text-xs md:text-sm font-medium tracking-wide">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
