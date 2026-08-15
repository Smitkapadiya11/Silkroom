"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { formatInr } from "@/lib/pricing";
import { getAllColorNames, products, SIZES, type Product } from "@/lib/products";

type ShopFilter = "all" | "new" | "design" | "solid";

export function ShopClient({ catalog }: { catalog: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = (searchParams.get("filter") as ShopFilter | null) ?? "all";
  const color = searchParams.get("color") ?? "All";
  const size = searchParams.get("size") ?? "All";
  const colors = useMemo(() => ["All", ...getAllColorNames()], []);
  const productTypes = useMemo(
    () =>
      (["all", ...(catalog.some((product) => product.isNew) ? ["new"] : []), ...(catalog.some((product) => product.category === "design") ? ["design"] : []), "solid"] as const),
    [catalog],
  );

  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "all") params.delete(name);
    else params.set(name, value);
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = [...catalog];
    if (filter === "new") list = list.filter((product) => product.isNew);
    if (filter === "design") list = list.filter((product) => product.category === "design");
    if (filter === "solid") list = list.filter((product) => product.category === "solid");
    if (color !== "All") {
      list = list.filter((product) =>
        product.colors.some((item) => item.name === color),
      );
    }
    if (size !== "All") {
      list = list.filter((product) => product.sizes.includes(size));
    }
    return list;
  }, [catalog, color, filter, size]);

  return (
    <div className="shop-page">
      <header className="store-page-header">
        <p className="eyebrow">Shop</p>
        <h1>Every polo in the room</h1>
        <p>{filtered.length} polo{filtered.length === 1 ? "" : "s"} · {formatInr(products[0]?.price ?? 399)} each</p>
      </header>

      <div className="shop-filters" role="search">
        <div className="shop-filter-row" aria-label="Product type">
          {productTypes.map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? "is-active" : ""}
              onClick={() => setParam("filter", item)}
            >
              {item === "all" ? "All" : item === "new" ? "New" : `${item}s`}
            </button>
          ))}
        </div>
        <div className="shop-filter-row" aria-label="Colour">
          {colors.map((item) => (
            <button
              key={item}
              type="button"
              className={color === item ? "is-active" : ""}
              onClick={() => setParam("color", item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="shop-filter-row" aria-label="Size">
          {["All", ...SIZES].map((item) => (
            <button
              key={item}
              type="button"
              className={size === item ? "is-active" : ""}
              onClick={() => setParam("size", item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="store-grid shop-grid-animated" key={`${filter}-${color}-${size}`}>
          {filtered.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 6}
              className="shop-card-enter"
            />
          ))}
        </div>
      ) : (
        <div className="shop-empty">
          <p>No polos in that combination.</p>
          <button type="button" onClick={() => router.replace(pathname)}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
