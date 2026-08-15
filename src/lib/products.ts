export type ProductColor = { name: string; hex: string };

export type ProductFabric = {
  gsm: number;
  composition: string;
  fit: string;
  preShrunk: boolean;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number | null;
  body: string;
  isPlaceholder: true;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  image: string;
  category: "solid" | "design";
  isNew?: boolean;
  detailImages?: string[];
  colors: ProductColor[];
  sizes: string[];
  blurb: string;
  fabric: ProductFabric;
  care: string[];
  deliveryEstimate: string;
  reviews: ProductReview[];
};

export type ComboPreset = {
  slug: string;
  name: string;
  count: 3 | 5;
  slugs: string[];
  blurb: string;
};

export const UNIT_PRICE = 399;
export const SIZES = ["S", "M", "L", "XL"] as const;

const PLACEHOLDER_REVIEWS: ProductReview[] = [
  {
    id: "review-1",
    author: "TODO: customer name",
    rating: null,
    body: "TODO: replace with real review — fit, fabric feel, delivery experience.",
    isPlaceholder: true,
  },
  {
    id: "review-2",
    author: "TODO: customer name",
    rating: null,
    body: "TODO: replace with real review — sizing accuracy and wash behaviour.",
    isPlaceholder: true,
  },
];

const sharedFabric: ProductFabric = {
  gsm: 220,
  composition: "95% cotton, 5% elastane",
  fit: "Relaxed regular — sits clean on the shoulder, easy through the chest",
  preShrunk: true,
};

const sharedCare = [
  "Machine wash cold, inside out",
  "Do not bleach",
  "Tumble dry low or line dry",
  "Cool iron on reverse if needed",
];

export const products: Product[] = [
  {
    slug: "nocturne-zip-polo",
    name: "Nocturne Zip Polo",
    price: UNIT_PRICE,
    image: "/products/Black_polo_shirt_displayed_2K_202608071858.jpeg",
    category: "solid",
    colors: [{ name: "Ink", hex: "#17171B" }],
    sizes: [...SIZES],
    blurb: "Ribbed weight, clean collar, a flash of brass.",
    fabric: sharedFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "umber-zip-polo",
    name: "Umber Zip Polo",
    price: UNIT_PRICE,
    image: "/products/Brown_ribbed_polo_shirt_2K_202608071857.jpeg",
    category: "solid",
    colors: [{ name: "Umber", hex: "#674942" }],
    sizes: [...SIZES],
    blurb: "A warm neutral cut with quiet structure.",
    fabric: sharedFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "reed-zip-polo",
    name: "Reed Zip Polo",
    price: UNIT_PRICE,
    image: "/products/Green_polo_shirt_displayed_2K_202608071856.jpeg",
    category: "solid",
    colors: [{ name: "Reed", hex: "#9B9280" }],
    sizes: [...SIZES],
    blurb: "Soft earth colour, precise rib, easy shape.",
    fabric: sharedFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "sage-zip-polo",
    name: "Sage Zip Polo",
    price: UNIT_PRICE,
    image: "/products/Green_polo_shirt_displayed_2K_202608071858.jpeg",
    category: "solid",
    colors: [{ name: "Sage", hex: "#B1B5A3" }],
    sizes: [...SIZES],
    blurb: "Pale green with a cool, considered finish.",
    fabric: sharedFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "rose-zip-polo",
    name: "Rose Zip Polo",
    price: UNIT_PRICE,
    image: "/products/Pink_ribbed_polo_shirt_2K_202608071858.jpeg",
    category: "solid",
    colors: [{ name: "Dust Rose", hex: "#D6A1A7" }],
    sizes: [...SIZES],
    blurb: "Dusty rose, softened rib, never overstated.",
    fabric: sharedFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "silver-zip-polo",
    name: "Silver Zip Polo",
    price: UNIT_PRICE,
    image: "/products/Ribbed_grey_polo_shirt_displayed_202608071857.jpeg",
    category: "solid",
    colors: [{ name: "Silver", hex: "#A9ADAB" }],
    sizes: [...SIZES],
    blurb: "Cool grey made tactile by fine vertical rib.",
    fabric: sharedFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "chalk-zip-polo",
    name: "Chalk Zip Polo",
    price: UNIT_PRICE,
    image: "/products/White_polo_shirt_flat_lay_202608071858.jpeg",
    category: "solid",
    colors: [{ name: "Chalk", hex: "#F0EFEB" }],
    sizes: [...SIZES],
    blurb: "A clear white surface with visible depth.",
    fabric: sharedFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
];

export const comboPresets: ComboPreset[] = [
  {
    slug: "night-trio",
    name: "Night Trio",
    count: 3,
    slugs: ["nocturne-zip-polo", "silver-zip-polo", "chalk-zip-polo"],
    blurb: "Ink, silver, chalk. Three quiet nights.",
  },
  {
    slug: "earth-trio",
    name: "Earth Trio",
    count: 3,
    slugs: ["umber-zip-polo", "reed-zip-polo", "sage-zip-polo"],
    blurb: "Warm ground colours, one shared rib.",
  },
  {
    slug: "rose-trio",
    name: "Rose Trio",
    count: 3,
    slugs: ["rose-zip-polo", "chalk-zip-polo", "umber-zip-polo"],
    blurb: "Dust rose with chalk and umber.",
  },
  {
    slug: "cool-five",
    name: "Cool Five",
    count: 5,
    slugs: [
      "nocturne-zip-polo",
      "silver-zip-polo",
      "chalk-zip-polo",
      "sage-zip-polo",
      "rose-zip-polo",
    ],
    blurb: "The cooler room. Five tones, one cut.",
  },
  {
    slug: "warm-five",
    name: "Warm Five",
    count: 5,
    slugs: [
      "umber-zip-polo",
      "reed-zip-polo",
      "sage-zip-polo",
      "rose-zip-polo",
      "chalk-zip-polo",
    ],
    blurb: "Earth through rose. The longer edit.",
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function productsBySlug(slugs: string[]) {
  return slugs
    .map((slug) => getProduct(slug))
    .filter((product): product is Product => Boolean(product));
}

export function getRelatedProducts(slug: string, limit = 4) {
  return products.filter((product) => product.slug !== slug).slice(0, limit);
}

export function getAllColorNames() {
  return [...new Set(products.flatMap((product) => product.colors.map((c) => c.name)))];
}
