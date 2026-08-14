"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { formatInr } from "@/lib/pricing";
import { getAllColorNames, products, SIZES, type Product } from "@/lib/products";

type SortKey = "price-asc" | "price-desc" | "name";

export function ShopClient({ catalog }: { catalog: Product[] }) {
  const [color, setColor] = useState<string>("All");
  const [size, setSize] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("name");
  const colors = useMemo(() => ["All", ...getAllColorNames()], []);

  const filtered = useMemo(() => {
    let list = [...catalog];
    if (color !== "All") {
      list = list.filter((product) =>
        product.colors.some((item) => item.name === color),
      );
    }
    if (size !== "All") {
      list = list.filter((product) => product.sizes.includes(size));
    }
    list.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [catalog, color, size, sort]);

  return (
    <div className="shop-page">
      <header className="store-page-header">
        <p className="eyebrow">Shop</p>
        <h1>Every tee in the room</h1>
        <p>{formatInr(products[0]?.price ?? 399)} each · mix combos on the Combos page</p>
      </header>

      <div className="shop-filters" role="search">
        <label>
          Colour
          <select value={color} onChange={(event) => setColor(event.target.value)}>
            {colors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Size
          <select value={size} onChange={(event) => setSize(event.target.value)}>
            <option value="All">All</option>
            {SIZES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
          >
            <option value="name">Name</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="store-grid">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
