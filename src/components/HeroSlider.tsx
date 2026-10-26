import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import flashLipsticks from "@/assets/solura-flash-sale-lipsticks.jpeg.asset.json";
import flashSkincare from "@/assets/solura-flash-sale-skincare.jpeg.asset.json";
import diwaliSlide from "@/assets/solura-diwali-slide.jpeg.asset.json";
import royaltySlide from "@/assets/solura-royalty-slide.jpeg.asset.json";
import festiveSlide from "@/assets/solura-festive-slide.jpeg.asset.json";

import flashLipsticksFallback from "@/assets/solura-flash-sale-lipsticks-fallback.webp";
import flashSkincareFallback from "@/assets/solura-flash-sale-skincare-fallback.webp";
import diwaliFallback from "@/assets/solura-diwali-fallback.webp";
import royaltyFallback from "@/assets/solura-royalty-fallback.webp";
import festiveFallback from "@/assets/solura-festive-fallback.webp";
import DiwaliFireworks from "@/components/DiwaliFireworks";

const slides = [
  { image: flashLipsticks.url, fallback: flashLipsticksFallback, alt: "Solura 1st Anniversary Mega Sale — 27-minute flash sale, October 27, 7:00–7:27 PM; lipsticks and soap at ₹27", width: 1024, height: 1024 },
  { image: flashSkincare.url, fallback: flashSkincareFallback, alt: "Solura 1st Anniversary Mega Sale — 27-minute flash sale, only October 27; shampoo, face wash and brightening cream at ₹127", width: 1024, height: 1024 },
  { image: diwaliSlide.url, fallback: diwaliFallback, alt: "Solura — Brighten Like Diwali, up to 50% off on viral picks", width: 1376, height: 768 },
  { image: royaltySlide.url, fallback: royaltyFallback, alt: "Solura Brightening Cream — Brighten Like Royalty, up to 50% off on viral picks", width: 1142, height: 768 },
  { image: festiveSlide.url, fallback: festiveFallback, alt: "Solura festive pre-sale — special offer, up to 50% off", width: 1376, height: 768 },
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
