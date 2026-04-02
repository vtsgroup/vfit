/**
 * src/components/assessments/photo-editor.tsx
 *
 * Photo Editor with AI Preview
 *
 * Exports: PhotoEditor
 * Hooks: useState, useCallback, useEffect
 * Features: 'use client' · DSIcon
 */

// ============================================
// Photo Editor with AI Preview
// ============================================

'use client'

import { useState, useCallback, useEffect } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider'
import { api } from '@/lib/api-client'

interface PhotoEditorProps {
  photos: {
    front?: { preview: string | null }
    side?: { preview: string | null }
    back?: { preview: string | null }
  }
  editMode: 'none' | 'leaner_man' | 'leaner_woman' | 'muscular_man'
}

interface EditedPhoto {
  position: string
  original: string
  edited: string
  loading: boolean
  error: string | null
}

export function PhotoEditor({ photos, editMode }: PhotoEditorProps) {
  const [editedPhotos, setEditedPhotos] = useState<Record<string, EditedPhoto>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Verificar se há fotos válidas (não data URLs)
  const hasValidPhotos = Object.values(photos).some(
    (p) => p?.preview && !p.preview.startsWith('data:')
  )

  const processPhotos = useCallback(async () => {
    if (editMode === 'none' || !hasValidPhotos) return

    setIsProcessing(true)

    // Fotos a processar
    const photosToProcess = [
      { position: 'front', preview: photos.front?.preview },
      { position: 'side', preview: photos.side?.preview },
      { position: 'back', preview: photos.back?.preview },
    ].filter((p) => p.preview && !p.preview.startsWith('data:'))

    for (const photo of photosToProcess) {
      try {
        // Inicializar estado de carregamento
        setEditedPhotos((prev) => ({
          ...prev,
          [photo.position]: {
            position: photo.position,
            original: photo.preview!,
            edited: '',
            loading: true,
            error: null,
          },
        }))

        // Chamar API para processar foto com Nano Banana
        const response = await api.post<{ edited_url: string }>('/assessments/preview-edit-photo', {
          image_url: photo.preview,
          style: editMode,
        }, { auth: false })

        // Atualizar com foto editada
        setEditedPhotos((prev) => ({
          ...prev,
          [photo.position]: {
            ...prev[photo.position]!,
            edited: response.data.edited_url,
            loading: false,
          },
        }))
      } catch (err) {
        setEditedPhotos((prev) => ({
          ...prev,
          [photo.position]: {
            ...prev[photo.position]!,
            loading: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido',
          },
        }))
      }
    }

    setIsProcessing(false)
  }, [photos, editMode, hasValidPhotos])

  // Processar fotos quando editMode mudar
  useEffect(() => {
    if (editMode !== 'none') {
      processPhotos()
    }
  }, [editMode, processPhotos])

  if (editMode === 'none') {
    return null
  }

  const styleLabelMap = {
    leaner_man: 'Versão Mais Magra',
    leaner_woman: 'Versão Mais Magra',
    muscular_man: 'Versão Mais Musculosa',
  }

  return (
    <div className="space-y-6 border-t border-border-light pt-6">
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-2">
          Comparativo IA — {styleLabelMap[editMode as keyof typeof styleLabelMap]}
        </h3>
        <p className="text-sm text-text-muted">
          Deslize para comparar como o aluno ficaria. Arraste o controle deslizante para ver antes e depois.
        </p>
      </div>

      {/* Aviso: edição só funciona com fotos salvas */}
      {!hasValidPhotos && editMode && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex gap-3">
          <DSIcon name="alertCircle" size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Fotos ainda não foram processadas
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              Salve a avaliação primeiro para que as fotos sejam enviadas ao servidor. Depois poderá editar com IA.
            </p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-8 text-text-muted">
          <DSIcon name="loader" size={20} className="animate-spin" />
          <span>Processando fotos com IA...</span>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {['front', 'side', 'back'].map((position) => {
          const photo = editedPhotos[position]
          const original = photos[position as keyof typeof photos]?.preview

          if (!original) return null

          return (
            <div key={position}>
              <p className="mb-3 text-sm font-medium text-text-primary capitalize">
                {position === 'front' && 'Frente'}
                {position === 'side' && 'Perfil'}
                {position === 'back' && 'Costas'}
              </p>

              {photo?.error ? (
                <div className="aspect-square rounded-lg border-2 border-red-500/30 bg-red-500/10 flex flex-col items-center justify-center gap-2 p-4">
                  <DSIcon name="alertCircle" className="text-red-500" />
                  <p className="text-xs text-red-600 text-center">{photo.error}</p>
                </div>
              ) : photo?.loading ? (
                <div className="aspect-square rounded-lg border-2 border-brand-primary/30 bg-bg-secondary flex items-center justify-center">
                  <DSIcon name="loader" className="animate-spin text-brand-primary" />
                </div>
              ) : photo?.edited ? (
                <ImageComparisonSlider
                  beforeUrl={photo.original}
                  afterUrl={photo.edited}
                  beforeLabel="Antes"
                  afterLabel={styleLabelMap[editMode as keyof typeof styleLabelMap].split(' ')[2]}
                  alt={position}
                  storyGoal={editMode === 'muscular_man' ? 'muscle_gain' : editMode === 'leaner_man' || editMode === 'leaner_woman' ? 'definition' : 'recomposition'}
                  storyPersona={editMode === 'leaner_woman' ? 'female' : editMode === 'leaner_man' || editMode === 'muscular_man' ? 'male' : 'neutral'}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
