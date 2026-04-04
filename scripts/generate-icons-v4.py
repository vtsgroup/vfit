#!/usr/bin/env python3
"""
VFIT Icon Generator v4 — Conceito "Vibrante"
Gera TODOS os ícones necessários:
- Favicons (16, 32, 48, 96, favicon.ico, favicon.svg)
- PWA icons (48-1024, maskable, monochrome)
- Apple Touch Icon (180px)
- TWA icons (48-512, adaptive foreground, splash)
- Store icons (512, 1024, feature graphic)
- Notification badges
"""

import os
import sys
import struct
import io

try:
    import cairosvg
    from PIL import Image
except ImportError:
    print("ERROR: pip3 install cairosvg Pillow")
    sys.exit(1)

# ============================================
# CONFIG
# ============================================
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
ICONS_DIR = os.path.join(PUBLIC_DIR, "icons")
FAVICONS_DIR = os.path.join(PUBLIC_DIR, "favicons")
TWA_ICONS_DIR = os.path.join(PROJECT_ROOT, "twa", "icons", "generated")
TWA_SOURCE_DIR = os.path.join(PROJECT_ROOT, "twa", "icons", "source")

# Android adaptive icon safe zone = 66% of full icon
# Maskable icons need 10% padding on each side (content in 80% center)
MASKABLE_PADDING_RATIO = 0.15  # 15% padding = content in 70% center

# ============================================
# SVG TEMPLATES — Conceito A "Vibrante"
# ============================================

def svg_icon_main(size=512):
    """Ícone principal — verde gradiente vibrante com V branco"""
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 200 200"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#56EF85"/>
      <stop offset="38%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#065F2C"/>
    </linearGradient>
    <radialGradient id="hl" cx="33%" cy="28%" r="54%">
      <stop offset="0%" stop-color="rgba(255,255,255,.28)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="46" fill="url(#bg)"/>
  <rect width="200" height="200" rx="46" fill="url(#hl)"/>
  <rect x="1" y="1" width="198" height="198" rx="45" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/>
  <polyline points="32,38 100,162 168,38"
    fill="none" stroke="white"
    stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_icon_maskable(size=512):
    """Maskable icon — conteúdo menor (safe zone), sem border-radius, fundo cheio"""
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 200 200"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#56EF85"/>
      <stop offset="38%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#065F2C"/>
    </linearGradient>
    <radialGradient id="hl" cx="33%" cy="28%" r="54%">
      <stop offset="0%" stop-color="rgba(255,255,255,.22)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <!-- Full bleed background — no border radius for maskable -->
  <rect width="200" height="200" fill="url(#bg)"/>
  <rect width="200" height="200" fill="url(#hl)"/>
  <!-- V mark smaller (safe zone ~66%) — centered with padding -->
  <polyline points="50,52 100,148 150,52"
    fill="none" stroke="white"
    stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_icon_monochrome(size=96):
    """Monochrome icon — apenas o V em branco, fundo transparente"""
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 200 200"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <polyline points="32,38 100,162 168,38"
    fill="none" stroke="white"
    stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_notification_badge(size=96):
    """Notification badge — V verde sem fundo"""
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 200 200"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <polyline points="32,38 100,162 168,38"
    fill="none" stroke="#22C55E"
    stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_favicon():
    """Favicon SVG — otimizado para tamanhos pequenos, stroke mais grosso"""
    return '''<svg width="32" height="32" viewBox="0 0 200 200"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#56EF85"/>
      <stop offset="38%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#065F2C"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="46" fill="url(#bg)"/>
  <polyline points="38,44 100,156 162,44"
    fill="none" stroke="white"
    stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_adaptive_foreground(size=512):
    """Android adaptive icon foreground — apenas o V, fundo transparente
    Dimensionado para safe zone de 66% do ícone adaptativo (108dp viewBox padrão)"""
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 108 108"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Adaptive icon: 108dp viewBox, safe zone = 72dp centrado (18dp padding) -->
  <polyline points="30,28 54,80 78,28"
    fill="none" stroke="white"
    stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_splash(size=2048):
    """Splash screen icon — ícone centrado em fundo escuro para TWA splash"""
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 200 200"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#050A12"/>
  <defs>
    <linearGradient id="bg" x1="60" y1="60" x2="140" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#56EF85"/>
      <stop offset="38%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#065F2C"/>
    </linearGradient>
  </defs>
  <!-- Centered icon at ~40% of canvas -->
  <rect x="60" y="60" width="80" height="80" rx="18" fill="url(#bg)"/>
  <polyline points="72.8,75.2 100,124.8 127.2,75.2"
    fill="none" stroke="white"
    stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_store_icon(size=1024):
    """Store icon — alta resolução para Google Play / App Store, sem radius (Google Play adiciona)"""
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 200 200"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#56EF85"/>
      <stop offset="38%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#065F2C"/>
    </linearGradient>
    <radialGradient id="hl" cx="33%" cy="28%" r="54%">
      <stop offset="0%" stop-color="rgba(255,255,255,.25)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg)"/>
  <rect width="200" height="200" fill="url(#hl)"/>
  <polyline points="32,38 100,162 168,38"
    fill="none" stroke="white"
    stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''


def svg_feature_graphic():
    """Feature graphic 1024x500 para Google Play"""
    return '''<svg width="1024" height="500" viewBox="0 0 1024 500"
  fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1024" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0A1A0E"/>
      <stop offset="50%" stop-color="#050A12"/>
      <stop offset="100%" stop-color="#030508"/>
    </linearGradient>
    <linearGradient id="vg" x1="380" y1="100" x2="520" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#56EF85"/>
      <stop offset="38%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#065F2C"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="55%" r="35%">
      <stop offset="0%" stop-color="rgba(34,197,94,.15)"/>
      <stop offset="100%" stop-color="rgba(34,197,94,0)"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <rect width="1024" height="500" fill="url(#glow)"/>
  <!-- V mark — centered -->
  <polyline points="410,120 512,380 614,120"
    fill="none" stroke="url(#vg)"
    stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Brand text -->
  <text x="512" y="460" font-family="Inter,system-ui,sans-serif" font-size="32" font-weight="300" letter-spacing="12" fill="rgba(255,255,255,.3)" text-anchor="middle">TREINOS COM IA</text>
</svg>'''


# ============================================
# HELPERS
# ============================================

def svg_to_png(svg_string, output_path, width, height=None):
    """Convert SVG string to PNG file"""
    if height is None:
        height = width
    png_data = cairosvg.svg2png(
        bytestring=svg_string.encode('utf-8'),
        output_width=width,
        output_height=height,
    )
    with open(output_path, 'wb') as f:
        f.write(png_data)
    return output_path


def create_ico(png_paths, ico_path):
    """Create .ico file from multiple PNG files using Pillow"""
    images = []
    for path in png_paths:
        img = Image.open(path)
        images.append(img)
    # Save as ICO with multiple sizes
    images[0].save(
        ico_path,
        format='ICO',
        sizes=[(img.width, img.height) for img in images],
        append_images=images[1:] if len(images) > 1 else [],
    )
    return ico_path


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


# ============================================
# GENERATION
# ============================================

def generate_all():
    print("🎨 VFIT Icon Generator v4 — Conceito Vibrante")
    print("=" * 50)

    ensure_dir(ICONS_DIR)
    ensure_dir(FAVICONS_DIR)
    ensure_dir(TWA_ICONS_DIR)
    ensure_dir(TWA_SOURCE_DIR)

    generated = []

    # ── 1. Main PWA Icons ──
    print("\n📱 PWA Icons (any purpose)...")
    pwa_sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512, 1024]
    for s in pwa_sizes:
        path = os.path.join(ICONS_DIR, f"icon-{s}.png")
        svg_to_png(svg_icon_main(s), path, s)
        generated.append(f"  ✅ icons/icon-{s}.png")
        print(f"  ✅ {s}x{s}")

    # ── 2. Maskable Icons ──
    print("\n🎭 Maskable Icons...")
    maskable_sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512]
    for s in maskable_sizes:
        path = os.path.join(ICONS_DIR, f"icon-{s}-maskable.png")
        svg_to_png(svg_icon_maskable(s), path, s)
        # Also generate with reversed name for compatibility
        path2 = os.path.join(ICONS_DIR, f"icon-maskable-{s}.png")
        svg_to_png(svg_icon_maskable(s), path2, s)
        print(f"  ✅ {s}x{s} maskable")

    # ── 3. Monochrome Icons ──
    print("\n⚪ Monochrome Icons...")
    mono_sizes = [96, 192]
    for s in mono_sizes:
        path = os.path.join(ICONS_DIR, f"icon-{s}-monochrome.png")
        svg_to_png(svg_icon_monochrome(s), path, s)
        print(f"  ✅ {s}x{s} monochrome")

    # ── 4. Notification Badges ──
    print("\n🔔 Notification Badges...")
    badge_sizes = [48, 72, 96, 192]
    for s in badge_sizes:
        path = os.path.join(ICONS_DIR, f"notification-badge-{s}.png")
        svg_to_png(svg_notification_badge(s), path, s)
        print(f"  ✅ {s}x{s} badge")

    # ── 5. Favicons ──
    print("\n🌐 Favicons...")
    favicon_sizes = [16, 32, 48, 96]
    favicon_pngs = []
    for s in favicon_sizes:
        path = os.path.join(FAVICONS_DIR, f"favicon-{s}.png")
        svg_to_png(svg_favicon(), path, s)
        favicon_pngs.append(path)
        print(f"  ✅ favicon-{s}.png")

    # favicon.ico (multi-resolution: 16, 32, 48)
    ico_path = os.path.join(FAVICONS_DIR, "favicon.ico")
    create_ico(favicon_pngs[:3], ico_path)  # 16, 32, 48
    print(f"  ✅ favicon.ico (multi-res)")

    # Also copy to root for compatibility
    import shutil
    shutil.copy2(ico_path, os.path.join(PUBLIC_DIR, "favicon.ico"))
    print(f"  ✅ /favicon.ico (root copy)")

    # favicon.svg
    svg_path = os.path.join(FAVICONS_DIR, "favicon.svg")
    with open(svg_path, 'w') as f:
        f.write(svg_favicon())
    print(f"  ✅ favicon.svg")

    # ── 6. Apple Touch Icon ──
    print("\n🍎 Apple Touch Icon...")
    apple_path = os.path.join(FAVICONS_DIR, "apple-touch-icon.png")
    svg_to_png(svg_icon_main(180), apple_path, 180)
    print(f"  ✅ apple-touch-icon.png (180x180)")

    # Copy to icons/ and root for compatibility
    shutil.copy2(apple_path, os.path.join(ICONS_DIR, "apple-touch-icon.png"))
    shutil.copy2(apple_path, os.path.join(PUBLIC_DIR, "apple-touch-icon.png"))
    print(f"  ✅ Copies to /icons/ and /public/")

    # Apple touch icon SVG
    apple_svg_path = os.path.join(ICONS_DIR, "apple-touch-icon.svg")
    with open(apple_svg_path, 'w') as f:
        f.write(svg_icon_main(180))
    print(f"  ✅ apple-touch-icon.svg")

    # ── 7. Startup/Splash ──
    print("\n🚀 Startup Image...")
    startup_path = os.path.join(ICONS_DIR, "startup-1024.png")
    svg_to_png(svg_splash(1024), startup_path, 1024)
    print(f"  ✅ startup-1024.png")

    # ── 8. TWA Icons ──
    print("\n📦 TWA Icons...")

    # Play Store icon 512
    twa_store = os.path.join(TWA_ICONS_DIR, "play-store-icon-512.png")
    svg_to_png(svg_store_icon(512), twa_store, 512)
    print(f"  ✅ play-store-icon-512.png")

    # Store icon 512 (same as main)
    twa_icon_512 = os.path.join(TWA_ICONS_DIR, "icon-512.png")
    svg_to_png(svg_store_icon(512), twa_icon_512, 512)
    print(f"  ✅ icon-512.png")

    # Android density icons
    android_densities = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192,
    }
    for density, size in android_densities.items():
        path = os.path.join(TWA_ICONS_DIR, f"icon-{density}-{size}.png")
        svg_to_png(svg_icon_main(size), path, size)
        print(f"  ✅ icon-{density}-{size}.png")

    # Feature graphic
    fg_path = os.path.join(TWA_ICONS_DIR, "feature-graphic-1024x500.png")
    svg_to_png(svg_feature_graphic(), fg_path, 1024, 500)
    print(f"  ✅ feature-graphic-1024x500.png")

    # Splash for TWA
    splash_path = os.path.join(TWA_ICONS_DIR, "splash-2048.png")
    svg_to_png(svg_splash(2048), splash_path, 2048)
    print(f"  ✅ splash-2048.png")

    # Source icon (1024px for bubblewrap)
    source_path = os.path.join(TWA_SOURCE_DIR, "icon-1024.png")
    svg_to_png(svg_store_icon(1024), source_path, 1024)
    print(f"  ✅ source/icon-1024.png (1024x1024)")

    # TWA store_icon.png (root of twa/)
    store_icon_path = os.path.join(PROJECT_ROOT, "twa", "store_icon.png")
    svg_to_png(svg_store_icon(512), store_icon_path, 512)
    print(f"  ✅ twa/store_icon.png")

    # ── 9. Master SVGs ──
    print("\n📐 Master SVGs...")
    svgs = {
        "icon-512.svg": svg_icon_main(512),
        "icon-192.svg": svg_icon_main(192),
        "icon-maskable-512.svg": svg_icon_maskable(512),
    }
    for name, content in svgs.items():
        path = os.path.join(ICONS_DIR, name)
        with open(path, 'w') as f:
            f.write(content)
        print(f"  ✅ {name}")

    # ── 10. Screenshot placeholders ──
    # Keep existing screenshots if they exist
    print("\n📸 Screenshots...")
    for fname in ["screenshot-mobile.png", "screenshot-desktop.png"]:
        path = os.path.join(ICONS_DIR, fname)
        if os.path.exists(path):
            print(f"  ⏭️  {fname} (keeping existing)")
        else:
            print(f"  ⚠️  {fname} (not found, skipping)")

    # ── Summary ──
    total_icons = len(pwa_sizes) + len(maskable_sizes)*2 + len(mono_sizes) + len(badge_sizes) + len(favicon_sizes) + 1 + 1 + 3 + 1 + 1 + len(android_densities) + 1 + 1 + 1 + 1 + len(svgs)
    print(f"\n{'=' * 50}")
    print(f"✅ Total: {total_icons} ícones gerados com sucesso!")
    print(f"📁 {ICONS_DIR}")
    print(f"📁 {FAVICONS_DIR}")
    print(f"📁 {TWA_ICONS_DIR}")
    print(f"\n🎯 Conceito: Vibrante — Verde gradiente (#56EF85 → #22C55E → #065F2C)")
    print(f"   V branco bold, rounded corners, specular highlight")


if __name__ == "__main__":
    generate_all()
