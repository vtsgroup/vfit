/**
 * src/components/profile/photo-upload.tsx
 *
 * PhotoUpload — Upload de foto de perfil com preview
 *
 * Exports: PhotoUpload
 * Hooks: useEffect, useMemo, useState, useRef, useCallback, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// PhotoUpload — Upload de foto de perfil com preview
// Preview circular, drag & drop, crop visual
// ============================================

'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { DSIcon } from '@/components/ui/ds-icon'
import dynamic from 'next/dynamic'
import type { Area } from 'react-easy-crop'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'

const Cropper = dynamic(() => import('react-easy-crop'), { ssr: false })

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const PUBLIC_IMAGES_BASE = (process.env.NEXT_PUBLIC_IMAGES_URL || 'https://images.vfit.app.br').replace(/\/+$/, '')

interface PhotoUploadProps {
  className?: string
}

export function PhotoUpload({ className }: PhotoUploadProps) {
  const user = useAuthStore((s) => s.user)
  const tokens = useAuthStore((s) => s.tokens)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const [cropOpen, setCropOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useScrollLock(cropOpen)

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPhoto = user?.avatar_url

  const normalizedCurrentPhoto = useMemo(() => {
    if (!currentPhoto) return null
    const raw = String(currentPhoto).trim()
    if (!raw) return null

    if (raw.startsWith('profiles/')) return `${PUBLIC_IMAGES_BASE}/${raw}`
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const u = new URL(raw)
        if (!u.hostname.includes('.') || u.hostname === 'profiles') {
          const p = u.pathname.startsWith('/profiles/') ? u.pathname : `/profiles${u.pathname}`
          return `${PUBLIC_IMAGES_BASE}${p}`
        }
      } catch {
        // ignore
      }
      return raw
    }
    if (raw.startsWith('//')) return `https:${raw}`
    if (raw.startsWith('/')) return raw
    if (raw.startsWith('profiles/')) return `${PUBLIC_IMAGES_BASE}/${raw}`
    return `https://${raw}`
  }, [currentPhoto])

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      try {
        if (sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl)
      } catch {
        // ignore
      }
      try {
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      } catch {
        // ignore
      }
    }
  }, [sourceUrl, previewUrl])

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato não suportado. Use JPG, PNG ou WebP.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Máximo 20MB.'
    }
    return null
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    setSelectedFile(file)
    setUploadFile(file)

    // Create object URL source + preview
    const nextUrl = URL.createObjectURL(file)
    setSourceUrl((prev) => {
      try {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      } catch {
        // ignore
      }
      return nextUrl
    })
    setPreviewUrl((prev) => {
      try {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      } catch {
        // ignore
      }
      return nextUrl
    })

    // Reset crop state + open editor
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setCropOpen(true)
  }, [validateFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const cancelPreview = () => {
    setCropOpen(false)
    setSourceUrl(null)
    setPreviewUrl(null)
    setSelectedFile(null)
    setUploadFile(null)
  }

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Falha ao carregar imagem para recorte'))
      img.src = url
    })
  }

  const cropToBlob = async (imageSrc: string, pixelCrop: Area, outputSize = 512): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas não suportado')

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputSize,
      outputSize
    )

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error('Falha ao gerar imagem recortada'))
          resolve(b)
        },
        'image/webp',
        0.92
      )
    })

    return blob
  }

  const applyCrop = async () => {
    if (!sourceUrl || !croppedAreaPixels || !selectedFile) {
      setCropOpen(false)
      return
    }

    try {
      const blob = await cropToBlob(sourceUrl, croppedAreaPixels, 512)
      const nextFile = new File([blob], `avatar-${Date.now()}.webp`, { type: blob.type })
      setUploadFile(nextFile)

      const nextPreview = URL.createObjectURL(blob)
      setPreviewUrl((prev) => {
        try {
          if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
        } catch {
          // ignore
        }
        return nextPreview
      })
      setCropOpen(false)
    } catch (err) {
      console.error('[PhotoUpload] Crop error:', err)
      toast.error(err instanceof Error ? err.message : 'Erro ao recortar imagem')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !tokens?.access_token) return

    // If user didn't click "Aplicar" yet, auto-generate the cropped file using current crop state.
    let fileToUpload = uploadFile || selectedFile
    if (
      sourceUrl &&
      croppedAreaPixels &&
      (!uploadFile || uploadFile === selectedFile)
    ) {
      try {
        const blob = await cropToBlob(sourceUrl, croppedAreaPixels, 512)
        fileToUpload = new File([blob], `avatar-${Date.now()}.webp`, { type: blob.type })
        setUploadFile(fileToUpload)
      } catch (err) {
        console.error('[PhotoUpload] Auto-crop error:', err)
        // Fall back to original file if crop fails
        fileToUpload = uploadFile || selectedFile
      }
    }

    setUploading(true)
    try {
      // Step 1: Get upload key from backend
      const initRes = await fetch(`${API_BASE}/api/v1/users/me/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access_token}`,
        },
        body: JSON.stringify({ content_type: fileToUpload.type }),
      })

      if (!initRes.ok) {
        throw new Error('Falha ao iniciar upload')
      }

      const initData = (await initRes.json()) as { data: { key: string } }
      const { key } = initData.data

      // Step 2: Upload file directly
      const arrayBuffer = await fileToUpload.arrayBuffer()
      const uploadRes = await fetch(
        `${API_BASE}/api/v1/users/me/photo/upload?key=${encodeURIComponent(key)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': fileToUpload.type,
            Authorization: `Bearer ${tokens.access_token}`,
          },
          body: arrayBuffer,
        }
      )

      if (!uploadRes.ok) {
        throw new Error('Falha ao enviar foto')
      }

      const uploadData = (await uploadRes.json()) as {
        data: { profile_photo_url: string }
      }

      // Step 3: Update auth store (add cache-buster to force browser to load fresh image)
      const freshUrl = `${uploadData.data.profile_photo_url}?v=${Date.now()}`
      updateUser({ avatar_url: freshUrl })

      // Clean up
      setSourceUrl(null)
      setPreviewUrl(null)
      setSelectedFile(null)
      setUploadFile(null)
      toast.success('Foto atualizada com sucesso!')
    } catch (err) {
      console.error('[PhotoUpload] Error:', err)
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar foto')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!tokens?.access_token) return

    setRemoving(true)
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access_token}`,
        },
        body: JSON.stringify({ profile_photo_url: null }),
      })

      if (!res.ok) throw new Error('Falha ao remover foto')

      updateUser({ avatar_url: null })
      toast.success('Foto removida')
    } catch (err) {
      console.error('[PhotoUpload] Remove error:', err)
      toast.error('Erro ao remover foto')
    } finally {
      setRemoving(false)
    }
  }

  const displaySrc = previewUrl || normalizedCurrentPhoto

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Photo preview area */}
      <div
        className={cn(
          'group relative cursor-pointer',
          dragActive && 'scale-105'
        )}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Avatar circle */}
        <div
          className={cn(
            'relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-border-light transition-all',
            dragActive && 'ring-brand-primary ring-opacity-50',
            previewUrl && 'ring-brand-primary'
          )}
        >
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt={user?.full_name || 'Avatar'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-accent text-2xl font-bold text-white">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <DSIcon name="camera" size={24} className="text-white" />
          </div>
        </div>

        {/* Uploading spinner */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <DSIcon name="loader" size={32} className="animate-spin text-brand-primary" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Action buttons */}
      {previewUrl ? (
        // Preview mode: confirm or cancel
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCropOpen(true)}
            disabled={uploading}
            className="text-xs"
          >
            Ajustar recorte
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelPreview}
            disabled={uploading}
            className="text-xs"
          >
            <DSIcon name="close" size={14} className="mr-1" /> Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            loading={uploading}
            className="text-xs"
          >
            <DSIcon name="check" size={14} className="mr-1" /> Salvar foto
          </Button>
        </div>
      ) : (
        // Default mode: upload or remove
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || removing}
            className="text-xs"
          >
            <DSIcon name="upload" size={14} className="mr-1" />
            {currentPhoto ? 'Trocar foto' : 'Enviar foto'}
          </Button>
          {currentPhoto && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleRemovePhoto}
              loading={removing}
              disabled={uploading}
              className="text-xs"
            >
              <DSIcon name="trash" size={14} className="mr-1" /> Remover
            </Button>
          )}
        </div>
      )}

      {/* Help text */}
      <p className="text-center text-[11px] text-text-muted">
        JPG, PNG ou WebP · Máximo 20MB
      </p>

      {/* Crop modal — rendered via Portal to escape Card stacking context */}
      {cropOpen && sourceUrl && mounted && createPortal(
        <div
          className="fixed inset-0 z-99999 isolate"
          role="dialog"
          aria-modal="true"
          aria-label="Recortar foto"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setCropOpen(false)}
          />

          {/* Modal — centered on full screen */}
          <div className="relative flex min-h-dvh items-center justify-center p-4">
            <div
              className="w-full max-w-lg animate-in zoom-in-90 fade-in slide-in-from-bottom-4 duration-500"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass card */}
              <div
                className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
                style={{
                  background: 'linear-gradient(135deg, rgba(11,18,33,0.90) 0%, rgba(5,10,18,0.95) 100%)',
                  backdropFilter: 'blur(40px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                }}
              >
                {/* Top shimmer */}
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/40 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Ajustar foto</p>
                    <p className="text-[11px] text-text-muted">Arraste para reposicionar e use o zoom</p>
                  </div>
                  <button
                    onClick={() => setCropOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-text-muted backdrop-blur-sm transition-all hover:bg-white/10 hover:text-text-primary hover:scale-110 active:scale-95"
                    aria-label="Fechar"
                  >
                    <DSIcon name="close" size={16} />
                  </button>
                </div>

                {/* Crop area */}
                <div className="relative h-72 bg-black/80 sm:h-96">
                  <Cropper
                    image={sourceUrl}
                    crop={crop}
                    zoom={zoom}
                    rotation={0}
                    aspect={1}
                    minZoom={1}
                    maxZoom={4}
                    cropShape="round"
                    showGrid={false}
                    zoomSpeed={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{}}
                    classes={{}}
                    restrictPosition={true}
                    mediaProps={{}}
                    cropperProps={{}}
                    keyboardStep={5}
                  />
                </div>

                {/* Controls */}
                <div className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Zoom</span>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.01}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCrop({ x: 0, y: 0 })
                        setZoom(1)
                      }}
                      className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:bg-white/10 hover:text-text-primary"
                      title="Reset"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCropOpen(false)}
                      disabled={uploading}
                      className="rounded-2xl"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={applyCrop}
                      disabled={uploading}
                      className="rounded-2xl"
                    >
                      <DSIcon name="check" size={16} className="mr-1.5" />
                      Aplicar
                    </Button>
                  </div>
                </div>

                {/* Bottom shimmer */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
