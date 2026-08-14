export function scrollShellTo(id: string) {
  const page = document.querySelector<HTMLElement>(".site-shell");
  const target = document.getElementById(id);
  if (!page || !target) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const top =
    target.getBoundingClientRect().top -
    page.getBoundingClientRect().top +
    page.scrollTop;
  page.classList.add("free-scroll");
  page.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}
