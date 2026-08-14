import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const outputDirectory = resolve("artifacts", "responsive");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewports = [
  { width: 360, height: 640 },
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.locator(".preloader").waitFor({ state: "hidden", timeout: 5000 });

    const shell = page.locator(".site-shell");
    const metrics = await page.evaluate(() => {
      const shell = document.querySelector(".site-shell");
      const interactive = Array.from(
        document.querySelectorAll("a, button, [tabindex='0']"),
      ).filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });

      return {
        documentOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        shellOverflow: shell.scrollWidth - shell.clientWidth,
        productPanels: document.querySelectorAll(".product-panel").length,
        undersizedTargets: interactive
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              label:
                element.getAttribute("aria-label") ||
                element.textContent?.trim().slice(0, 36),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          })
          .filter(({ width, height }) => width < 44 || height < 44),
      };
    });
    const silkAtTop = await shell.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--silk-current").trim(),
    );

    await shell.evaluate((element) =>
      element.scrollTo({ top: element.clientHeight * 1.25, behavior: "instant" }),
    );
    await page.locator(".sticky-whatsapp").waitFor({ state: "visible" });
    const stickyVisible = await page.locator(".sticky-whatsapp").isVisible();

    const gallery = page.getByLabel(
      "Fabric details. Use left and right arrow keys to browse.",
    );
    await gallery.scrollIntoViewIfNeeded();
    await gallery.focus();
    const galleryStart = await gallery.evaluate((element) => element.scrollLeft);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    const galleryEnd = await gallery.evaluate((element) => element.scrollLeft);

    const card = page
      .getByRole("button", { name: /^View details for / })
      .first();
    await card.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await page.waitForTimeout(100);
    const cardBox = await card.boundingBox();
    const cardInViewport = Boolean(
      cardBox &&
        cardBox.y >= 0 &&
        cardBox.y + cardBox.height <= viewport.height,
    );
    const scrollState = await shell.evaluate((element) => ({
      className: element.className,
      scrollTop: element.scrollTop,
      clientHeight: element.clientHeight,
    }));
    await card.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible" });
    const closeFocused = await page
      .getByRole("button", { name: /Close/ })
      .evaluate((element) => document.activeElement === element);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    const focusRestored = await card.evaluate(
      (element) => document.activeElement === element,
    );

    await shell.evaluate((element) =>
      element.scrollTo({ top: element.scrollHeight, behavior: "instant" }),
    );
    await page.waitForTimeout(150);
    const silkAtBottom = await shell.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--silk-current").trim(),
    );
    await page.locator("#hero").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const stickyHiddenOnHero = !(await page.locator(".sticky-whatsapp").isVisible());
    const screenshot = resolve(
      outputDirectory,
      `${viewport.width}x${viewport.height}.png`,
    );
    await page.screenshot({ path: screenshot });

    results.push({
      viewport,
      ...metrics,
      silkAtTop,
      silkAtBottom,
      silkProgressChanged: silkAtTop !== silkAtBottom,
      heroVisible: await page
        .getByRole("heading", { name: "Silk", exact: true })
        .isVisible(),
      stickyVisible,
      stickyHiddenOnHero,
      galleryKeyboardMoved: galleryEnd > galleryStart,
      cardInViewport,
      cardBox,
      scrollState,
      closeFocused,
      focusRestored,
      dialogClosedWithEscape: (await dialog.count()) === 0,
      errors,
      screenshot,
    });
    await context.close();
  }

  const reducedContext = await browser.newContext({
    viewport: { width: 360, height: 800 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const reducedMotion = await reducedPage.evaluate(() => {
    const targets = Array.from(
      document.querySelectorAll("[data-enter], [data-reveal]"),
    );
    const hiddenTargets = targets.filter((element) => {
      const style = getComputedStyle(element);
      return style.opacity !== "1" || style.transform !== "none";
    });
    return {
      mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      hiddenTargets: hiddenTargets.length,
      preloaderMounted: Boolean(document.querySelector(".preloader")),
    };
  });
  await reducedContext.close();

  const report = { results, reducedMotion };
  await writeFile(
    resolve(outputDirectory, "summary.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
