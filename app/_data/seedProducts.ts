export type ProductCategory = "trousers" | "shirts";

export type Product = {
  id: string; // stable id for cart/orders (we'll also use slug for routing)
  slug: string;
  category: ProductCategory;

  name: string;
  subtitle: string;
  description: string;

  priceNgn: number;

  images: string[]; // /images/...
  sizes: string[];  // demo sizes - edit later
  colors: string[]; // demo colors - edit later

  highlights: string[];
  details: string[];
};

export const SEED_PRODUCTS: Product[] = [
  // =========================
  // TROUSERS (5)
  // =========================
  {
    id: "trouser-001",
    slug: "signature-slim-trouser-wine",
    category: "trousers",
    name: "Signature Slim Trouser",
    subtitle: "Sharp fit, clean finish, all-day comfort.",
    description:
      "A premium slim trouser designed for a confident silhouette. Easy to dress up or down, with a refined waistline and a smooth fall from hip to hem.",
    priceNgn: 18500,
    images: ["/images/trouser-1.jpg", "/images/trouser-2.jpg", "/images/trouser-3.jpg", "/images/trouser-4.jpg", "/images/trouser-5.jpg"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    colors: ["Wine", "Black", "Ash"],
    highlights: [
      "Slim fit with comfort stretch feel",
      "Clean front and structured waist",
      "Perfect for casual and smart looks"
    ],
    details: [
      "Care: gentle wash, low heat iron",
      "Style: slim trouser",
      "Occasion: work, outing, dinner",
      "Finish: premium stitching & clean seams"
    ]
  },
  {
    id: "trouser-002",
    slug: "everyday-straight-trouser-black",
    category: "trousers",
    name: "Everyday Straight Trouser",
    subtitle: "Relaxed confidence in a classic cut.",
    description:
      "A straight-leg trouser built for daily wear. Comfortable through the thigh with a neat taper down the leg — simple, timeless, and easy to pair.",
    priceNgn: 16500,
    images: ["/images/trouser-2.jpg", "/images/trouser-1.jpg", "/images/trouser-3.jpg", "/images/trouser-4.jpg", "/images/trouser-5.jpg"],
    sizes: ["28", "30", "32", "34", "36", "38", "40", "42"],
    colors: ["Black", "Navy", "Chocolate"],
    highlights: [
      "Classic straight fit",
      "Comfort-first waist construction",
      "Clean minimal design"
    ],
    details: [
      "Care: wash inside out for longevity",
      "Style: straight trouser",
      "Occasion: everyday, office, meetings",
      "Finish: durable seams"
    ]
  },
  {
    id: "trouser-003",
    slug: "smart-taper-trouser-ash",
    category: "trousers",
    name: "Smart Taper Trouser",
    subtitle: "A polished taper built for style.",
    description:
      "Our smart taper trouser balances comfort and structure. Designed to sit well at the waist, with a refined taper that keeps the look neat and premium.",
    priceNgn: 17500,
    images: ["/images/trouser-3.jpg", "/images/trouser-1.jpg", "/images/trouser-2.jpg", "/images/trouser-4.jpg", "/images/trouser-5.jpg"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    colors: ["Ash", "Black", "Wine"],
    highlights: [
      "Tapered leg for a neat silhouette",
      "Comfort fit waist",
      "Easy to style with shirts & tees"
    ],
    details: [
      "Care: hand wash recommended",
      "Style: tapered trouser",
      "Occasion: smart casual, events",
      "Finish: premium hem"
    ]
  },
  {
    id: "trouser-004",
    slug: "classic-formal-trouser-navy",
    category: "trousers",
    name: "Classic Formal Trouser",
    subtitle: "Formal done properly.",
    description:
      "A formal trouser with a clean drape and sharp lines. Designed for elevated looks: office, church, weddings, and formal events.",
    priceNgn: 19500,
    images: ["/images/trouser-4.jpg", "/images/trouser-1.jpg", "/images/trouser-2.jpg", "/images/trouser-3.jpg", "/images/trouser-5.jpg"],
    sizes: ["30", "32", "34", "36", "38", "40", "42"],
    colors: ["Navy", "Black", "Charcoal"],
    highlights: [
      "Elegant drape and sharp finishing",
      "Formal-ready fit",
      "Premium stitching and refined feel"
    ],
    details: [
      "Care: dry clean preferred",
      "Style: formal trouser",
      "Occasion: formal events, work",
      "Finish: clean crease look"
    ]
  },
  {
    id: "trouser-005",
    slug: "street-cargo-trouser-chocolate",
    category: "trousers",
    name: "Street Cargo Trouser",
    subtitle: "Utility meets premium streetwear.",
    description:
      "A modern cargo trouser with clean pocket placement and a premium silhouette. Built for style and movement — easy to pair with sneakers and shirts alike.",
    priceNgn: 20500,
    images: ["/images/trouser-5.jpg", "/images/trouser-1.jpg", "/images/trouser-2.jpg", "/images/trouser-3.jpg", "/images/trouser-4.jpg"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    colors: ["Chocolate", "Black", "Olive"],
    highlights: [
      "Modern cargo style with clean pockets",
      "Comfort for movement",
      "Strong streetwear vibe"
    ],
    details: [
      "Care: wash cold",
      "Style: cargo trouser",
      "Occasion: casual, outdoor, streetwear",
      "Finish: reinforced seams"
    ]
  },

  // =========================
  // SHIRTS (5)
  // =========================
  {
    id: "shirt-001",
    slug: "premium-oxford-shirt-white",
    category: "shirts",
    name: "Premium Oxford Shirt",
    subtitle: "Clean, crisp and confident.",
    description:
      "A premium oxford-style shirt with a structured collar and a clean silhouette. Ideal for work, events, and smart casual styling.",
    priceNgn: 14500,
    images: ["/images/shirt-1.jpg", "/images/shirt-2.jpg", "/images/shirt-3.jpg", "/images/shirt-4.jpg", "/images/shirt-5.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Sky Blue", "Black"],
    highlights: [
      "Structured collar for sharp looks",
      "Comfort fit through the body",
      "Easy to style with trousers"
    ],
    details: [
      "Care: gentle wash, low heat iron",
      "Style: oxford shirt",
      "Occasion: office, church, dinner",
      "Finish: premium buttons"
    ]
  },
  {
    id: "shirt-002",
    slug: "classic-buttondown-shirt-wine",
    category: "shirts",
    name: "Classic Buttondown Shirt",
    subtitle: "A staple piece with premium finishing.",
    description:
      "A classic buttondown made for daily confidence. Balanced fit, clean lines, and a premium touch that sits well under jackets or on its own.",
    priceNgn: 13500,
    images: ["/images/shirt-2.jpg", "/images/shirt-1.jpg", "/images/shirt-3.jpg", "/images/shirt-4.jpg", "/images/shirt-5.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Wine", "White", "Black"],
    highlights: [
      "Clean button-down front",
      "Comfortable everyday fit",
      "Premium finishing"
    ],
    details: [
      "Care: wash cold, iron inside out",
      "Style: buttondown",
      "Occasion: everyday, dates, outings",
      "Finish: durable seams"
    ]
  },
  {
    id: "shirt-003",
    slug: "minimal-poplin-shirt-black",
    category: "shirts",
    name: "Minimal Poplin Shirt",
    subtitle: "Minimal design. Maximum impact.",
    description:
      "A minimal poplin shirt built for sharp outfits. Clean feel, smooth look, and a premium silhouette that stands out without doing too much.",
    priceNgn: 15500,
    images: ["/images/shirt-3.jpg", "/images/shirt-1.jpg", "/images/shirt-2.jpg", "/images/shirt-4.jpg", "/images/shirt-5.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Ash"],
    highlights: [
      "Minimal premium silhouette",
      "Smooth poplin feel",
      "Pairs with anything"
    ],
    details: [
      "Care: machine wash low",
      "Style: poplin shirt",
      "Occasion: smart casual, events",
      "Finish: neat cuffs"
    ]
  },
  {
    id: "shirt-004",
    slug: "smart-casual-shirt-sky",
    category: "shirts",
    name: "Smart Casual Shirt",
    subtitle: "Fresh, simple, and sharp.",
    description:
      "A smart casual shirt designed to look premium without stress. Clean seams, balanced fit and a feel that’s comfortable all day.",
    priceNgn: 14000,
    images: ["/images/shirt-4.jpg", "/images/shirt-1.jpg", "/images/shirt-2.jpg", "/images/shirt-3.jpg", "/images/shirt-5.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Sky Blue", "White", "Navy"],
    highlights: [
      "Balanced fit: not too slim, not too wide",
      "Premium collar and cuff structure",
      "Perfect for everyday confidence"
    ],
    details: [
      "Care: wash cold",
      "Style: smart casual",
      "Occasion: meetings, outings",
      "Finish: clean stitching"
    ]
  },
  {
    id: "shirt-005",
    slug: "statement-shirt-ash",
    category: "shirts",
    name: "Statement Shirt",
    subtitle: "Simple statement. Clean power.",
    description:
      "A statement piece with premium finishing — subtle, confident and clean. Built to stand out in a quiet, classy way.",
    priceNgn: 16000,
    images: ["/images/shirt-5.jpg", "/images/shirt-1.jpg", "/images/shirt-2.jpg", "/images/shirt-3.jpg", "/images/shirt-4.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Ash", "Black", "White"],
    highlights: [
      "Premium feel and clean look",
      "Easy to style for events",
      "Built for confidence"
    ],
    details: [
      "Care: gentle wash",
      "Style: statement shirt",
      "Occasion: events, dinner, smart casual",
      "Finish: quality buttons & neat cuffs"
    ]
  }
];