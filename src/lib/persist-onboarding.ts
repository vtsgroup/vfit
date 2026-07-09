/**
 * src/lib/persist-onboarding.ts
 *
 * Persistência pós-cadastro do funil público de onboarding.
 *
 * No path de signup fresco (guest → cria conta), o quiz e o plano gerado ficavam
 * SÓ no client (localStorage `vfit-onboarding` + sessionStorage `vfit_plan`) e nunca
 * chegavam ao backend. Resultado: ao aterrissar em /treinos, o guard do layout B2C
 * (`GET /onboarding` → completed:false) fazia `router.replace('/onboarding')` e o
 * usuário voltava ao funil (tela de carregamento / "criar e salvar plano").
 *
 * Este helper roda no 1º momento autenticado (email ou Google) e, de forma silenciosa
 * (sem tela de loading), salva:
 *   1. as respostas do quiz  → satisfaz o gate do /treinos (completed:true)
 *   2. o plano EXATO que o usuário acabou de ver → sem re-gerar via IA
 *
 * Deve ser aguardado ANTES de navegar para /treinos, para o gate já ver completed:true.
 */

import { api } from '@/lib/api-client'
import { useOnboardingStore } from '@/stores/onboarding-store'

export async function persistOnboardingAndPlan(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const store = useOnboardingStore.getState()
  // Só age quando o usuário realmente concluiu o funil (result page chamou markCompleted()).
  // Evita marcar onboarding p/ quem se cadastrou pelo form clássico (mesmo hook useRegisterStudent).
  if (!store.isCompleted) return false

  const d = store.data
  // Defaults espelham exatamente o payload da loading page (onboardingSchema exige enums/números).
  const payload = {
    gender: d.gender || 'prefer_not_say',
    experience_level: d.experience_level || 'beginner',
    training_frequency: d.training_frequency || 'never',
    goal: d.goal || 'health',
    training_location: d.training_location || 'gym_large',
    target_muscles: d.target_muscles?.length ? d.target_muscles : [],
    age: d.age || 25,
    height_cm: d.height_cm || 170,
    weight_kg: d.weight_kg || 70,
    target_weight_kg: d.target_weight_kg || d.weight_kg || 70,
    days_per_week: d.days_per_week || 3,
    session_duration: d.session_duration || 'medium_45',
    injuries: d.injuries?.length ? d.injuries : [],
    preferred_days: d.preferred_days?.length ? d.preferred_days : [],
    preferred_time: d.preferred_time || 'any',
  }

  try {
    // 1. Respostas do quiz → destrava o gate do /treinos.
    await api.post('/onboarding', payload)

    // 2. Plano que o usuário já viu (sessionStorage gravado pela loading page).
    //    Se por algum motivo não estiver presente (ex.: round-trip full-page do OAuth
    //    limpou o sessionStorage), o próprio /treinos dispara o auto-generate — pois
    //    agora onboardingStatus.completed === true.
    try {
      const raw = sessionStorage.getItem('vfit_plan')
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed?.plan) {
        await api.post('/plans/save', { plan: parsed.plan })
      }
    } catch (err) {
      console.warn('[persistOnboarding] falha ao salvar plano:', err)
    }

    // 3. Espelha a loading page: cria a auto-avaliação a partir do onboarding (best-effort).
    api.post('/self-assessments/from-onboarding', {}).catch(() => {})

    // 4. Limpa o estado local do funil — evita re-post e bounce em navegações futuras.
    sessionStorage.removeItem('vfit_plan')
    useOnboardingStore.getState().reset()
    return true
  } catch (err) {
    console.warn('[persistOnboarding] falha ao salvar onboarding:', err)
    return false
  }
}
