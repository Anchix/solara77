import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  const isOutOfStock = product.is_out_of_stock;
  const primaryImg = product.images?.[0] || "/placeholder.svg";
  const hoverImg = product.images?.[1] || primaryImg;
  const hasHover = hoverImg !== primaryImg;

  return (
    <div className="group">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative bg-secondary rounded-lg overflow-hidden aspect-square flex items-center justify-center p-8 transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
          <img
            src={primaryImg}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-contain p-8 transition-opacity duration-700 ${hasHover ? "group-hover:opacity-0" : "group-hover:scale-105"} ${isOutOfStock ? "opacity-50" : ""}`}
            loading="lazy"
          />
          {hasHover && (
            <img
              src={hoverImg}
              alt={`${product.name} alternate`}
              className={`hidden md:block absolute inset-0 w-full h-full object-contain p-8 opacity-0 transition-opacity duration-700 group-hover:opacity-100 ${isOutOfStock ? "opacity-50" : ""}`}
              loading="lazy"
            />
          )}
          {isOutOfStock && (
            <span className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
          {!isOutOfStock && product.sale_price && product.sale_price < product.price && (
            <span className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              {Math.round((1 - product.sale_price / product.price) * 100)}% off
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
          {product.sale_price ? (
            <>
              <span className="font-semibold">₹{product.sale_price}</span>
              <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="font-semibold">₹{product.price}</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 gap-2 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
        >
          <ShoppingBag className="h-4 w-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
