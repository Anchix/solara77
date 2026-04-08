import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Camera } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  images: string[];
  created_at: string;
}

const StarRating = ({ rating, onChange, interactive = false }: { rating: number; onChange?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer" : ""}`}
        onClick={() => interactive && onChange?.(i)}
      />
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, text: "", imageUrls: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (data) setReviews(data as Review[]);
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async () => {
    if (!form.name) { toast.error("Please enter your name"); return; }
    setLoading(true);
    const images = form.imageUrls ? form.imageUrls.split(",").map((u) => u.trim()).filter(Boolean) : [];
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      customer_name: form.name,
      rating: form.rating,
      review_text: form.text || null,
      images,
    });
    if (error) { toast.error("Failed to submit review"); setLoading(false); return; }
    toast.success("Review submitted! Thank you ✨");
    setForm({ name: "", rating: 5, text: "", imageUrls: "" });
    setShowForm(false);
    // Refresh
    const { data } = await supabase.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
    if (data) setReviews(data as Review[]);
    setLoading(false);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-xl font-semibold">Reviews</h3>
          {avgRating && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" /> {avgRating} ({reviews.length})
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-secondary rounded-lg p-5 space-y-4">
          <div>
            <Label>Your Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Rating</Label>
            <div className="mt-1"><StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} interactive /></div>
          </div>
          <div>
            <Label>Your Review</Label>
            <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="mt-1" rows={3} placeholder="Share your experience..." />
          </div>
          <div>
            <Label className="flex items-center gap-1"><Camera className="h-4 w-4" /> Image URLs (comma separated)</Label>
            <Input value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} className="mt-1" placeholder="https://example.com/photo1.jpg, https://..." />
          </div>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Submitting..." : "Submit Review"}</Button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{r.customer_name}</span>
                  <StarRating rating={r.rating} />
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              {r.review_text && <p className="text-sm text-muted-foreground mt-1">{r.review_text}</p>}
              {r.images && r.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.images.map((img, i) => (
                    <img key={i} src={img} alt="Review" className="w-16 h-16 object-cover rounded" loading="lazy" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
