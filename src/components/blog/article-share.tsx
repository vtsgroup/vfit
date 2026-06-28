// ============================================
// article-share.tsx — Compartilhamento do artigo (light, ultra moderno)
// ============================================
//
// O que faz:
//   Card de compartilhamento com cabeçalho, campo de LINK CURTO copiável
//   (vfit.app.br/r/{shortId}) e botões por rede (WhatsApp, X, LinkedIn) com cor
//   da marca no hover. O link curto é só um redirect 301 → canônica
//   (ver public/_worker.js) e está em Disallow:/r/, então NÃO afeta o SEO.
//
// Exports principais:
//   ArticleShare — card de compartilhamento social (light)
'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { useState } from 'react'
import { getShortPath } from '@/data/blog-posts'

interface ArticleShareProps {
  title: string
  slug: string
}

const SITE = 'https://vfit.app.br'

export function ArticleShare({ title, slug }: ArticleShareProps) {
  const [copied, setCopied] = useState(false)

  const shortPath = getShortPath(slug) // ex.: /r/ia-gratis
  const shortUrl = `${SITE}${shortPath}`
  const encodedTitle = encodeURIComponent(title)
  const encodedShort = encodeURIComponent(shortUrl)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard indisponível — silencioso */
    }
  }

  const net =
    'flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:-translate-y-0.5'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-26px_rgba(15,23,42,0.16)] sm:p-6">
      {/* Cabeçalho */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-emerald-600"
          style={{ background: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.22)' }}
        >
          <DSIcon name="share2" size={18} />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-950">Compartilhe este artigo</p>
          <p className="text-xs text-slate-500">Link curto e direto — sem rastreadores</p>
        </div>
      </div>

      {/* Campo de link curto + redes */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={handleCopy}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-left transition-colors hover:border-emerald-500/40 hover:bg-emerald-50/50"
          aria-label="Copiar link curto"
        >
          <DSIcon name="link" size={15} className="shrink-0 text-emerald-600" />
          <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-slate-600">
            vfit.app.br<span className="font-semibold text-emerald-700">{shortPath}</span>
          </span>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
              copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 group-hover:text-emerald-700'
            }`}
          >
            <DSIcon name={copied ? 'check' : 'copy'} size={13} />
            {copied ? 'Copiado!' : 'Copiar'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedShort}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`${net} hover:border-whatsapp/40 hover:bg-whatsapp/10 hover:text-[#1ebe5d] hover:shadow-[0_10px_22px_-10px_rgba(37,211,102,0.6)]`}
            aria-label="Compartilhar no WhatsApp"
          >
            <DSIcon name="message" size={16} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedShort}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`${net} hover:border-black/25 hover:bg-black/5 hover:text-black hover:shadow-[0_10px_22px_-10px_rgba(15,23,42,0.5)]`}
            aria-label="Compartilhar no X"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedShort}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`${net} hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:shadow-[0_10px_22px_-10px_rgba(10,102,194,0.55)]`}
            aria-label="Compartilhar no LinkedIn"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
