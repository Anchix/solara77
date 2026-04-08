import { useParams, Link } from "react-router-dom";
import { useProductBySlug } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, ArrowLeft, Shield, Award, CheckCircle, Leaf, Sun } from "lucide-react";
import { useState } from "react";
import ProductReviews from "@/components/ProductReviews";

const certs = [
  { icon: Shield, name: "FDA Approved" },
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

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-5xl">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="bg-secondary rounded-lg flex items-center justify-center p-8 aspect-square">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-contain" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${i === selectedImage ? "border-primary" : "border-border"}`}
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

            <div className="border-t border-border pt-6">
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                </TabsList>
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
