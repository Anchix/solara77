import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide5 from "@/assets/hero-slide-5.jpg";
import lipstickOfferAsset from "@/assets/solura-hot-red-lipstick-offer.jpeg.asset.json";
import shampooOfferAsset from "@/assets/solura-hibiglow-shampoo-offer.jpeg.asset.json";


const slides = [
  {
    image: lipstickOfferAsset.url,
    alt: "Solura Hot Red Lipstick offer price ₹60, valid September 14 and 15",
    offer: true,
  },
  {
    image: shampooOfferAsset.url,
    alt: "Solura Hibiglow anti-dandruff shampoo offer price ₹99, valid September 14 and 15",
    offer: true,
  },
  {
    image: heroSlide2,
    alt: "Solura cosmetics made with carefully selected ingredients",
    subtitle: "Handcrafted With Love",
    title: "Pure Ingredients, Real Results",
    description: "Experience the power of nature with our carefully crafted formulations tested for all skin types.",
    cta: { label: "Buy Now", to: "/shop" },
    ctaSecondary: { label: "Learn More", to: "/about" },
  },
  {
    image: heroSlide3,
    alt: "Solura innovative herbal skincare and haircare collection",
    subtitle: "GMP · ISO Certified",
    title: "Trusted by 5000+ Customers",
    description: "Join thousands who've switched to innovative herbal skincare and haircare.",
    cta: { label: "Explore Products", to: "/shop" },
    ctaSecondary: { label: "View Reviews", to: "/shop" },
  },
  {
    image: heroSlide5,
    alt: "Solura skincare, haircare and lip products",
    subtitle: "The Full Collection",
    title: "Skincare, Haircare & Lips",
    description: "Hibiglow, Bright-X, Brightening Cream and more — innovative herbal essentials in one place.",
    cta: { label: "Explore Collection", to: "/shop" },
    ctaSecondary: { label: "Our Story", to: "/founder-story" },
  },
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
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[85vh]">
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
              {slide.offer ? (
                <Link to="/shop" className="block h-full bg-foreground" aria-label={`${slide.alt}. Shop now`}>
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-full object-contain"
                    width={1024}
                    height={1024}
                    decoding={index === 0 ? "sync" : "async"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </Link>
              ) : (
                <>
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                    width={1920}
                    height={800}
                    decoding="async"
                    fetchPriority="low"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="container max-w-6xl mx-auto px-4">
                      <div className="max-w-lg text-primary-foreground">
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary-foreground/80 mb-2 md:mb-4">
                          {slide.subtitle}
                        </p>
                        <h1 className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.05] tracking-tight mb-3 md:mb-6 italic">
                          {slide.title}
                        </h1>
                        <p className="text-primary-foreground/80 text-xs sm:text-sm md:text-lg leading-relaxed mb-4 md:mb-8 max-w-md">
                          {slide.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                          <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 text-sm md:text-base h-9 md:h-11">
                            <Link to={slide.cta?.to ?? "/shop"}>
                              {slide.cta?.label} <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 text-sm md:text-base h-9 md:h-11">
                            <Link to={slide.ctaSecondary?.to ?? "/about"}>{slide.ctaSecondary?.label}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-foreground/40 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-foreground/40 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${
              index === current ? "bg-accent w-6 md:w-8" : "bg-primary-foreground/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
