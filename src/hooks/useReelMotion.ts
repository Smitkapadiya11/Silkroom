"use client";

import { type RefObject, useEffect, useState } from "react";
import {
  animate,
  createScope,
  onScroll,
  stagger,
  utils,
} from "animejs";

function revealPanel(panel: HTMLElement) {
  if (panel.dataset.in === "1") return;
  panel.dataset.in = "1";

  const manifestoLines = panel.querySelectorAll<HTMLElement>(".manifesto-line");
  if (manifestoLines.length) {
    animate(manifestoLines, {
      translateY: [28, 0],
      opacity: [0, 1],
      duration: 640,
      ease: "outExpo",
      delay: stagger(120),
    });
    const note = panel.querySelector<HTMLElement>(".manifesto-note");
    if (note) {
      animate(note, {
        translateY: [16, 0],
        opacity: [0, 1],
        duration: 600,
        ease: "outExpo",
        delay: 280,
      });
    }
    return;
  }

  const items = panel.querySelectorAll<HTMLElement>("[data-enter]");
  const targets = items.length
    ? items
    : panel.matches("[data-reveal]")
      ? [panel]
      : [];
  if (!targets.length) return;

  animate(targets, {
    translateY: [36, 0],
    opacity: [0, 1],
    duration: 780,
    ease: "outExpo",
    delay: stagger(80),
    onComplete: () => {
      targets.forEach((element) => {
        element.dataset.in = "1";
        element.style.opacity = "1";
        element.style.transform = "none";
      });
    },
  });
}

export function useReelMotion(
  root: RefObject<HTMLElement | null>,
  storyIds: string[],
) {
  const [activeStory, setActiveStory] = useState(0);
  const [heroPassed, setHeroPassed] = useState(false);

  useEffect(() => {
    const page = root.current;
    if (!page) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const scrollSync = coarsePointer ? true : 0.25;

    page.classList.add("js-ready");
    if (reduceMotion) page.classList.add("is-reduced");

    const scope = createScope({ root: page });

    scope.add(() => {
      const observerRoot: IntersectionObserverInit = {
        root: page,
        threshold: 0.4,
        rootMargin: "0px 0px -6% 0px",
      };

      const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = storyIds.indexOf((entry.target as HTMLElement).id);
          if (index >= 0) setActiveStory(index);
        });
      }, observerRoot);

      page
        .querySelectorAll<HTMLElement>("[data-story]")
        .forEach((panel) => storyObserver.observe(panel));

      const hero = page.querySelector<HTMLElement>("#hero");
      const heroObserver = new IntersectionObserver(
        ([entry]) => setHeroPassed(!entry.isIntersecting),
        { ...observerRoot, threshold: 0.12 },
      );
      if (hero) heroObserver.observe(hero);

      const normalRegion =
        page.querySelector<HTMLElement>(".normal-scroll-region");
      const updateSnapMode = () => {
        if (!normalRegion) return;
        const freeScrollStart =
          normalRegion.offsetTop - page.clientHeight * 1.02;
        page.classList.toggle("free-scroll", page.scrollTop >= freeScrollStart);
      };
      page.addEventListener("scroll", updateSnapMode, { passive: true });
      updateSnapMode();

      const scrollContent = page.querySelector<HTMLElement>(".scroll-content");
      if (scrollContent) {
        onScroll({
          container: page,
          target: scrollContent,
          enter: "top top",
          leave: "bottom bottom",
          sync: scrollSync,
          onUpdate: (observer) => {
            const progress = utils.clamp(observer.progress, 0, 1);
            const r = Math.round(utils.lerp(15, 180, progress));
            const g = Math.round(utils.lerp(94, 64, progress));
            const b = Math.round(utils.lerp(92, 122, progress));
            page.style.setProperty("--silk-current", `rgb(${r} ${g} ${b})`);
            page.style.setProperty("--silk-progress", `${progress * 100}%`);
            page.style.setProperty("--story-scroll-progress", String(progress));
            page.style.setProperty(
              "--marquee-direction",
              observer.backward ? "reverse" : "normal",
            );

            const segments = page.querySelectorAll<HTMLElement>(".story-segment span");
            const fillIndex = progress * (segments.length - 1);
            segments.forEach((segment, index) => {
              const fill = utils.clamp(fillIndex - index, 0, 1);
              segment.style.setProperty("--segment-fill", `${fill * 100}%`);
            });
          },
        });
      }

      if (reduceMotion) {
        page
          .querySelectorAll<HTMLElement>("[data-enter], [data-reveal], .manifesto-line")
          .forEach((element) => {
            element.style.opacity = "1";
            element.style.transform = "none";
            element.dataset.in = "1";
          });
        page.querySelectorAll<HTMLElement>(".story-segment span").forEach((segment) => {
          segment.style.setProperty("--segment-fill", "100%");
        });
        return () => {
          storyObserver.disconnect();
          heroObserver.disconnect();
          page.removeEventListener("scroll", updateSnapMode);
        };
      }

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealPanel(entry.target as HTMLElement);
        });
      }, observerRoot);

      page
        .querySelectorAll<HTMLElement>(".panel, [data-reveal]")
        .forEach((element) => revealObserver.observe(element));

      if (hero) revealPanel(hero);

      if (hero) {
        animate(".hero-photo", {
          scale: [1, coarsePointer ? 1.05 : 1.08],
          translateY: [0, coarsePointer ? -12 : -24],
          ease: "linear",
          autoplay: onScroll({
            container: page,
            target: hero,
            enter: "top top",
            leave: "bottom top",
            sync: true,
          }),
        });
      }

      animate(".swipe-hint-chevron", {
        translateY: [0, 7],
        duration: 700,
        ease: "inOutSine",
        alternate: true,
        loop: true,
      });

      page.querySelectorAll<HTMLElement>(".product-parallax").forEach((image) => {
        const panel = image.closest<HTMLElement>(".product-panel");
        if (!panel) return;
        animate(image, {
          translateY: coarsePointer ? [-10, 10] : [-20, 20],
          ease: "linear",
          autoplay: onScroll({
            container: page,
            target: panel,
            enter: "bottom top",
            leave: "top bottom",
            sync: true,
          }),
        });
      });

      const hideSwipeHint = () => {
        animate(".swipe-hint", {
          translateY: [0, -8],
          opacity: [1, 0],
          duration: 280,
          ease: "outQuad",
        });
      };
      page.addEventListener("scroll", hideSwipeHint, {
        passive: true,
        once: true,
      });
      page.addEventListener("wheel", hideSwipeHint, {
        passive: true,
        once: true,
      });
      page.addEventListener("touchmove", hideSwipeHint, {
        passive: true,
        once: true,
      });

      return () => {
        storyObserver.disconnect();
        heroObserver.disconnect();
        revealObserver.disconnect();
        page.removeEventListener("scroll", updateSnapMode);
        page.removeEventListener("scroll", hideSwipeHint);
        page.removeEventListener("wheel", hideSwipeHint);
        page.removeEventListener("touchmove", hideSwipeHint);
      };
    });

    return () => scope.revert();
  }, [root, storyIds]);

  return { activeStory, heroPassed };
}
