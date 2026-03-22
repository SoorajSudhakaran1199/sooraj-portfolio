const playwrightModulePath = process.env.PLAYWRIGHT_MODULE_PATH || "playwright";
const { chromium } = await import(playwrightModulePath);

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";

const pages = [
  "index.html",
  "journey.html",
  "request-cv.html",
  "feedback.html",
  "feedback-thank-you.html",
  "portfolio-map.html",
  "experience-masters-thesis-keba.html",
  "experience-working-student-keba.html",
  "experience-ndt-technician.html",
  "project-autonomous-vacuum-robot.html",
  "project-active-suspension.html",
  "project-service-robot.html",
  "project-topology-bag-sealer.html",
  "project-vr-machine-workshop.html",
];

const viewports = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

function summarizeAnimations(snapshot) {
  return {
    runningCount: snapshot.runningCount,
    totalCurrentTime: snapshot.totalCurrentTime,
    scrollWidth: snapshot.scrollWidth,
    revealHiddenCount: snapshot.revealHiddenCount,
  };
}

const browser = await chromium.launch({ headless: true });

const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    colorScheme: "dark",
    reducedMotion: "no-preference",
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
  });

  for (const pagePath of pages) {
    const page = await context.newPage();

    const url = `${baseUrl}/${pagePath}`;

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(800);

      const first = await page.evaluate(() => {
        const running = document
          .getAnimations()
          .filter((animation) => animation.playState === "running");

        return {
          runningCount: running.length,
          totalCurrentTime: running.reduce(
            (sum, animation) => sum + (typeof animation.currentTime === "number" ? animation.currentTime : 0),
            0
          ),
          scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          revealHiddenCount: Array.from(document.querySelectorAll(".reveal-on-scroll")).filter((element) => {
            const style = window.getComputedStyle(element);
            return Number.parseFloat(style.opacity || "1") < 0.95;
          }).length,
        };
      });

      await page.waitForTimeout(1400);

      const second = await page.evaluate(() => {
        const running = document
          .getAnimations()
          .filter((animation) => animation.playState === "running");

        return {
          runningCount: running.length,
          totalCurrentTime: running.reduce(
            (sum, animation) => sum + (typeof animation.currentTime === "number" ? animation.currentTime : 0),
            0
          ),
          scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        };
      });

      const revealTargets = page.locator(".reveal-on-scroll");
      const revealCount = await revealTargets.count();
      for (let index = 0; index < revealCount; index += 1) {
        await revealTargets.nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(180);
      }

      await page.waitForTimeout(500);

      const postScroll = await page.evaluate(() => ({
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        revealHiddenCount: Array.from(document.querySelectorAll(".reveal-on-scroll")).filter((element) => {
          const style = window.getComputedStyle(element);
          return Number.parseFloat(style.opacity || "1") < 0.95;
        }).length,
      }));

      let hoverOverflow = null;
      if (viewport.width >= 1024) {
        const hoverTarget = page.locator(".hover-lift, .shine-card, .btn, .theme-toggle").first();
        if (await hoverTarget.count()) {
          await hoverTarget.hover();
          await page.waitForTimeout(350);
          hoverOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
        }
      }

      const issues = [];
      if (first.runningCount > 0 && second.totalCurrentTime <= first.totalCurrentTime) {
        issues.push("animation timeline did not advance");
      }
      if (first.scrollWidth > viewport.width + 2 || second.scrollWidth > viewport.width + 2 || postScroll.scrollWidth > viewport.width + 2) {
        issues.push("overflow detected while animations were running");
      }
      if (postScroll.revealHiddenCount > 0) {
        issues.push(`scroll reveal items still hidden after full-page scroll: ${postScroll.revealHiddenCount}`);
      }
      if (hoverOverflow && hoverOverflow > viewport.width + 2) {
        issues.push("hover transition caused overflow on desktop");
      }

      results.push({
        page: pagePath,
        viewport: viewport.name,
        status: issues.length ? "fail" : "pass",
        initial: summarizeAnimations(first),
        later: summarizeAnimations({ ...second, revealHiddenCount: postScroll.revealHiddenCount }),
        hoverOverflow,
        issues,
      });
    } catch (error) {
      results.push({
        page: pagePath,
        viewport: viewport.name,
        status: "error",
        issues: [String(error)],
      });
    }

    await page.close();
  }

  await context.close();
}

await browser.close();

const failures = results.filter((result) => result.status !== "pass");
console.log(JSON.stringify({ baseUrl, checked: results.length, failures, results }, null, 2));
