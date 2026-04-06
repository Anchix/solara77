export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  discount: string | null;
  images: string[];
  category: string;
  specs: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  publishedAt: string;
  author: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Solura Bright-X Face Wash",
    slug: "bright-x-face-wash",
    description:
      "A gentle yet effective face wash that brightens your skin with every use. Formulated with natural ingredients to remove impurities while maintaining your skin's natural moisture balance. Suitable for all skin types and daily use.",
    price: 249,
    salePrice: 200,
    discount: "20% off",
    images: [
      "https://soluracosmo.com/wp-content/uploads/2024/08/Bright-X-Face-Wash-100ml.png",
    ],
    category: "Face Care",
    specs: {
      Volume: "100ml",
      "Skin Type": "All Skin Types",
      Usage: "Daily, Morning & Night",
      "Key Ingredients": "Natural Brightening Agents",
    },
  },
  {
    id: "2",
    name: "Solura Glow'e Night Cream",
    slug: "glowe-night-cream",
    description:
      "Wake up to radiant, glowing skin with our luxurious night cream. Enriched with nourishing botanicals that work while you sleep to repair, rejuvenate, and restore your skin's natural luminosity. A must-have in your nighttime skincare routine.",
    price: 699,
    salePrice: 455,
    discount: "35% off",
    images: [
      "https://soluracosmo.com/wp-content/uploads/2024/08/Glowe-Night-cream-50gm.png",
    ],
    category: "Face Care",
    specs: {
      Weight: "50gm",
      "Skin Type": "All Skin Types",
      Usage: "Nightly before bed",
      "Key Ingredients": "Botanical Extracts, Vitamins",
    },
  },
  {
    id: "3",
    name: "Solura Hibiglow Shampoo",
    slug: "hibiglow-shampoo",
    description:
      "Transform your hair care routine with our hibiscus-infused shampoo. Designed to cleanse, strengthen, and add natural shine to your hair. Chemical-free formula that's gentle enough for everyday use while delivering salon-quality results.",
    price: 425,
    salePrice: null,
    discount: null,
    images: [
      "https://soluracosmo.com/wp-content/uploads/2024/08/Hibiglow-Shampoo-100ml.png",
    ],
    category: "Hair Care",
    specs: {
      Volume: "100ml",
      "Hair Type": "All Hair Types",
      Usage: "2-3 times per week",
      "Key Ingredients": "Hibiscus Extract",
    },
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "5 Steps to a Glowing Nighttime Skincare Routine",
    slug: "nighttime-skincare-routine",
    excerpt:
      "Discover the perfect nighttime routine that will have you waking up with radiant, refreshed skin every morning.",
    content: `
## Why Nighttime Skincare Matters

Your skin does most of its repair work while you sleep. That's why a consistent nighttime routine is crucial for maintaining healthy, glowing skin.

### Step 1: Double Cleanse
Start with an oil-based cleanser to remove makeup and sunscreen, followed by a gentle face wash like **Solura Bright-X Face Wash** to remove any remaining impurities.

### Step 2: Tone
Apply a hydrating toner to balance your skin's pH levels and prep it for the next steps.

### Step 3: Serum
Choose a serum that targets your specific skin concerns — whether it's brightening, anti-aging, or hydration.

### Step 4: Night Cream
Lock in all the goodness with a nourishing night cream. **Solura Glow'e Night Cream** is packed with botanical extracts that work overnight to rejuvenate your skin.

### Step 5: Eye Cream
Don't forget the delicate under-eye area! A good eye cream can help reduce puffiness and dark circles.

*Consistency is key — stick with your routine for at least 4 weeks to see visible results.*
    `,
    featuredImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=500&fit=crop",
    publishedAt: "2024-12-15",
    author: "Solura Team",
  },
  {
    id: "2",
    title: "The Benefits of Chemical-Free Hair Care",
    slug: "chemical-free-hair-care",
    excerpt:
      "Learn why switching to natural, chemical-free hair care products can transform the health and appearance of your hair.",
    content: `
## Going Natural with Your Hair Care

The beauty industry is shifting towards cleaner, more natural formulations — and for good reason. Chemical-laden products can strip your hair of its natural oils, leading to dryness, breakage, and dullness.

### Why Choose Chemical-Free?

1. **Gentler on your scalp** — Natural ingredients are less likely to cause irritation or allergic reactions
2. **Better long-term results** — Your hair retains its natural moisture and strength
3. **Eco-friendly** — Natural products are better for the environment
4. **Safe for colored hair** — Won't strip or fade hair color

### The Power of Hibiscus

Hibiscus has been used for centuries in traditional hair care. It's known to:
- Stimulate hair growth
- Prevent premature graying
- Add natural shine and volume
- Condition and soften hair

**Solura Hibiglow Shampoo** harnesses the power of hibiscus extract in a gentle, chemical-free formula that's suitable for all hair types.

*Make the switch today and feel the difference in just two weeks.*
    `,
    featuredImage: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=500&fit=crop",
    publishedAt: "2024-11-20",
    author: "Solura Team",
  },
  {
    id: "3",
    title: "Understanding Your Skin Type: A Complete Guide",
    slug: "understanding-skin-type",
    excerpt:
      "Not sure what your skin type is? This comprehensive guide will help you identify it and choose the right products.",
    content: `
## Know Your Skin, Love Your Skin

Understanding your skin type is the foundation of any effective skincare routine. Using the wrong products can lead to breakouts, irritation, or excessive dryness.

### The Five Main Skin Types

#### 1. Normal Skin
- Well-balanced moisture levels
- Few imperfections
- No severe sensitivity
- Barely visible pores

#### 2. Dry Skin
- Tight feeling after washing
- Rough or flaky patches
- Almost invisible pores
- Less elasticity

#### 3. Oily Skin
- Shiny appearance
- Enlarged pores
- Prone to blackheads and breakouts
- Thicker complexion

#### 4. Combination Skin
- Oily T-zone (forehead, nose, chin)
- Dry or normal cheeks
- Varying pore sizes

#### 5. Sensitive Skin
- Easily irritated
- Prone to redness
- Reactions to certain products
- May feel tight or itchy

### Choosing the Right Products

No matter your skin type, look for products with gentle, natural ingredients. **Solura Bright-X Face Wash** is formulated for all skin types, making it a perfect starting point for anyone's skincare journey.

*When in doubt, always patch test new products on a small area before applying to your full face.*
    `,
    featuredImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=500&fit=crop",
    publishedAt: "2024-10-10",
    author: "Solura Team",
  },
];
