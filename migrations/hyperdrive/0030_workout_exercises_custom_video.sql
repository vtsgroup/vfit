-- ============================================================
-- Migration Neon: workout exercises custom video + workout cover
-- Data: 2026-04-08
-- Descrição:
--   1. workout_exercises → custom_video_url (vídeo do aluno gravado na academia)
--   2. cover_image_url já existe em workouts (0025) — confirma sem recriar
-- ============================================================

-- custom_video_url: personal faz upload do vídeo do próprio aluno
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS custom_video_url VARCHAR(500);

-- Índice para buscas por workout (listagem de exercícios com vídeo)
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
