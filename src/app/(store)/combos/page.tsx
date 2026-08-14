import Link from "next/link";
import { ComboBuilder } from "@/components/store/ComboBuilder";
import { createPageMetadata } from "@/lib/metadata";
import { comboRules, formatInr } from "@/lib/pricing";
import { comboPresets, products, productsBySlug } from "@/lib/products";
import Image from "next/image";

export const metadata = createPageMetadata({
  title: "Combo offers",
  description:
    "Build your Silk Room bundle — any 3 or 5 polos with automatic combo savings.",
  path: "/combos",
});

export default function CombosPage() {
  return (
    <div className="combos-page">
      <header className="store-page-header">
        <p className="eyebrow">Combos</p>
        <h1>Mix colours. Watch the total drop.</h1>
        <p>
          {comboRules.map((rule) => rule.label).join(" · ")} — savings apply
          automatically in cart.
        </p>
      </header>

      <ComboBuilder products={products} />

      <section className="combos-presets" aria-labelledby="presets-title">
        <h2 id="presets-title">Prepared mixes</h2>
        <div className="combo-grid">
          {comboPresets.map((combo) => {
            const items = productsBySlug(combo.slugs);
            const price =
              combo.count === 3
                ? (comboRules.find((rule) => rule.id === "trio")?.value ?? 799)
                : (comboRules.find((rule) => rule.id === "five")?.value ?? 1299);
            return (
              <article key={combo.slug} className="combo-card">
                <div className="combo-stack" aria-hidden="true">
                  {items.slice(0, 3).map((product, index) => (
                    <span
                      key={product.slug}
                      className="combo-stack-shot"
                      style={{ zIndex: 3 - index }}
                    >
                      <Image src={product.image} alt="" fill sizes="120px" />
                    </span>
                  ))}
                </div>
                <h3>{combo.name}</h3>
                <p>{combo.blurb}</p>
                <p className="combo-card-price">
                  {combo.count} polos · {formatInr(price)}
                </p>
                <Link href="/shop" className="button button-ghost">
                  Shop to build
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
