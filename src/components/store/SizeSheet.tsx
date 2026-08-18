"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartProvider";
import { formatInr } from "@/lib/pricing";
import { SIZES, type Product } from "@/lib/products";

export function SizeSheet({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addProduct } = useCart();
  const [size, setSize] = useState<string>("M");
  const color = product.colors[0]?.name ?? "Default";

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const addToCart = (goCheckout = false) => {
    addProduct(product, size, color, 1, { open: !goCheckout });
    onClose();
    if (goCheckout) router.push("/checkout");
  };

  return (
    <div className="size-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="size-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Select size for ${product.name}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="size-sheet-handle" aria-hidden="true" />
        <header className="size-sheet-head">
          <span className="size-sheet-thumb aspect-product">
            <Image src={product.image} alt="" fill sizes="64px" />
          </span>
          <div>
            <p className="size-sheet-name">{product.name}</p>
            <p className="size-sheet-price">{formatInr(product.price)}</p>
            <Link href={`/product/${product.slug}`} className="size-sheet-view" onClick={onClose}>
              View product details
            </Link>
          </div>
          <button type="button" className="size-sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="size-sheet-label">Select size</p>
        <div className="size-sheet-sizes" role="group" aria-label="Select size">
          {SIZES.map((item) => (
            <button
              key={item}
              type="button"
              className={size === item ? "is-active" : ""}
              aria-pressed={size === item}
              onClick={() => setSize(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="size-sheet-actions">
          <button type="button" className="size-sheet-add" onClick={() => addToCart(false)}>
            Add to cart
          </button>
          <button type="button" className="size-sheet-buy" onClick={() => addToCart(true)}>
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
