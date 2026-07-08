/**
 * src/lib/boot-destination.ts
 *
 * bootDestination — matriz pura user_type × simulação × guest × anon → rota home.
 *
 * FONTE DE VERDADE DOCUMENTADA da matriz de boot. O boot script pré-paint em
 * src/app/layout.tsx (inline, vanilla JS) implementa o MESMO mapeamento — qualquer
 * mudança aqui exige atualizar o script (e vice-versa). O teste de paridade em
 * tests/unit/boot-destination.test.ts trava os dois em sincronia por contrato.
 *
 * Consumidores: testes (paridade/contrato) e superfícies que precisem computar o
 * destino de boot. Os REDIRECTS continuam com os donos atuais (boot script + gates)
 * — decisão D2 do plano splash-boot: a splash observa, nunca navega.
 */

export type BootUserType = 'personal' | 'student' | 'nutritionist' | 'admin'

export interface BootContext {
  authenticated: boolean
  userType?: BootUserType | null
  /** Tipo simulado quando admin/super_admin está com simulação ativa */
  simulatedType?: BootUserType | null
  /** Guest mode B2C (localStorage vfit_guest_mode) */
  guest?: boolean
}

export function bootDestination(ctx: BootContext): string {
  if (!ctx.authenticated) {
    return ctx.guest ? '/treinos' : '/welcome'
  }

  const effective =
    ctx.userType === 'admin' && ctx.simulatedType ? ctx.simulatedType : ctx.userType

  switch (effective) {
    case 'student':
      return '/treinos'
    case 'admin':
      return '/dashboard/admin'
    case 'personal':
    case 'nutritionist':
    default:
      return '/dashboard'
  }
}
