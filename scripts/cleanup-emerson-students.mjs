// Cleanup definitivo dos alunos do Emerson
// Mantém apenas: Betania, Paula Agata e Victor Duarte

import { neon } from '@neondatabase/serverless'

const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!dbUrl) {
  console.error('Set DATABASE_URL or NEON_DATABASE_URL')
  process.exit(1)
}

const sql = neon(dbUrl)
const EMERSON_PERSONAL_ID = '2fb61a39-cf00-47ac-9f6d-e43a30611df6'

const keepFilter = `
  LOWER(COALESCE(u.full_name, '')) LIKE '%bet%'
  OR LOWER(COALESCE(u.full_name, '')) LIKE '%paula%'
  OR LOWER(COALESCE(u.full_name, '')) LIKE '%agata%'
  OR LOWER(COALESCE(u.full_name, '')) LIKE '%ágata%'
  OR LOWER(COALESCE(u.full_name, '')) LIKE '%victor%duarte%'
`

const targetRows = await sql.query(
  `SELECT s.id, u.full_name, u.email
   FROM students s
   JOIN users u ON u.id = s.id
   WHERE s.personal_id = $1
     AND NOT (${keepFilter})
   ORDER BY u.full_name`,
  [EMERSON_PERSONAL_ID]
)

const targetIds = targetRows.map((r) => r.id)
console.log(`Alvos para remoção: ${targetIds.length}`)

if (targetIds.length === 0) {
  console.log('Nada para remover.')
  process.exit(0)
}

const statements = [
  'DELETE FROM student_badges WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM workout_logs WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM workout_exercises WHERE workout_id IN (SELECT id FROM workouts WHERE student_id::text = ANY($1::text[]))',
  'DELETE FROM workouts WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM assessments WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM assessment_evolution WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM personal_reviews WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM payments WHERE payer_id::text = ANY($1::text[])',
  'DELETE FROM payment_subscriptions WHERE payer_id::text = ANY($1::text[])',
  'DELETE FROM messages WHERE sender_id::text = ANY($1::text[])',
  'DELETE FROM conversations WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM notifications WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM asaas_customers WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM user_passkeys WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM feedback_replies WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM feedback_suggestions WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM ai_usage_logs WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM app_logs WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM workout_session_state WHERE user_id::text = ANY($1::text[])',
  'DELETE FROM user_daily_goals WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM calendar_events WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM xp_audit_log WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM xp_balances WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM xp_daily_limits WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM xp_deduplication WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM xp_streak_milestones WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM xp_streaks WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM xp_transactions WHERE student_id::text = ANY($1::text[])',
  'DELETE FROM students WHERE id::text = ANY($1::text[])',
  'DELETE FROM users WHERE id::text = ANY($1::text[])',
]

for (const stmt of statements) {
  await sql.query(stmt, [targetIds])
}

await sql.query(
  `UPDATE personals p
   SET total_students = COALESCE(s.total_students, 0),
       active_students = COALESCE(s.active_students, 0),
       updated_at = NOW()
   FROM (
     SELECT personal_id,
            COUNT(*)::int AS total_students,
            COUNT(*) FILTER (WHERE status = 'active')::int AS active_students
     FROM students
     WHERE personal_id = $1
     GROUP BY personal_id
   ) s
   WHERE p.id = $1`,
  [EMERSON_PERSONAL_ID]
)

await sql.query(
  `UPDATE personals p
   SET total_students = 0,
       active_students = 0,
       updated_at = NOW()
   WHERE p.id = $1
     AND NOT EXISTS (SELECT 1 FROM students s WHERE s.personal_id = p.id)`,
  [EMERSON_PERSONAL_ID]
)

const remaining = await sql.query(
  `SELECT u.full_name, u.email, s.status
   FROM students s
   JOIN users u ON u.id = s.id
   WHERE s.personal_id = $1
   ORDER BY u.full_name`,
  [EMERSON_PERSONAL_ID]
)

const rafaela = await sql.query(
  `SELECT id, full_name, email
   FROM users
   WHERE LOWER(full_name) LIKE '%rafaela%'
      OR LOWER(email) LIKE '%rafaela%'
      OR LOWER(full_name) LIKE '%rafela%'
      OR LOWER(email) LIKE '%rafela%'`
)

console.log(JSON.stringify({
  deletedCount: targetIds.length,
  remainingForEmerson: remaining.length,
  remaining,
  rafaelaMentions: rafaela.length,
  rafaela,
}, null, 2))
