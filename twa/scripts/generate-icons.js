// generate-icons.js
// Gera todos os ícones necessários para Android + PWA/manifest
// Input:  twa/icons/source/icon-1024.png  (1024×1024, sem padding, fundo #09090B)
// Output: twa/icons/generated/  +  ../../public/icons/

import sharp from "sharp";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, "../icons/source/icon-1024.png");
const OUT_ANDROID = join(__dirname, "../icons/generated");
const OUT_PUBLIC = join(__dirname, "../../public/icons");

// Cor de fundo do tema VFIT (consistente com manifest.json)
const BG_COLOR = { r: 9, g: 9, b: 11, alpha: 1 }; // #09090B

// Densidades Android
const ANDROID_SIZES = [
  { size: 48, density: "mdpi" },
  { size: 72, density: "hdpi" },
  { size: 96, density: "xhdpi" },
  { size: 144, density: "xxhdpi" },
  { size: 192, density: "xxxhdpi" },
];

// Tamanhos PWA/manifest (devem cobrir todas as entradas do manifest.json)
const PWA_SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512];

async function run() {
  // Verificar arquivo fonte
  if (!existsSync(SOURCE)) {
    console.error("\n❌ Ícone base não encontrado!");
    console.error("   Coloque: twa/icons/source/icon-1024.png");
    console.error("   Tamanho: 1024×1024 pixels, PNG, fundo #09090B\n");
    process.exit(1);
  }

  // Criar pastas de saída
  [OUT_ANDROID, OUT_PUBLIC].forEach((d) => mkdirSync(d, { recursive: true }));

  const meta = await sharp(SOURCE).metadata();
  console.log(`\n📐 Ícone fonte: ${meta.width}×${meta.height}px (${meta.format})`);

  if (meta.width < 1024 || meta.height < 1024) {
    console.error("❌ Ícone muito pequeno! Mínimo 1024×1024px");
    process.exit(1);
  }

  console.log("\n🤖 Gerando ícones Android (densidades)...");
  for (const { size, density } of ANDROID_SIZES) {
    const file = `icon-${density}-${size}.png`;
    await sharp(SOURCE).resize(size, size).png({ quality: 100 }).toFile(join(OUT_ANDROID, file));
    console.log(`  ✅ ${file}`);
  }

  console.log("\n🌐 Gerando ícones PWA (manifest.json)...");
  for (const size of PWA_SIZES) {
    // Normal (any)
    const fileNormal = `icon-${size}.png`;
    await sharp(SOURCE)
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(join(OUT_PUBLIC, fileNormal));

    // Maskable (safe zone: 80% = 10% padding em cada lado)
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round(size * 0.1);
    const fileMaskable = `icon-${size}-maskable.png`;
    await sharp(SOURCE)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: BG_COLOR,
      })
      .png({ quality: 100 })
      .toFile(join(OUT_PUBLIC, fileMaskable));

    console.log(`  ✅ icon-${size}.png + icon-${size}-maskable.png`);
  }

  console.log("\n🔔 Gerando ícone monochrome (notificações Android)...");
  await sharp(SOURCE)
    .resize(96, 96)
    .greyscale()
    .png({ quality: 100 })
    .toFile(join(OUT_PUBLIC, "icon-96-monochrome.png"));
  console.log("  ✅ icon-96-monochrome.png");

  console.log("\n💦 Gerando splash screen (2048×2048)...");
  // Logo centralizado em fundo sólido
  const logoSize = Math.round(2048 * 0.35); // 35% do splash
  const splashPadding = Math.round((2048 - logoSize) / 2);
  await sharp(SOURCE)
    .resize(logoSize, logoSize)
    .extend({
      top: splashPadding,
      bottom: splashPadding,
      left: splashPadding,
      right: splashPadding,
      background: BG_COLOR,
    })
    .png({ quality: 100 })
    .toFile(join(OUT_ANDROID, "splash-2048.png"));
  console.log("  ✅ splash-2048.png");

  console.log("\n🖼️  Gerando feature graphic Play Store (1024×500)...");
  // Logo centralizado na área de 1024×500
  const logoH = 260;
  const logoW = 260;
  const fgPadTop = Math.round((500 - logoH) / 2);
  const fgPadLeft = Math.round((1024 - logoW) / 2);
  await sharp(SOURCE)
    .resize(logoW, logoH)
    .extend({
      top: fgPadTop,
      bottom: 500 - logoH - fgPadTop,
      left: fgPadLeft,
      right: 1024 - logoW - fgPadLeft,
      background: BG_COLOR,
    })
    .png({ quality: 100 })
    .toFile(join(OUT_ANDROID, "feature-graphic-1024x500.png"));
  console.log("  ✅ feature-graphic-1024x500.png");

  console.log("\n📲 Gerando ícone Play Store (512×512)...");
  await sharp(SOURCE)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(join(OUT_ANDROID, "play-store-icon-512.png"));
  copyFileSync(join(OUT_PUBLIC, "icon-512.png"), join(OUT_ANDROID, "icon-512.png"));
  console.log("  ✅ play-store-icon-512.png");

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   ✅ Todos os ícones gerados!            ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\n  Android:    twa/icons/generated/`);
  console.log(`  PWA/Public: public/icons/`);
  console.log("\n📋 Próximo: npm run assetlinks");
}

run().catch((err) => {
  console.error("❌ Erro ao gerar ícones:", err.message);
  process.exit(1);
});
