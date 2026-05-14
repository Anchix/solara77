import { Link } from "react-router-dom";
import { useProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Sun, Shield, Award, CheckCircle, Star, Truck, CreditCard } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import HeroSlider from "@/components/HeroSlider";
import BogoBanner from "@/components/BogoBanner";
import naturalBeauty from "@/assets/natural-beauty.jpg";
import certifications from "@/assets/certifications.png";


const testimonials = [
  { name: "Lakshmi", text: "The Bright-X Face Wash transformed my skin in just 2 weeks. My complexion has never looked better!", rating: 5 },
  { name: "Shaik Asfaq", text: "I've tried countless shampoos but Hibiglow is the only one that gives my hair that natural shine without any chemicals.", rating: 5 },
  { name: "Sasi Prabha", text: "The Glow'e Night Cream is absolute luxury. I wake up every morning with soft, glowing skin.", rating: 5 },
  { name: "Priya M.", text: "Solura products are now a staple in my routine. Love that they're chemical-free and actually work!", rating: 4 },
];

const certs = [
  { icon: Award, name: "GMP Certified" },
  { icon: CheckCircle, name: "ISO Certified" },
  { icon: Leaf, name: "Cruelty Free" },
  { icon: Sun, name: "Non GMO" },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Trust badges */}
      <section className="py-4 md:py-6 border-y border-border">
        <div className="container flex flex-wrap justify-center gap-4 md:gap-16 items-center">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"><Truck className="h-4 w-4 text-primary" /> Fast Delivery</div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"><CreditCard className="h-4 w-4 text-primary" /> Secure Payments</div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"><Shield className="h-4 w-4 text-primary" /> 100% Genuine Products</div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"><Leaf className="h-4 w-4 text-primary" /> Chemical-Free</div>
        </div>
      </section>

      {/* Bestsellers Carousel */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Our Collection</p>
            <h2 className="font-display text-3xl md:text-5xl font-light">Bestsellers</h2>
          </div>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading products...</p>
          ) : (
            <div className="max-w-5xl mx-auto px-4 md:px-0">
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="-ml-4">
                  {products.map((p) => (
                    <CarouselItem key={p.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <ProductCard product={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-2 md:-left-12" />
                <CarouselNext className="-right-2 md:-right-12" />
              </Carousel>
            </div>
          )}
          <div className="text-center mt-8 md:mt-12">
            <Button asChild variant="outline" size="lg"><Link to="/shop">View All Products</Link></Button>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container text-center px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">Certified Quality</p>
          <h2 className="font-display text-2xl md:text-4xl font-light mb-10">Our Certifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
            {certs.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-3 p-4 bg-card border border-border rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium">{c.name}</p>
              </div>
            ))}
          </div>
          <img src={certifications} alt="GMP, ISO, Cruelty Free, Non GMO certifications" className="max-w-full md:max-w-2xl mx-auto mt-8" loading="lazy" width={1920} height={512} />
        </div>
      </section>

      {/* Natural beauty section */}
      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            <img src={naturalBeauty} alt="Natural skincare" className="rounded-lg shadow-lg w-full" loading="lazy" width={1200} height={800} />
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Why Solura?</p>
              <h2 className="font-display text-2xl md:text-4xl font-light">Pure Ingredients,<br />Real Results</h2>
              <div className="space-y-4">
                {[
                  { icon: Leaf, title: "Chemical-Free", desc: "100% natural ingredients, no harsh chemicals or parabens" },
                  { icon: Sun, title: "Daily Glow", desc: "Designed for everyday use to enhance your natural radiance" },
                  { icon: Sparkles, title: "Premium Quality", desc: "Carefully crafted formulations tested for all skin types" },
                ].map((v) => (
                  <div key={v.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <v.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{v.title}</h3>
                      <p className="text-sm text-muted-foreground">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline"><Link to="/shop">Explore Products</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-secondary">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">What Our Customers Say</p>
            <h2 className="font-display text-3xl md:text-5xl font-light">Testimonials</h2>
          </div>
          <div className="max-w-5xl mx-auto">
            <Carousel opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-4">
                {testimonials.map((t) => (
                  <CarouselItem key={t.name} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4 h-full">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= t.rating ? "fill-accent text-accent" : "text-muted/30"}`} />)}
                      </div>
                      <p className="text-muted-foreground italic leading-relaxed text-sm">"{t.text}"</p>
                      <p className="font-medium text-sm">— {t.name}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 md:-left-4" />
              <CarouselNext className="-right-2 md:-right-4" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="container text-center max-w-2xl mx-auto px-4">
          <h2 className="font-display text-2xl md:text-4xl font-light mb-4">Ready to Glow?</h2>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">Join thousands of happy customers who've switched to natural, chemical-free skincare.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2"><Link to="/shop">Shop Now <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/founder-story">Our Story</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
