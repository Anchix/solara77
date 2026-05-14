import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { computeBogo, isBogoActive } from "@/lib/bogo";
import CountdownTimer from "@/components/CountdownTimer";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const bogo = computeBogo(items);
  const finalTotal = totalPrice - bogo.totalDiscount;

  // Suggest adding 1 more to unlock BOGO for any single-qty BOGO product in cart
  const bogoNudges = isBogoActive()
    ? items.filter((i) => i.product.is_bogo && i.quantity % 2 === 1)
    : [];

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
            {/* BOGO promo strip */}
            {isBogoActive() && (
              <div className="rounded-lg bg-gradient-to-r from-primary/15 via-accent/15 to-primary/10 border border-primary/30 p-3 mt-2">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs font-semibold">Buy 1 Get 1 FREE on selected items</p>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className="text-muted-foreground uppercase tracking-wider">Ends in</span>
                  <CountdownTimer variant="inline" className="text-primary text-xs" />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => {
                const freeUnits = bogo.lines.find((l) => l.productId === item.product.id)?.freeUnits || 0;
                return (
                  <div key={item.product.id} className="flex gap-4 border-b border-border pb-4">
                    <img
                      src={item.product.images?.[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain bg-secondary rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        ₹{item.product.sale_price ?? item.product.price}
                      </p>
                      {item.product.is_bogo && isBogoActive() && (
                        <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          <Gift className="h-3 w-3" /> BOGO
                          {freeUnits > 0 && <span className="ml-1 text-foreground">· {freeUnits} FREE 🎉</span>}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                        <button onClick={() => removeFromCart(item.product.id)} className="ml-auto p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nudge to unlock free item */}
            {bogoNudges.length > 0 && (
              <div className="rounded-lg bg-accent/20 border border-accent/40 p-3 text-xs">
                <p className="font-medium">Add 1 more {bogoNudges[0].product.name} to unlock your <span className="text-primary font-bold">FREE bottle</span> 🎁</p>
                <button
                  onClick={() => updateQuantity(bogoNudges[0].product.id, bogoNudges[0].quantity + 1)}
                  className="mt-2 text-[11px] font-semibold underline text-primary"
                >
                  Add free item →
                </button>
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              {bogo.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-primary font-medium">
                  <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> BOGO Savings</span>
                  <span>−₹{bogo.totalDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-1">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString("en-IN")}</span>
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
