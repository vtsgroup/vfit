-- ============================================
-- D1 MIGRATION 0002 - Seed Data
-- Initial data: muscle groups, exercises, series types,
-- equipment types, workout templates
-- Personal IA Prod
-- ============================================

-- =====================
-- MUSCLE GROUPS
-- =====================
INSERT INTO muscle_groups (id, name, name_pt, icon_svg, description, display_order) VALUES
('chest',      'Chest',      'Peito',        '💪', 'Peitoral maior e menor', 1),
('back',       'Back',       'Costas',       '🔙', 'Latíssimo do dorso, trapézio, romboides', 2),
('shoulders',  'Shoulders',  'Ombros',       '🏋️', 'Deltoides anterior, lateral e posterior', 3),
('biceps',     'Biceps',     'Bíceps',       '💪', 'Bíceps braquial e braquial', 4),
('triceps',    'Triceps',    'Tríceps',      '💪', 'Tríceps braquial (cabeça longa, lateral, medial)', 5),
('forearms',   'Forearms',   'Antebraços',   '🤝', 'Flexores e extensores do punho', 6),
('quadriceps', 'Quadriceps', 'Quadríceps',   '🦵', 'Reto femoral, vasto lateral, medial e intermédio', 7),
('hamstrings', 'Hamstrings', 'Posteriores',  '🦵', 'Bíceps femoral, semitendíneo, semimembranáceo', 8),
('glutes',     'Glutes',     'Glúteos',      '🍑', 'Glúteo máximo, médio e mínimo', 9),
('calves',     'Calves',     'Panturrilhas', '🦵', 'Gastrocnêmio e sóleo', 10),
('abs',        'Abs',        'Abdominais',   '🔥', 'Reto abdominal, oblíquos, transverso', 11),
('traps',      'Traps',      'Trapézio',     '🔙', 'Trapézio superior, médio e inferior', 12),
('core',       'Core',       'Core',         '🎯', 'Estabilizadores centrais do corpo', 13),
('full-body',  'Full Body',  'Corpo Inteiro','⚡', 'Exercícios compostos multi-articulares', 14);

-- =====================
-- EQUIPMENT TYPES
-- =====================
INSERT INTO equipment_types (id, name, name_pt, icon_svg, display_order) VALUES
('barbell',       'Barbell',         'Barra Reta',       '🏋️', 1),
('dumbbell',      'Dumbbell',        'Halter',            '🏋️', 2),
('cable',         'Cable Machine',   'Crossover/Cabo',   '⚙️', 3),
('machine',       'Machine',         'Máquina',           '🏗️', 4),
('bodyweight',    'Bodyweight',      'Peso Corporal',    '🧘', 5),
('kettlebell',    'Kettlebell',      'Kettlebell',        '🔔', 6),
('resistance-band','Resistance Band','Elástico',          '🎗️', 7),
('smith-machine', 'Smith Machine',   'Smith Machine',    '🏗️', 8),
('ez-bar',        'EZ Bar',          'Barra W',          '🏋️', 9),
('pull-up-bar',   'Pull-Up Bar',     'Barra Fixa',       '🔝', 10),
('bench',         'Bench',           'Banco',             '🪑', 11),
('trx',           'TRX/Suspension',  'TRX/Suspensão',    '🪢', 12),
('medicine-ball', 'Medicine Ball',   'Medicine Ball',    '⚽', 13),
('box',           'Plyo Box',        'Caixa Pliométrica','📦', 14),
('foam-roller',   'Foam Roller',     'Rolo de Espuma',   '🧻', 15),
('none',          'No Equipment',    'Sem Equipamento',  '✋', 16);

-- =====================
-- SERIES TYPES
-- =====================
INSERT INTO series_types (id, name, name_pt, description, icon_svg) VALUES
('bi-set',      'Bi-Set',      'Bi-Set',      'Dois exercícios consecutivos sem descanso', '2️⃣'),
('tri-set',     'Tri-Set',     'Tri-Set',     'Três exercícios consecutivos sem descanso', '3️⃣'),
('drop-set',    'Drop Set',    'Drop Set',    'Redução de carga e continuação até falha', '⬇️'),
('super-set',   'Super Set',   'Super Set',   'Exercícios de músculos antagonistas', '🔄'),
('circuit',     'Circuit',     'Circuito',    'Múltiplos exercícios em rotação com descanso mínimo', '🔁'),
('rest-pause',  'Rest-Pause',  'Rest-Pause',  'Pausas curtas (10-15s) durante a série', '⏸️'),
('progressive', 'Progressive', 'Progressivo', 'Aumento de carga a cada série', '📈'),
('giant-set',   'Giant Set',   'Giant Set',   'Quatro ou mais exercícios consecutivos', '🦍'),
('pyramid',     'Pyramid',     'Pirâmide',    'Variação de carga em pirâmide crescente/decrescente', '🔺'),
('21s',         '21s',         '21s',         'Amplitude parcial: 7 baixo + 7 cima + 7 completa', '2️⃣1️⃣'),
('cluster',     'Cluster Set', 'Cluster Set', 'Séries com pausas intra-série (15-30s)', '🫧'),
('emom',        'EMOM',        'EMOM',        'Every Minute On the Minute', '⏱️'),
('amrap',       'AMRAP',       'AMRAP',       'As Many Reps As Possible no tempo definido', '💯');

-- =====================
-- EXERCISES - PEITO (CHEST)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-chest-001', 'Barbell Bench Press',       'Supino Reto com Barra',           'chest', 'Exercício composto principal para desenvolvimento do peitoral maior. Deitar no banco, pés firmes no chão, descer a barra até o peito e empurrar.', 'beginner', '["barbell","bench"]'),
('ex-chest-002', 'Incline Barbell Press',     'Supino Inclinado com Barra',      'chest', 'Foco no peitoral superior. Banco inclinado a 30-45°, mesma mecânica do supino reto.', 'beginner', '["barbell","bench"]'),
('ex-chest-003', 'Decline Barbell Press',     'Supino Declinado com Barra',      'chest', 'Enfatiza a porção inferior do peitoral. Banco declinado a 15-30°.', 'intermediate', '["barbell","bench"]'),
('ex-chest-004', 'Dumbbell Bench Press',      'Supino Reto com Halteres',        'chest', 'Maior amplitude de movimento que a barra. Permite ajuste individual de cada lado.', 'beginner', '["dumbbell","bench"]'),
('ex-chest-005', 'Incline Dumbbell Press',    'Supino Inclinado com Halteres',   'chest', 'Peitoral superior com halteres. Maior amplitude e ativação de estabilizadores.', 'beginner', '["dumbbell","bench"]'),
('ex-chest-006', 'Cable Fly',                 'Crucifixo no Crossover',          'chest', 'Isolamento do peitoral com tensão constante. Cruzar os cabos na frente do corpo.', 'intermediate', '["cable"]'),
('ex-chest-007', 'Dumbbell Fly',              'Crucifixo com Halteres',          'chest', 'Isolamento clássico do peitoral. Braços levemente flexionados durante todo o movimento.', 'beginner', '["dumbbell","bench"]'),
('ex-chest-008', 'Push-Up',                   'Flexão de Braço',                 'chest', 'Exercício corporal fundamental. Mãos na largura dos ombros, corpo reto como prancha.', 'beginner', '["bodyweight"]'),
('ex-chest-009', 'Machine Chest Press',       'Supino na Máquina',               'chest', 'Boa opção para iniciantes. Movimento guiado que isola o peitoral com segurança.', 'beginner', '["machine"]'),
('ex-chest-010', 'Dips (Chest)',              'Paralelas (Foco Peito)',          'chest', 'Inclinar o tronco para frente para enfatizar peitoral. Avançado com carga corporal.', 'intermediate', '["bodyweight"]');

-- =====================
-- EXERCISES - COSTAS (BACK)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-back-001', 'Barbell Row',                'Remada Curvada com Barra',        'back', 'Exercício composto principal para costas. Tronco a ~45°, puxar a barra até o abdômen.', 'intermediate', '["barbell"]'),
('ex-back-002', 'Pull-Up',                    'Barra Fixa (Pegada Pronada)',     'back', 'Exercício corporal rei das costas. Pegada pronada, puxar até o queixo passar a barra.', 'intermediate', '["pull-up-bar"]'),
('ex-back-003', 'Lat Pulldown',               'Puxada Frontal na Polia',         'back', 'Alternativa à barra fixa. Puxar a barra até a clavícula com controle.', 'beginner', '["cable"]'),
('ex-back-004', 'Seated Cable Row',           'Remada Sentada no Cabo',          'back', 'Foco em latíssimo e romboides. Manter postura ereta, puxar o triângulo até o abdômen.', 'beginner', '["cable"]'),
('ex-back-005', 'Single-Arm Dumbbell Row',    'Remada Unilateral com Halter',    'back', 'Corrige desequilíbrios. Apoiar joelho e mão no banco, remar o halter até o quadril.', 'beginner', '["dumbbell","bench"]'),
('ex-back-006', 'T-Bar Row',                  'Remada Cavalinho (T-Bar)',        'back', 'Excelente para espessura das costas. Variação da remada com barra em V.', 'intermediate', '["barbell"]'),
('ex-back-007', 'Deadlift',                   'Levantamento Terra',              'back', 'Exercício composto máximo. Trabalha posterior inteiro, core e costas.', 'advanced', '["barbell"]'),
('ex-back-008', 'Face Pull',                  'Face Pull na Polia',              'back', 'Saúde do ombro e postura. Puxar a corda até o rosto, rotação externa.', 'beginner', '["cable"]'),
('ex-back-009', 'Chin-Up',                    'Barra Fixa (Pegada Supinada)',    'back', 'Variação que recruta mais bíceps. Pegada supinada, subir até queixo sobre a barra.', 'intermediate', '["pull-up-bar"]'),
('ex-back-010', 'Hyperextension',             'Hiperextensão Lombar',            'back', 'Fortalecimento dos eretores da espinha. Subir o tronco até alinhamento neutro.', 'beginner', '["machine"]');

-- =====================
-- EXERCISES - OMBROS (SHOULDERS)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-shoulders-001', 'Overhead Press',            'Desenvolvimento com Barra',        'shoulders', 'Exercício composto principal para deltoides. Empurrar a barra acima da cabeça.', 'intermediate', '["barbell"]'),
('ex-shoulders-002', 'Dumbbell Shoulder Press',   'Desenvolvimento com Halteres',     'shoulders', 'Versão com halteres permitindo maior amplitude e ativação de estabilizadores.', 'beginner', '["dumbbell"]'),
('ex-shoulders-003', 'Lateral Raise',             'Elevação Lateral',                 'shoulders', 'Isolamento do deltoide lateral. Elevar halteres até altura dos ombros.', 'beginner', '["dumbbell"]'),
('ex-shoulders-004', 'Front Raise',               'Elevação Frontal',                 'shoulders', 'Isolamento do deltoide anterior. Elevar halteres à frente até altura dos ombros.', 'beginner', '["dumbbell"]'),
('ex-shoulders-005', 'Reverse Fly',               'Crucifixo Inverso',                'shoulders', 'Deltoide posterior. Tronco inclinado, abrir braços lateralmente.', 'beginner', '["dumbbell"]'),
('ex-shoulders-006', 'Arnold Press',              'Arnold Press',                     'shoulders', 'Rotação durante a subida. Trabalha as 3 porções do deltoide.', 'intermediate', '["dumbbell"]'),
('ex-shoulders-007', 'Upright Row',               'Remada Alta',                      'shoulders', 'Trapézio e deltoide lateral. Puxar barra/halteres até o queixo rente ao corpo.', 'intermediate', '["barbell"]'),
('ex-shoulders-008', 'Cable Lateral Raise',       'Elevação Lateral no Cabo',         'shoulders', 'Tensão constante no deltoide lateral. Unilateral com cabo baixo.', 'beginner', '["cable"]');

-- =====================
-- EXERCISES - BÍCEPS (BICEPS)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-biceps-001', 'Barbell Curl',             'Rosca Direta com Barra',          'biceps', 'Exercício clássico de bíceps. Cotovelos fixos, flexionar os braços.', 'beginner', '["barbell"]'),
('ex-biceps-002', 'Dumbbell Curl',            'Rosca Alternada com Halteres',    'biceps', 'Rosca alternada para corrigir desequilíbrios. Supinação no topo.', 'beginner', '["dumbbell"]'),
('ex-biceps-003', 'Hammer Curl',              'Rosca Martelo',                   'biceps', 'Pegada neutra que enfatiza braquial e braquiorradial.', 'beginner', '["dumbbell"]'),
('ex-biceps-004', 'Preacher Curl',            'Rosca Scott',                     'biceps', 'Isolamento máximo com apoio no banco Scott. Evita compensação.', 'beginner', '["ez-bar"]'),
('ex-biceps-005', 'Concentration Curl',       'Rosca Concentrada',               'biceps', 'Sentado, cotovelo apoiado na coxa. Foco na contração de pico.', 'beginner', '["dumbbell"]'),
('ex-biceps-006', 'Cable Curl',               'Rosca no Cabo',                   'biceps', 'Tensão constante durante todo o movimento. Ótima para séries finais.', 'beginner', '["cable"]'),
('ex-biceps-007', 'Incline Dumbbell Curl',    'Rosca Inclinada com Halteres',    'biceps', 'Banco inclinado a 45°. Maior estiramento do bíceps na fase excêntrica.', 'intermediate', '["dumbbell","bench"]'),
('ex-biceps-008', 'EZ Bar Curl',              'Rosca com Barra W',               'biceps', 'Reduz estresse no punho comparado à barra reta. Boa ergonomia.', 'beginner', '["ez-bar"]');

-- =====================
-- EXERCISES - TRÍCEPS (TRICEPS)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-triceps-001', 'Close-Grip Bench Press',   'Supino Pegada Fechada',           'triceps', 'Exercício composto para tríceps. Mãos na largura dos ombros no supino.', 'intermediate', '["barbell","bench"]'),
('ex-triceps-002', 'Tricep Pushdown',          'Tríceps na Polia (Barra)',        'triceps', 'Isolamento com tensão constante. Empurrar a barra para baixo.', 'beginner', '["cable"]'),
('ex-triceps-003', 'Rope Pushdown',            'Tríceps na Polia (Corda)',        'triceps', 'Versão com corda que permite abrir na fase final para maior contração.', 'beginner', '["cable"]'),
('ex-triceps-004', 'Overhead Tricep Extension','Extensão de Tríceps Acima da Cabeça','triceps', 'Foco na cabeça longa do tríceps. Halter ou corda acima da cabeça.', 'beginner', '["dumbbell"]'),
('ex-triceps-005', 'Skull Crusher',            'Tríceps Testa (Skull Crusher)',   'triceps', 'Deitar no banco, descer a barra até a testa e estender. Cabeça longa e medial.', 'intermediate', '["ez-bar","bench"]'),
('ex-triceps-006', 'Dips (Triceps)',           'Paralelas (Foco Tríceps)',        'triceps', 'Tronco ereto para enfatizar tríceps. Corpo perpendicular ao chão.', 'intermediate', '["bodyweight"]'),
('ex-triceps-007', 'Kickback',                 'Tríceps Kickback',                'triceps', 'Inclinado, estender o braço para trás. Foco na contração final.', 'beginner', '["dumbbell"]'),
('ex-triceps-008', 'Diamond Push-Up',          'Flexão Diamante',                 'triceps', 'Mãos juntas formando diamante. Excelente para tríceps com peso corporal.', 'intermediate', '["bodyweight"]');

-- =====================
-- EXERCISES - QUADRÍCEPS (QUADRICEPS)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-quads-001', 'Barbell Squat',             'Agachamento com Barra',           'quadriceps', 'Rei dos exercícios. Barra nas costas, agachar até paralelo ou abaixo.', 'intermediate', '["barbell"]'),
('ex-quads-002', 'Front Squat',               'Agachamento Frontal',             'quadriceps', 'Barra na frente dos ombros. Maior ativação de quadríceps e core.', 'advanced', '["barbell"]'),
('ex-quads-003', 'Leg Press',                 'Leg Press 45°',                   'quadriceps', 'Prensa de pernas na máquina. Pés na plataforma, empurrar controlado.', 'beginner', '["machine"]'),
('ex-quads-004', 'Leg Extension',             'Cadeira Extensora',               'quadriceps', 'Isolamento puro de quadríceps. Estender as pernas contra a resistência.', 'beginner', '["machine"]'),
('ex-quads-005', 'Bulgarian Split Squat',     'Agachamento Búlgaro',             'quadriceps', 'Unilateral com pé traseiro elevado. Excelente para equilíbrio e correção.', 'intermediate', '["dumbbell","bench"]'),
('ex-quads-006', 'Walking Lunge',             'Avanço Caminhando',               'quadriceps', 'Avanços contínuos caminhando. Funcional e trabalha equilíbrio.', 'beginner', '["dumbbell"]'),
('ex-quads-007', 'Hack Squat',                'Hack Squat na Máquina',           'quadriceps', 'Agachamento guiado na máquina. Foco em quadríceps com segurança.', 'beginner', '["machine"]'),
('ex-quads-008', 'Goblet Squat',              'Agachamento Goblet',              'quadriceps', 'Halter na frente do peito. Ideal para iniciantes aprenderem mecânica.', 'beginner', '["dumbbell"]');

-- =====================
-- EXERCISES - POSTERIORES (HAMSTRINGS)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-hams-001', 'Romanian Deadlift',          'Stiff (Levantamento Terra Romeno)','hamstrings', 'Pernas levemente flexionadas, descer a barra até meio da canela sentindo o posterior.', 'intermediate', '["barbell"]'),
('ex-hams-002', 'Lying Leg Curl',             'Mesa Flexora',                    'hamstrings', 'Deitado, flexionar as pernas contra a resistência. Isolamento de isquiotibiais.', 'beginner', '["machine"]'),
('ex-hams-003', 'Seated Leg Curl',            'Cadeira Flexora',                 'hamstrings', 'Sentado, flexionar as pernas. Diferente ativação comparada à mesa.', 'beginner', '["machine"]'),
('ex-hams-004', 'Good Morning',               'Good Morning',                    'hamstrings', 'Barra nas costas, inclinar o tronco à frente mantendo costas retas.', 'intermediate', '["barbell"]'),
('ex-hams-005', 'Single-Leg RDL',             'Stiff Unilateral',                'hamstrings', 'Versão unilateral do stiff. Corrige desequilíbrios e melhora estabilidade.', 'intermediate', '["dumbbell"]'),
('ex-hams-006', 'Nordic Hamstring Curl',      'Nordic Curl',                     'hamstrings', 'Exercício excêntrico avançado para prevenção de lesões. Apenas peso corporal.', 'advanced', '["bodyweight"]');

-- =====================
-- EXERCISES - GLÚTEOS (GLUTES)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-glutes-001', 'Hip Thrust',               'Elevação de Quadril (Hip Thrust)','glutes', 'Principal exercício para glúteo máximo. Costas apoiadas no banco, elevar o quadril.', 'intermediate', '["barbell","bench"]'),
('ex-glutes-002', 'Barbell Hip Thrust',       'Hip Thrust com Barra',            'glutes', 'Versão com barra para progressão de carga. Squeeze no topo.', 'intermediate', '["barbell","bench"]'),
('ex-glutes-003', 'Cable Kickback',           'Glúteo no Cabo (Kickback)',       'glutes', 'Extensão de quadril no cabo. Isolar cada lado do glúteo.', 'beginner', '["cable"]'),
('ex-glutes-004', 'Sumo Deadlift',            'Levantamento Terra Sumo',         'glutes', 'Pegada larga, pés abertos. Maior ativação de glúteos e adutores.', 'intermediate', '["barbell"]'),
('ex-glutes-005', 'Glute Bridge',             'Ponte de Glúteo',                 'glutes', 'Deitado no chão, elevar quadril. Base para hip thrust.', 'beginner', '["bodyweight"]'),
('ex-glutes-006', 'Step-Up',                  'Step-Up (Subida no Banco)',       'glutes', 'Subir e descer do banco com uma perna. Funcional e eficiente.', 'beginner', '["dumbbell","box"]');

-- =====================
-- EXERCISES - PANTURRILHAS (CALVES)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-calves-001', 'Standing Calf Raise',      'Panturrilha em Pé na Máquina',    'calves', 'Foco no gastrocnêmio. Elevar na ponta dos pés contra a resistência.', 'beginner', '["machine"]'),
('ex-calves-002', 'Seated Calf Raise',        'Panturrilha Sentado',             'calves', 'Foco no sóleo. Joelhos flexionados a 90°, elevar na ponta dos pés.', 'beginner', '["machine"]'),
('ex-calves-003', 'Donkey Calf Raise',        'Panturrilha no Leg Press',        'calves', 'Usar a plataforma do leg press para amplitude máxima.', 'beginner', '["machine"]'),
('ex-calves-004', 'Single-Leg Calf Raise',    'Panturrilha Unilateral',          'calves', 'Uma perna de cada vez para corrigir desequilíbrios.', 'beginner', '["bodyweight"]');

-- =====================
-- EXERCISES - ABDOMINAIS (ABS)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-abs-001', 'Crunch',                      'Abdominal Crunch',                'abs', 'Exercício básico de abdômen. Flexionar tronco elevando ombros do chão.', 'beginner', '["bodyweight"]'),
('ex-abs-002', 'Plank',                       'Prancha Isométrica',              'abs', 'Manter posição de prancha por tempo determinado. Core inteiro ativado.', 'beginner', '["bodyweight"]'),
('ex-abs-003', 'Hanging Leg Raise',           'Elevação de Pernas na Barra',     'abs', 'Pendurado na barra, elevar pernas até 90°. Abdômen inferior.', 'intermediate', '["pull-up-bar"]'),
('ex-abs-004', 'Cable Crunch',                'Abdominal no Cabo',               'abs', 'Ajoelhado, flexionar tronco contra resistência do cabo.', 'beginner', '["cable"]'),
('ex-abs-005', 'Russian Twist',               'Rotação Russa',                   'abs', 'Sentado, rotar tronco lado a lado. Foco em oblíquos.', 'beginner', '["bodyweight"]'),
('ex-abs-006', 'Ab Wheel Rollout',            'Roda Abdominal',                  'abs', 'Rolar a roda para frente e voltar. Extremamente eficaz para core inteiro.', 'advanced', '["none"]'),
('ex-abs-007', 'Mountain Climber',            'Escalador (Mountain Climber)',    'abs', 'Posição de prancha, alternar joelhos ao peito rapidamente. Cardio + abdômen.', 'beginner', '["bodyweight"]'),
('ex-abs-008', 'Leg Raise',                   'Elevação de Pernas Deitado',      'abs', 'Deitado, elevar pernas retas até 90° e descer controlado.', 'beginner', '["bodyweight"]');

-- =====================
-- EXERCISES - ANTEBRAÇOS (FOREARMS)
-- =====================
INSERT INTO exercises (id, name, name_pt, muscle_group_id, description_pt, difficulty, equipment_needed) VALUES
('ex-forearms-001', 'Wrist Curl',             'Rosca de Punho (Flexão)',         'forearms', 'Apoiar antebraço no banco, flexionar punho com halter. Flexores.', 'beginner', '["dumbbell"]'),
('ex-forearms-002', 'Reverse Wrist Curl',     'Rosca de Punho (Extensão)',       'forearms', 'Apoiar antebraço no banco, estender punho com halter. Extensores.', 'beginner', '["dumbbell"]'),
('ex-forearms-003', 'Farmer Walk',            'Caminhada do Fazendeiro',         'forearms', 'Segurar halteres pesados e caminhar. Grip e estabilizadores.', 'beginner', '["dumbbell"]');

-- =====================
-- WORKOUT TEMPLATES
-- =====================
INSERT INTO workout_templates (id, name, name_pt, description, category, difficulty, template_data, is_default) VALUES
(
  'tpl-hipertrofia-push-pull-legs',
  'Push Pull Legs - Hypertrophy',
  'Push Pull Legs - Hipertrofia',
  'Treino clássico de 6 dias dividido em Push (peito/ombro/tríceps), Pull (costas/bíceps) e Legs (pernas/glúteos). Ideal para hipertrofia intermediária a avançada.',
  'hipertrofia',
  'intermediate',
  '{"split":"PPL","days_per_week":6,"sessions":[{"day":"Push A","focus":["chest","shoulders","triceps"],"exercises":["ex-chest-001","ex-chest-005","ex-shoulders-002","ex-shoulders-003","ex-triceps-002","ex-triceps-004"]},{"day":"Pull A","focus":["back","biceps"],"exercises":["ex-back-002","ex-back-004","ex-back-008","ex-biceps-001","ex-biceps-003"]},{"day":"Legs A","focus":["quadriceps","hamstrings","glutes","calves"],"exercises":["ex-quads-001","ex-quads-004","ex-hams-001","ex-glutes-001","ex-calves-001"]}]}',
  1
),
(
  'tpl-hipertrofia-upper-lower',
  'Upper Lower Split',
  'Superior Inferior',
  'Treino 4x por semana alternando membros superiores e inferiores. Boa frequência para intermediários.',
  'hipertrofia',
  'intermediate',
  '{"split":"Upper/Lower","days_per_week":4,"sessions":[{"day":"Upper A","focus":["chest","back","shoulders","biceps","triceps"],"exercises":["ex-chest-001","ex-back-003","ex-shoulders-002","ex-biceps-002","ex-triceps-002"]},{"day":"Lower A","focus":["quadriceps","hamstrings","glutes","calves"],"exercises":["ex-quads-001","ex-hams-001","ex-glutes-001","ex-calves-001","ex-abs-002"]}]}',
  1
),
(
  'tpl-emagrecimento-circuito',
  'Fat Loss Circuit',
  'Circuito para Emagrecimento',
  'Treino em circuito de corpo inteiro com descanso mínimo. Ideal para perda de gordura mantendo massa muscular.',
  'emagrecimento',
  'beginner',
  '{"split":"Full Body Circuit","days_per_week":3,"sessions":[{"day":"Circuito A","focus":["full-body"],"exercises":["ex-quads-006","ex-chest-008","ex-back-003","ex-shoulders-003","ex-abs-007","ex-glutes-005"],"rest_between":"30s","rounds":3}]}',
  1
),
(
  'tpl-funcional-fullbody',
  'Functional Full Body',
  'Funcional Corpo Inteiro',
  'Treino funcional com movimentos compostos e multiarticulares. Foco em funcionalidade e performance.',
  'funcional',
  'beginner',
  '{"split":"Full Body","days_per_week":3,"sessions":[{"day":"Full Body A","focus":["full-body","core"],"exercises":["ex-quads-001","ex-back-007","ex-shoulders-001","ex-glutes-004","ex-abs-002","ex-forearms-003"]}]}',
  1
),
(
  'tpl-iniciante-adaptacao',
  'Beginner Adaptation',
  'Adaptação para Iniciantes',
  'Programa de 4 semanas para quem está começando. Foco em aprendizado motor e adaptação neuromuscular. 3x por semana, corpo inteiro.',
  'adaptacao',
  'beginner',
  '{"split":"Full Body","days_per_week":3,"duration_weeks":4,"sessions":[{"day":"Treino A","focus":["chest","back","quadriceps","abs"],"exercises":["ex-chest-009","ex-back-003","ex-quads-003","ex-abs-001","ex-calves-001"]},{"day":"Treino B","focus":["shoulders","biceps","triceps","hamstrings","glutes"],"exercises":["ex-shoulders-002","ex-biceps-002","ex-triceps-002","ex-hams-002","ex-glutes-005"]}]}',
  1
),
(
  'tpl-hipertrofia-abc',
  'ABC Split - 3 Days',
  'ABC - 3 Dias Hipertrofia',
  'Divisão clássica ABC: A (Peito/Tríceps), B (Costas/Bíceps), C (Pernas/Ombros). 3-6x por semana.',
  'hipertrofia',
  'beginner',
  '{"split":"ABC","days_per_week":3,"sessions":[{"day":"A - Peito/Tríceps","focus":["chest","triceps"],"exercises":["ex-chest-001","ex-chest-005","ex-chest-006","ex-triceps-002","ex-triceps-005"]},{"day":"B - Costas/Bíceps","focus":["back","biceps"],"exercises":["ex-back-002","ex-back-001","ex-back-004","ex-biceps-001","ex-biceps-003"]},{"day":"C - Pernas/Ombros","focus":["quadriceps","hamstrings","glutes","shoulders","calves"],"exercises":["ex-quads-001","ex-hams-001","ex-glutes-001","ex-shoulders-002","ex-calves-001"]}]}',
  1
);
