/**
 * src/components/auth/passkey-enrollment-step.tsx
 *
 * Passkey Enrollment Step — passo full-screen pós-cadastro (biometria v2, B1)
 *
 * Oferta proeminente de ativação de biometria logo no primeiro momento autenticado
 * no app (student pós-onboarding; personal/nutri no 1º login). Tela cheia (não modal):
 * é um passo do fluxo, não uma interrupção. Reusa o fluxo WebAuthn de useRegisterPasskey.
 *
 * v2 (2026-07-09): redesign "splash-cohesive". Fundo navy do splash (gradiente radial
 *  #0c1a3a→#08122b→#050a12 + grid verde à deriva + vinheta), theme-color sincronizado
 *  enquanto a tela vive. Máquina de estados com SVG de digital que DESENHA ao entrar
 *  (stroke-dashoffset stagger), morph para CHECK verde no sucesso e DISSOLUÇÃO fluida
 *  (ícone fica transparente + burst do anel) fechando a permissão. prefers-reduced-motion
 *  respeitado (estados finais visíveis, sem draw).
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import {
  useRegisterPasskey,
  setBiometricAutoUnlock,
  setLastBiometricUser,
  setBiometricLastAuth,
} from '@/hooks/use-passkey'

interface PasskeyEnrollmentStepProps {
  /** Chamado ao concluir — biometria ativada OU usuário pulou ("Agora não") */
  onDone: () => void
}

/** Fases da cena. enter→idle: desenho da digital. success: morph p/ check. exiting: dissolve. */
type Phase = 'enter' | 'idle' | 'prompting' | 'success' | 'exiting'

const ENTER_MS = 1000 // duração do desenho da digital (entrada)
const SUCCESS_HOLD_MS = 1050 // check verde na tela antes de dissolver
const DISSOLVE_MS = 620 // fade+scale de saída (igual splash)

/** Nome amigável do dispositivo para exibir na lista de passkeys */
function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Dispositivo'
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Android/i.test(ua)) return 'Android'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Dispositivo'
}

/** Digital (Lucide fingerprint) — cada arco com pathLength=1 p/ desenho uniforme. */
const FINGERPRINT_PATHS = [
  'M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4',
  'M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2',
  'M17.29 21.02c.12-.6.43-2.3.5-3.02',
  'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4',
  'M7 16.32c.09.24.12.55.12.68',
  'M12 2a10 10 0 0 1 10 10c0 .93-.08 1.86-.24 2.76',
  'M8.65 22c.21-.66.45-1.32.57-2',
  'M14 13.12c0 2.38 0 6.38-1 8.88',
  'M2 16h.01',
  'M21.8 16c.2-2 .131-5.354 0-6',
  'M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2',
] as const

export function PasskeyEnrollmentStep({ onDone }: PasskeyEnrollmentStepProps) {
  const user = useAuthStore((s) => s.user)
  const registerPasskey = useRegisterPasskey()
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<Phase>('enter')
  const doneRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // enter → idle após o desenho da digital
  useEffect(() => {
    if (phase !== 'enter') return
    const t = setTimeout(() => setPhase('idle'), ENTER_MS)
    return () => clearTimeout(t)
  }, [phase])

  // theme-color = navy do splash enquanto a tela vive; restaura ao sair.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])')
    const prev = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', '#08122B')
    return () => {
      if (meta && prev !== null) meta.setAttribute('content', prev)
    }
  }, [])

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }, [onDone])

  // success → segura o check → dissolve → onDone
  useEffect(() => {
    if (phase !== 'success') return
    const t1 = setTimeout(() => setPhase('exiting'), SUCCESS_HOLD_MS)
    return () => clearTimeout(t1)
  }, [phase])

  useEffect(() => {
    if (phase !== 'exiting') return
    const t = setTimeout(finish, DISSOLVE_MS)
    return () => clearTimeout(t)
  }, [phase, finish])

  async function handleActivate() {
    setPhase('prompting')
    try {
      await registerPasskey.mutateAsync(getDeviceName())
      if (user) {
        setBiometricAutoUnlock(true)
        setLastBiometricUser({
          name: user.full_name,
          avatar: user.avatar_url ?? null,
          email: user.email,
        })
        setBiometricLastAuth()
      }
      setPhase('success')
    } catch {
      // Cancelamento / erro já tratado no hook (toast). Volta ao idle p/ nova tentativa.
      setPhase('idle')
    }
  }

  if (!mounted || !user) return null

  const firstName = user.full_name?.split(' ')[0] || ''
  const drawing = phase === 'enter'
  const success = phase === 'success' || phase === 'exiting'
  const active = phase === 'prompting'

  const step = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ative o desbloqueio por biometria"
      data-phase={phase}
      className={`pes-root${phase === 'exiting' ? ' pes-exit' : ''}`}
    >
      {/* ─── Fundo splash: gradiente navy + grid verde + vinheta ─── */}
      <div className="pes-bg pes-grid" aria-hidden="true" />
      <div className="pes-bg pes-vig" aria-hidden="true" />

      {/* ─── Conteúdo ─── */}
      <div className="pes-content">
        {/* Hero: palco do ícone (digital → check) */}
        <div className="pes-stage" aria-hidden="true">
          <div className={`pes-glow${active ? ' pes-glow-active' : ''}${success ? ' pes-glow-success' : ''}`} />
          {active && <><span className="pes-ring pes-ringA" /><span className="pes-ring pes-ringB" /></>}
          {success && <span className="pes-burst" />}

          <div className="pes-icon">
            {/* Digital — desenha na entrada, some no sucesso */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`pes-fp${success ? ' pes-fp-out' : ''}${active ? ' pes-fp-active' : ''}`}
            >
              {FINGERPRINT_PATHS.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  pathLength={1}
                  className={drawing ? 'pes-fp-path' : undefined}
                  style={drawing ? { animationDelay: `${i * 55}ms` } : undefined}
                />
              ))}
            </svg>

            {/* Check verde — desenha no sucesso */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`pes-check${success ? ' pes-check-in' : ''}`}
            >
              <path d="M20 6 9 17l-5-5" pathLength={1} className="pes-check-path" />
            </svg>
          </div>
        </div>

        {/* Texto */}
        <div className="pes-copy">
          {!success ? (
            <>
              <span className="pes-badge">
                <DSIcon name="sparkles" size={13} />
                RECOMENDADO
              </span>
              <h1 className="pes-title">
                {firstName ? `Quase lá, ${firstName}!` : 'Quase lá!'}
              </h1>
              <p className="pes-sub">
                Ative o desbloqueio por biometria e entre com Face ID, digital ou
                Windows Hello — sem digitar senha.
              </p>
            </>
          ) : (
            <div className="pes-done" role="status" aria-live="polite">
              <h1 className="pes-title">Biometria ativada!</h1>
              <p className="pes-sub">Da próxima vez, é só o seu toque.</p>
            </div>
          )}
        </div>

        {/* Benefícios (some no sucesso) */}
        {!success && (
          <div className="pes-benefits">
            <div className="pes-benefit">
              <span className="pes-benefit-ico pes-ico-amber">
                <DSIcon name="flame" size={16} />
              </span>
              <div>
                <p className="pes-benefit-t">1 segundo</p>
                <p className="pes-benefit-d">Login sem digitar senha</p>
              </div>
            </div>
            <div className="pes-benefit">
              <span className="pes-benefit-ico pes-ico-green">
                <DSIcon name="shield" size={16} />
              </span>
              <div>
                <p className="pes-benefit-t">Ultra seguro</p>
                <p className="pes-benefit-d">A biometria nunca sai do dispositivo</p>
              </div>
            </div>
          </div>
        )}

        {/* Ações (some no sucesso) */}
        {!success && (
          <div className="pes-actions">
            <button
              type="button"
              onClick={handleActivate}
              disabled={registerPasskey.isPending}
              className="pes-cta"
            >
              {registerPasskey.isPending ? (
                <span className="pes-spinner" aria-hidden="true" />
              ) : (
                <DSIcon name="fingerprint" size={18} />
              )}
              {registerPasskey.isPending ? 'Aguardando biometria…' : 'Ativar biometria'}
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={registerPasskey.isPending}
              className="pes-skip"
            >
              Agora não
            </button>
          </div>
        )}
      </div>

      <style>{`
        .pes-root {
          position: fixed; inset: 0; z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          overflow-y: auto;
          padding: max(2.5rem, env(safe-area-inset-top)) 1.5rem
                   max(2.5rem, env(safe-area-inset-bottom));
          color-scheme: dark;
          /* Fundo = manifest/splash: handoff sem emenda com a status bar #08122B */
          background: radial-gradient(circle at 50% 42%, #0c1a3a 0%, #08122b 55%, #050a12 100%);
          opacity: 1; transform: scale(1);
          transition: opacity ${DISSOLVE_MS}ms cubic-bezier(.2,.8,.2,1),
                      transform ${DISSOLVE_MS}ms cubic-bezier(.2,.8,.2,1);
        }
        .pes-exit { opacity: 0; transform: scale(1.05); pointer-events: none; }

        .pes-bg { position: absolute; inset: 0; pointer-events: none; }
        .pes-grid {
          inset: -40px;
          background-image:
            linear-gradient(rgba(58,181,74,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(58,181,74,.06) 1px, transparent 1px);
          background-size: 40px 40px;
          -webkit-mask: radial-gradient(circle at 50% 40%, #000 20%, transparent 70%);
                  mask: radial-gradient(circle at 50% 40%, #000 20%, transparent 70%);
          will-change: transform;
          animation: pes-gridDrift 55s linear infinite;
        }
        .pes-vig { background: radial-gradient(circle at 50% 42%, transparent 42%, rgba(4,9,22,.65) 100%); }

        .pes-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          gap: 1.5rem; width: 100%; max-width: 22rem; text-align: center;
        }

        /* ─── Palco do ícone ─── */
        .pes-stage { position: relative; width: 132px; height: 132px; display: grid; place-items: center; }
        .pes-glow {
          position: absolute; width: 132px; height: 132px; border-radius: 50%;
          background: radial-gradient(circle, rgba(58,181,74,.42), rgba(58,181,74,.1) 48%, transparent 70%);
          filter: blur(6px); opacity: .55;
          animation: pes-glowPulse 4.5s ease-in-out infinite;
        }
        .pes-glow-active { opacity: .8; }
        .pes-glow-success {
          background: radial-gradient(circle, rgba(52,211,105,.6), rgba(52,211,105,.14) 48%, transparent 72%);
          opacity: 1; animation: none;
        }
        .pes-ring {
          position: absolute; width: 96px; height: 96px; border-radius: 50%;
          border: 2px solid rgba(74,200,110,.5); transform: scale(.7); opacity: 0;
          will-change: transform, opacity;
        }
        .pes-ringA { animation: pes-ring 2.6s linear infinite; }
        .pes-ringB { animation: pes-ring 2.6s linear 1.3s infinite; }
        .pes-burst {
          position: absolute; width: 96px; height: 96px; border-radius: 50%;
          border: 2px solid rgba(52,211,105,.7);
          animation: pes-burst .9s cubic-bezier(.2,.7,.2,1) forwards;
        }

        .pes-icon {
          position: relative; z-index: 2; width: 94px; height: 94px; border-radius: 26px;
          display: grid; place-items: center;
          background: linear-gradient(160deg, rgba(58,181,74,.16), rgba(8,18,43,.5));
          border: 1px solid rgba(74,200,110,.28);
          box-shadow: 0 18px 46px -14px rgba(58,181,74,.5), inset 0 1px 0 rgba(255,255,255,.06);
          transition: border-color .5s ease, box-shadow .5s ease, background .5s ease;
        }
        [data-phase="success"] .pes-icon, [data-phase="exiting"] .pes-icon {
          border-color: rgba(52,211,105,.6);
          box-shadow: 0 20px 54px -12px rgba(52,211,105,.6), inset 0 1px 0 rgba(255,255,255,.1);
        }

        .pes-fp {
          position: absolute; width: 52px; height: 52px; color: #eaf6ec;
          opacity: 1; transform: scale(1);
          transition: opacity .38s ease, transform .5s cubic-bezier(.4,0,.2,1), color .4s ease;
        }
        .pes-fp-active { color: #7fe6a0; }
        .pes-fp-out { opacity: 0; transform: scale(.55); }
        .pes-fp-path {
          stroke-dasharray: 1; stroke-dashoffset: 1;
          animation: pes-draw .6s cubic-bezier(.4,0,.2,1) forwards;
        }

        .pes-check {
          position: absolute; width: 50px; height: 50px; color: #34d369;
          opacity: 0; transform: scale(.5);
          transition: opacity .3s ease, transform .5s cubic-bezier(.2,1.3,.4,1);
        }
        .pes-check-in { opacity: 1; transform: scale(1); }
        .pes-check-path {
          stroke-dasharray: 1; stroke-dashoffset: 1;
        }
        .pes-check-in .pes-check-path {
          animation: pes-draw .45s cubic-bezier(.6,0,.3,1) .12s forwards;
        }

        /* ─── Texto ─── */
        .pes-copy { display: flex; flex-direction: column; align-items: center; gap: .5rem; min-height: 118px; justify-content: center; }
        .pes-badge {
          display: inline-flex; align-items: center; gap: .375rem;
          font-size: 10px; font-weight: 800; letter-spacing: .2em; color: #4ed06a;
        }
        .pes-title { font-size: 1.6rem; font-weight: 800; letter-spacing: -.01em; color: #fff; line-height: 1.15; }
        .pes-sub { font-size: .875rem; line-height: 1.55; color: #a7b1c2; max-width: 20rem; }
        .pes-done { display: flex; flex-direction: column; align-items: center; gap: .5rem; animation: pes-fadeUp .5s ease both; }

        /* ─── Benefícios ─── */
        .pes-benefits { display: flex; flex-direction: column; gap: .625rem; width: 100%; }
        .pes-benefit {
          display: flex; align-items: center; gap: .75rem; text-align: left;
          padding: .75rem 1rem; border-radius: 1rem;
          border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.035);
        }
        .pes-benefit-ico { display: grid; place-items: center; width: 36px; height: 36px; border-radius: .75rem; flex-shrink: 0; }
        .pes-ico-amber { background: rgba(250,204,21,.12); color: #facc15; }
        .pes-ico-green { background: rgba(52,211,105,.12); color: #34d369; }
        .pes-benefit-t { font-size: .875rem; font-weight: 600; color: #eef2f7; }
        .pes-benefit-d { font-size: .6875rem; color: #8b95a5; }

        /* ─── Ações ─── */
        .pes-actions { display: flex; flex-direction: column; gap: .625rem; width: 100%; margin-top: .25rem; }
        .pes-cta {
          display: flex; align-items: center; justify-content: center; gap: .5rem;
          width: 100%; min-height: 52px; padding: .875rem 1.5rem; border-radius: 1rem;
          font-size: .9375rem; font-weight: 700; color: #052e16;
          background: linear-gradient(135deg, #4ed06a 0%, #2fb457 100%);
          box-shadow: 0 10px 26px -8px rgba(52,211,105,.5), inset 0 1px 0 rgba(255,255,255,.35);
          transition: transform .15s ease, box-shadow .25s ease, opacity .2s ease;
        }
        .pes-cta:hover { box-shadow: 0 14px 34px -8px rgba(52,211,105,.65), inset 0 1px 0 rgba(255,255,255,.4); }
        .pes-cta:active { transform: scale(.975); }
        .pes-cta:disabled { opacity: .75; }
        .pes-cta:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(78,208,106,.5), 0 0 0 6px rgba(8,18,43,.9); }
        .pes-skip {
          width: 100%; min-height: 44px; padding: .625rem; border-radius: 1rem;
          font-size: .875rem; font-weight: 500; color: #8b95a5;
          transition: color .2s ease, background .2s ease;
        }
        .pes-skip:hover { color: #d7dde6; background: rgba(255,255,255,.05); }
        .pes-skip:disabled { opacity: .5; }
        .pes-skip:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(78,208,106,.45); }
        .pes-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(5,46,22,.35); border-top-color: #052e16;
          animation: pes-spin .7s linear infinite;
        }

        @keyframes pes-draw { to { stroke-dashoffset: 0; } }
        @keyframes pes-spin { to { transform: rotate(360deg); } }
        @keyframes pes-gridDrift { 0% { transform: translate(0,0); } 100% { transform: translate(40px,40px); } }
        @keyframes pes-glowPulse { 0%,100% { opacity: .48; } 50% { opacity: .72; } }
        @keyframes pes-ring { 0% { transform: scale(.7); opacity: 0; } 12% { opacity: .5; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes pes-burst { 0% { transform: scale(.7); opacity: .8; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes pes-fadeUp { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }

        @media (prefers-reduced-motion: reduce) {
          .pes-root { transition: opacity .2s linear; }
          .pes-grid, .pes-glow, .pes-ring, .pes-burst, .pes-spinner { animation: none !important; }
          .pes-fp-path, .pes-check-path { animation: none !important; stroke-dashoffset: 0 !important; }
          .pes-check, .pes-check-in { transition: opacity .2s linear !important; transform: none !important; }
          .pes-fp-out { transition: opacity .2s linear !important; transform: none !important; }
          .pes-done { animation: none !important; }
        }
      `}</style>
    </div>
  )

  return createPortal(step, document.body)
}
