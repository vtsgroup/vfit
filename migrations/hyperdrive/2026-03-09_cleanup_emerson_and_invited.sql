-- ================================================
-- 2026-03-09: Cleanup Emerson personal + incomplete registrations
-- Removes: emersonpheducator@gmail.com + students with name 'Aluno convidado'
-- ================================================

BEGIN;

-- ================================================
-- PART 1: Remove 'Aluno convidado' (incomplete registrations)
-- ================================================
DO $$
DECLARE
  _ids uuid[];
BEGIN
  SELECT array_agg(u.id) INTO _ids
  FROM users u
  JOIN students s ON s.id = u.id
  WHERE u.full_name = 'Aluno convidado';

  IF _ids IS NULL OR array_length(_ids, 1) IS NULL THEN
    RAISE NOTICE 'No incomplete students found. Skipping part 1.';
    RETURN;
  END IF;

  RAISE NOTICE 'Cleaning % incomplete students...', array_length(_ids, 1);

  DELETE FROM student_badges WHERE student_id = ANY(_ids);
  DELETE FROM workout_logs WHERE student_id = ANY(_ids);
  DELETE FROM workout_exercises WHERE workout_id IN (SELECT w.id FROM workouts w WHERE w.student_id = ANY(_ids));
  DELETE FROM workouts WHERE student_id = ANY(_ids);
  DELETE FROM assessments WHERE student_id = ANY(_ids);
  DELETE FROM assessment_evolution WHERE student_id = ANY(_ids);
  DELETE FROM personal_reviews WHERE student_id = ANY(_ids);
  DELETE FROM payments WHERE payer_id = ANY(_ids);
  DELETE FROM payment_subscriptions WHERE payer_id = ANY(_ids);
  DELETE FROM messages WHERE sender_id = ANY(_ids);
  DELETE FROM conversations WHERE student_id = ANY(_ids);
  DELETE FROM notifications WHERE user_id = ANY(_ids);
  DELETE FROM asaas_customers WHERE user_id = ANY(_ids);
  DELETE FROM user_passkeys WHERE user_id = ANY(_ids);
  DELETE FROM feedback_replies WHERE user_id = ANY(_ids);
  DELETE FROM feedback_suggestions WHERE user_id = ANY(_ids);
  DELETE FROM ai_usage_logs WHERE user_id = ANY(_ids);
  DELETE FROM app_logs WHERE user_id = ANY(_ids);
  DELETE FROM admin_account_notes WHERE target_user_id = ANY(_ids);
  DELETE FROM audit_log WHERE actor_user_id = ANY(_ids) OR target_id = ANY(_ids);
  DELETE FROM workout_session_state WHERE user_id = ANY(ARRAY(SELECT id::text FROM unnest(_ids) AS id));
  DELETE FROM user_daily_goals WHERE student_id = ANY(_ids);
  DELETE FROM calendar_events WHERE student_id = ANY(_ids);
  DELETE FROM xp_audit_log WHERE student_id = ANY(_ids);
  DELETE FROM xp_balances WHERE student_id = ANY(_ids);
  DELETE FROM xp_daily_limits WHERE student_id = ANY(_ids);
  DELETE FROM xp_deduplication WHERE student_id = ANY(_ids);
  DELETE FROM xp_streak_milestones WHERE student_id = ANY(_ids);
  DELETE FROM xp_streaks WHERE student_id = ANY(_ids);
  DELETE FROM xp_transactions WHERE student_id = ANY(_ids);
  DELETE FROM students WHERE id = ANY(_ids);
  DELETE FROM users WHERE id = ANY(_ids);

  RAISE NOTICE 'Part 1 done: removed % incomplete students', array_length(_ids, 1);
END $$;

-- ================================================
-- PART 2: Remove Emerson personal + all his students
-- Personal ID: 2fb61a39-cf00-47ac-9f6d-e43a30611df6
-- ================================================
DO $$
DECLARE
  _personal_id uuid := '2fb61a39-cf00-47ac-9f6d-e43a30611df6';
  _all_ids uuid[];
  _student_ids uuid[];
BEGIN
  -- Check if personal exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = _personal_id) THEN
    RAISE NOTICE 'Emerson not found. Already cleaned. Skipping part 2.';
    RETURN;
  END IF;

  -- Collect student IDs
  SELECT array_agg(s.id) INTO _student_ids
  FROM students s WHERE s.personal_id = _personal_id;

  -- All IDs = personal + students
  IF _student_ids IS NOT NULL THEN
    _all_ids := _student_ids || ARRAY[_personal_id];
  ELSE
    _all_ids := ARRAY[_personal_id];
  END IF;

  RAISE NOTICE 'Removing Emerson + % students...', COALESCE(array_length(_student_ids, 1), 0);

  -- Delete all child records (order matters: affiliate_commissions before payments!)
  DELETE FROM student_badges WHERE student_id = ANY(_all_ids);
  DELETE FROM workout_logs WHERE student_id = ANY(_all_ids);
  DELETE FROM workout_exercises WHERE workout_id IN (
    SELECT w.id FROM workouts w WHERE w.personal_id = _personal_id OR w.student_id = ANY(_all_ids)
  );
  DELETE FROM workouts WHERE personal_id = _personal_id OR student_id = ANY(_all_ids);
  DELETE FROM assessments WHERE personal_id = _personal_id OR student_id = ANY(_all_ids);
  DELETE FROM assessment_evolution WHERE personal_id = _personal_id OR student_id = ANY(_all_ids);
  DELETE FROM personal_reviews WHERE personal_id = _personal_id OR student_id = ANY(_all_ids);
  -- Affiliates BEFORE payments (affiliate_commissions.payment_id → payments.id, referral_id → referrals.id)
  DELETE FROM affiliate_commissions WHERE affiliate_id IN (SELECT id FROM affiliates WHERE personal_id = _personal_id)
    OR referral_id IN (SELECT id FROM referrals WHERE referred_personal_id = _personal_id)
    OR payment_id IN (SELECT id FROM payments WHERE payer_id = ANY(_all_ids) OR recipient_id = _personal_id);
  DELETE FROM referrals WHERE affiliate_id IN (SELECT id FROM affiliates WHERE personal_id = _personal_id) OR referred_personal_id = _personal_id;
  DELETE FROM affiliates WHERE personal_id = _personal_id;
  DELETE FROM payments WHERE payer_id = ANY(_all_ids) OR recipient_id = _personal_id;
  DELETE FROM payment_subscriptions WHERE payer_id = ANY(_all_ids) OR recipient_id = _personal_id;
  DELETE FROM messages WHERE sender_id = ANY(_all_ids);
  DELETE FROM conversations WHERE personal_id = _personal_id OR student_id = ANY(_all_ids);
  DELETE FROM notifications WHERE user_id = ANY(_all_ids);
  DELETE FROM pix_transfers WHERE personal_id = _personal_id;
  DELETE FROM affiliate_commissions WHERE affiliate_id IN (SELECT id FROM affiliates WHERE personal_id = _personal_id);
  DELETE FROM referrals WHERE affiliate_id IN (SELECT id FROM affiliates WHERE personal_id = _personal_id) OR referred_personal_id = _personal_id;
  DELETE FROM affiliates WHERE personal_id = _personal_id;
  DELETE FROM plan_purchases WHERE buyer_id = ANY(_all_ids) OR plan_id IN (SELECT id FROM workout_plans WHERE created_by = ANY(_all_ids));
  DELETE FROM workout_plans WHERE created_by = ANY(_all_ids);
  DELETE FROM personal_settings WHERE id = _personal_id;
  DELETE FROM asaas_customers WHERE user_id = ANY(_all_ids) OR personal_id = _personal_id;
  DELETE FROM ai_usage_logs WHERE user_id = ANY(_all_ids);
  DELETE FROM user_passkeys WHERE user_id = ANY(_all_ids);
  DELETE FROM feedback_replies WHERE user_id = ANY(_all_ids);
  DELETE FROM feedback_suggestions WHERE user_id = ANY(_all_ids);
  DELETE FROM app_logs WHERE user_id = ANY(_all_ids);
  DELETE FROM admin_account_notes WHERE target_user_id = ANY(_all_ids);
  DELETE FROM audit_log WHERE actor_user_id = ANY(_all_ids) OR target_id = ANY(_all_ids);
  DELETE FROM workout_session_state WHERE user_id = ANY(ARRAY(SELECT id::text FROM unnest(_all_ids) AS id));
  DELETE FROM user_daily_goals WHERE student_id = ANY(_all_ids);
  DELETE FROM calendar_events WHERE personal_id = _personal_id OR student_id = ANY(_all_ids);
  DELETE FROM xp_audit_log WHERE student_id = ANY(_all_ids);
  DELETE FROM xp_balances WHERE student_id = ANY(_all_ids);
  DELETE FROM xp_daily_limits WHERE student_id = ANY(_all_ids);
  DELETE FROM xp_deduplication WHERE student_id = ANY(_all_ids);
  DELETE FROM xp_streak_milestones WHERE student_id = ANY(_all_ids);
  DELETE FROM xp_streaks WHERE student_id = ANY(_all_ids);
  DELETE FROM xp_transactions WHERE student_id = ANY(_all_ids);

  -- Delete entity records
  DELETE FROM students WHERE personal_id = _personal_id;
  DELETE FROM personals WHERE id = _personal_id;
  DELETE FROM users WHERE id = ANY(_all_ids);

  RAISE NOTICE 'Part 2 done: removed Emerson and % students', COALESCE(array_length(_student_ids, 1), 0);
END $$;

-- ================================================
-- PART 3: Update student counts for affected personals
-- ================================================
UPDATE personals p
SET total_students = COALESCE(sub.cnt, 0),
    active_students = COALESCE(sub.active, 0),
    updated_at = NOW()
FROM (
  SELECT s.personal_id,
         COUNT(*)::int AS cnt,
         COUNT(*) FILTER (WHERE s.status = 'active')::int AS active
  FROM students s
  GROUP BY s.personal_id
) sub
WHERE p.id = sub.personal_id
  AND (p.total_students != sub.cnt OR p.active_students != sub.active);

-- Zero out personals with no students
UPDATE personals
SET total_students = 0, active_students = 0, updated_at = NOW()
WHERE (total_students > 0 OR active_students > 0)
  AND NOT EXISTS (SELECT 1 FROM students WHERE personal_id = personals.id);

COMMIT;
