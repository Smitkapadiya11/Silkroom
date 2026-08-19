export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "2205854633526316";

type MetaEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

type MetaParams = Record<string, string | number | boolean | string[] | object[] | undefined>;

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };
    _fbq?: Window["fbq"];
  }
}

export function trackMeta(event: MetaEvent, params?: MetaParams) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (params) window.fbq("track", event, params);
  else window.fbq("track", event);
}

export function metaContents(
  items: { slug: string; quantity: number; price: number }[],
) {
  return items.map((item) => ({
    id: item.slug,
    quantity: item.quantity,
    item_price: item.price,
  }));
}
