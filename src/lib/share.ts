/**
 * src/lib/share.ts
 *
 * Web Share API + fallback de cópia
 */

export interface ShareData {
  title: string
  text: string
  url?: string
  files?: File[]
}

/**
 * Compartilhar via Web Share API (nativa mobile)
 * Fallback: copiar para clipboard
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  // Try native share API
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // Check if files are supported
      if (data.files?.length && navigator.canShare?.({ files: data.files })) {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
          files: data.files,
        })
        return true
      }

      // Share without files
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      })
      return true
    } catch (err) {
      // User cancelled or error
      if ((err as Error)?.name === 'AbortError') return false
      // Fall through to clipboard
    }
  }

  // Fallback: copy to clipboard
  try {
    const textContent = [data.title, data.text, data.url].filter(Boolean).join('\n')
    await navigator.clipboard.writeText(textContent)
    return true
  } catch {
    return false
  }
}

/**
 * Copiar imagem (canvas) para clipboard
 */
export async function copyImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )
    if (!blob) return false

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
    return true
  } catch {
    return false
  }
}

/**
 * Compartilhar imagem de canvas via Web Share API
 */
export async function shareCanvasImage(
  canvas: HTMLCanvasElement,
  title: string,
  text: string
): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )
    if (!blob) return false

    const file = new File([blob], 'vfit-progress.png', { type: 'image/png' })

    return shareContent({
      title,
      text,
      files: [file],
    })
  } catch {
    return false
  }
}
