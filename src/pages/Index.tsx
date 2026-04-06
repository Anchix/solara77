import { Link } from "react-router-dom";
import { useProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Leaf, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const heroWords = ["Radiance", "Confidence", "Glow"];

const testimonials = [
  { name: "Lakshmi", text: "The Bright-X Face Wash transformed my skin in just 2 weeks. My complexion has never looked better!" },
  { name: "Shaik Asfaq", text: "I've tried countless shampoos but Hibiglow is the only one that gives my hair that natural shine without any chemicals." },
  { name: "Sasi Prabha", text: "The Glow'e Night Cream is absolute luxury. I wake up every morning with soft, glowing skin." },
];

const Index = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const { data: products = [], isLoading } = useProducts();

  useEffect(() => {
    const interval = setInterval(() => setWordIndex((i) => (i + 1) % heroWords.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-24 md:py-40">
        <div className="container text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 animate-fade-in">Chemical-Free · Natural · Luxurious</p>
          <h1 className="font-display text-5xl md:text-7xl font-light leading-tight">
            Discover Your<br />
            <span className="font-semibold text-primary italic transition-all duration-500">{heroWords[wordIndex]}</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-lg mx-auto leading-relaxed">Premium skincare and haircare products crafted with natural ingredients for your everyday glow.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2"><Link to="/shop">Shop Now <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/about">Our Story</Link></Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Our Collection</p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Bestsellers</h2>
          </div>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading products...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg"><Link to="/shop">View All Products</Link></Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto text-center">
            {[
              { icon: Leaf, title: "Chemical-Free", desc: "100% natural ingredients, no harsh chemicals or parabens" },
              { icon: Sun, title: "Daily Glow", desc: "Designed for everyday use to enhance your natural radiance" },
              { icon: Sparkles, title: "Premium Quality", desc: "Carefully crafted formulations tested for all skin types" },
            ].map((v) => (
              <div key={v.title} className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><v.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="font-display text-xl font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">What Our Customers Say</p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-lg p-6 space-y-4">
                <p className="text-muted-foreground italic leading-relaxed">"{t.text}"</p>
                <p className="font-medium text-sm">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
