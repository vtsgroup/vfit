-- ============================================
-- D1 MIGRATION 0004 - VFIT Exercise Enhancements
-- Adds coaching_cues, tags, and extra exercises
-- Total after: ~160+ exercises
-- VFIT Sprint 41 — 2026-04-01
-- ============================================

-- =====================
-- ADD COLUMNS (VFIT spec)
-- =====================
-- D1 SQLite requires individual ALTER TABLE for each column

ALTER TABLE exercises ADD COLUMN coaching_cues TEXT;
ALTER TABLE exercises ADD COLUMN tags TEXT;
ALTER TABLE exercises ADD COLUMN image_urls TEXT;

-- =====================
-- UPDATE existing exercises with coaching cues & tags
-- =====================

UPDATE exercises SET
  coaching_cues = 'Chest up, knees tracking over toes, full depth, explosive drive',
  tags = 'compound,free_weight,progressive,strength'
WHERE id = 'ex-legs-001';

UPDATE exercises SET
  coaching_cues = 'Hinge at hips, neutral spine, drive through heels, lockout with glutes',
  tags = 'compound,free_weight,progressive,strength,posterior'
WHERE id = 'ex-back-001';

UPDATE exercises SET
  coaching_cues = 'Arch back slightly, retract scapulae, lower to mid-chest, press explosively',
  tags = 'compound,free_weight,progressive,strength,push'
WHERE id = 'ex-chest-001';

UPDATE exercises SET
  coaching_cues = 'Full ROM, retract scapulae at bottom, controlled descent',
  tags = 'compound,bodyweight,pull,progressive'
WHERE id = 'ex-back-002';

UPDATE exercises SET
  coaching_cues = 'Core braced, press overhead, slight lean, full lockout',
  tags = 'compound,free_weight,push,strength'
WHERE id = 'ex-shoulders-001';

-- =====================
-- NEW EXERCISES — Full Body / Compound (5)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed, coaching_cues, tags) VALUES
('ex-fullbody-001', 'Thruster',            'Thruster (Agachamento + Press)',    'shoulders', 'Agachamento frontal seguido de press militar. Exercício cardio-força completo.', 'intermediate', '["barbell","dumbbells"]', 'Agachamento profundo, exploda para cima, pressione acima da cabeça em um movimento fluido', 'compound,full_body,cardio,strength'),
('ex-fullbody-002', 'Man Maker',           'Man Maker',                         'chest',     'Flexão + remada + clean + press. Exercício total body com halteres.', 'advanced', '["dumbbells"]', 'Mantenha o core contraído em todas as fases, controle o peso na descida', 'compound,full_body,cardio,advanced'),
('ex-fullbody-003', 'Turkish Get Up',      'Levantamento Turco',                'core',      'Do chão até em pé com peso acima da cabeça. Mobilidade e estabilidade total.', 'advanced', '["kettlebell","dumbbells"]', 'Olho no peso o tempo todo, cada posição deve ser estável antes de prosseguir', 'compound,full_body,stability,mobility'),
('ex-fullbody-004', 'Clean and Press',     'Clean e Press',                     'shoulders', 'Levantamento do chão até o ombro e pressão acima da cabeça.', 'intermediate', '["barbell","dumbbells","kettlebell"]', 'Extensão tripla nos tornozelos-joelhos-quadris, receba na posição de rack', 'compound,full_body,explosive,strength'),
('ex-fullbody-005', 'Devil Press',         'Devil Press',                       'chest',     'Burpee com halteres + snatch duplo acima da cabeça.', 'advanced', '["dumbbells"]', 'Movimento fluido sem pausa, halteres passam entre as pernas no swing', 'compound,full_body,cardio,advanced');

-- =====================
-- NEW EXERCISES — Core / Abs (5)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed, coaching_cues, tags) VALUES
('ex-core-011', 'Pallof Press',           'Pallof Press (Anti-rotação)',        'core',       'Pressão frontal contra resistência lateral. Anti-rotação pura para oblíquos e transverso.', 'beginner', '["cable","resistance_bands"]', 'Core contraído, pressione à frente sem rotacionar o tronco, mantenha 2-3s', 'isolation,anti_rotation,stability'),
('ex-core-012', 'Ab Wheel Rollout',       'Rollout na Roda Abdominal',         'core',       'Extensão completa na roda ab. Trabalha reto abdominal e serrátil.', 'intermediate', '["ab_wheel"]', 'Contraia o glúteo, não deixe o quadril cair, volte contraindo o abdômen', 'compound,progressive,strength'),
('ex-core-013', 'Dragon Flag',            'Dragon Flag',                       'core',       'Extensão do corpo inteiro preso pelo ombro. Nível avançado de controle abdominal.', 'advanced', '["bench"]', 'Corpo rígido como uma tábua, desça devagar, não deixe a lombar descolar', 'bodyweight,progressive,advanced,strength'),
('ex-core-014', 'Dead Bug',               'Dead Bug',                          'core',       'Deitado, braço e perna opostos se estendem. Anti-extensão para estabilidade lombar.', 'beginner', '["none"]', 'Lombar colada no chão, expire ao estender, movimentos lentos e controlados', 'bodyweight,stability,rehab,beginner'),
('ex-core-015', 'Copenhagen Plank',       'Prancha de Copenhagen',             'adductors',  'Prancha lateral com perna de cima apoiada. Trabalha adutores e oblíquos simultaneamente.', 'intermediate', '["bench"]', 'Quadril alto, corpo alinhado, não deixe o quadril cair para frente', 'bodyweight,stability,adductors,intermediate');

-- =====================
-- NEW EXERCISES — Arms / Isolation (5)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed, coaching_cues, tags) VALUES
('ex-biceps-011', 'Bayesian Curl',         'Rosca Bayesian (Cabo)',             'biceps',     'Rosca no cabo atrás do corpo. Máximo alongamento do bíceps na posição inicial.', 'intermediate', '["cable"]', 'Cotovelo atrás do corpo, contraia no topo, desça devagar com controle', 'isolation,cable,progressive'),
('ex-triceps-011', 'JM Press',             'JM Press',                          'triceps',    'Híbrido entre supino fechado e tríceps testa. Foco no tríceps com carga pesada.', 'advanced', '["barbell","bench"]', 'Cotovelos apontam para frente, barra desce para o queixo, extensão explosiva', 'compound,free_weight,strength,advanced'),
('ex-biceps-012', 'Zottman Curl',          'Rosca Zottman',                     'biceps',     'Rosca supinada na subida, pronada na descida. Trabalha bíceps e antebraço.', 'intermediate', '["dumbbells"]', 'Subida supinada controlada, gire no topo, descida pronada lenta', 'isolation,free_weight,forearms'),
('ex-triceps-012', 'Overhead Rope Extension', 'Extensão de Tríceps Acima (Corda)', 'triceps', 'Extensão com corda acima da cabeça no cabo. Foco na cabeça longa do tríceps.', 'beginner', '["cable"]', 'Cotovelos fixos ao lado da cabeça, estenda completamente, controle o retorno', 'isolation,cable,progressive'),
('ex-forearms-006', 'Plate Pinch Hold',    'Pinça de Disco',                    'forearms',   'Segurar discos de peso entre os dedos por tempo. Grip isométrico intenso.', 'beginner', '["plates"]', 'Aperte com força, mantenha o braço ao lado do corpo, respire normalmente', 'isolation,isometric,grip,endurance');
