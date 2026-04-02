/**
 * src/components/profile/public-profile.tsx
 *
 * Public Profile Client Component
 *
 * Exports: PublicProfileClient
 * Hooks: useState, usePublicProfile, usePublicReviews
 * Features: 'use client' · DSIcon
 */

// ============================================
// Public Profile Client Component
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicProfileSkeleton } from '@/components/ui/page-skeletons'
import { Avatar } from '@/components/ui/avatar'
import {
  usePublicProfile,
  usePublicReviews,
  type PublicReview,
} from '@/hooks/use-public-profile'

export default function PublicProfileClient({ slug }: { slug: string }) {
  const { data: profile, isLoading } = usePublicProfile(slug)
  const [reviewPage, setReviewPage] = useState(1)
  const { data: reviewsData } = usePublicReviews(profile?.id || '', { page: reviewPage })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PublicProfileSkeleton />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-text-muted">Perfil não encontrado.</p>
        <Link href="/" className="text-sm text-brand-primary hover:underline">
          Ir para o início
        </Link>
      </div>
    )
  }

  const reviews = reviewsData?.reviews ?? []
  const reviewMeta = reviewsData?.meta

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <div className="relative bg-linear-to-br from-brand-primary to-brand-primary/80 pb-20 pt-12">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            size="xl"
            className="mx-auto mb-4 h-24 w-24 border-4 border-white/20"
          />
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>

          {profile.cref && (
            <p className="mt-1 text-sm text-white/70">CREF: {profile.cref}</p>
          )}

          {(profile.city || profile.state) && (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-white/80">
              <DSIcon name="mapPin" size={14} />
              {[profile.city, profile.state].filter(Boolean).join(', ')}
            </p>
          )}

          {/* Stats */}
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.total_students}</p>
              <p className="text-xs text-white/70">Alunos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                {profile.average_rating.toFixed(1)}
                <DSIcon name="star" size={20} className="fill-yellow-400 text-yellow-400" />
              </p>
              <p className="text-xs text-white/70">{profile.total_reviews} avaliações</p>
            </div>
          </div>

          {/* Specialties */}
          {profile.specialties.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {profile.specialties.map((s) => (
                <Badge key={s} className="bg-white/10 text-white border-white/20 text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto -mt-12 max-w-3xl px-4 pb-12 space-y-6">
        {/* Bio */}
        {profile.bio && (
          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Social links */}
        {profile.social_links && Object.keys(profile.social_links).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {profile.social_links.instagram && (
                  <a
                    href={`https://instagram.com/${profile.social_links.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-2 text-sm text-text-secondary hover:border-brand-primary/30 transition-colors"
                  >
                    <DSIcon name="externalLink" size={14} />
                    Instagram
                  </a>
                )}
                {profile.social_links.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.social_links.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-2 text-sm text-text-secondary hover:border-brand-primary/30 transition-colors"
                  >
                    <DSIcon name="externalLink" size={14} />
                    WhatsApp
                  </a>
                )}
                {profile.social_links.youtube && (
                  <a
                    href={profile.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-2 text-sm text-text-secondary hover:border-brand-primary/30 transition-colors"
                  >
                    <DSIcon name="externalLink" size={14} />
                    YouTube
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DSIcon name="star" size={16} /> Avaliações ({profile.total_reviews})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="py-4 text-center text-sm text-text-muted">
                Nenhuma avaliação publicada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}

                {reviewMeta && reviewMeta.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage <= 1}
                      onClick={() => setReviewPage((p) => p - 1)}
                    >
                      <DSIcon name="chevronLeft" size={16} />
                    </Button>
                    <span className="text-sm text-text-muted">
                      {reviewPage} / {reviewMeta.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage >= reviewMeta.total_pages}
                      onClick={() => setReviewPage((p) => p + 1)}
                    >
                      <DSIcon name="chevronRight" size={16} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/register">
            <Button size="lg">
              Comece a treinar com {profile.full_name.split(' ')[0]}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Review Card
// ============================================

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <div className="border-b border-border-light pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <p className="font-medium text-text-primary text-sm">{review.student_name}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <DSIcon
              key={i}
              name="star"
              size={14}
              className={cn(
                i < review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-border-light'
              )}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="mt-1 text-sm text-text-secondary">{review.comment}</p>
      )}
      <p className="mt-1 text-[10px] text-text-muted">
        {new Date(review.created_at).toLocaleDateString('pt-BR')}
      </p>
    </div>
  )
}
