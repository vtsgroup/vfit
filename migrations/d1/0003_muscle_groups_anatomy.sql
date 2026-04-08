-- ============================================================
-- Migration: muscle_groups anatomy expansion
-- Data: 2026-04-08
-- Descrição:
--   1. Adiciona image_url, animation_url, color_hex à muscle_groups
--   2. Adiciona parent_id (sub-músculos, ex: chest-upper → chest)
--   3. Insere sub-músculos com imagens genéricas provisórias
--   4. Adiciona secondary_muscle_ids e custom_video_url em exercises
-- ============================================================

-- 1. Novas colunas em muscle_groups
ALTER TABLE muscle_groups ADD COLUMN image_url TEXT;
ALTER TABLE muscle_groups ADD COLUMN animation_url TEXT;
ALTER TABLE muscle_groups ADD COLUMN color_hex TEXT DEFAULT '#22c55e';
ALTER TABLE muscle_groups ADD COLUMN parent_id TEXT REFERENCES muscle_groups(id);

-- 2. custom_video_url em exercises (vídeo pessoal do aluno)
-- (exercises já existe, adicionamos coluna de override por personal)
-- Nota: workout_exercises fica no Neon — esta coluna é na biblioteca D1
ALTER TABLE exercises ADD COLUMN ai_prompt_cues TEXT;

-- 3. Sub-músculos do Peito
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('chest-upper',     'Upper Chest',      'Peitoral Superior',  'chest',       101, '#22c55e'),
  ('chest-middle',    'Middle Chest',     'Peitoral Médio',     'chest',       102, '#22c55e'),
  ('chest-lower',     'Lower Chest',      'Peitoral Inferior',  'chest',       103, '#22c55e');

-- 4. Sub-músculos das Costas
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('back-lats',       'Latissimus Dorsi', 'Latíssimo',          'back',        201, '#22c55e'),
  ('back-rhomboids',  'Rhomboids',        'Romboides',          'back',        202, '#22c55e'),
  ('back-teres',      'Teres Major',      'Redondo Maior',      'back',        203, '#22c55e');

-- 5. Sub-músculos dos Ombros
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('shoulders-front', 'Front Deltoid',    'Deltóide Anterior',  'shoulders',   301, '#22c55e'),
  ('shoulders-mid',   'Middle Deltoid',   'Deltóide Lateral',   'shoulders',   302, '#22c55e'),
  ('shoulders-rear',  'Rear Deltoid',     'Deltóide Posterior', 'shoulders',   303, '#22c55e');

-- 6. Sub-músculos do Quadríceps
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('quad-rectus',     'Rectus Femoris',   'Reto Femoral',       'quadriceps',  401, '#22c55e'),
  ('quad-vastus-lat', 'Vastus Lateralis', 'Vasto Lateral',      'quadriceps',  402, '#22c55e'),
  ('quad-vastus-med', 'Vastus Medialis',  'Vasto Medial',       'quadriceps',  403, '#22c55e');

-- 7. Sub-músculos dos Glúteos
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('glutes-max',      'Gluteus Maximus',  'Glúteo Máximo',      'glutes',      501, '#22c55e'),
  ('glutes-med',      'Gluteus Medius',   'Glúteo Médio',       'glutes',      502, '#22c55e'),
  ('glutes-min',      'Gluteus Minimus',  'Glúteo Mínimo',      'glutes',      503, '#22c55e');

-- 8. Sub-músculos Abdominais
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('abs-upper',       'Upper Abs',        'Abdominais Superiores', 'abs',       601, '#22c55e'),
  ('abs-lower',       'Lower Abs',        'Abdominais Inferiores', 'abs',       602, '#22c55e');

-- 9. Sub-músculos dos Posteriores
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('hamstrings-biceps-fem', 'Biceps Femoris',  'Bíceps Femoral',     'hamstrings', 701, '#22c55e'),
  ('hamstrings-semi',       'Semitendinosus',  'Semitendíneo',       'hamstrings', 702, '#22c55e');

-- 10. Sub-músculos do Tríceps
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, parent_id, display_order, color_hex) VALUES
  ('triceps-long',    'Long Head',        'Cabeça Longa',       'triceps',     801, '#22c55e'),
  ('triceps-lateral', 'Lateral Head',     'Cabeça Lateral',     'triceps',     802, '#22c55e'),
  ('triceps-medial',  'Medial Head',      'Cabeça Medial',      'triceps',     803, '#22c55e');
