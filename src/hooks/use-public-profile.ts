/**
 * src/hooks/use-public-profile.ts
 *
 * Public Profile hooks — TanStack Query
 *
 * Exports: PublicPersonalProfile, PublicReview, PublicReviewsResponse, usePublicProfile, usePublicReviews
 * Hooks: useQuery, usePublicProfile, usePublicReviews
 * Features: React Query
 */

// ============================================
// Public Profile hooks — TanStack Query
// ============================================

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

// ============================================
// Types
// ============================================

export interface PublicPersonalProfile {
  id: string
  full_name: string
  avatar_url: string | null
  slug: string
  cref: string | null
  specialties: string[]
  bio: string | null
  city: string | null
  state: string | null
  average_rating: number
  total_reviews: number
  total_students: number
  social_links: {
    instagram?: string
    whatsapp?: string
    youtube?: string
  } | null
}

export interface PublicReview {
  id: string
  student_name: string
  rating: number
  comment: string | null
  created_at: string
  status: string
}

export interface PublicReviewsResponse {
  reviews: PublicReview[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

// ============================================
// Hooks
// ============================================

export function usePublicProfile(slug: string) {
  return useQuery<PublicPersonalProfile>({
    queryKey: ['public', 'profile', slug],
    queryFn: async () => {
      const res = await api.get<PublicPersonalProfile>(`/personals/${slug}`)
      return res.data
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,  // 5min — public data cached in CDN
    gcTime: 30 * 60_000,  // 30min — keep in memory longer
    refetchOnWindowFocus: false,
  })
}

export function usePublicReviews(personalId: string, params: { page?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  const q = qs.toString()

  return useQuery<PublicReviewsResponse>({
    queryKey: ['public', 'reviews', personalId, params],
    queryFn: async () => {
      const res = await api.get<PublicReviewsResponse>(`/reviews/public/${personalId}${q ? `?${q}` : ''}`)
      return res.data
    },
    enabled: !!personalId,
  })
}
