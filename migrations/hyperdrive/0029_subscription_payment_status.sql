-- Migration 0029: Add payment_status to vfit_subscriptions
-- Fixes: pre-activation bug (subscription was marked active before payment)
-- Also adds asaas_payment_id column for webhook tracking

ALTER TABLE vfit_subscriptions
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'confirmed';

-- Existing rows are already confirmed (or orphaned). Default = 'confirmed' for backwards compat.
-- New rows from checkout will be inserted with 'pending'.

COMMENT ON COLUMN vfit_subscriptions.payment_status IS 'pending = awaiting PIX payment, confirmed = payment received via webhook';
