// ============================================
// exercise-video-player.tsx — Player de vídeo de demonstração de exercício
// ============================================
//
// O que faz:
//   Botão play discreto na lateral do exercício.
//   Click abre modal com player ou dialog de upload.
//   Personal pode adicionar vídeo via upload direto.
//
// Exports principais:
//   ExerciseVideoPlayer — botão play compacto + modal player/upload
'use client'

import { useState, useRef } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useExerciseMedia } from '@/hooks/use-exercise-media'
import { useUploadExerciseMedia } from '@/hooks/use-exercise-media'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import { useQueryClient } from '@tanstack/react-query'

export function ExerciseVideoPlayer({
  exerciseId,
  customVideoUrl,
  className,
}: {
  exerciseId: string
  customVideoUrl?: string
  className?: string
}) {
  const { data, isLoading } = useExerciseMedia(exerciseId)
  const media = data?.[0]
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadExerciseMedia(exerciseId)
  const queryClient = useQueryClient()
  const userType = useAuthStore((s) => s.user?.user_type)
  const isPersonal = userType === 'personal' || userType === 'admin'

  // custom video (aluno específico) tem prioridade sobre biblioteca
  const activeVideoUrl = customVideoUrl || media?.video_url
  const hasVideo = !!activeVideoUrl

  async function handleUpload(file: File) {
    if (!file) return
    // Validate max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Vídeo deve ter no máximo 10MB')
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      await upload.mutateAsync({
        file,
        type: 'video',
        onProgress: setProgress,
      })
      await queryClient.invalidateQueries({ queryKey: ['exercise-media', exerciseId] })
      toast.success('Vídeo enviado com sucesso!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar vídeo')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  if (isLoading) {
    return <div className={cn('h-8 w-8 shrink-0 animate-pulse rounded-lg bg-bg-tertiary', className)} />
  }

  return (
    <>
      {/* Compact play button */}
      <button
        type="button"
        onClick={() => {
          if (hasVideo) {
            setOpen(true)
          } else if (isPersonal) {
            fileRef.current?.click()
          }
        }}
        title={hasVideo ? 'Ver vídeo' : isPersonal ? 'Adicionar vídeo' : 'Sem vídeo'}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
          hasVideo
            ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 hover:scale-105'
            : isPersonal
              ? 'bg-bg-tertiary text-text-muted hover:bg-brand-primary/10 hover:text-brand-primary border border-dashed border-border-light hover:border-brand-primary/30'
              : 'bg-bg-tertiary text-text-muted/40 cursor-default',
          className,
        )}
      >
        {uploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        ) : hasVideo ? (
          <DSIcon name="playCircle" size={18} />
        ) : isPersonal ? (
          <DSIcon name="upload" size={14} />
        ) : (
          <DSIcon name="playCircle" size={14} />
        )}
      </button>

      {/* Hidden file input */}
      {isPersonal && (
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
            e.target.value = ''
          }}
        />
      )}

      {/* Upload progress overlay */}
      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-72 rounded-2xl border border-border-light bg-bg-primary p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
            <p className="text-sm font-medium text-text-primary">Enviando vídeo...</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">{progress}%</p>
          </div>
        </div>
      )}

      {/* Video modal */}
      {open && hasVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border-light bg-bg-primary overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <DSIcon name="x" size={16} />
            </button>

            <video
              className="w-full max-h-[70vh] bg-black"
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={media?.thumbnail_url || undefined}
              src={activeVideoUrl}
            >
              Seu navegador não suporta vídeo HTML5.
            </video>

            {media?.setup_notes && (
              <div className="px-4 py-3 border-t border-border-light">
                <p className="text-xs text-text-muted">{media.setup_notes}</p>
              </div>
            )}

            {/* Replace video button for personal */}
            {isPersonal && (
              <div className="px-4 py-3 border-t border-border-light flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    setTimeout(() => fileRef.current?.click(), 100)
                  }}
                >
                  <DSIcon name="upload" size={14} />
                  Trocar vídeo
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
