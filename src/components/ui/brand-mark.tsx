// ============================================
// brand-mark.tsx — Selo da marca VFIT (V-mark) server-safe
// ============================================
//
// O que faz:
//   Renderiza APENAS o ícone "V" da marca (quadrado arredondado com gradiente
//   verde + highlight + polyline branca) — a mesma gramática do splash, app icon
//   e <VfitLogo/>, mas SEM 'use client'. Pode ser usado dentro de Server
//   Components (ex.: avatar do autor no blog) sem criar fronteira de cliente,
//   sem request de imagem e sem CLS (vetorial, escala perfeita).
//
// Exports principais:
//   BrandMark — selo V da marca (SVG inline, escala por `size`)
import type { CSSProperties } from 'react'

interface BrandMarkProps {
  /** Lado do quadrado, em px */
  size?: number
  className?: string
  style?: CSSProperties
  /** Sufixo único p/ os ids de gradiente quando houver +1 selo na mesma página */
  idSuffix?: string
}

export function BrandMark({ size = 44, className, style, idSuffix = 'a' }: BrandMarkProps) {
  const bg = `vmark-${idSuffix}-bg`
  const hl = `vmark-${idSuffix}-hl`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      role="img"
      aria-label="VFIT"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#56EF85" />
          <stop offset="38%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#065F2C" />
        </linearGradient>
        <radialGradient id={hl} cx="33%" cy="28%" r="54%">
          <stop offset="0%" stopColor="rgba(255,255,255,.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="46" fill={`url(#${bg})`} />
      <rect width="200" height="200" rx="46" fill={`url(#${hl})`} />
      <rect x="1" y="1" width="198" height="198" rx="45" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
      <polyline
        points="32,38 100,162 168,38"
        fill="none"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default BrandMark
