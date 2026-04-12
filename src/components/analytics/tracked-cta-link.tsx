'use client'

import Link from 'next/link'
import { trackLandingEvent } from '@/lib/landing-analytics'
import type { ReactNode } from 'react'

type CtaEvent = 'lp_cta_primary_click' | 'lp_cta_secondary_click' | 'lp_register_start'

interface TrackedCtaLinkProps {
  href: string
  cta: string
  placement: string
  pageSegment: 'home' | 'personal' | 'nutricionistas' | 'afiliados' | 'blog'
  event?: CtaEvent
  className?: string
  children: ReactNode
}

export function TrackedCtaLink({
  href,
  cta,
  placement,
  pageSegment,
  event = 'lp_cta_primary_click',
  className,
  children,
}: TrackedCtaLinkProps) {
  const handleClick = () => {
    trackLandingEvent(event, {
      cta,
      placement,
      page_segment: pageSegment,
      destination: href,
    })

    if (event === 'lp_register_start') {
      trackLandingEvent('signup_start', {
        cta,
        placement,
        source_page_segment: pageSegment,
      })
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
