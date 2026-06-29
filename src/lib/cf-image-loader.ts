// ============================================
// cf-image-loader.ts — Loader custom do next/image → Cloudflare Image Transformations
// ============================================
//
// O que faz:
//   Reescreve a URL de cada <Image> para passar pelo endpoint /cdn-cgi/image/
//   da Cloudflare (resize + format=auto + quality), gerando um srcset
//   multi-largura REAL mesmo com `output: "export"` (static export → CF Pages).
//   Transformations já está ENABLED na zona vfit.app.br (free tier 5.000/mês).
//
//   Transforma: same-zone (vfit.app.br + *.vfit.app.br, incl. R2 images.vfit.app.br)
//   e caminhos root-relative (/blog/x.webp).
//
//   PASS-THROUGH (retorna src sem tocar) — a CF não redimensiona / não deve tocar:
//     - data: / blob:
//     - SVG (favicon, ícones) — CF não redimensiona SVG por padrão
//     - URLs já transformadas (/cdn-cgi/image/)
//     - origens externas (replicate.delivery, googleusercontent.com, fbcdn.net…)
//       — a CF só redimensiona imagens same-zone por padrão
//
// Por que loader GLOBAL e não por-componente:
//   No Next 15.5 `images.unoptimized: true` é OR'd em toda <Image>
//   (get-img-props.js) e força srcSet undefined → a abordagem "só no blog" é
//   impossível. Daí o loader global + pass-through para proteger o resto.
//
// Exports principais:
//   default cfImageLoader — compatível com images.loaderFile do next.config

import type { ImageLoaderProps } from 'next/image'

export default function cfImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // 1) Não-transformáveis por esquema/formato.
  if (
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.includes('/cdn-cgi/image/') || // já transformada
    /\.svg(\?|$)/i.test(src) // CF não redimensiona SVG por padrão
  ) {
    return src
  }

  // 2) Origens externas: a CF só redimensiona same-zone por padrão → passa direto.
  if (/^https?:\/\//i.test(src)) {
    try {
      const host = new URL(src).hostname
      const sameZone = host === 'vfit.app.br' || host.endsWith('.vfit.app.br')
      if (!sameZone) return src
    } catch {
      return src // URL malformada: não arrisca
    }
  }

  // 3) Transforma (root-relative + same-zone absolutas, incl. R2).
  const q = quality || 60
  return `/cdn-cgi/image/width=${width},quality=${q},format=auto/${src}`
}
