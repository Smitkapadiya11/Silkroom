"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createScope, createTimeline } from "animejs";
import { ComboOffers } from "@/components/ComboOffers";
import { TrustStrip } from "@/components/store/TrustStrip";
import { useReelMotion } from "@/hooks/useReelMotion";
import {
  type Combo,
  type Product,
  PRICE,
  SIZES,
} from "@/data/products";
import {
  formatInr,
  orderBrowseMessage,
  orderComboMessage,
  orderSingleMessage,
  whatsappUrl,
} from "@/lib/order";
import { site } from "@/lib/site";
import { scrollShellTo } from "@/lib/scroll";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN0I3NjY4Ii8+PC9zdmc+";

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={direction === "left" ? "icon-arrow is-left" : "icon-arrow"}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!root.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    if (sessionStorage.getItem("silk-room-loaded") === "true") {
      setVisible(false);
      return;
    }

    const scope = createScope({ root });
    const finish = () => {
      sessionStorage.setItem("silk-room-loaded", "true");
      setVisible(false);
    };
    const hardStop = window.setTimeout(finish, 1200);

    scope.add(() => {
      createTimeline({
        onComplete: finish,
      })
        .add(".preloader-word", {
          translateY: ["110%", "0%"],
          duration: 420,
          ease: "outExpo",
        })
        .add(
          ".preloader-sheen",
          {
            translateX: ["-130%", "170%"],
            opacity: [0, 1, 0],
            duration: 480,
            ease: "inOutSine",
          },
          "-=220",
        )
        .add(".preloader", {
          opacity: [1, 0],
          duration: 220,
          ease: "outQuad",
        });
    });

    return () => {
      window.clearTimeout(hardStop);
      scope.revert();
    };
  }, []);

  if (!visible) return null;

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <div className="preloader-mask">
        <span className="preloader-word">SILK ROOM</span>
        <span className="preloader-sheen" />
      </div>
    </div>
  );
}

function SizeRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (size: string) => void;
}) {
  return (
    <div className="size-row" role="group" aria-label="Choose a size">
      {SIZES.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "size-chip is-active" : "size-chip"}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ProductPanel({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const [size, setSize] = useState("M");

  return (
    <section
      id={`product-${product.slug}`}
      className="product-panel panel snap-panel"
      data-story
      aria-labelledby={`title-${product.slug}`}
    >
      <p className="panel-index" aria-hidden="true">
        {String(index + 3).padStart(2, "0")}
      </p>

      <div className="product-layout">
        <div className="product-frame" data-enter>
          <Image
            className="product-parallax"
            src={product.image}
            alt={`${product.name} ribbed quarter-zip polo`}
            fill
            sizes="(min-width: 1024px) 45vw, (min-width: 640px) 58vw, 82vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
          <div className="photo-vignette" aria-hidden="true" />
        </div>

        <div className="product-copy">
          <p className="eyebrow" data-enter>
            The polo edit / {String(index + 1).padStart(2, "0")}
          </p>
          <div className="title-mask">
            <h2 id={`title-${product.slug}`} className="product-title" data-enter>
              {product.name}
            </h2>
          </div>
          <p className="product-blurb" data-enter>
            {product.blurb}
          </p>

          <div className="product-meta" data-enter>
            <div className="swatches" aria-label="Available colours">
              {product.colors.map((color) => (
                <span
                  key={color.name}
                  className="swatch"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                </span>
              ))}
            </div>
            <p className="price">{formatInr(product.price)}</p>
          </div>

          <div data-enter>
            <SizeRow value={size} onChange={setSize} />
          </div>

          <a
            className="button button-primary product-button"
            href={whatsappUrl(orderSingleMessage(product.name, size))}
            target="_blank"
            rel="noreferrer"
            data-enter
          >
            Order on WhatsApp
            <ArrowIcon />
          </a>
          <p className="combo-note" data-enter>
            Or three tones for {formatInr(PRICE.trio)} · five for {formatInr(PRICE.five)}
          </p>
        </div>
      </div>
    </section>
  );
}

function DetailSheet({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState("M");

  useEffect(() => {
    const node = sheet.current;
    if (!node) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const page = document.querySelector<HTMLElement>(".site-shell");
    const previousOverflow = page?.style.overflowY || "";
    const previousAriaHidden = page?.getAttribute("aria-hidden") ?? null;

    const focusable = Array.from(
      node.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    focusable[0]?.focus();
    if (page) {
      page.style.overflowY = "hidden";
      page.inert = true;
      page.setAttribute("aria-hidden", "true");
    }

    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || focusable.length < 2) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (page) {
        page.style.overflowY = previousOverflow;
        page.inert = false;
        if (previousAriaHidden === null) page.removeAttribute("aria-hidden");
        else page.setAttribute("aria-hidden", previousAriaHidden);
      }
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={sheet}
        className="detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <button className="sheet-close" type="button" onClick={onClose}>
          <span>Close</span>
          <span aria-hidden="true">×</span>
        </button>
        <div className="sheet-image">
          <Image
            src={product.image}
            alt={`${product.name} product detail`}
            fill
            sizes="(min-width: 768px) 40vw, 90vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </div>
        <p className="eyebrow">Silk Room / Polo edit</p>
        <h2 id="sheet-title" className="sheet-title">
          {product.name}
        </h2>
        <p className="sheet-copy">{product.blurb}</p>
        <SizeRow value={size} onChange={setSize} />
        <div className="sheet-line">
          <span>{product.colors[0].name}</span>
          <span className="price">{formatInr(product.price)}</span>
        </div>
        <a
          className="button button-primary"
          href={whatsappUrl(orderSingleMessage(product.name, size))}
          target="_blank"
          rel="noreferrer"
        >
          Order on WhatsApp
          <ArrowIcon />
        </a>
        <a
          className="sheet-combo-link"
          href="#combos"
          onClick={(event) => {
            event.preventDefault();
            onClose();
            window.setTimeout(() => scrollShellTo("combos"), 40);
          }}
        >
          Mix three for {formatInr(PRICE.trio)} or five for {formatInr(PRICE.five)}
        </a>
      </div>
    </div>
  );
}

function StoryRail({
  ids,
  active,
  container,
}: {
  ids: string[];
  active: number;
  container: RefObject<HTMLElement | null>;
}) {
  return (
    <nav className="story-rail" aria-label="Reel sections">
      {ids.map((id, index) => (
        <button
          key={id}
          type="button"
          className={index <= active ? "story-segment is-filled" : "story-segment"}
          aria-label={`Go to frame ${index + 1}`}
          aria-current={index === active ? "step" : undefined}
          onClick={() => {
            const page = container.current;
            const target = document.getElementById(id);
            if (!page || !target) return;
            const reduceMotion = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            const top =
              target.getBoundingClientRect().top -
              page.getBoundingClientRect().top +
              page.scrollTop;
            page.scrollTo({
              top,
              behavior: reduceMotion ? "auto" : "smooth",
            });
          }}
        >
          <span />
        </button>
      ))}
    </nav>
  );
}

export function SilkRoomExperience({
  products,
  combos,
}: {
  products: Product[];
  combos: Combo[];
}) {
  const root = useRef<HTMLElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, x: 0, left: 0 });
  const [selected, setSelected] = useState<Product | null>(null);
  const [showDragHint, setShowDragHint] = useState(true);
  const closeDetail = useCallback(() => setSelected(null), []);

  const storyIds = useMemo(
    () => ["hero", "manifesto", ...products.map((item) => `product-${item.slug}`)],
    [products],
  );
  const { activeStory, heroPassed } = useReelMotion(root, storyIds);

  useEffect(() => {
    if (sessionStorage.getItem("silk-room-dragged") === "true") {
      setShowDragHint(false);
    }
  }, []);

  const dismissDragHint = () => {
    setShowDragHint(false);
    sessionStorage.setItem("silk-room-dragged", "true");
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!gallery.current || event.button !== 0) return;
    dismissDragHint();
    dragState.current = {
      active: true,
      x: event.clientX,
      left: gallery.current.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!gallery.current || !dragState.current.active) return;
    gallery.current.scrollLeft =
      dragState.current.left - (event.clientX - dragState.current.x);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const cancelDrag = () => {
    dragState.current.active = false;
  };

  const moveGallery = (direction: number) => {
    if (!gallery.current) return;
    dismissDragHint();
    gallery.current.scrollBy({
      left: direction * gallery.current.clientWidth * 0.82,
      behavior: "auto",
    });
  };

  const handleGalleryKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") moveGallery(1);
    if (event.key === "ArrowLeft") moveGallery(-1);
  };

  const manifestoLines = [
    "Cut for low light, long evenings,",
    "and the confidence to say less.",
  ];

  return (
    <>
      <Preloader />
      <main ref={root} className="site-shell">
        <StoryRail ids={storyIds} active={activeStory} container={root} />

        <div className="scroll-content">
          <section id="hero" className="hero panel snap-panel" data-story>
            <Image
              className="hero-photo"
              src={products[0].image}
              alt="Black ribbed Silk Room quarter-zip polo worn with denim"
              fill
              priority
              sizes="100vw"
            />
            <div className="hero-scrim" aria-hidden="true" />
            <p className="panel-index hero-index" aria-hidden="true">
              01 / {String(storyIds.length).padStart(2, "0")}
            </p>
            <div className="hero-copy">
              <p className="hero-sale" data-enter>
                {formatInr(PRICE.single)} each · 3 for {formatInr(PRICE.trio)} · 5 for {formatInr(PRICE.five)}
              </p>
              <div className="wordmark-line">
                <h1 className="hero-word" data-enter>
                  Silk
                </h1>
              </div>
              <div className="wordmark-line">
                <span className="hero-word hero-word-indent" data-enter>
                  Room
                </span>
              </div>
              <p className="hero-position" data-enter>
                Quiet structure. Soft light. Polos for after hours.
              </p>
            </div>
            <a
              className="button button-primary hero-button"
              href="#combos"
              data-enter
              onClick={(event) => {
                event.preventDefault();
                scrollShellTo("combos");
              }}
            >
              See the combo sale
              <ArrowIcon />
            </a>
            <Link className="button button-ghost hero-shop-link" href="/shop" data-enter>
              Shop all tees
            </Link>
            <div className="swipe-hint" aria-hidden="true">
              <span>Swipe up</span>
              <svg className="swipe-hint-chevron" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </section>

          <TrustStrip className="trust-strip--landing" />

          <section id="manifesto" className="manifesto panel snap-panel" data-story>
            <p className="panel-index" aria-hidden="true">
              02
            </p>
            <p className="manifesto-copy" aria-label={manifestoLines.join(" ")}>
              {manifestoLines.map((line) => (
                <span key={line} className="manifesto-line">
                  {line}
                </span>
              ))}
            </p>
            <p className="manifesto-note">
              Seven tones. One cut. silkroom.shop
            </p>
          </section>

          {products.map((product, index) => (
            <div key={product.slug}>
              <ProductPanel product={product} index={index} />
              {index === 1 ? (
                <div className="normal-scroll-region combo-landing-slot">
                  <ComboOffers products={products} combos={combos} />
                </div>
              ) : null}
            </div>
          ))}

          <div className="normal-scroll-region">
            <section
              className="fabric-section section-pad"
              aria-labelledby="fabric-title"
            >
              <div className="section-heading" data-reveal>
                <p className="eyebrow">Seen up close</p>
                <h2 id="fabric-title">The fabric keeps the light.</h2>
              </div>

              <div className="gallery-controls">
                <button
                  type="button"
                  aria-label="Previous fabric detail"
                  onClick={() => moveGallery(-1)}
                >
                  <ArrowIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next fabric detail"
                  onClick={() => moveGallery(1)}
                >
                  <ArrowIcon />
                </button>
              </div>

              <div
                ref={gallery}
                className="fabric-gallery"
                tabIndex={0}
                aria-label="Fabric details. Use left and right arrow keys to browse."
                onKeyDown={handleGalleryKey}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={cancelDrag}
              >
                {products.slice(0, 5).map((product, index) => (
                  <figure className="fabric-card" key={product.slug}>
                    <Image
                      src={product.image}
                      alt={`${product.name} ${index % 2 ? "collar and zip" : "ribbed fabric"} detail`}
                      fill
                      sizes="(min-width: 1024px) 34vw, 78vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                    />
                    <figcaption>
                      {index % 2 ? "Collar / metal / line" : "Rib / weight / touch"}
                    </figcaption>
                  </figure>
                ))}
              </div>
              {showDragHint ? (
                <p className="drag-hint" aria-hidden="true">
                  Drag to inspect <span>↔</span>
                </p>
              ) : null}
            </section>

            <section className="marquee-section" aria-label="Silk Room brand line">
              <div className="marquee-track">
                <span>Made for the room after daylight — </span>
                <span aria-hidden="true">Made for the room after daylight — </span>
              </div>
            </section>

            <section
              className="range-section section-pad"
              aria-labelledby="range-title"
            >
              <div className="section-heading" data-reveal>
                <p className="eyebrow">The full range</p>
                <h2 id="range-title">Seven tones. {formatInr(PRICE.single)} each.</h2>
              </div>
              <div className="product-grid">
                {products.map((product) => (
                  <button
                    className="grid-card"
                    key={product.slug}
                    type="button"
                    onClick={() => setSelected(product)}
                    data-reveal
                    aria-label={`View details for ${product.name}`}
                  >
                    <span className="grid-image">
                      <Image
                        src={product.image}
                        alt={`${product.name} ribbed quarter-zip polo`}
                        fill
                        sizes="(min-width: 1024px) 24vw, 50vw"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    </span>
                    <span className="grid-meta">
                      <span>{product.name}</span>
                      <span className="price">
                        {formatInr(product.price)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section
              className="instagram-section section-pad"
              aria-labelledby="instagram-title"
            >
              <div className="instagram-heading" data-reveal>
                <div>
                  <p className="eyebrow">From the room</p>
                  <h2 id="instagram-title">{site.instagramHandle}</h2>
                  <p className="instagram-followers">
                    {site.instagramFollowers} followers · follow for drops
                  </p>
                </div>
                <a href={site.instagramUrl} target="_blank" rel="noreferrer">
                  Follow on Instagram <ArrowIcon />
                </a>
              </div>
              <div className="instagram-strip">
                {products.slice(1, 5).map((product, index) => (
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="instagram-tile"
                    key={product.slug}
                    aria-label={`View ${product.name} on Instagram`}
                    data-reveal
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name} studio post`}
                      fill
                      sizes="(min-width: 1024px) 25vw, 72vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                    />
                    <span>{String(index + 1).padStart(2, "0")} / SR</span>
                  </a>
                ))}
              </div>
            </section>

            <footer className="footer section-pad">
              <div className="footer-top">
                <p>Enter quietly. silkroom.shop</p>
                <a
                  className="button button-primary"
                  href={whatsappUrl(
                    orderComboMessage(
                      "Night Trio",
                      ["Ink", "Silver", "Chalk"],
                      PRICE.trio,
                      "M",
                    ),
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Order a trio
                  <ArrowIcon />
                </a>
              </div>
              <p className="footer-wordmark" aria-label="Silk Room">
                SILK ROOM
              </p>
              <div className="footer-links">
                <a href={whatsappUrl(orderBrowseMessage())} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
                <a href={site.instagramUrl} target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <address>{site.address}</address>
              </div>
            </footer>
          </div>
        </div>

        {heroPassed ? (
          <a
            className="sticky-whatsapp"
            href={whatsappUrl(orderBrowseMessage())}
            target="_blank"
            rel="noreferrer"
            aria-label="Order on WhatsApp"
          >
            <span>WA</span>
            <span className="sticky-label">Order</span>
          </a>
        ) : null}
      </main>

      {selected ? (
        <DetailSheet product={selected} onClose={closeDetail} />
      ) : null}
    </>
  );
}
