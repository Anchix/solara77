import { useParams, Link } from "react-router-dom";
import { useProductBySlug } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, ArrowLeft, Award, CheckCircle, Leaf, Sun, Gift, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import ProductReviews from "@/components/ProductReviews";
import { supabase } from "@/integrations/supabase/client";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";
import { isBogoActive } from "@/lib/bogo";
import CountdownTimer from "@/components/CountdownTimer";

const SITE_URL = "https://soluracosmo.com";

const certs = [
  { icon: Award, name: "GMP" },
  { icon: CheckCircle, name: "ISO" },
  { icon: Leaf, name: "Cruelty Free" },
  { icon: Sun, name: "Non GMO" },
];

const ProductDetail = () => {
  const { slug } = useParams();
  const { data: product, isLoading } = useProductBySlug(slug || "");
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Inject Product, AggregateRating/Review, FAQ, Breadcrumb JSON-LD + SEO meta
  useEffect(() => {
    if (!product) return;
    const url = `${SITE_URL}/product/${product.slug}`;
    const imgs = product.images && product.images.length > 0 ? product.images : [`${SITE_URL}/placeholder.svg`];
    const priceValue = product.sale_price ?? product.price;
    const desc = (product.description || product.key_benefits || product.name).slice(0, 160);

    document.title = `${product.name} — Solura Cosmetics`;
    const upsertMeta = (attr: "name" | "property", key: string, value: string) => {
      let m = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!m) { m = document.createElement("meta"); m.setAttribute(attr, key); document.head.appendChild(m); }
      m.setAttribute("content", value);
    };
    upsertMeta("name", "description", desc);
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = url;
    const ogImage = imgs[0];
    upsertMeta("property", "og:type", "product");
    upsertMeta("property", "og:title", product.name);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", product.name);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", ogImage);

    supabase
      .from("reviews")
      .select("customer_name, rating, review_text, created_at")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const reviews = (data || []) as Array<{ customer_name: string; rating: number; review_text: string | null; created_at: string }>;
        const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

        const productLd: Record<string, unknown> = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || desc,
          image: imgs,
          sku: product.id,
          brand: { "@type": "Brand", name: product.brand || "Solura" },
          category: product.category || undefined,
          url,
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "INR",
            price: priceValue,
            availability: product.is_out_of_stock
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Solura Cosmetics" },
          },
        };

        if (avg !== null && reviews.length > 0) {
          productLd.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: avg.toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          };
          productLd.review = reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.customer_name },
            datePublished: r.created_at,
            reviewBody: r.review_text || "",
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          }));
        }

        setJsonLd("product", productLd);
      });

    const faqs = [
      { q: `Is ${product.name} chemical-free?`, a: "Yes. All Solura products are crafted with natural, chemical-free ingredients and are cruelty free, GMP, ISO, and Non GMO compliant." },
      { q: `How do I use ${product.name}?`, a: product.how_to_use || "Apply as directed on the packaging. For best results use consistently as part of your daily routine." },
      { q: "What is the shipping fee?", a: "We charge a flat ₹50 shipping fee on all orders across India." },
      { q: "How can I track my order?", a: "After placing your order you can track its status from the My Orders page using your phone number." },
    ];
    setJsonLd("faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });

    setJsonLd("breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    });

    return () => {
      removeJsonLd("product");
      removeJsonLd("faq");
      removeJsonLd("breadcrumb");
    };
  }, [product]);

  // Auto-rotate product images every 4s with fade
  useEffect(() => {
    const len = product?.images?.length || 0;
    if (len <= 1) return;
    const id = setInterval(() => {
      setSelectedImage((i) => (i + 1) % len);
    }, 4000);
    return () => clearInterval(id);
  }, [product?.id, product?.images?.length]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
        <Button asChild variant="outline"><Link to="/shop">Back to Shop</Link></Button>
      </div>
    </div>
  );

  const handleAdd = () => { for (let i = 0; i < qty; i++) addToCart(product); };
  const discount = product.sale_price ? `${Math.round((1 - product.sale_price / product.price) * 100)}% off` : null;
  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"];
  const showBogo = product.is_bogo && isBogoActive() && !product.is_out_of_stock;

  const detailRows = [
    { label: "Brand", value: product.brand },
    { label: "Product Type", value: product.product_type },
    { label: "MRP", value: `₹${product.price}` },
    { label: "Net Quantity", value: product.net_quantity },
    { label: "Skin Type", value: product.skin_type },
    { label: "Key Benefits", value: product.key_benefits },
    { label: "Texture", value: product.texture },
    { label: "Usage Time", value: product.usage_time },
    { label: "How to Use", value: product.how_to_use },
    { label: "Expected Result", value: product.expected_result },
    { label: "Storage", value: product.storage_info },
    { label: "Safety Information", value: product.safety_info },
    { label: "Package Type", value: product.package_type },
    { label: "Country of Origin", value: product.country_of_origin },
  ].filter(r => r.value);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-5xl">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="bg-secondary rounded-lg flex items-center justify-center aspect-square overflow-hidden">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-contain p-4 md:p-8" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-14 h-14 md:w-16 md:h-16 rounded border-2 overflow-hidden ${i === selectedImage ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold">{product.name}</h1>
            </div>
            <div className="flex items-baseline gap-3">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-semibold">₹{product.sale_price}</span>
                  <span className="text-lg text-muted-foreground line-through">₹{product.price}</span>
                  <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">{discount}</span>
                </>
              ) : (
                <span className="text-3xl font-semibold">₹{product.price}</span>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              {certs.map(c => (
                <div key={c.name} className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full">
                  <c.icon className="h-3 w-3 text-primary" />{c.name}
                </div>
              ))}
            </div>

            {product.is_out_of_stock ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <p className="text-destructive font-semibold">Out of Stock</p>
                <p className="text-xs text-muted-foreground mt-1">This product is currently unavailable</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-secondary transition-colors">−</button>
                  <span className="px-4 py-2 border-x border-border text-sm">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-secondary transition-colors">+</button>
                </div>
                <Button size="lg" className="flex-1 gap-2" onClick={handleAdd}>
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </Button>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Product Details</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  {detailRows.length > 0 ? (
                    <dl className="space-y-3">
                      {detailRows.map(r => (
                        <div key={r.label} className="flex text-sm">
                          <dt className="w-40 shrink-0 text-muted-foreground">{r.label}</dt>
                          <dd className="font-medium">{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">No details available.</p>
                  )}
                </TabsContent>
                <TabsContent value="description" className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                  {product.specs ? (
                    <dl className="space-y-3">
                      {Object.entries(product.specs).map(([k, v]) => (
                        <div key={k} className="flex text-sm">
                          <dt className="w-36 text-muted-foreground">{k}</dt>
                          <dd className="font-medium">{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specifications available.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-border pt-8">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
