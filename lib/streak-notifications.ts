/**
 * lib/streak-notifications.ts
 *
 * Dispara push/in-app + WhatsApp quando o aluno atinge milestone de streak
 * (3/7/30/100 dias). Best-effort — nunca lança erro.
 */

import { notifyStreakMilestone } from '@lib/onesignal'
import { sendWhatsAppToUser } from '@lib/whatsapp'
import type { Bindings } from '@workers/types'

export async function notifyStreakMilestones(
  env: Bindings,
  studentId: string,
  milestones: Array<{ days: number; xpAwarded: number }>
): Promise<void> {
  if (milestones.length === 0) return

  for (const milestone of milestones) {
    await notifyStreakMilestone(env, studentId, milestone.days, milestone.xpAwarded).catch(() => {})
  }

  const top = milestones[milestones.length - 1]
  await sendWhatsAppToUser(
    env,
    studentId,
    `🔥 ${top.days} dias seguidos de treino! Você ganhou +${top.xpAwarded} XP no VFIT. Continue assim!`
  ).catch(() => {})
}
