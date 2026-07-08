// @vitest-environment node
// ============================================
// boot-destination.test.ts — Matriz de boot (plano splash-boot)
// ============================================
//
// Trava por contrato a matriz user_type × simulação × guest × anon → rota home.
// O boot script pré-paint em src/app/layout.tsx implementa o MESMO mapeamento em
// vanilla JS — o teste de paridade abaixo extrai o script do TSX e o executa
// contra cenários reais, garantindo que os dois nunca divirjam silenciosamente.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { bootDestination } from '@/lib/boot-destination'

describe('bootDestination — matriz pura', () => {
  it('anon → /welcome', () => {
    expect(bootDestination({ authenticated: false })).toBe('/welcome')
  })

  it('anon guest → /treinos', () => {
    expect(bootDestination({ authenticated: false, guest: true })).toBe('/treinos')
  })

  it('student → /treinos', () => {
    expect(bootDestination({ authenticated: true, userType: 'student' })).toBe('/treinos')
  })

  it('personal → /dashboard', () => {
    expect(bootDestination({ authenticated: true, userType: 'personal' })).toBe('/dashboard')
  })

  it('nutritionist → /dashboard', () => {
    expect(bootDestination({ authenticated: true, userType: 'nutritionist' })).toBe('/dashboard')
  })

  it('admin → /dashboard/admin', () => {
    expect(bootDestination({ authenticated: true, userType: 'admin' })).toBe('/dashboard/admin')
  })

  it('admin simulando student → /treinos', () => {
    expect(
      bootDestination({ authenticated: true, userType: 'admin', simulatedType: 'student' })
    ).toBe('/treinos')
  })

  it('admin simulando personal → /dashboard', () => {
    expect(
      bootDestination({ authenticated: true, userType: 'admin', simulatedType: 'personal' })
    ).toBe('/dashboard')
  })

  it('user_type desconhecido/ausente autenticado → /dashboard (fallback seguro)', () => {
    expect(bootDestination({ authenticated: true, userType: null })).toBe('/dashboard')
  })
})

describe('paridade com o boot script pré-paint (src/app/layout.tsx)', () => {
  const layoutSrc = readFileSync(
    path.resolve(__dirname, '../../src/app/layout.tsx'),
    'utf8'
  )

  // Extrai o IIFE do boot script (primeiro dangerouslySetInnerHTML com vsp-standalone)
  const match = layoutSrc.match(/__html: `((\(function\(\)\{try\{var d=document\.documentElement)[\s\S]*?)`,/)
  const script = match?.[1]

  it('boot script existe no root layout', () => {
    expect(script, 'boot script pré-paint não encontrado em src/app/layout.tsx').toBeTruthy()
  })

  /** Executa o boot script num DOM fake e captura o location.replace resultante. */
  function runBootScript(opts: {
    standalone: boolean
    pathname: string
    authState?: { user_type?: string } | null
    guest?: boolean
  }): string | null {
    let replaced: string | null = null
    const localData: Record<string, string> = {}
    if (opts.authState) {
      localData['vfit-auth'] = JSON.stringify({
        state: {
          user: { user_type: opts.authState.user_type },
          tokens: { access_token: 'tok', refresh_token: 'r', expires_at: 9999999999 },
        },
      })
    }
    if (opts.guest) localData['vfit_guest_mode'] = 'true'

    const sandbox = {
      document: {
        documentElement: { classList: { add: () => {} } },
        referrer: opts.standalone ? 'android-app://br.app.vfit' : '',
      },
      navigator: {},
      window: { matchMedia: () => ({ matches: false }) },
      matchMedia: () => ({ matches: false }),
      localStorage: {
        getItem: (k: string) => localData[k] ?? null,
      },
      sessionStorage: {
        getItem: () => null,
      },
      location: {
        pathname: opts.pathname,
        replace: (url: string) => {
          replaced = url
        },
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(
      'window',
      'document',
      'navigator',
      'localStorage',
      'sessionStorage',
      'location',
      script as string
    )
    fn(sandbox.window, sandbox.document, sandbox.navigator, sandbox.localStorage, sandbox.sessionStorage, sandbox.location)
    return replaced
  }

  it('standalone + personal logado em /welcome → replace /dashboard (paridade)', () => {
    expect(runBootScript({ standalone: true, pathname: '/welcome', authState: { user_type: 'personal' } }))
      .toBe(bootDestination({ authenticated: true, userType: 'personal' }))
  })

  it('standalone + student logado em /welcome → replace /treinos (paridade)', () => {
    expect(runBootScript({ standalone: true, pathname: '/welcome', authState: { user_type: 'student' } }))
      .toBe(bootDestination({ authenticated: true, userType: 'student' }))
  })

  it('standalone + admin logado em /welcome → replace /dashboard/admin (paridade)', () => {
    expect(runBootScript({ standalone: true, pathname: '/welcome', authState: { user_type: 'admin' } }))
      .toBe(bootDestination({ authenticated: true, userType: 'admin' }))
  })

  it('standalone + nutritionist logado em /welcome → replace /dashboard (paridade)', () => {
    expect(runBootScript({ standalone: true, pathname: '/welcome', authState: { user_type: 'nutritionist' } }))
      .toBe(bootDestination({ authenticated: true, userType: 'nutritionist' }))
  })

  it('standalone + student logado em /dashboard (deep) → replace /treinos', () => {
    expect(runBootScript({ standalone: true, pathname: '/dashboard/workouts', authState: { user_type: 'student' } }))
      .toBe('/treinos')
  })

  it('standalone + personal logado em /dashboard → fica (sem replace)', () => {
    expect(runBootScript({ standalone: true, pathname: '/dashboard', authState: { user_type: 'personal' } }))
      .toBeNull()
  })

  it('standalone + anon em /welcome → fica (sem replace)', () => {
    expect(runBootScript({ standalone: true, pathname: '/welcome' })).toBeNull()
  })

  it('standalone + anon em /dashboard → replace /welcome (paridade)', () => {
    expect(runBootScript({ standalone: true, pathname: '/dashboard' }))
      .toBe(bootDestination({ authenticated: false }))
  })

  it('standalone + anon GUEST em /treinos → fica (guest respeitado)', () => {
    expect(runBootScript({ standalone: true, pathname: '/treinos', guest: true })).toBeNull()
  })

  it('standalone + anon GUEST em /dashboard → replace /treinos (paridade)', () => {
    expect(runBootScript({ standalone: true, pathname: '/dashboard', guest: true }))
      .toBe(bootDestination({ authenticated: false, guest: true }))
  })

  it('standalone + anon GUEST em /welcome → replace /treinos (guest já ativo não re-vê marketing)', () => {
    expect(runBootScript({ standalone: true, pathname: '/welcome', guest: true }))
      .toBe(bootDestination({ authenticated: false, guest: true }))
  })

  it('standalone + anon em /login → fica (fluxo de auth exceção)', () => {
    expect(runBootScript({ standalone: true, pathname: '/login' })).toBeNull()
  })

  it('browser comum (não-standalone) → nunca faz replace', () => {
    expect(runBootScript({ standalone: false, pathname: '/welcome', authState: { user_type: 'personal' } }))
      .toBeNull()
  })
})
