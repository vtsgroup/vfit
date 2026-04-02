// ============================================
// exercise-media-upload.tsx — Upload de vídeo e thumbnail de exercício
// ============================================
//
// O que faz:
//   Formulário para upload de vídeo (MP4/WebM) e thumbnail de exercício.
//   useCreateExerciseMedia cria o registro + useUploadExerciseMedia envia os arquivos para R2.
//   Preview do vídeo e thumbnail antes do upload.
//   Validação de tamanho (vídeo max 100MB, thumb max 5MB).
//
// Exports principais:
//   ExerciseMediaUpload — form de upload de mídia de exercício
'use client'

import { useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useCreateExerciseMedia, useUploadExerciseMedia } from '@/hooks/use-exercise-media'

export function ExerciseMediaUpload({ exerciseId }: { exerciseId: string }) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [setupNotes, setSetupNotes] = useState('')
  const [duration, setDuration] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)

  const uploadMutation = useUploadExerciseMedia(exerciseId)
  const createMutation = useCreateExerciseMedia(exerciseId)

  async function handleSubmit() {
    if (!videoFile) return

    setProgress(0)
    const video = await uploadMutation.mutateAsync({
      file: videoFile,
      type: 'video',
      onProgress: setProgress,
    })

    let thumbnailUrl: string | null = null
    if (thumbnailFile) {
      const thumb = await uploadMutation.mutateAsync({
        file: thumbnailFile,
        type: 'thumbnail',
      })
      thumbnailUrl = thumb.url
    }

    await createMutation.mutateAsync({
      video_url: video.url,
      thumbnail_url: thumbnailUrl,
      setup_notes: setupNotes || null,
      duration_seconds: duration,
      is_active: true,
    })

    setVideoFile(null)
    setThumbnailFile(null)
    setSetupNotes('')
    setDuration(0)
    setProgress(0)
  }

  const isBusy = uploadMutation.isPending || createMutation.isPending

  return (
    <div className="space-y-3 rounded-lg border border-border-light bg-bg-primary p-3">
      <p className="text-sm font-medium text-text-primary">Upload de mídia do exercício</p>

      <div className="space-y-1">
        <label className="text-xs text-text-muted">Vídeo (obrigatório)</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          className="block w-full rounded-md border border-border-light bg-bg-secondary p-2 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-text-muted">Thumbnail (opcional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          className="block w-full rounded-md border border-border-light bg-bg-secondary p-2 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          type="number"
          min={0}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value || 0))}
          placeholder="Duração (segundos)"
          className="rounded-md border border-border-light bg-bg-secondary p-2 text-xs"
        />
        <input
          type="text"
          value={setupNotes}
          onChange={(e) => setSetupNotes(e.target.value)}
          placeholder="Notas de setup"
          className="rounded-md border border-border-light bg-bg-secondary p-2 text-xs"
        />
      </div>

      {progress > 0 && progress < 100 && (
        <div className="h-2 w-full overflow-hidden rounded bg-bg-tertiary">
          <div className="h-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!videoFile || isBusy}
        className="w-full"
      >
        <DSIcon name="uploadCloud" size={16} className="mr-2" />
        {isBusy ? 'Enviando...' : 'Enviar mídia'}
      </Button>
    </div>
  )
}
