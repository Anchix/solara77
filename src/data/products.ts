import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  images: string[] | null;
  category: string | null;
  specs: Record<string, string> | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: string | null;
  author: string | null;
}

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return (data || []).map((p) => ({
        ...p,
        specs: p.specs as Record<string, string> | null,
      }));
    },
  });

export const useProductBySlug = (slug: string) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? { ...data, specs: data.specs as Record<string, string> | null } : null;
    },
  });

// Keep hardcoded blog posts as fallback for the frontend blog page
export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "5 Steps to a Glowing Nighttime Skincare Routine",
    slug: "nighttime-skincare-routine",
    excerpt: "Discover the perfect nighttime routine that will have you waking up with radiant, refreshed skin every morning.",
    content: `## Why Nighttime Skincare Matters\n\nYour skin does most of its repair work while you sleep. That's why a consistent nighttime routine is crucial for maintaining healthy, glowing skin.\n\n### Step 1: Double Cleanse\nStart with an oil-based cleanser to remove makeup and sunscreen, followed by a gentle face wash like **Solura Bright-X Face Wash**.\n\n### Step 2: Tone\nApply a hydrating toner to balance your skin's pH levels.\n\n### Step 3: Serum\nChoose a serum that targets your specific skin concerns.\n\n### Step 4: Night Cream\nLock in all the goodness with **Solura Glow'e Night Cream**.\n\n### Step 5: Eye Cream\nDon't forget the delicate under-eye area!`,
    featured_image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=500&fit=crop",
    published_at: "2024-12-15",
    author: "Solura Team",
  },
  {
    id: "2",
    title: "The Benefits of Chemical-Free Hair Care",
    slug: "chemical-free-hair-care",
    excerpt: "Learn why switching to natural, chemical-free hair care products can transform the health and appearance of your hair.",
    content: `## Going Natural with Your Hair Care\n\nThe beauty industry is shifting towards cleaner, more natural formulations.\n\n### Why Choose Chemical-Free?\n\n1. **Gentler on your scalp**\n2. **Better long-term results**\n3. **Eco-friendly**\n4. **Safe for colored hair**\n\n### The Power of Hibiscus\n\n**Solura Hibiglow Shampoo** harnesses the power of hibiscus extract in a gentle, chemical-free formula.`,
    featured_image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=500&fit=crop",
    published_at: "2024-11-20",
    author: "Solura Team",
  },
  {
    id: "3",
    title: "Understanding Your Skin Type: A Complete Guide",
    slug: "understanding-skin-type",
    excerpt: "Not sure what your skin type is? This comprehensive guide will help you identify it and choose the right products.",
    content: `## Know Your Skin, Love Your Skin\n\nUnderstanding your skin type is the foundation of any effective skincare routine.\n\n### The Five Main Skin Types\n\n1. **Normal Skin** — Well-balanced\n2. **Dry Skin** — Tight feeling\n3. **Oily Skin** — Shiny appearance\n4. **Combination Skin** — Oily T-zone\n5. **Sensitive Skin** — Easily irritated\n\n**Solura Bright-X Face Wash** is formulated for all skin types.`,
    featured_image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=500&fit=crop",
    published_at: "2024-10-10",
    author: "Solura Team",
  },
];
