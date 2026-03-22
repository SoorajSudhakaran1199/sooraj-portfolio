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
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "small-laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
];

function uniqueTopIssues(nodes) {
  const seen = new Set();
  return nodes
    .filter((node) => {
      const key = `${node.tag}|${node.className}|${node.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

const browser = await chromium.launch({
  headless: true,
});

const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    colorScheme: "dark",
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
  });

  for (const pagePath of pages) {
    const page = await context.newPage();

    const url = `${baseUrl}/${pagePath}`;
    let loadError = null;

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    } catch (error) {
      loadError = String(error);
    }

    if (loadError) {
      results.push({
        page: pagePath,
        viewport: viewport.name,
        status: "error",
        issues: [loadError],
      });
      await page.close();
      continue;
    }

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const nav = document.querySelector(".nav");
      const navRect = nav?.getBoundingClientRect();

      const overflowingNodes = [];
      for (const element of Array.from(document.querySelectorAll("body *"))) {
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") continue;

        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;

        if (rect.right > viewportWidth + 2 || rect.left < -2) {
          overflowingNodes.push({
            tag: element.tagName.toLowerCase(),
            className: element.className || "",
            text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
            left: Number(rect.left.toFixed(1)),
            right: Number(rect.right.toFixed(1)),
            width: Number(rect.width.toFixed(1)),
          });
        }
      }

      return {
        viewportWidth,
        viewportHeight,
        scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
        navHeight: navRect ? Number(navRect.height.toFixed(1)) : 0,
        overflowingNodes,
      };
    });

    const issues = [];
    if (metrics.scrollWidth > metrics.viewportWidth + 2) {
      issues.push(
        `horizontal overflow: scrollWidth ${metrics.scrollWidth}px > viewport ${metrics.viewportWidth}px`
      );
    }

    if (metrics.viewportWidth <= 420 && metrics.navHeight > 220) {
      issues.push(`mobile header too tall: ${metrics.navHeight}px`);
    }

    const overflowingNodes = uniqueTopIssues(metrics.overflowingNodes);
    if (overflowingNodes.length) {
      issues.push(
        `elements outside viewport: ${overflowingNodes
          .map((node) => `${node.tag}${node.className ? "." + String(node.className).trim().replace(/\s+/g, ".") : ""} [${node.left}, ${node.right}]`)
          .join("; ")}`
      );
    }

    results.push({
      page: pagePath,
      viewport: viewport.name,
      status: issues.length ? "fail" : "pass",
      navHeight: metrics.navHeight,
      issues,
    });

    await page.close();
  }

  await context.close();
}

await browser.close();

const failures = results.filter((result) => result.status !== "pass");
console.log(JSON.stringify({ baseUrl, checked: results.length, failures, results }, null, 2));
