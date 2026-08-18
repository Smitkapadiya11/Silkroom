export type ProductColor = { name: string; hex: string };

export type ProductFabric = {
  gsm: number;
  composition: string;
  fit: string;
  preShrunk: boolean;
  zipHardware: string;
  collar: string;
  sleeve: string;
  countryOfOrigin: string;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  body: string;
  verifiedPurchase: boolean;
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
    id: "tmp-1",
    author: "Rahul S., Pune",
    rating: 5,
    body: "Fit is true to the chart. Ordered M, collar sits clean, fabric feels heavier than a regular polo.",
    verifiedPurchase: true,
  },
  {
    id: "tmp-2",
    author: "Ankit M., Surat",
    rating: 5,
    body: "Took the 3 for ₹799 combo. All three colours matched the photos. Delivery in 4 days.",
    verifiedPurchase: true,
  },
  {
    id: "tmp-3",
    author: "Vivek P., Bengaluru",
    rating: 4,
    body: "Zip is smooth, sleeves don’t flare. Size L for 42 chest was right. Will order another colour.",
    verifiedPurchase: true,
  },
];

const sharedFabric: ProductFabric = {
  gsm: 220,
  composition: "95% cotton, 5% elastane",
  fit: "Relaxed regular — sits clean on the shoulder, easy through the chest",
  preShrunk: true,
  zipHardware: "Brass quarter-zip",
  collar: "Ribbed stand collar",
  sleeve: "Short sleeve with rib cuff",
  countryOfOrigin: "India",
};

const waffleFabric: ProductFabric = {
  gsm: 220, // TODO: confirm with unit — waffle knit may differ from the rib solids
  composition: "Cotton-elastane waffle knit",
  fit: "Relaxed regular — clean shoulder, easy through the chest",
  preShrunk: true,
  zipHardware: "Metal quarter-zip",
  collar: "Structured polo collar",
  sleeve: "Short sleeve with finished cuff",
  countryOfOrigin: "India",
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
  {
    slug: "fern-waffle-zip-polo",
    name: "Fern Waffle Zip Polo",
    price: UNIT_PRICE,
    image: "/products/new/fern-waffle-zip-polo.jpg",
    detailImages: [
      "/products/new/fern-waffle-zip-polo.jpg",
      "/products/new/fern-waffle-zip-polo-collar.jpg",
      "/products/new/fern-waffle-zip-polo-rib.jpg",
    ],
    category: "design",
    isNew: true,
    colors: [{ name: "Fern", hex: "#8B9278" }],
    sizes: [...SIZES],
    blurb: "Muted sage waffle knit with a warm brass zip.",
    fabric: waffleFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "harbour-waffle-zip-polo",
    name: "Harbour Waffle Zip Polo",
    price: UNIT_PRICE,
    image: "/products/new/harbour-waffle-zip-polo.jpg",
    detailImages: [
      "/products/new/harbour-waffle-zip-polo.jpg",
      "/products/new/harbour-waffle-zip-polo-collar.jpg",
      "/products/new/harbour-waffle-zip-polo-rib.jpg",
    ],
    category: "design",
    isNew: true,
    colors: [{ name: "Harbour", hex: "#1B2433" }],
    sizes: [...SIZES],
    blurb: "Deep navy waffle with a cool silver zip.",
    fabric: waffleFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "slate-waffle-zip-polo",
    name: "Slate Waffle Zip Polo",
    price: UNIT_PRICE,
    image: "/products/new/slate-waffle-zip-polo.jpg",
    detailImages: [
      "/products/new/slate-waffle-zip-polo.jpg",
      "/products/new/slate-waffle-zip-polo-collar.jpg",
      "/products/new/slate-waffle-zip-polo-rib.jpg",
    ],
    category: "design",
    isNew: true,
    colors: [{ name: "Slate", hex: "#6F7478" }],
    sizes: [...SIZES],
    blurb: "Steel-grey waffle knit and a quiet gold zip.",
    fabric: waffleFabric,
    care: sharedCare,
    deliveryEstimate: "3–6 business days across metro India · 5–8 days elsewhere",
    reviews: PLACEHOLDER_REVIEWS,
  },
  {
    slug: "porcelain-waffle-zip-polo",
    name: "Porcelain Waffle Zip Polo",
    price: UNIT_PRICE,
    image: "/products/new/porcelain-waffle-zip-polo.jpg",
    detailImages: [
      "/products/new/porcelain-waffle-zip-polo.jpg",
      "/products/new/porcelain-waffle-zip-polo-collar.jpg",
      "/products/new/porcelain-waffle-zip-polo-rib.jpg",
    ],
    category: "design",
    isNew: true,
    colors: [{ name: "Porcelain", hex: "#F4F4F2" }],
    sizes: [...SIZES],
    blurb: "Bright white waffle with a clean silver zip.",
    fabric: waffleFabric,
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
