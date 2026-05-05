const messages = [
  "✨ Get 10% OFF on your first purchase — use code WELCOME10",
  "🚚 Free shipping on prepaid orders above ₹999",
  "🌿 100% Chemical-Free · Cruelty-Free · GMP Certified",
  "💖 Join 5000+ happy customers — Shop Solura today",
];

const AnnouncementBar = () => {
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
