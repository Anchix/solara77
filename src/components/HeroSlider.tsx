import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import festivalOffer from "@/assets/solura-festival-offer.jpeg.asset.json";
import brightXFacewash from "@/assets/solura-bright-x-facewash.jpeg.asset.json";
import anniversary from "@/assets/solura-one-year-anniversary.jpeg.asset.json";
import hotRedCollection from "@/assets/solura-hot-red-collection.jpeg.asset.json";
import festivalOfferFallback from "@/assets/solura-festival-offer-fallback.webp";
import brightXFacewashFallback from "@/assets/solura-bright-x-facewash-fallback.webp";
import anniversaryFallback from "@/assets/solura-one-year-anniversary-fallback.webp";
import hotRedCollectionFallback from "@/assets/solura-hot-red-collection-fallback.webp";
import DiwaliFireworks from "@/components/DiwaliFireworks";

const slides = [
  { image: festivalOffer.url, fallback: festivalOfferFallback, alt: "Solura Festival Offer — beauty essentials and gift bag", width: 1600, height: 900 },
  { image: brightXFacewash.url, fallback: brightXFacewashFallback, alt: "Solura Bright-X Face Wash skincare campaign", width: 1024, height: 1024 },
  { image: anniversary.url, fallback: anniversaryFallback, alt: "Solura Cosmetics — one year of trust", width: 1024, height: 1024 },
  { image: hotRedCollection.url, fallback: hotRedCollectionFallback, alt: "Solura Hot Red Collection lipstick campaign", width: 720, height: 447 },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[1376/768] min-h-0 bg-secondary">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <Link
                to="/shop"
                className="absolute inset-0 flex items-center justify-center"
                aria-label={slide.alt + " — shop now"}
                tabIndex={isActive ? 0 : -1}
              >
                <img
                  src={slide.image}
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = slide.fallback; }}
                  alt={slide.alt}
                  className="h-full w-full object-contain"
                  width={slide.width}
                  height={slide.height}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Diwali fireworks over the artwork (theme window in src/lib/diwali.ts) */}
      <DiwaliFireworks />

      {/* Navigation arrows */}
      <Button variant="ghost" size="icon"
        onClick={prev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-foreground/40 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
      <Button variant="ghost" size="icon"
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-foreground/40 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <Button variant="ghost" size="icon"
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${
              index === current ? "bg-accent w-6 md:w-8" : "bg-primary-foreground/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={index === current}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
