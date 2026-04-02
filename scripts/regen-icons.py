#!/usr/bin/env python3
"""Regenerate all PWA icons with solid dark blue background (#050526)."""

from PIL import Image

# === CONFIG ===
BG_COLOR = (5, 5, 38, 255)   # #050526 - dark blue from logo
BG_RGB = (5, 5, 38)

src = Image.open('public/icons/icon-1024.png').convert('RGBA')
src_w, src_h = src.size

# Logo content bounds (green IA mark + PERSONAL text)
logo_left, logo_top, logo_right, logo_bottom = 164, 193, 858, 829
logo_w = logo_right - logo_left   # 694
logo_h = logo_bottom - logo_top   # 636
logo_max = max(logo_w, logo_h)    # 694

# =====================================================
# ANY ICONS - Logo fills ~86% of canvas
# =====================================================
pad = int(logo_max * 0.08)
crop_size = logo_max + 2 * pad
cx = (logo_left + logo_right) // 2
cy = (logo_top + logo_bottom) // 2
crop_left = max(0, cx - crop_size // 2)
crop_top = max(0, cy - crop_size // 2)
crop_right = min(src_w, crop_left + crop_size)
crop_bottom = min(src_h, crop_top + crop_size)
actual_size = min(crop_right - crop_left, crop_bottom - crop_top)
crop_right = crop_left + actual_size
crop_bottom = crop_top + actual_size

any_src = Image.new('RGBA', (actual_size, actual_size), BG_COLOR)
cropped = src.crop((crop_left, crop_top, crop_right, crop_bottom))
any_src.paste(cropped, (0, 0), cropped)

for size in [48, 72, 96, 128, 144, 152, 192, 256, 384, 512, 1024]:
    icon = any_src.resize((size, size), Image.LANCZOS)
    rgb = Image.new('RGB', (size, size), BG_RGB)
    rgb.paste(icon, (0, 0), icon)
    rgb.save(f'public/icons/icon-{size}.png', 'PNG', optimize=True)
    print(f'  ✅ icon-{size}.png (any)')

# =====================================================
# MASKABLE ICONS - Logo 62% of canvas inside safe zone
# =====================================================
maskable_src = Image.new('RGBA', (1024, 1024), BG_COLOR)
target_logo_max = int(1024 * 0.62)
scale = target_logo_max / logo_max
new_logo_w = int(logo_w * scale)
new_logo_h = int(logo_h * scale)
logo_img = src.crop((logo_left, logo_top, logo_right, logo_bottom))
logo_resized = logo_img.resize((new_logo_w, new_logo_h), Image.LANCZOS)
paste_x = (1024 - new_logo_w) // 2
paste_y = (1024 - new_logo_h) // 2
maskable_src.paste(logo_resized, (paste_x, paste_y), logo_resized)

for size in [48, 72, 96, 128, 144, 152, 192, 384, 512]:
    icon = maskable_src.resize((size, size), Image.LANCZOS)
    rgb = Image.new('RGB', (size, size), BG_RGB)
    rgb.paste(icon, (0, 0), icon)
    rgb.save(f'public/icons/icon-{size}-maskable.png', 'PNG', optimize=True)
    print(f'  ✅ icon-{size}-maskable.png (maskable)')

# =====================================================
# APPLE TOUCH ICON (180x180) - NO transparency
# =====================================================
apple = any_src.resize((180, 180), Image.LANCZOS)
rgb = Image.new('RGB', (180, 180), BG_RGB)
rgb.paste(apple, (0, 0), apple)
rgb.save('public/icons/apple-touch-icon.png', 'PNG', optimize=True)
rgb.save('public/favicons/apple-touch-icon.png', 'PNG', optimize=True)
rgb.save('public/apple-touch-icon.png', 'PNG', optimize=True)
print('  ✅ apple-touch-icon.png (3 locations)')

# MONOCHROME
mono = any_src.resize((96, 96), Image.LANCZOS).convert('L').convert('RGBA')
mono.save('public/icons/icon-96-monochrome.png', 'PNG', optimize=True)
print('  ✅ icon-96-monochrome.png')

# STARTUP
startup_rgb = Image.new('RGB', (1024, 1024), BG_RGB)
startup = any_src.resize((1024, 1024), Image.LANCZOS)
startup_rgb.paste(startup, (0, 0), startup)
startup_rgb.save('public/icons/startup-1024.png', 'PNG', optimize=True)
print('  ✅ startup-1024.png')

# =====================================================
# VERIFICATION
# =====================================================
print('\n🔍 Verification:')
for f in ['icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png']:
    check = Image.open(f'public/icons/{f}').convert('RGBA')
    w, h = check.size
    transparent = sum(1 for yy in range(h) for xx in range(w) if check.getpixel((xx,yy))[3] < 255)
    corner = check.getpixel((0,0))
    center = check.getpixel((w//2, h//2))
    print(f'  {f}: {w}x{h} transparent={transparent} corner=#{corner[0]:02x}{corner[1]:02x}{corner[2]:02x} center=#{center[0]:02x}{center[1]:02x}{center[2]:02x}')

print('\n🎉 All icons regenerated with dark blue bg #050526!')
