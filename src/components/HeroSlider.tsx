
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import slider1 from "@/assets/solura-slider-1.jpg";
import slider2 from "@/assets/solura-slider-2.jpg";
import slider3 from "@/assets/solura-slider-3.jpg";
import slider4 from "@/assets/solura-slider-4.jpg";
import slider5 from "@/assets/solura-slider-5.jpg";

import DiwaliFireworks from "@/components/DiwaliFireworks";

const slides = [
  {
    image: slider1,
    alt: "Solura Cosmetics skincare campaign",
    width: 1600,
    height: 900,
  },
  {
    image: slider2,
    alt: "Solura Festival Offer collection",
    width: 1600,
    height: 900,
  },
  {
    image: slider3,
    alt: "Solura Cosmetics brand and lipstick campaign",
    width: 1376,
    height: 768,
  },
  {
    image: slider4,
    alt: "Solura Hot Red lipstick collection",
    width: 1376,
    height: 768,
  },
  {
    image: slider5,
    alt: "Solura Brightening Cream campaign",
    width: 1376,
    height: 768,
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[1376/768] bg-secondary">
        {slides.map((slide, index) => {
          const isActive = index === current;

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
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

      <DiwaliFireworks />

      <Button
        variant="ghost"
        size="icon"
        onClick={prev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground/30 text-primary-foreground hover:bg-foreground/40"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground/30 text-primary-foreground hover:bg-foreground/40"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <Button
            variant="ghost"
            size="icon"
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${
              index === current
                ? "bg-accent w-6 md:w-8"
                : "bg-primary-foreground/40"
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
