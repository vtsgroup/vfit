/**
 * src/components/ui/avatar.tsx
 *
 * Avatar — componente base
 *
 * Exports: Avatar
 * Hooks: useEffect, useMemo, useState
 * Features: 'use client'
 */

// ============================================
// Avatar — componente base
// Direct R2 URLs (CF Image Resizing not available on Pages)
// ============================================

'use client'

import { cn, getInitials } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const sizePx: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const [failed, setFailed] = useState(false)

  // ── Reset failed state when src changes (new photo uploaded) ──
  // Without this, a previously-failed avatar stays stuck on initials
  // even after the user uploads a new photo.
  useEffect(() => {
    setFailed(false)
  }, [src])

  const normalizedSrc = useMemo(() => {
    if (!src) return null
    const raw = String(src).trim()
    if (!raw) return null

    const publicImagesBase = (process.env.NEXT_PUBLIC_IMAGES_URL || 'https://images.vfit.app.br').replace(/\/+$/, '')

    // If backend stored only the key, build a public URL.
    if (raw.startsWith('profiles/')) return `${publicImagesBase}/${raw}`

    // Accept absolute URLs (R2/CDN) and same-origin paths.
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const u = new URL(raw)
        // Guard: some misconfig returned host "profiles" (no dot). Map to our CDN domain.
        if (!u.hostname.includes('.') || u.hostname === 'profiles') {
          const p = u.pathname.startsWith('/profiles/') ? u.pathname : `/profiles${u.pathname}`
          return `${publicImagesBase}${p}`
        }
      } catch {
        // fallthrough
      }
      return raw
    }
    if (raw.startsWith('//')) return `https:${raw}`
    if (raw.startsWith('/')) return raw

    // If backend ever returns a naked host/path, try to make it usable.
    if (raw.startsWith('profiles/')) return `${publicImagesBase}/${raw}`
    return `https://${raw}`
  }, [src])

  if (normalizedSrc && !failed) {
    const px = sizePx[size]

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalizedSrc}
        alt={name}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        className={cn(
          'shrink-0 rounded-full object-cover',
          sizeStyles[size],
          className
        )}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-primary to-brand-accent font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.15)]',
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  )
}
