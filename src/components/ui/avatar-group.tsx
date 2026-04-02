/**
 * src/components/ui/avatar-group.tsx
 *
 * AvatarGroup — Overlapping avatars with overflow count
 * Features: stacked layout, customizable overlap, +N badge
 */

import { cn } from '@/lib/utils'
import { Avatar } from './avatar'

interface AvatarGroupItem {
  name: string
  src?: string
}

interface AvatarGroupProps {
  items: AvatarGroupItem[]
  /** Max visible avatars before +N */
  max?: number
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  xs: { avatar: 'sm' as const, ring: 'ring-2', overlapMl: '-ml-2', countSize: 'h-6 w-6 text-[10px]' },
  sm: { avatar: 'sm' as const, ring: 'ring-2', overlapMl: '-ml-2.5', countSize: 'h-8 w-8 text-xs' },
  md: { avatar: 'md' as const, ring: 'ring-[3px]', overlapMl: '-ml-3', countSize: 'h-10 w-10 text-sm' },
  lg: { avatar: 'lg' as const, ring: 'ring-[3px]', overlapMl: '-ml-3.5', countSize: 'h-12 w-12 text-sm' },
}

export function AvatarGroup({ items, max = 4, size = 'md', className }: AvatarGroupProps) {
  const s = sizeMap[size]
  const visible = items.slice(0, max)
  const overflow = items.length - max

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((item, i) => (
        <div
          key={item.name + i}
          className={cn(
            i > 0 && s.overlapMl,
            s.ring,
            'ring-bg-primary rounded-full transition-transform hover:-translate-y-1 hover:z-10'
          )}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar name={item.name} src={item.src} size={s.avatar} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center rounded-full',
            'bg-bg-tertiary text-text-secondary font-semibold',
            'border-2 border-bg-primary',
            s.overlapMl,
            s.countSize
          )}
          style={{ zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
