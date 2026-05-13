import { useEffect } from "react";
import { Leaf, Heart, Award } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { applySeo } from "@/lib/seo";

const faqs = [
  { q: "Are Solura products chemical-free?", a: "Yes. Every Solura product is crafted with natural ingredients and is GMP, ISO, Cruelty Free and Non GMO compliant." },
  { q: "Do you ship across India?", a: "Yes, we ship pan-India with a flat ₹50 shipping fee on all orders." },
  { q: "How long does delivery take?", a: "Most orders are delivered within 4-7 business days depending on your location." },
  { q: "Can I track my order without creating an account?", a: "Yes. Solura is a guest-friendly experience — track your order anytime from the My Orders page using the phone number you placed the order with." },
  { q: "What is your return policy?", a: "Unopened products can be returned within 7 days of delivery. Reach out to our support team to initiate a return." },
  { q: "Are your products safe for sensitive skin?", a: "Our formulations use gentle, natural ingredients suitable for most skin types. We always recommend a patch test if you have sensitive skin." },
];

const About = () => {
  useEffect(() => {
    setJsonLd("faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    return () => removeJsonLd("faq");
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Our Story</p>
          <h1 className="font-display text-4xl md:text-5xl font-light">About Solura</h1>
        </div>

        <div className="space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Solura was born from a simple belief: everyone deserves access to premium, chemical-free beauty products that actually work. What started as a project at a startup pitch competition has grown into a brand trusted by thousands across India.
            </p>
            <p>
              Our products are crafted with carefully sourced natural ingredients — from hibiscus-infused shampoos to botanical night creams — each formulation is designed to enhance your natural beauty without compromising on quality or safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {[
              { icon: Leaf, title: "Natural Ingredients", desc: "Every product is made with 100% natural, sustainably sourced ingredients." },
              { icon: Heart, title: "Made with Love", desc: "Small-batch production ensures quality and attention to detail in every product." },
              { icon: Award, title: "Tested & Trusted", desc: "Dermatologically tested and trusted by thousands of happy customers." },
            ].map((v) => (
              <div key={v.title} className="text-center space-y-3 bg-secondary rounded-lg p-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="pt-8">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Help Center</p>
              <h2 className="font-display text-3xl md:text-4xl font-light">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="max-w-2xl mx-auto">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
