-- Fix subscription_plan CHECK constraint to include 'profissional'
-- The original constraint only allows ('trial', 'pro', 'max')
-- Need to add 'profissional' for the Pro+ plan tier

-- Drop old constraint (PostgreSQL allows dropping by name)
ALTER TABLE personals DROP CONSTRAINT IF EXISTS personals_subscription_plan_check;

-- Add updated constraint
ALTER TABLE personals ADD CONSTRAINT personals_subscription_plan_check
  CHECK (subscription_plan IN ('trial', 'pro', 'profissional', 'max'));
