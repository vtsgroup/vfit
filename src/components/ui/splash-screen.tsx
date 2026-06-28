/**
 * src/components/ui/splash-screen.tsx
 *
 * SplashScreen — Abertura VFIT (cinematográfica, on-brand)
 *
 * Exports: SplashScreen
 * Hooks: useState, useEffect, useRef
 * Features: 'use client'
 *
 * v5 (2026-06-28): porte do splash "vfit-splash.html" (a abertura definitiva).
 *  - Marca V+wifi (favicon) com arcos desenhando, anéis emanando, glow respirando,
 *    grid à deriva + campo de partículas (determinístico, sem Math.random no render → SSR-safe).
 *  - Wordmark "VFIT" em Space Grotesk 900 (faux-bold + stroke) — fonte já carregada pelo app, sem fetch novo.
 *  - A linha verde virou BARRA DE LOADING real: progride enquanto carrega e COMPLETA quando
 *    a sessão fica pronta (isReady) — aí o splash sai. Nada de spinner redondo.
 *  - Mantém a API `isReady`, a re-entrada por sessão e a válvula de segurança (não prende
 *    o usuário atrás do splash se /auth/me travar). Tudo composited (transform/opacity).
 *  - prefers-reduced-motion respeitado (sem animação, estados finais visíveis).
 */

'use client'

import { type CSSProperties, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const SPLASH_KEY = 'vfit-splash-v5'
const ENTER_MS = 1100        // duração da entrada (icon/arcos/wordmark/barra)
const MIN_VISIBLE = 3300     // 1ª carga: entrada completa (~1.28s) + ~2s de respiro antes de sair
                            // (app rápido não corta o logo no meio; pedido do dono: ficar um pouco mais). Não loopa.
const SAFETY_MS = 4000       // nunca prender o usuário atrás do splash (cap de delay se /auth/me travar)

/* ─── Campo de partículas determinístico (sem Math.random no render → SSR-safe) ─── */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Particle = {
  left: string; top: string; size: number; color: string; glow: string
  dx: string; dy: string; dur: string; delay: string; twDur: string; twDelay: string; twMin: number
}

const PARTICLES: Particle[] = (() => {
  const r = mulberry32(0x5f3759df)
  return Array.from({ length: 24 }, () => {
    const green = r() > 0.42
    const size = +(1 + r() * 2.4).toFixed(1)
    return {
      left: (r() * 100).toFixed(1) + '%',
      top: (r() * 100).toFixed(1) + '%',
      size,
      color: green
        ? `rgba(104,206,128,${(0.16 + r() * 0.26).toFixed(2)})`
        : `rgba(222,236,226,${(0.14 + r() * 0.3).toFixed(2)})`,
      glow: green && size > 2.4 ? '0 0 6px rgba(74,200,110,.55)' : 'none',
      dx: (r() * 16 - 8).toFixed(1) + 'px',
      dy: (r() * 16 - 8).toFixed(1) + 'px',
      dur: (11 + r() * 12).toFixed(1) + 's',
      delay: (-r() * 22).toFixed(1) + 's',
      twDur: (3 + r() * 4).toFixed(1) + 's',
      twDelay: (-r() * 6).toFixed(1) + 's',
      twMin: +(0.22 + r() * 0.28).toFixed(2),
    }
  })
})()

/* ─── Marca V + wifi (favicon VFIT, viewBox 1024) — arcos animam na entrada ─── */
function VFITMark({ instant }: { instant: boolean }) {
  const arc = (cls: string, fill: string, d: string) => (
    <path className={cn('vsp-arc', cls, instant && 'vsp-instant')} fill={fill} d={d} />
  )
  return (
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="vsp-mark-svg" aria-hidden="true">
      <rect x="0" y="0" width="1024" height="1024" rx="220" ry="220" fill="#3ab54a" />
      <path
        fill="#08122b"
        d="M415.889740,248.989182 C444.136658,251.162689 462.226135,266.718750 473.780396,290.935883 C478.271240,300.348389 480.280060,310.441864 480.046539,320.978149 C479.836151,330.471497 479.935852,339.973877 480.024475,349.471069 C480.117126,359.400116 485.657867,364.938446 495.536621,364.979858 C510.033356,365.040619 524.530701,365.043030 539.027405,364.980530 C549.567200,364.935120 554.928345,359.494904 554.984741,348.860413 C555.039551,338.529510 555.419006,328.177460 554.914124,317.871033 C553.706970,293.228333 574.263855,258.341980 609.192749,250.898941 C613.690857,249.940445 618.413879,249.688309 623.031677,249.696640 C660.177246,249.763702 697.329224,249.611679 734.465027,250.295380 C751.876587,250.615967 769.342102,250.619171 786.619507,254.478531 C815.045715,260.828217 840.351074,286.761261 844.962158,315.533630 C845.508362,318.941742 846.524292,322.320129 846.668030,325.739807 C847.581482,347.470551 839.342529,366.306244 827.454590,383.757996 C805.924194,415.364990 784.163391,446.815247 762.442810,478.292297 C747.624512,499.766724 732.701965,521.169189 717.841797,542.614685 C689.229187,583.907104 660.739197,625.285095 631.982239,666.476624 C613.052307,693.591980 594.302063,720.863403 574.415283,747.269592 C560.512939,765.729492 541.158936,775.888733 517.763977,777.783997 C488.599457,780.146545 465.336060,768.807800 447.714935,746.333801 C434.496277,729.474792 422.524414,711.621826 410.317200,693.989990 C388.729797,662.809753 367.355621,631.481628 345.950073,600.175842 C330.921814,578.196838 316.052917,556.108704 301.000092,534.146606 C276.734528,498.742981 252.245895,463.491516 228.109467,428.000336 C215.301392,409.166809 202.881439,390.063232 190.594421,370.884125 C184.813751,361.860901 181.302887,351.821686 179.794647,341.141754 C179.268707,337.417450 178.047607,333.708038 178.082199,330.000580 C178.509399,284.198364 211.334473,252.452209 253.152405,249.651260 C276.025604,248.119232 299.031708,248.249298 321.978638,248.219376 C353.120789,248.178772 384.263611,248.702927 415.889740,248.989182 z"
      />
      {arc('vsp-arcC', '#36ab43', 'M370.515564,426.502441 C387.045929,412.658386 405.914490,404.116943 426.066864,398.232544 C477.557526,383.197540 529.740784,381.604492 582.348755,390.947479 C608.449829,395.582977 633.426025,403.597351 655.868530,418.211456 C674.747253,430.504913 686.869812,446.697479 685.879578,470.490814 C685.533691,478.803284 686.046448,487.165375 685.393616,495.443787 C685.164490,498.349731 683.232300,502.501678 680.959900,503.475189 C678.718262,504.435516 674.160706,503.018066 672.161072,501.065033 C637.042786,466.765015 592.293030,458.276611 546.127869,454.272125 C509.885620,451.128418 473.914978,453.882446 438.593445,463.113312 C417.189056,468.707123 396.675995,476.436615 378.672180,489.645966 C373.730591,493.271667 369.626678,498.040405 364.679199,501.656372 C362.108490,503.535156 357.766052,505.721252 355.615570,504.734802 C353.070312,503.567322 350.688141,499.180664 350.567810,496.098328 C350.107483,484.305664 350.033112,472.438141 350.851746,460.670746 C351.838806,446.482239 360.853149,436.384308 370.515564,426.502441 z')}
      {arc('vsp-arcB', '#36aa43', 'M617.420288,514.576416 C632.720886,526.339600 634.261902,542.462158 632.441101,559.449646 C631.718872,566.187744 625.874268,568.768433 620.783325,564.344421 C582.381714,530.973083 494.512115,526.111572 440.599457,550.478088 C434.431458,553.265747 428.796631,557.248657 422.971680,560.771729 C420.698761,562.146423 418.699280,563.995605 416.373108,565.255371 C410.957275,568.188477 405.868195,566.295105 405.012817,560.211365 C402.658722,543.468506 403.711823,527.518372 418.403351,515.725952 C431.949219,504.853271 447.566986,498.323517 464.249115,494.529144 C504.381042,485.401093 544.465210,484.816742 584.148193,497.143280 C596.127930,500.864532 607.436462,506.145081 617.420288,514.576416 z')}
      {arc('vsp-arcA', '#35aa43', 'M570.137695,579.013245 C575.479919,586.342285 574.093933,593.249573 565.719360,597.258057 C559.336670,600.313171 552.394592,602.702759 545.442810,603.970398 C525.609924,607.586731 505.665802,607.618225 485.958008,602.898010 C481.177734,601.753052 476.388580,599.817749 472.177979,597.289246 C462.600616,591.538147 462.568787,581.645752 472.096436,575.768433 C476.136841,573.275940 480.754303,571.234924 485.377960,570.253784 C508.102966,565.431702 530.972107,564.291809 553.588562,570.617737 C559.325867,572.222473 564.461914,575.977295 570.137695,579.013245 z')}
    </svg>
  )
}

export function SplashScreen({ isReady, onFinished }: { isReady?: boolean; onFinished?: () => void }) {
  const [show, setShow] = useState(false)
  const [instant, setInstant] = useState(false)   // re-entrada na sessão → sem replay da entrada
  const [minDone, setMinDone] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [done, setDone] = useState(false)
  const booted = useRef(false)
  const ready = isReady ?? true

  // ─── Boot ───
  useEffect(() => {
    if (booted.current) return
    booted.current = true

    let seen = false
    try { seen = typeof window !== 'undefined' && !!sessionStorage.getItem(SPLASH_KEY) } catch { seen = false }
    if (seen && ready) { setDone(true); return }   // já visto + já pronto → nem aparece

    setShow(true)
    try { sessionStorage.setItem(SPLASH_KEY, '1') } catch { /* private mode */ }

    if (seen) {
      setInstant(true)
      setMinDone(true)
      return
    }
    const t = setTimeout(() => setMinDone(true), MIN_VISIBLE)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Sair quando pronto + tempo mínimo cumprido ───
  useEffect(() => {
    if (!show || done || exiting) return
    if (ready && minDone) setExiting(true)
  }, [ready, minDone, show, done, exiting])

  // ─── Desmontar após a animação de saída ───
  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(() => setDone(true), 620)
    return () => clearTimeout(t)
  }, [exiting])

  // ─── Válvula de segurança ───
  useEffect(() => {
    if (!show || done) return
    const t = setTimeout(() => setExiting(true), SAFETY_MS)
    return () => clearTimeout(t)
  }, [show, done])

  // ─── Avisa quando a splash terminou (saiu de tela ou foi pulada) ───
  // Enquanto não terminar, a splash é o ÚNICO loading visível; os loaders
  // secundários ficam suprimidos até aqui (ver isSplashFinished no store).
  useEffect(() => {
    if (done) onFinished?.()
  }, [done, onFinished])

  if (done || !show) return null

  const complete = exiting || (ready && minDone)

  return (
    <div
      className={cn('vsp-root dark', exiting && 'vsp-exit')}
      style={{ colorScheme: 'dark' }}
      role="status"
      aria-live="polite"
      aria-label="Carregando VFIT"
    >
      {/* fundo: grid à deriva */}
      <div className="vsp-bg vsp-grid" />
      {/* fundo: partículas */}
      <div className="vsp-bg vsp-dots">
        {PARTICLES.map((p, i) => {
          const style = {
            left: p.left, top: p.top, width: p.size, height: p.size,
            background: p.color, boxShadow: p.glow,
            '--dx': p.dx, '--dy': p.dy, '--twMin': String(p.twMin),
            animation: `vsp-drift ${p.dur} ease-in-out ${p.delay} infinite, vsp-tw ${p.twDur} ease-in-out ${p.twDelay} infinite alternate`,
          } as CSSProperties
          return <i key={i} style={style} />
        })}
      </div>
      {/* fundo: vinheta */}
      <div className="vsp-bg vsp-vig" />

      {/* conteúdo */}
      <div className="vsp-wrap">
        <div className="vsp-stage">
          <div className={cn('vsp-glow', instant && 'vsp-instant')} />
          <div className={cn('vsp-ring vsp-ringA', instant && 'vsp-instant')} />
          <div className={cn('vsp-ring vsp-ringB', instant && 'vsp-instant')} />
          <div className={cn('vsp-icon', instant && 'vsp-instant')}>
            <VFITMark instant={instant} />
          </div>
        </div>

        <h1 className={cn('vsp-name', instant && 'vsp-instant')}>VFIT</h1>

        {/* barra de loading: progride carregando → completa quando pronto */}
        <div className="vsp-track" aria-hidden="true">
          <div
            className={cn('vsp-bar', complete ? 'vsp-bar-done' : 'vsp-bar-loading', instant && 'vsp-instant')}
          />
          <div className="vsp-bar-shimmer" />
        </div>
        <span className="sr-only">Carregando…</span>
      </div>

      <style>{`
        .vsp-root {
          /* z-index máximo: a splash SEMPRE fica acima de qualquer loader do app
             (BrandLoader page z-9999, gates z-99999/z-999999) — nada pinta por cima dela */
          position: fixed; inset: 0; z-index: 2147483646;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          /* borda #050a12 = manifest background_color → handoff TWA/PWA sem emenda */
          background: radial-gradient(circle at 50% 42%, #0c1a3a 0%, #08122b 55%, #050a12 100%);
          opacity: 1; transform: scale(1);
          transition: opacity .6s cubic-bezier(.2,.8,.2,1), transform .6s cubic-bezier(.2,.8,.2,1);
        }
        .vsp-exit { opacity: 0; transform: scale(1.04); pointer-events: none; }
        /* Na saída: congela as animações decorativas e libera as camadas da GPU.
           Durante o fade de .6s, partículas/anéis parados são imperceptíveis — e isso
           devolve GPU/main-thread para a página que está hidratando ATRÁS da splash
           (elimina o "travamento" no momento mais pesado). Visual idêntico. */
        .vsp-exit .vsp-grid,
        .vsp-exit .vsp-dots i,
        .vsp-exit .vsp-ring,
        .vsp-exit .vsp-glow,
        .vsp-exit .vsp-bar-shimmer { animation-play-state: paused; will-change: auto; }

        .vsp-bg { position: absolute; inset: 0; pointer-events: none; }
        .vsp-grid {
          z-index: 0; inset: -40px;            /* maior que a viewport → o translate não revela bordas */
          background-image:
            linear-gradient(rgba(58,181,74,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(58,181,74,.06) 1px, transparent 1px);
          background-size: 40px 40px;
          -webkit-mask: radial-gradient(circle at 50% 46%, #000 22%, transparent 72%);
                  mask: radial-gradient(circle at 50% 46%, #000 22%, transparent 72%);
          will-change: transform;
          animation: vsp-gridDrift 55s linear infinite;   /* transform → composited (sem repaint) */
        }
        .vsp-dots { z-index: 1; }
        .vsp-dots i { position: absolute; border-radius: 50%; will-change: transform, opacity; }
        .vsp-vig { z-index: 2; background: radial-gradient(circle at 50% 44%, transparent 42%, rgba(4,9,22,.6) 100%); }

        .vsp-wrap { position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; }
        .vsp-stage { position: relative; width: 210px; height: 210px; display: grid; place-items: center; }

        .vsp-glow {
          position: absolute; top: 50%; left: 50%; width: 300px; height: 300px; margin: -150px 0 0 -150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(58,181,74,.5), rgba(58,181,74,.12) 45%, transparent 68%);
          filter: blur(5px); z-index: 0; opacity: 0;
          will-change: opacity;
          animation: vsp-glowIn .6s ease-out forwards, vsp-glowPulse 5s ease-in-out 1s infinite;
        }
        .vsp-ring {
          position: absolute; top: 50%; left: 50%; width: 160px; height: 160px; margin: -80px 0 0 -80px;
          border-radius: 50%; z-index: 0; transform: scale(.7); opacity: 0; will-change: transform, opacity;
        }
        .vsp-ringA { border: 2px solid rgba(74,200,110,.55); animation: vsp-ring 3.4s linear .2s infinite; }
        .vsp-ringB { border: 2px solid rgba(74,200,110,.4);  animation: vsp-ring 3.4s linear 1.9s infinite; }

        .vsp-icon {
          position: relative; z-index: 2; width: 152px; height: 152px; border-radius: 34px; overflow: hidden;
          opacity: 0; transform: scale(.6); backface-visibility: hidden; will-change: transform, opacity;
          box-shadow: 0 22px 60px -18px rgba(58,181,74,.5);
          animation: vsp-iconIn .85s cubic-bezier(.2,.75,.3,1) forwards;
        }
        .vsp-mark-svg { display: block; width: 100%; height: 100%; }
        .vsp-arc { transform-box: view-box; transform-origin: 512px 600px; opacity: 0; transform: scale(.2); will-change: transform, opacity; }
        .vsp-arcC { animation: vsp-arcIn .7s cubic-bezier(.2,.8,.2,1) .34s forwards; }
        .vsp-arcB { animation: vsp-arcIn .7s cubic-bezier(.2,.8,.2,1) .46s forwards; }
        .vsp-arcA { animation: vsp-arcIn .7s cubic-bezier(.2,.8,.2,1) .58s forwards; }

        .vsp-name {
          margin: 36px 0 0; font-family: var(--font-space-grotesk), system-ui, sans-serif;
          font-size: clamp(34px, 9vw, 48px); font-weight: 900; letter-spacing: .16em;
          text-transform: uppercase; color: #edf4ee; padding-left: .16em; line-height: 1;
          /* Space Grotesk vai até 700 real → 900 sintetiza (faux-bold) + stroke engrossa ainda mais */
          -webkit-text-stroke: .6px #edf4ee;
          text-shadow: 0 2px 26px rgba(58,181,74,.28);
          opacity: 0; transform: translateY(14px); will-change: transform, opacity;
          animation: vsp-wordIn .5s cubic-bezier(.2,.8,.2,1) .5s forwards;
        }

        .vsp-track {
          position: relative; width: 150px; height: 4px; margin-top: 18px; border-radius: 4px;
          overflow: hidden; background: rgba(255,255,255,.08);
        }
        .vsp-bar {
          position: absolute; inset: 0; border-radius: 4px; transform-origin: left center;
          background: linear-gradient(90deg, #2e9f3c, #4ed06a);
          box-shadow: 0 0 10px rgba(58,181,74,.6);
        }
        .vsp-bar-loading { transform: scaleX(.06); animation: vsp-barCreep 6s cubic-bezier(.15,.7,.2,1) .55s forwards; }
        .vsp-bar-done { transform: scaleX(1); transition: transform .35s cubic-bezier(.2,.8,.2,1); }
        .vsp-bar-shimmer {
          position: absolute; inset: 0; width: 40%; border-radius: 4px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          transform: translateX(-120%); will-change: transform;
          animation: vsp-barShimmer 1.5s ease-in-out .6s infinite;
        }

        @keyframes vsp-iconIn { 0%{opacity:0;transform:scale(.6)} 62%{opacity:1;transform:scale(1.07)} 100%{opacity:1;transform:scale(1)} }
        @keyframes vsp-arcIn  { 0%{opacity:0;transform:scale(.18)} 72%{opacity:1;transform:scale(1.16)} 100%{opacity:1;transform:scale(1)} }
        @keyframes vsp-ring   { 0%{transform:scale(.7);opacity:0} 10%{opacity:.5} 100%{transform:scale(2.7);opacity:0} }
        @keyframes vsp-glowIn { 0%{opacity:0;transform:scale(.6)} 100%{opacity:.6;transform:scale(1)} }
        @keyframes vsp-glowPulse { 0%,100%{opacity:.42} 50%{opacity:.66} }
        @keyframes vsp-wordIn { 0%{opacity:0;transform:translateY(14px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes vsp-barCreep { 0%{transform:scaleX(.06)} 100%{transform:scaleX(.9)} }
        @keyframes vsp-barShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(320%)} }
        @keyframes vsp-tw { 0%{opacity:var(--twMin,.3)} 100%{opacity:1} }
        @keyframes vsp-drift { 0%{transform:translate(0,0)} 50%{transform:translate(var(--dx,0),var(--dy,0))} 100%{transform:translate(0,0)} }
        @keyframes vsp-gridDrift { 0%{transform:translate(0,0)} 100%{transform:translate(40px,40px)} }

        /* re-entrada na sessão → mostra estados finais imediatamente (sem replay da entrada) */
        .vsp-icon.vsp-instant { animation: none; opacity: 1; transform: scale(1); }
        .vsp-arc.vsp-instant  { animation: none; opacity: 1; transform: scale(1); }
        .vsp-name.vsp-instant { animation: none; opacity: 1; transform: none; }
        .vsp-glow.vsp-instant { animation: vsp-glowPulse 5s ease-in-out infinite; opacity: .55; }
        .vsp-bar-loading.vsp-instant { animation-delay: 0s; }

        @media (prefers-reduced-motion: reduce) {
          .vsp-grid, .vsp-dots i, .vsp-glow, .vsp-ring, .vsp-bar-shimmer { animation: none !important; }
          .vsp-icon, .vsp-name, .vsp-glow { animation: none !important; opacity: 1 !important; transform: none !important; }
          .vsp-arc { animation: none !important; opacity: 1 !important; transform: scale(1) !important; }
          .vsp-glow { opacity: .5 !important; }
          .vsp-bar-loading { animation: none !important; transform: scaleX(.5) !important; }
        }
      `}</style>
    </div>
  )
}
