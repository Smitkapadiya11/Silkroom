# Silk Room build plan

## Visual system

- Display: **Bricolage Grotesque** (variable, via `next/font/google`) for the oversized wordmark and editorial headlines.
- Body: **Geist** (via `next/font/google`) for compact product, price, and interface copy.
- Tokens: ink `#12121A`, ecru `#DED6C4`, muted `#7B7668`, warp `#0F5E5C`, weft `#B4407A`, gold `#C9973F`.
- Actual image direction: the seven supplied files are clean, centred ribbed zip-polo studies on neutral grey. The black worn image has the strongest human presence and becomes the hero. Product panels use controlled 4:5 crops and charcoal framing so the pale studio backgrounds read like illuminated fabric tables rather than generic cards.
- Surface: blued-charcoal room, warm ecru type, restrained gold hairlines, 4% grain, and photo-edge vignettes. Colour is reserved for the shot-silk system and product colour swatches.

## Hero wireframe

```text
┌──────────────────────────────┐
│  01 / 10                 ┃   │
│                         rail │
│                              │
│       [BLACK POLO PHOTO]      │
│       full-bleed, slow zoom   │
│                              │
│ SILK                         │
│ ROOM                         │
│ Quiet structure. Soft light. │
│                              │
│ [ ORDER THE FIRST EDIT  → ]   │
│           swipe up ⌄          │
└──────────────────────────────┘
```

## Product panel wireframe

```text
┌──────────────────────────────┐
│  03 / 10                 ┃   │
│                              │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │    FIXED 4:5 PRODUCT     │ │
│ │    max 40px parallax     │ │
│ │                          │ │
│ └──────────────────────────┘ │
│ NOCTURNE ZIP POLO            │
│ Ribbed weight. Clean collar. │
│ ○  ○  ○       ₹2,490         │
│ S  M  L  XL                  │
│ [ ORDER ON WHATSAPP      → ]  │
└──────────────────────────────┘
```

Desktop keeps the same sequence but splits image and copy into two columns and relaxes snapping to proximity.

## Shot-silk interpolation

The scroll container exposes total progress from 0 to 1. A single anime.js v4 `onScroll()` observer feeds `utils.lerp()`, which interpolates the warp and weft RGB channels and writes `--silk-current` plus `--silk-progress` on the page root. Progress rail fills, reveal sweeps, and CTA underglow consume those variables. No other decorative element uses the accent.

## Section build order

1. Scaffold Next.js 15, TypeScript, Tailwind, fonts, metadata, and data model.
2. Build preloader, hero, manifesto, reusable product reel, and story rail.
3. Build fabric gallery, direction-aware CSS marquee, full-range detail sheet, Instagram strip, footer, and sticky WhatsApp CTA.
4. Add reduced-motion/coarse-pointer behavior, focus management, keyboard gallery controls, grain/vignette, and responsive passes.
5. Verify lint, production build, and 360 / 768 / 1440 viewport behavior.

## Brief check and revision

The first-pass risk was a reusable “luxury dark” layout. I revised it around the supplied imagery: studio-grey product fields become the room’s illuminated fabric tables, the ribbing and brass zips drive the detail language, and the worn black polo is the only full-bleed human frame. Accent colour remains confined to one scroll-reactive shot-silk thread, preventing the page from drifting into a generic gradient theme.
