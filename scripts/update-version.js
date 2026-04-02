const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");
const version = pkg.version;

console.log(`📦 New version: ${version}`);

// Update manifest.json for PWA
const manifestPath = path.join(__dirname, "../public/manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.version = version;

  const withVersionQuery = (src) => {
    if (typeof src !== "string") return src;
    // Cache-bust para /icons/* que tem cache longo (immutable) no Pages.
    // Mantém outros paths intactos.
    if (!src.startsWith("/icons/")) return src;
    if (src.includes("?v=")) return src.replace(/\?v=[^&]+/, `?v=${version}`);
    return `${src}?v=${version}`;
  };

  // icons
  if (Array.isArray(manifest.icons)) {
    manifest.icons = manifest.icons.map((i) => ({
      ...i,
      src: withVersionQuery(i.src),
    }));
  }

  // screenshots
  if (Array.isArray(manifest.screenshots)) {
    manifest.screenshots = manifest.screenshots.map((s) => ({
      ...s,
      src: withVersionQuery(s.src),
    }));
  }

  // shortcuts icons
  if (Array.isArray(manifest.shortcuts)) {
    manifest.shortcuts = manifest.shortcuts.map((sc) => ({
      ...sc,
      icons: Array.isArray(sc.icons)
        ? sc.icons.map((ic) => ({
          ...ic,
          src: withVersionQuery(ic.src),
        }))
        : sc.icons,
    }));
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("✅ manifest.json updated");
}

// Update version.ts
const versionFile = `// Auto-generated - do not edit manually
// Updated via: npm run version:patch

export const APP_VERSION = '${version}'
export const BUILD_DATE = '${new Date().toISOString()}'
export const BUILD_NUMBER = ${Date.now()}
`;

fs.writeFileSync(path.join(__dirname, "../lib/version.ts"), versionFile);
console.log("✅ lib/version.ts updated");

console.log(`\n🎉 Version ${version} ready!`);
