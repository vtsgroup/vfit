const { execSync } = require("child_process");
const pkg = require("../package.json");

console.log(`🚀 Deploying v${pkg.version} to Cloudflare Pages...`);

try {
  const outDir = `${process.cwd()}/out`;
  // Deploy static export to Pages
  execSync(
    `cd /tmp && npx wrangler pages deploy "${outDir}" --project-name=personal-ia-prod --branch=main`, // legacy CF project name — rename in Dashboard when ready
    { stdio: "inherit" }
  );

  console.log(`\n✅ Deployed successfully!`);
  console.log(`🔗 https://vfit.pages.dev`);
} catch (error) {
  console.error("❌ Deploy failed:", error.message);
  process.exit(1);
}
