"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

const PoloCanvas = dynamic(
  () => import("@/components/three/PoloScene").then((mod) => mod.PoloCanvas),
  { ssr: false, loading: () => <div className="polo-3d-fallback" aria-hidden="true" /> },
);

export function PoloHero({
  images,
  orbit = false,
  className = "",
}: {
  images: string[];
  orbit?: boolean;
  className?: string;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 760;
    setEnabled(!reduceMotion && !(coarse && narrow));
  }, []);

  if (!enabled) {
    return (
      <div className={`polo-3d-fallback ${className}`.trim()}>
        {images.slice(0, 3).map((src, index) => (
          <figure key={src} className={`polo-3d-card polo-3d-card--${index}`}>
            <Image src={src} alt="" fill sizes="(min-width: 900px) 28vw, 70vw" />
          </figure>
        ))}
      </div>
    );
  }

  return <PoloCanvas images={images} orbit={orbit} className={`polo-3d ${className}`.trim()} />;
}
