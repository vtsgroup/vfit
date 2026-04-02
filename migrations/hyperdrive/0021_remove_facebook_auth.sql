-- ============================================
-- Migration 0021: Remove Facebook auth provider
-- ============================================
-- Converts users with auth_provider='facebook' to use email-based auth.
-- These users will need to use "Forgot Password" to set a password.
-- Safe to run multiple times (idempotent).
-- ============================================

-- 1) Log affected users before migration (for audit)
DO $$
DECLARE
  fb_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fb_count FROM users
  WHERE metadata->>'oauth_provider' = 'facebook';
  RAISE NOTICE 'Facebook OAuth users to migrate: %', fb_count;
END $$;

-- 2) Update metadata: clear oauth_provider, mark as migrated
UPDATE users
SET
  metadata = COALESCE(metadata, '{}'::jsonb)
    || jsonb_build_object(
      'oauth_provider_legacy', metadata->>'oauth_provider',
      'oauth_provider_id_legacy', metadata->>'oauth_provider_id',
      'facebook_migrated_at', NOW()::text
    )
    - 'oauth_provider'
    - 'oauth_provider_id',
  updated_at = NOW()
WHERE metadata->>'oauth_provider' = 'facebook';

-- 3) Verify migration
DO $$
DECLARE
  remaining INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining FROM users
  WHERE metadata->>'oauth_provider' = 'facebook';
  IF remaining > 0 THEN
    RAISE WARNING 'Still % users with Facebook provider!', remaining;
  ELSE
    RAISE NOTICE 'Migration complete. All Facebook users migrated successfully.';
  END IF;
END $$;
