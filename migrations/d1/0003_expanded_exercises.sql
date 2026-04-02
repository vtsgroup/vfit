-- ============================================
-- D1 MIGRATION 0003 - Expanded Exercise Library
-- Adds 4 new muscle groups + ~75 new exercises
-- Total: 18 groups, ~155 exercises
-- Personal IA Prod — 2026-02-15
-- ============================================

-- =====================
-- NEW MUSCLE GROUPS (4)
-- =====================
INSERT OR IGNORE INTO muscle_groups (id, name, name_pt, icon_svg, description, display_order) VALUES
('adductors',  'Adductors',  'Adutores',        '🦵', 'Adutores da coxa (magno, longo, curto, grácil, pectíneo)', 15),
('abductors',  'Abductors',  'Abdutores',        '🦵', 'Abdutores do quadril (glúteo médio, mínimo, tensor da fáscia lata)', 16),
('obliques',   'Obliques',   'Oblíquos',         '🔥', 'Oblíquos internos e externos do abdômen', 17),
('lower-back', 'Lower Back', 'Lombar',           '🔙', 'Eretores da espinha, quadrado lombar, multífidos', 18);

-- =====================
-- NEW EXERCISES — PEITO (3 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-chest-011', 'Incline Cable Fly',        'Crucifixo Inclinado no Cabo',      'chest', 'Tensão constante no peitoral superior. Banco inclinado entre os cabos.', 'intermediate', '["cable","bench"]'),
('ex-chest-012', 'Svend Press',              'Svend Press (Aperto de Disco)',    'chest', 'Apertar disco à frente do peito e estender. Foco na contração do peitoral.', 'beginner', '["none"]'),
('ex-chest-013', 'Landmine Press',           'Landmine Press',                    'chest', 'Pressão angular com barra na mina. Trabalha peitoral superior e ombro.', 'intermediate', '["barbell"]');

-- =====================
-- NEW EXERCISES — COSTAS (3 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-back-011', 'Meadows Row',               'Remada Meadows',                   'back', 'Remada unilateral na landmine. Excelente para latíssimo e romboides.', 'intermediate', '["barbell"]'),
('ex-back-012', 'Straight-Arm Pulldown',     'Pulldown Braço Estendido',         'back', 'Polia alta, braços estendidos. Isola o latíssimo sem bíceps.', 'beginner', '["cable"]'),
('ex-back-013', 'Pendlay Row',               'Remada Pendlay',                    'back', 'Remada explosiva partindo do chão. Alta ativação de costas e core.', 'advanced', '["barbell"]');

-- =====================
-- NEW EXERCISES — OMBROS (3 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-shoulders-009', 'Behind the Neck Press', 'Desenvolvimento Atrás da Nuca',    'shoulders', 'Versão avançada para deltoide posterior. Requer boa mobilidade.', 'advanced', '["barbell"]'),
('ex-shoulders-010', 'Lu Raise',              'Lu Raise',                          'shoulders', 'Elevação lateral com rotação. Popularizada pelo halterofilista Lu Xiaojun.', 'intermediate', '["dumbbell"]'),
('ex-shoulders-011', 'Machine Shoulder Press', 'Desenvolvimento na Máquina',       'shoulders', 'Movimento guiado, boa opção para iniciantes e alta intensidade.', 'beginner', '["machine"]');

-- =====================
-- NEW EXERCISES — BÍCEPS (2 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-biceps-009', 'Spider Curl',              'Rosca Spider (Aranha)',             'biceps', 'Peito apoiado no banco inclinado. Máxima tensão na contração de pico.', 'intermediate', '["dumbbell","bench"]'),
('ex-biceps-010', 'Bayesian Curl',            'Rosca Bayesian no Cabo',            'biceps', 'Cabo atrás do corpo, máximo estiramento do bíceps. Moderna e eficaz.', 'intermediate', '["cable"]');

-- =====================
-- NEW EXERCISES — TRÍCEPS (2 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-triceps-009', 'JM Press',                'JM Press',                          'triceps', 'Híbrido entre supino fechado e skull crusher. Alta ativação da cabeça medial.', 'advanced', '["barbell","bench"]'),
('ex-triceps-010', 'Cable Overhead Extension','Extensão de Tríceps no Cabo (Acima)','triceps', 'De costas para a polia, extensão acima da cabeça. Estiramento máximo da cabeça longa.', 'beginner', '["cable"]');

-- =====================
-- NEW EXERCISES — QUADRÍCEPS (3 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-quads-009', 'Sissy Squat',               'Agachamento Sissy',                 'quadriceps', 'Inclinação para trás com joelhos avançados. Isola quadríceps sem carga.', 'advanced', '["bodyweight"]'),
('ex-quads-010', 'Pendulum Squat',            'Agachamento Pendular',              'quadriceps', 'Máquina com arco de movimento pendular. Boa alternativa ao hack squat.', 'beginner', '["machine"]'),
('ex-quads-011', 'Reverse Lunge',             'Avanço Reverso',                    'quadriceps', 'Pisar para trás em avanço. Menos estresse no joelho que o avanço frontal.', 'beginner', '["dumbbell"]');

-- =====================
-- NEW EXERCISES — POSTERIORES (3 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-hams-007', 'Glute-Ham Raise',            'GHR (Glute-Ham Raise)',             'hamstrings', 'Exercício avançado no banco GHD. Trabalha posterior e glúteos em cadeia fechada.', 'advanced', '["machine"]'),
('ex-hams-008', 'Swiss Ball Leg Curl',        'Flexão de Pernas na Bola Suíça',   'hamstrings', 'Deitado, puxar a bola com os calcanhares. Estabilizadores + isquiotibiais.', 'intermediate', '["none"]'),
('ex-hams-009', 'Cable Pull-Through',         'Pull-Through no Cabo',              'hamstrings', 'De costas para o cabo, extensão de quadril. Alternativa ao stiff sem sobrecarga axial.', 'beginner', '["cable"]');

-- =====================
-- NEW EXERCISES — GLÚTEOS (3 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-glutes-007', 'Frog Pump',                'Frog Pump',                         'glutes', 'Solas dos pés juntas, quadril elevado. Alta ativação do glúteo máximo.', 'beginner', '["bodyweight"]'),
('ex-glutes-008', 'Curtsy Lunge',             'Avanço Cruzado (Curtsy)',           'glutes', 'Avanço cruzando a perna atrás. Ativa glúteo médio e mínimo intensamente.', 'intermediate', '["dumbbell"]'),
('ex-glutes-009', 'Banded Lateral Walk',      'Caminhada Lateral com Elástico',    'glutes', 'Mini-band nos tornozelos, andar lateralmente. Aquecimento e ativação de glúteos.', 'beginner', '["resistance-band"]');

-- =====================
-- NEW EXERCISES — PANTURRILHAS (2 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-calves-005', 'Smith Machine Calf Raise', 'Panturrilha no Smith Machine',      'calves', 'Calf raise no Smith para carga pesada com estabilidade. Boa progressão.', 'beginner', '["smith-machine"]'),
('ex-calves-006', 'Jump Rope',                'Pular Corda',                       'calves', 'Excelente para panturrilhas + cardio. Pular na ponta dos pés com impulsão.', 'beginner', '["none"]');

-- =====================
-- NEW EXERCISES — ABDOMINAIS (3 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-abs-009', 'Pallof Press',                'Pallof Press (Anti-Rotação)',       'abs', 'Cabo na lateral, pressionar à frente resistindo rotação. Core funcional.', 'intermediate', '["cable"]'),
('ex-abs-010', 'Dead Bug',                    'Dead Bug',                          'abs', 'Deitado, braços e pernas estendidos. Abaixar membro oposto mantendo lombar neutra.', 'beginner', '["bodyweight"]'),
('ex-abs-011', 'Dragon Flag',                 'Dragon Flag',                       'abs', 'Exercício avançado de Bruce Lee. Elevar corpo reto segurando no banco. Core extremo.', 'advanced', '["bench"]');

-- =====================
-- NEW EXERCISES — ANTEBRAÇOS (2 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-forearms-004', 'Dead Hang',               'Pendurar na Barra (Dead Hang)',    'forearms', 'Simplesmente pendurar na barra fixa. Fortalece grip e descomprime coluna.', 'beginner', '["pull-up-bar"]'),
('ex-forearms-005', 'Plate Pinch Hold',        'Pinça de Discos',                  'forearms', 'Segurar discos lisos com dedos. Desenvolve pegada de pinça.', 'intermediate', '["none"]');

-- =====================
-- NEW EXERCISES — TRAPÉZIO (4 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-traps-001', 'Barbell Shrug',             'Encolhimento com Barra',            'traps', 'Exercício principal para trapézio superior. Encolher ombros com barra pesada.', 'beginner', '["barbell"]'),
('ex-traps-002', 'Dumbbell Shrug',            'Encolhimento com Halteres',         'traps', 'Versão com halteres para maior amplitude. Rotação opcional no topo.', 'beginner', '["dumbbell"]'),
('ex-traps-003', 'Cable Shrug',               'Encolhimento no Cabo',              'traps', 'Tensão constante durante todo o ROM. Polia baixa.', 'beginner', '["cable"]'),
('ex-traps-004', 'Farmer Walk (Traps)',       'Caminhada do Fazendeiro (Traps)',   'traps', 'Segurar halteres pesados e caminhar. Trapézio, grip e core.', 'intermediate', '["dumbbell"]');

-- =====================
-- NEW EXERCISES — CORE (4 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-core-001', 'Turkish Get-Up',             'Levantamento Turco',                'core', 'Exercício funcional completo: deitar → ficar em pé com kettlebell. Mobilidade + estabilidade.', 'advanced', '["kettlebell"]'),
('ex-core-002', 'Bear Crawl',                 'Engatinhar (Bear Crawl)',           'core', 'Quadrúpede com joelhos elevados, andar para frente/trás. Core + coordenação.', 'beginner', '["bodyweight"]'),
('ex-core-003', 'Suitcase Carry',             'Carga Unilateral (Suitcase Carry)','core', 'Segurar halter em um lado e caminhar. Anti-flexão lateral do core.', 'intermediate', '["dumbbell"]'),
('ex-core-004', 'Bird Dog',                   'Bird Dog',                          'core', 'Quadrúpede, estender braço e perna opostos. Estabilização e anti-rotação.', 'beginner', '["bodyweight"]');

-- =====================
-- NEW EXERCISES — FULL-BODY (5 novos)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-fullbody-001', 'Barbell Clean and Press',  'Clean e Press com Barra',          'full-body', 'Levantar barra do chão aos ombros (clean) e pressionar acima. Potência total.', 'advanced', '["barbell"]'),
('ex-fullbody-002', 'Thruster',                 'Thruster',                          'full-body', 'Agachamento frontal + desenvolvimento em um movimento fluido. Cardio + força.', 'intermediate', '["barbell"]'),
('ex-fullbody-003', 'Burpee',                   'Burpee',                            'full-body', 'Agachar → prancha → flexão → salto. Exercício cardio-muscular completo.', 'beginner', '["bodyweight"]'),
('ex-fullbody-004', 'Kettlebell Swing',         'Swing com Kettlebell',              'full-body', 'Balançar kettlebell entre as pernas e projetar até altura dos ombros. Quadril explosivo.', 'intermediate', '["kettlebell"]'),
('ex-fullbody-005', 'Man Maker',                'Man Maker',                         'full-body', 'Remada + flexão + clean + thruster com halteres. Exercício completo brutal.', 'advanced', '["dumbbell"]');

-- =====================
-- NEW EXERCISES — ADUTORES (6 exercícios)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-adductors-001', 'Machine Adduction',       'Cadeira Adutora',                  'adductors', 'Máquina específica para adutores. Apertar as pernas contra a resistência.', 'beginner', '["machine"]'),
('ex-adductors-002', 'Cable Adduction',         'Adução no Cabo',                   'adductors', 'Cabo preso ao tornozelo, puxar perna cruzando à frente. Unilateral.', 'beginner', '["cable"]'),
('ex-adductors-003', 'Copenhagen Plank',        'Prancha Copenhagen',               'adductors', 'Prancha lateral com pé de cima apoiado no banco. Adutores em isometria.', 'advanced', '["bench"]'),
('ex-adductors-004', 'Sumo Squat',              'Agachamento Sumô',                 'adductors', 'Agachamento com pés bem afastados e apontados para fora. Adutores + glúteos.', 'beginner', '["dumbbell"]'),
('ex-adductors-005', 'Sliding Disc Adduction',  'Adução com Disco Deslizante',      'adductors', 'Um pé fixo, outro desliza lateralmente. Controle excêntrico dos adutores.', 'intermediate', '["none"]'),
('ex-adductors-006', 'Wide Stance Leg Press',   'Leg Press Pés Afastados',          'adductors', 'Leg press com pés altos e afastados. Enfatiza adutores e glúteos.', 'beginner', '["machine"]');

-- =====================
-- NEW EXERCISES — ABDUTORES (6 exercícios)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-abductors-001', 'Machine Abduction',       'Cadeira Abdutora',                 'abductors', 'Máquina específica para abdutores. Abrir as pernas contra a resistência.', 'beginner', '["machine"]'),
('ex-abductors-002', 'Cable Abduction',         'Abdução no Cabo',                  'abductors', 'Cabo preso ao tornozelo, afastar perna lateralmente. Glúteo médio.', 'beginner', '["cable"]'),
('ex-abductors-003', 'Side Lying Hip Abduction','Abdução Deitado Lateral',          'abductors', 'Deitado de lado, elevar perna de cima. Exercício de isolamento simples.', 'beginner', '["bodyweight"]'),
('ex-abductors-004', 'Banded Clamshell',        'Conchinha com Elástico',           'abductors', 'Deitado de lado, joelhos flexionados, abrir joelho superior. Glúteo médio e mínimo.', 'beginner', '["resistance-band"]'),
('ex-abductors-005', 'Fire Hydrant',            'Fire Hydrant (Hidrante)',          'abductors', 'Quadrúpede, abduzir perna lateralmente. Glúteo médio + estabilidade.', 'beginner', '["bodyweight"]'),
('ex-abductors-006', 'Single-Leg Romanian DL',  'Stiff Unilateral (Abdutores)',     'abductors', 'Stiff em uma perna enfatizando estabilização lateral via abdutores.', 'intermediate', '["dumbbell"]');

-- =====================
-- NEW EXERCISES — OBLÍQUOS (6 exercícios)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-obliques-001', 'Side Plank',               'Prancha Lateral',                  'obliques', 'Prancha de lado, manter corpo reto. Isométrico para oblíquos.', 'beginner', '["bodyweight"]'),
('ex-obliques-002', 'Cable Woodchop',           'Woodchop no Cabo',                 'obliques', 'Rotação diagonal de cima para baixo no cabo. Oblíquos em movimento funcional.', 'intermediate', '["cable"]'),
('ex-obliques-003', 'Bicycle Crunch',           'Abdominal Bicicleta',              'obliques', 'Tocar cotovelo no joelho oposto alternando. Alta ativação de oblíquos.', 'beginner', '["bodyweight"]'),
('ex-obliques-004', 'Hanging Oblique Raise',    'Elevação Oblíqua na Barra',        'obliques', 'Pendurado na barra, elevar joelhos para um lado. Oblíquos avançado.', 'advanced', '["pull-up-bar"]'),
('ex-obliques-005', 'Landmine Rotation',        'Rotação na Landmine',              'obliques', 'Segurar ponta da barra, rotar lado a lado. Rotação com resistência.', 'intermediate', '["barbell"]'),
('ex-obliques-006', 'Suitcase Deadlift',        'Levantamento Terra Unilateral',    'obliques', 'Terra com halter em um lado só. Anti-flexão lateral intensa.', 'intermediate', '["dumbbell"]');

-- =====================
-- NEW EXERCISES — LOMBAR (6 exercícios)
-- =====================
INSERT OR IGNORE INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-lowerback-001', 'Back Extension (Machine)', 'Extensão Lombar na Máquina',      'lower-back', 'Máquina de extensão lombar. Estender tronco contra a resistência controlada.', 'beginner', '["machine"]'),
('ex-lowerback-002', 'Reverse Hyper',            'Hiperextensão Reversa',            'lower-back', 'Elevar pernas para trás deitado na máquina GHD. Eretores + glúteos.', 'intermediate', '["machine"]'),
('ex-lowerback-003', 'Superman Hold',            'Superman (Isométrico)',            'lower-back', 'Deitado de bruços, elevar braços e pernas. Manter posição por tempo.', 'beginner', '["bodyweight"]'),
('ex-lowerback-004', 'Rack Pull',                'Rack Pull (Terra Parcial)',        'lower-back', 'Levantamento terra partindo da altura dos joelhos. Isola eretores com carga pesada.', 'intermediate', '["barbell"]'),
('ex-lowerback-005', 'Seated Good Morning',      'Good Morning Sentado',             'lower-back', 'Sentado no banco com barra, inclinar para frente. Isola lombar sem isquiotibiais.', 'intermediate', '["barbell","bench"]'),
('ex-lowerback-006', 'Cat-Cow Stretch',          'Gato-Vaca (Mobilidade)',           'lower-back', 'Quadrúpede, alternar flexão e extensão da coluna. Mobilidade e alívio lombar.', 'beginner', '["bodyweight"]');
