import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { computeBogo, isBogoActive, BOGO_END } from "@/lib/bogo";
import CountdownTimer from "./CountdownTimer";
import { getDhanterasPrice } from "@/lib/dhanteras";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const bogo = computeBogo(items);
  const bogoActive = isBogoActive();


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 border-b border-border pb-4">
                  <img
                    src={item.product.images?.[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-20 h-20 object-contain bg-secondary rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{getDhanterasPrice(item.product)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                      <button onClick={() => removeFromCart(item.product.id)} className="ml-auto p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {bogoActive && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-primary">
                    <Gift className="h-3.5 w-3.5" /> Dhanteras Shampoo Offer
                  </span>
                    <CountdownTimer end={BOGO_END} compact noLoop />
                </div>
                {bogo.freeUnits > 0 ? (
                  <p className="text-xs text-primary">
                    🎉 You unlocked <b>{bogo.freeUnits} FREE item{bogo.freeUnits > 1 ? "s" : ""}</b> — saving ₹{bogo.savings.toLocaleString("en-IN")}!
                  </p>
                ) : items.some((i) => i.product.is_bogo) ? (
                    <p className="text-xs text-muted-foreground">Add Hibiglow Shampoo to unlock one free bottle.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Buy Hibiglow Shampoo and get one free automatically.</p>
                )}
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-2">
              {bogo.savings > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Free gift{bogo.freeUnits > 1 ? "s" : ""} added</span>
                  <span>FREE (worth ₹{bogo.savings.toLocaleString("en-IN")})</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <Button className="w-full mt-2" size="lg" onClick={() => { setIsOpen(false); navigate("/checkout"); }}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
