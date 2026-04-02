-- Cleanup definitivo dos alunos do personal Emerson
-- Mantém apenas: Betania, Paula Agata, Victor Duarte
-- Remove placeholders de convite e qualquer menção da Rafaela vinculada ao personal

BEGIN;

CREATE TEMP TABLE target_students ON COMMIT DROP AS
SELECT s.id
FROM students s
JOIN users u ON u.id = s.id
WHERE s.personal_id = '2fb61a39-cf00-47ac-9f6d-e43a30611df6'::uuid
  AND NOT (
    LOWER(COALESCE(u.full_name, '')) LIKE '%bet%'
    OR LOWER(COALESCE(u.full_name, '')) LIKE '%paula%'
    OR LOWER(COALESCE(u.full_name, '')) LIKE '%agata%'
    OR LOWER(COALESCE(u.full_name, '')) LIKE '%ágata%'
    OR LOWER(COALESCE(u.full_name, '')) LIKE '%victor%duarte%'
  );

DELETE FROM student_badges WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM workout_logs WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM workout_exercises WHERE workout_id IN (
  SELECT w.id FROM workouts w WHERE w.student_id IN (SELECT id FROM target_students)
);
DELETE FROM workouts WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM assessments WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM assessment_evolution WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM personal_reviews WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM payments WHERE payer_id IN (SELECT id FROM target_students);
DELETE FROM payment_subscriptions WHERE payer_id IN (SELECT id FROM target_students);
DELETE FROM messages WHERE sender_id IN (SELECT id FROM target_students);
DELETE FROM conversations WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM notifications WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM asaas_customers WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM user_passkeys WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM feedback_replies WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM feedback_suggestions WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM ai_usage_logs WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM app_logs WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM workout_session_state WHERE user_id IN (SELECT id FROM target_students);
DELETE FROM user_daily_goals WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM calendar_events WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM xp_audit_log WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM xp_balances WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM xp_daily_limits WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM xp_deduplication WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM xp_streak_milestones WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM xp_streaks WHERE student_id IN (SELECT id FROM target_students);
DELETE FROM xp_transactions WHERE student_id IN (SELECT id FROM target_students);

DELETE FROM students WHERE id IN (SELECT id FROM target_students);
DELETE FROM users WHERE id IN (SELECT id FROM target_students);

UPDATE personals p
SET total_students = COALESCE(s.total_students, 0),
    active_students = COALESCE(s.active_students, 0),
    updated_at = NOW()
FROM (
  SELECT personal_id,
         COUNT(*)::int AS total_students,
         COUNT(*) FILTER (WHERE status = 'active')::int AS active_students
  FROM students
  WHERE personal_id = '2fb61a39-cf00-47ac-9f6d-e43a30611df6'::uuid
  GROUP BY personal_id
) s
WHERE p.id = '2fb61a39-cf00-47ac-9f6d-e43a30611df6'::uuid;

UPDATE personals p
SET total_students = 0,
    active_students = 0,
    updated_at = NOW()
WHERE p.id = '2fb61a39-cf00-47ac-9f6d-e43a30611df6'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM students s WHERE s.personal_id = p.id
  );

COMMIT;
