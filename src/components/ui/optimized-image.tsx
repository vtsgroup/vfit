/**
 * src/components/ui/optimized-image.tsx
 *
 * OptimizedImage — Performance-first image component
 *
 * Exports: OptimizedImage, AvatarImage
 * Hooks: useState, useRef, useEffect
 * Features: 'use client'
 */

// ============================================
// OptimizedImage — Performance-first image component
// Blur placeholder + lazy loading + rounded corners
// ============================================

'use client'

import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  /** Base64 blur data URL for placeholder */
  blurDataURL?: string
  /** Preload for LCP images */
  priority?: boolean
  /** Border radius preset */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  /** Additional class names */
  className?: string
  /** Container class names */
  containerClassName?: string
  /** Called when image loads */
  onLoad?: () => void
  /** Called on error */
  onError?: () => void
  /** Sizes attribute for responsive images */
  sizes?: string
  /** Quality hint (for future CDN optimization) */
  quality?: number
}

const RADIUS_MAP = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const

const FIT_MAP = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
} as const

// Default blur placeholder (10×10 gray gradient)
const DEFAULT_BLUR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMTgxODFCIi8+PC9zdmc+'

// CF Image Resizing — transforms images on-the-fly (WebP/AVIF, resize, quality)
// CF Image Resizing is not available on Cloudflare Pages (requires Pro+ zone).
// Return the original src directly. Images are already optimized at upload.
function getCFResizedUrl(src: string, _width: number, _height: number, _quality: number, _fit: string): string {
  return src
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  blurDataURL,
  priority = false,
  rounded = 'xl',
  objectFit = 'cover',
  className,
  containerClassName,
  onLoad,
  onError,
  sizes,
  quality = 80,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Check if image is already cached (instant load)
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setIsLoaded(true)
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const aspectRatio = width / height
  const radiusClass = RADIUS_MAP[rounded]
  const fitClass = FIT_MAP[objectFit]
  const blur = blurDataURL || DEFAULT_BLUR

  // CF Image Resizing: optimized src + responsive srcSet
  const optimizedSrc = getCFResizedUrl(src, width, height, quality, objectFit)
  const srcSet = [
    `${getCFResizedUrl(src, Math.round(width * 0.5), Math.round(height * 0.5), quality, objectFit)} ${Math.round(width * 0.5)}w`,
    `${getCFResizedUrl(src, width, height, quality, objectFit)} ${width}w`,
    `${getCFResizedUrl(src, Math.round(width * 1.5), Math.round(height * 1.5), quality, objectFit)} ${Math.round(width * 1.5)}w`,
  ].join(', ')

  const containerStyle: CSSProperties = {
    aspectRatio: `${aspectRatio}`,
    width: '100%',
    maxWidth: `${width}px`,
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        radiusClass,
        containerClassName
      )}
      style={containerStyle}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={blur}
          alt=""
          aria-hidden
          className={cn(
            'absolute inset-0 h-full w-full scale-110 blur-lg',
            fitClass,
            'transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-tertiary">
          <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </div>
      )}

      {/* Real image — CF Image Resizing optimized */}
      {!hasError && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          sizes={sizes || `(max-width: ${width}px) 100vw, ${width}px`}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'h-full w-full transition-opacity duration-500',
            fitClass,
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  )
}

// ─── Avatar Image (Circular with fallback) ───────────
interface AvatarImageProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallbackName?: string
  className?: string
  showStatus?: boolean
  status?: 'online' | 'offline' | 'busy'
}

const AVATAR_SIZES = {
  xs: { px: 24, text: 'text-[10px]' },
  sm: { px: 32, text: 'text-xs' },
  md: { px: 40, text: 'text-sm' },
  lg: { px: 56, text: 'text-lg' },
  xl: { px: 80, text: 'text-2xl' },
  '2xl': { px: 120, text: 'text-4xl' },
} as const

const STATUS_COLORS = {
  online: 'bg-success',
  offline: 'bg-text-muted',
  busy: 'bg-warning',
} as const

// Generate a consistent color from a string
function nameToColor(name: string): string {
  const colors = [
    'from-brand-primary to-brand-accent',
    'from-blue-500 to-blue-400',
    'from-purple-500 to-purple-400',
    'from-pink-500 to-pink-400',
    'from-orange-500 to-orange-400',
    'from-teal-500 to-teal-400',
    'from-indigo-500 to-indigo-400',
    'from-rose-500 to-rose-400',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallbackName,
  className,
  showStatus = false,
  status = 'offline',
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false)
  const { px, text } = AVATAR_SIZES[size]
  const initials = fallbackName ? getInitials(fallbackName) : '?'
  const gradient = fallbackName ? nameToColor(fallbackName) : 'from-text-muted to-text-muted'

  const statusDotSize = px <= 32 ? 'h-2 w-2' : px <= 56 ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <div
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: px, height: px }}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="h-full w-full rounded-full object-cover ring-2 ring-border-light/50"
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center rounded-full bg-linear-to-br font-bold text-white ring-2 ring-border-light/50',
            gradient,
            text
          )}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-bg-primary',
            statusDotSize,
            STATUS_COLORS[status]
          )}
        />
      )}
    </div>
  )
}
