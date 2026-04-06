import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative bg-secondary rounded-lg overflow-hidden aspect-square flex items-center justify-center p-8 group-hover:shadow-lg transition-shadow">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discount && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              {product.discount}
            </span>
          )}
        </div>
      </Link>
      <div className="mt-4 space-y-2">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-lg font-semibold hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="font-semibold">₹{product.salePrice}</span>
              <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="font-semibold">₹{product.price}</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 gap-2"
          onClick={() => addToCart(product)}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
