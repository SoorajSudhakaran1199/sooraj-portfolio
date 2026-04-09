import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const siteDir = path.join(rootDir, "site");

const ROOT_FILES = [
  "app.js",
  "style.css",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico"
];

async function syncHtmlFiles() {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const siteEntries = await readdir(siteDir, { withFileTypes: true });
  const staleHtmlFiles = siteEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && !htmlFiles.includes(entry.name))
    .map((entry) => path.join(siteDir, entry.name));

  await Promise.all(staleHtmlFiles.map((target) => rm(target, { force: true })));
  await Promise.all(
    htmlFiles.map((name) => cp(path.join(rootDir, name), path.join(siteDir, name), { force: true }))
  );

  return htmlFiles;
}

async function syncRootFiles() {
  await Promise.all(
    ROOT_FILES.map((name) => cp(path.join(rootDir, name), path.join(siteDir, name), { force: true }))
  );
}

async function syncAssets() {
  await rm(path.join(siteDir, "assets"), { recursive: true, force: true });
  await cp(path.join(rootDir, "assets"), path.join(siteDir, "assets"), { recursive: true, force: true });
}

async function writeSiteReadme(htmlFiles) {
  const readme = `# Generated Site Mirror

This directory is generated from the repository root.

Do not edit files in \`site/\` manually. Update the root source files instead, then run:

\`\`\`bash
node scripts/sync_site.mjs
\`\`\`

Synced HTML pages:

${htmlFiles.map((name) => `- \`${name}\``).join("\n")}
`;

  await writeFile(path.join(siteDir, "README.md"), readme);
}

async function main() {
  await mkdir(siteDir, { recursive: true });
  const htmlFiles = await syncHtmlFiles();
  await syncRootFiles();
  await syncAssets();
  await writeSiteReadme(htmlFiles);
}

main().catch(async (error) => {
  const detail = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  console.error(detail);
  process.exitCode = 1;
});
