import { useEffect } from "react";
import { useProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";

const SITE_URL = "https://soluracosmo.com";

const Shop = () => {
  const { data: products = [], isLoading } = useProducts();

  useEffect(() => {
    if (products.length === 0) return;
    setJsonLd("shop-itemlist", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Solura Shop",
      itemListElement: products.slice(0, 50).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/product/${p.slug}`,
        name: p.name,
      })),
    });
    return () => removeJsonLd("shop-itemlist");
  }, [products]);

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Solura Collection</p>
          <h1 className="font-display text-4xl md:text-5xl font-light">Shop All Products</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">Natural, chemical-free cosmetics crafted for your daily glow.</p>
        </div>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
