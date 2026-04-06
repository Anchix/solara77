import { useParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useState } from "react";

const ProductDetail = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
          <Button asChild variant="outline">
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-5xl">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-secondary rounded-lg flex items-center justify-center p-12 aspect-square">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-semibold">₹{product.salePrice}</span>
                  <span className="text-lg text-muted-foreground line-through">₹{product.price}</span>
                  <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {product.discount}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-semibold">₹{product.price}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Quantity + Add to Cart */}
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

            {/* Specs */}
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
                  <dl className="space-y-3">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex text-sm">
                        <dt className="w-36 text-muted-foreground">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
