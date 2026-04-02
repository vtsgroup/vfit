// ============================================
// success-content.tsx — Conteúdo cliente da página de sucesso de avaliação
// ============================================
//
// O que faz:
//   Componente cliente que exibe detalhes da avaliação recém-criada.
//   Busca dados via useAssessment(assessmentId).
//   Permite compartilhar, baixar PDF ou voltar à lista de avaliações.
//   Separado de page.tsx para permitir Suspense boundary no RSC pai.
//
// Exports principais:
//   SuccessContent — conteúdo cliente da página de sucesso
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { useAssessment } from '@/hooks/use-assessments'
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider'

export default function SuccessContent({ params }: { params: { id: string } }) {
  const { data: assessment, isLoading } = useAssessment(params.id)
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0)

  if (isLoading) {
    return (
      <AuthGuard requiredType="personal">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 animate-pulse" />
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-white/8" />
            <div className="mx-auto h-3 w-56 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!assessment || !assessment.photos || assessment.photos.length === 0) {
    return (
      <AuthGuard requiredType="personal">
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="text-center">
            <DSIcon name="checkCircle" size={80} className="text-success mx-auto mb-4" />
            <h1 className="text-3xl font-black tracking-tight text-text-primary mb-2">
              Avaliação Criada com Sucesso!
            </h1>
            <p className="text-text-muted mb-8">
              Nenhuma foto foi salva, mas os dados foram registrados.
            </p>
          </div>
          <Link href="/dashboard/assessments">
            <Button className="gap-2">
              <DSIcon name="chevronLeft" size={16} />
              Voltar às Avaliações
            </Button>
          </Link>
        </div>
      </AuthGuard>
    )
  }

  const currentPhoto = assessment.photos[selectedPhotoIdx]
  const photoLabels: Record<string, string> = {
    front: 'Frente',
    back: 'Costas',
    side_left: 'Perfil',
    side_right: 'Lado Direito',
    custom: 'Customizada',
  }

  // Procurar foto editada para o tipo da foto atual
  const editedPhoto = assessment.ai_analysis?.edited_photos?.find(
    (ep) => ep.type === currentPhoto.type
  )
  const hasEditedPhoto = !!editedPhoto

  return (
    <AuthGuard requiredType="personal">
      <div className="flex flex-col -mx-4 -mt-4 lg:-mx-6 lg:-mt-6">
        {/* Header */}
        <div className="border-b border-border-light bg-bg-secondary px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DSIcon name="checkCircle" size={24} className="text-success" />
              <div>
                <h1 className="text-lg font-black tracking-tight text-text-primary">
                  Avaliação Criada com Sucesso!
                </h1>
                <p className="text-sm text-text-muted">
                  {assessment.student_name} • {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <Link href="/dashboard/assessments">
              <Button variant="outline" size="sm">
                <DSIcon name="chevronLeft" size={16} className="mr-1" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col">
          <div className="flex items-center justify-center p-6 md:p-12">
            {/* Photo preview */}
            <div className="w-full flex flex-col items-center justify-center gap-6">
              {/* Slider com antes/depois se houver foto editada */}
              {hasEditedPhoto ? (
                <div className="w-full max-w-2xl">
                  <ImageComparisonSlider
                    beforeUrl={currentPhoto.url}
                    afterUrl={editedPhoto.edited_url}
                    beforeLabel="Original"
                    afterLabel="Editada"
                    alt={photoLabels[currentPhoto.type] || 'Foto'}
                    storyGoal={editedPhoto.style === 'muscular_man' ? 'muscle_gain' : editedPhoto.style === 'leaner_man' || editedPhoto.style === 'leaner_woman' ? 'definition' : 'recomposition'}
                    storyPersona={editedPhoto.style === 'leaner_woman' ? 'female' : editedPhoto.style === 'leaner_man' || editedPhoto.style === 'muscular_man' ? 'male' : 'neutral'}
                  />
                </div>
              ) : (
                <div className="relative w-full max-w-2xl aspect-square rounded-lg overflow-hidden border-2 border-brand-primary/20 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentPhoto.url}
                    alt={photoLabels[currentPhoto.type] || 'Foto'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-center">
                <p className="text-sm font-medium text-text-muted mb-2">
                  {hasEditedPhoto ? 'Comparativo com IA' : 'Foto do Aluno'}
                </p>
                <p className="text-xl font-bold text-text-primary">
                  {photoLabels[currentPhoto.type] || currentPhoto.type}
                </p>
              </div>
            </div>
          </div>

          {/* Photo thumbnails */}
          {assessment.photos.length > 1 && (
            <div className="border-t border-border-light bg-bg-secondary p-4">
              <div>
                <p className="text-xs text-text-muted mb-3 uppercase tracking-wider font-medium">
                  Fotos ({assessment.photos.length})
                </p>
                <div className="flex gap-3 overflow-x-auto">
                  {assessment.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIdx(idx)}
                      className={`relative shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedPhotoIdx === idx
                          ? 'border-brand-primary ring-2 ring-brand-primary/50'
                          : 'border-border-light hover:border-brand-primary/50'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photoLabels[photo.type]}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-border-light bg-bg-secondary p-4">
            <div className="flex gap-3">
              <Link href={`/dashboard/assessments/view?id=${params.id}`} className="flex-1">
                <Button className="w-full">
                  Ver Avaliação Completa
                </Button>
              </Link>
              <Link href="/dashboard/assessments" className="flex-1">
                <Button className="w-full" variant="outline">
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
