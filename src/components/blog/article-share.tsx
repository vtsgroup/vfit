// ============================================
// article-share.tsx — Botões de compartilhamento do artigo
// ============================================
//
// O que faz:
//   Botões para compartilhar artigo no WhatsApp, Twitter/X e copiar link.
//   Copy-to-clipboard com feedback visual (ícone muda por 2s).
//   URL base: https://vfit.app.br/blog/{slug}
//
// Exports principais:
//   ArticleShare — barra de compartilhamento social
'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { useState } from 'react'

interface ArticleShareProps {
  title: string
  slug: string
}

export function ArticleShare({ title, slug }: ArticleShareProps) {
  const [copied, setCopied] = useState(false)
  const url = `https://vfit.app.br/blog/${slug}`
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconBtn =
    'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:text-emerald-700 hover:shadow-[0_8px_18px_-8px_rgba(34,197,94,0.45)]'

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_34px_-22px_rgba(15,23,42,0.16)]">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <DSIcon name="externalLink" size={14} />
        Compartilhar
      </span>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label="Compartilhar no WhatsApp"
      >
        <DSIcon name="message" size={14} />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label="Compartilhar no Twitter"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label="Compartilhar no LinkedIn"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
        </svg>
      </a>

      <button
        onClick={handleCopy}
        className={iconBtn}
        aria-label="Copiar link"
      >
        <DSIcon name={copied ? 'check' : 'link'} size={14} className={copied ? 'text-emerald-600' : ''} />
      </button>

      {copied && (
        <span className="text-xs font-semibold text-emerald-700">Link copiado!</span>
      )}
    </div>
  )
}
