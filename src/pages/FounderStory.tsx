import { Link } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Lightbulb, Users, Target, Award, Sparkles } from "lucide-react";

const milestones = [
  { year: "2024", title: "The Spark", desc: "Solura's concept wins at a state-level startup pitch competition, proving the idea has real potential." },
  { year: "2025", title: "Research & Development", desc: "Months of deep research, ingredient testing, product formulation, trials and improvements." },
  { year: "Oct 2025", title: "Official Launch", desc: "Solura Cosmetics officially launches on 27 October 2025, entering the real market." },
  { year: "2026", title: "Growing Impact", desc: "Trusted by thousands of customers across India, continuing to innovate with natural formulations." },
];

const values = [
  { icon: Heart, title: "No Fake Promises", desc: "We believe in honesty — every product delivers what it claims." },
  { icon: Lightbulb, title: "Natural Ingredients", desc: "100% chemical-free formulations with eco-friendly solutions." },
  { icon: Target, title: "Real Results", desc: "Designed for long-term skin and hair health, not temporary fixes." },
  { icon: Sparkles, title: "Affordable Luxury", desc: "Premium quality skincare accessible to everyone." },
];

const FounderStory = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative py-16 md:py-28 bg-gradient-to-b from-primary/10 to-background">
      <div className="container max-w-4xl mx-auto text-center px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Our Story</p>
        <h1 className="font-display text-3xl md:text-6xl font-light leading-tight mb-6">
          From a Student's Vision<br className="hidden md:block" /> to a Growing Brand
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">
          In a world full of quick fixes and unrealistic beauty promises, Solura Cosmetics stands for something different — honesty, nature, and real solutions.
        </p>
      </div>
    </section>

    {/* The Beginning */}
    <section className="py-12 md:py-20">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">The Beginning</p>
          <h2 className="font-display text-2xl md:text-4xl font-light">Where It All Started</h2>
          <p className="text-muted-foreground leading-relaxed">
            The journey of Solura Cosmetics did not begin in a laboratory or a corporate office. It started with an idea — a simple yet powerful belief:
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-4 bg-secondary/50 rounded-r-lg">
            <p className="font-display text-xl md:text-2xl italic text-foreground">
              "Every skin and hair problem deserves a sure, honest solution."
            </p>
          </blockquote>
          <p className="text-muted-foreground leading-relaxed">
            This idea took shape during a startup pitch competition, where Solura's concept stood out and won at the state level. That moment was not just a win — it became the foundation of a brand that would soon enter the real world.
          </p>
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="py-12 md:py-20 bg-secondary">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Our Journey</p>
          <h2 className="font-display text-2xl md:text-4xl font-light">Key Milestones</h2>
        </div>
        <div className="space-y-8">
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-4 md:gap-8 items-start">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                {i < milestones.length - 1 && <div className="w-px h-full min-h-[40px] bg-border mt-2" />}
              </div>
              <div className="pb-6">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">{m.year}</span>
                <h3 className="font-display text-lg md:text-xl font-semibold mt-1">{m.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Founder */}
    <section className="py-12 md:py-20">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">The Founder</p>
            <h2 className="font-display text-2xl md:text-4xl font-light">A 16-Year-Old Entrepreneur</h2>
            <p className="text-muted-foreground leading-relaxed">
              Solura Cosmetics was founded by <strong>Muhammadh Muaadh</strong>, a 16-year-old student studying in the 11th standard. Starting a business at such a young age came with unique challenges — balancing school and business, managing time and resources, and learning business fundamentals from scratch.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              But passion turned obstacles into opportunities. From late-night research sessions to early morning planning, every step of Solura's journey reflects discipline, consistency, and belief.
            </p>
          </div>
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">The Mentor</p>
            <h2 className="font-display text-2xl md:text-4xl font-light">The Vision Behind</h2>
            <p className="text-muted-foreground leading-relaxed">
              Behind every strong founder is a strong support system. <strong>Muhammed Javith</strong>, Co-Founder and Mentor, played a crucial role in shaping Solura Cosmetics — from refining the business strategy to guiding decisions. His mentorship transformed a student idea into a structured and scalable brand.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Solura is built on trust, shared vision, and mutual support. The bond between the founder and mentor represents a brotherhood driven by purpose and growth.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-12 md:py-20 bg-secondary">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">What We Stand For</p>
          <h2 className="font-display text-2xl md:text-4xl font-light">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="bg-card border border-border rounded-lg p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="py-12 md:py-20">
      <div className="container max-w-3xl mx-auto text-center px-4">
        <Award className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto mb-6" />
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Our Mission</p>
        <h2 className="font-display text-3xl md:text-5xl font-light mb-6">"Cure Problem, Sure Solution"</h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
          We aim to solve real skincare and haircare issues, provide trustworthy products, and build a brand customers can rely on. What started as a student's dream is now growing into a brand that aims to impact lives through determination, innovation, trust, and natural beauty.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/shop">Explore Products <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default FounderStory;
