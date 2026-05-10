-- Migration 0032: harden VFIT food catalog sync
-- Adds fields/indexes used by barcode lookup and idempotent library seeding.

ALTER TABLE vfit_foods
  ADD COLUMN IF NOT EXISTS barcode VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_vfit_foods_barcode
  ON vfit_foods(barcode)
  WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vfit_foods_library_name_lower
  ON vfit_foods (lower(name))
  WHERE is_library = true;
