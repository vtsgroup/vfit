/**
 * lib/ai-prompts.ts
 *
 * AI Prompts Otimizados para Replicate
 *
 * Exports: StudentData, StudentBillingData, ExerciseForPrompt, WorkoutGenerationParams, PROMPTS
 */

// ============================================
// AI Prompts Otimizados para Replicate
// ============================================

export interface StudentData {
  id: string
  name: string
  age?: number
  level?: string
  goals?: string[]
  medical_restrictions?: string
  workout_history_summary?: string
  height_cm?: number
  weight_kg?: number
  gender?: string
}

export interface StudentBillingData {
  id: string
  name: string
  pending_amount: number
  days_until_due: number
  last_activity: string
  payment_history_score?: number
}

/** Exercício do D1 para context injection no prompt */
export interface ExerciseForPrompt {
  id: string
  name_pt: string
  muscle_group_id: string
  difficulty: string
  equipment_needed: string
}

export interface WorkoutGenerationParams {
  student: StudentData
  goal: string
  days_per_week?: number
  split_type?: 'abc' | 'upper_lower' | 'push_pull_legs' | 'full_body' | 'auto'
  exercises_available?: ExerciseForPrompt[]
  extra_instructions?: string
}

export const PROMPTS = {
  /**
   * Gera treino personalizado usando exercícios REAIS do banco de dados.
   * Output é compatível com createWorkoutSchema do backend.
   */
  create_workout: (params: WorkoutGenerationParams) => {
    const { student, goal, days_per_week = 3, split_type = 'auto', exercises_available, extra_instructions } = params

    // Agrupar exercícios por grupo muscular para o prompt
    let exerciseContext = ''
    if (exercises_available && exercises_available.length > 0) {
      const grouped = new Map<string, ExerciseForPrompt[]>()
      for (const ex of exercises_available) {
        const group = ex.muscle_group_id
        if (!grouped.has(group)) grouped.set(group, [])
        grouped.get(group)!.push(ex)
      }
      exerciseContext = '\nEXERCÍCIOS DISPONÍVEIS (use APENAS estes IDs):\n'
      for (const [group, exs] of grouped) {
        exerciseContext += `\n[${group}]\n`
        for (const ex of exs) {
          exerciseContext += `  - id: "${ex.id}" | ${ex.name_pt} | ${ex.difficulty} | equip: ${ex.equipment_needed}\n`
        }
      }
    }

    return `Você é um personal trainer certificado (CREF ativo) especialista em prescrição de treinos.

ALUNO:
- Nome: ${student.name}
- Idade: ${student.age || 'Não informada'} anos
- Nível: ${student.level || 'beginner'}
- Sexo: ${student.gender || 'Não informado'}
- Altura: ${student.height_cm || 'N/I'} cm
- Peso: ${student.weight_kg || 'N/I'} kg
- Objetivo: ${goal}
- Restrições médicas: ${student.medical_restrictions || 'Nenhuma'}
- Histórico: ${student.workout_history_summary || 'Sem histórico'}

CONFIGURAÇÃO DO TREINO:
- Dias por semana: ${days_per_week}
- Tipo de divisão: ${split_type === 'auto' ? 'Escolha a melhor divisão para o perfil do aluno' : split_type}
${exerciseContext}
${extra_instructions ? `\nINSTRUÇÕES ADICIONAIS DO PERSONAL:\n${extra_instructions}\n` : ''}
TAREFA:
Crie ${days_per_week} treino(s) de musculação personalizado(s).

REGRAS OBRIGATÓRIAS:
1. Use APENAS os exercise_id listados acima (ex: "ex-chest-001")
2. Cada treino: 6-8 exercícios
3. Comece com compostos (multi-articulares) e termine com isolados
4. Respeite restrições médicas — NUNCA inclua exercícios contraindicados
5. Ajuste carga, séries e reps ao nível do aluno
6. Para iniciantes: 3x12-15 com cargas leves. Para avançados: 4x6-10 com cargas pesadas
7. Descanso: 60-90s para hipertrofia, 120-180s para força, 30-45s para emagrecimento

FORMATO DE SAÍDA (JSON ESTRITO — sem texto fora do JSON):
{
  "workouts": [
    {
      "name": "Treino A — Peito e Tríceps",
      "description": "Foco em empurrar: peito e tríceps com exercícios compostos e isolados",
      "exercises": [
        {
          "exercise_id": "ex-chest-001",
          "sets": 4,
          "reps": "8-12",
          "rest_seconds": 90,
          "load": "moderada",
          "notes": "Manter escápulas retraídas, descida controlada 2s",
          "order_index": 0
        }
      ]
    }
  ]
}

IMPORTANTE:
- Cada workout no array é um dia de treino (A, B, C...)
- O campo "exercise_id" DEVE ser um ID real da lista acima
- O campo "reps" pode ser "8-12", "15", "12-15", "até falha", "30s" (para isometria)
- O campo "load" deve ser: "leve", "moderada", "pesada", "progressiva" ou peso específico como "20kg"
- O campo "notes" é a dica de execução para o aluno
- order_index começa em 0 e incrementa sequencialmente

Retorne APENAS o JSON, sem markdown, sem explicações.`
  },

  /**
   * Analisa fotos antes/depois
   */
  analyze_photos: (beforeUrl: string, afterUrl: string) => `
Analise estas duas fotos de avaliação física:
- Foto ANTES: ${beforeUrl}
- Foto DEPOIS: ${afterUrl}

Calcule:
1. Percentual de mudança visual (0-100%)
2. Grupos musculares mais desenvolvidos
3. Sugestões de foco para próximo ciclo

Formato JSON:
{
  "mudanca_percentual": 25,
  "musculos_desenvolvidos": ["peitoral", "ombros"],
  "areas_a_melhorar": ["pernas", "costas"],
  "resumo": "Ótima evolução na parte superior..."
}
`,

  /**
   * Sugestão inteligente de cobranças
   */
  smart_billing_suggestion: (alunos: StudentBillingData[]) => `
Você é um assistente financeiro de personal trainer.

ALUNOS COM PAGAMENTO PENDENTE:
${alunos.map((a) => `- ${a.name}: R$ ${a.pending_amount}, vence em ${a.days_until_due} dias, última atividade: ${a.last_activity}`).join('\n')}

TAREFA:
Sugira em qual ordem cobrar, considerando:
- Urgência (dias até vencer)
- Valor pendente
- Engajamento recente

Formato JSON:
{
  "ordem_cobranca": [
    {
      "aluno_id": "uuid",
      "aluno_nome": "Nome",
      "prioridade": 1,
      "motivo": "Pagamento vence amanhã e valor alto",
      "melhor_horario": "14:00-16:00",
      "tom_sugerido": "amigável_urgente",
      "mensagem_sugerida": "Texto curto para enviar"
    }
  ]
}
`,

  /**
   * Assistente geral do personal
   */
  assistant: (question: string, context: string) => `
Você é o assistente IA do VFIT, uma plataforma SaaS para personal trainers brasileiros.
Responda de forma clara, objetiva e profissional em português do Brasil.
Seja útil e prático — dê dicas acionáveis sempre que possível.
Se a pergunta envolver dados específicos do personal, use o contexto fornecido.

CONTEXTO DO PERSONAL:
${context}

PERGUNTA DO PERSONAL:
${question}

Responda de forma direta e organizada. Use listas quando fizer sentido.
No final, sugira 1-3 próximos passos práticos se aplicável.
`,

  /**
   * Geração de conteúdo marketing
   */
  content_generation: (type: 'instagram' | 'email' | 'whatsapp', topic: string, personalName: string) => `
Você é um copywriter especialista em marketing fitness.

TIPO DE CONTEÚDO: ${type}
TÓPICO: ${topic}
NOME DO PERSONAL: ${personalName}

${type === 'instagram' ? `
Crie um post de Instagram com:
- Texto principal (máx. 300 chars)
- 5 hashtags relevantes
- CTA (Call to Action)
- Emoji apropriados

Formato JSON:
{
  "texto": "...",
  "hashtags": ["#fitness", ...],
  "cta": "...",
  "melhor_horario_post": "19:00"
}
` : type === 'email' ? `
Crie um email profissional com:
- Assunto
- Corpo do email (HTML simples)
- CTA

Formato JSON:
{
  "assunto": "...",
  "corpo": "...",
  "cta_texto": "...",
  "cta_link": "/..."
}
` : `
Crie uma mensagem WhatsApp curta e amigável.

Formato JSON:
{
  "mensagem": "...",
  "emoji": true
}
`}
`,

  /**
   * Análise de sentimento em feedbacks
   */
  sentiment_analysis: (feedback: string) => `
Analise o sentimento deste feedback de aluno:

"${feedback}"

Formato JSON:
{
  "score": 0.85,
  "sentimento": "positivo",
  "resumo": "Aluno satisfeito com os resultados",
  "pontos_positivos": ["treinos variados"],
  "pontos_negativos": [],
  "alerta": false
}

Score: 0 = muito negativo, 0.5 = neutro, 1 = muito positivo.
alerta = true se detectar insatisfação grave ou intenção de cancelamento.
`,

  /**
   * Análise de avaliação física com feedback motivador
   */
  analyze_assessment: (data: {
    studentName: string
    bmi: number
    weight_kg: number
    height_cm: number
    body_fat_percentage?: number
    muscle_mass_kg?: number
    measurements: Record<string, string | number>
    previousAssessment?: {
      weight_kg: number
      body_fat_percentage?: number
      bmi: number
    }
  }) => {
    const { studentName, bmi, weight_kg, height_cm, body_fat_percentage, muscle_mass_kg, measurements, previousAssessment } = data
    
    const bmiCategory = 
      bmi < 18.5 ? 'abaixo do peso'
      : bmi < 25 ? 'peso ideal'
      : bmi < 30 ? 'sobrepeso'
      : 'obesidade'

    const weightChange = previousAssessment 
      ? weight_kg - previousAssessment.weight_kg 
      : null
    
    const fatChange = previousAssessment && body_fat_percentage && previousAssessment.body_fat_percentage
      ? body_fat_percentage - previousAssessment.body_fat_percentage
      : null

    const evolutionText = previousAssessment
      ? `\nEVOLUÇÃO DESDE ÚLTIMA AVALIAÇÃO:\n- Peso: ${previousAssessment.weight_kg}kg → ${weight_kg}kg (${weightChange! > 0 ? '+' : ''}${weightChange}kg)\n- Gordura corporal: ${previousAssessment.body_fat_percentage ?? 'N/I'}% → ${body_fat_percentage ?? 'N/I'}% (${fatChange! > 0 ? '+' : ''}${fatChange ?? 'N/I'}%)\n- IMC: ${previousAssessment.bmi} → ${bmi}`
      : '\n(Primeira avaliação)'

    return `Você é um personal trainer experiente e motivador, especializado em análise de composição corporal e desenvolvimento pessoal.

DADOS DO ALUNO - ${studentName}:
- Altura: ${height_cm} cm
- Peso: ${weight_kg} kg
- IMC: ${bmi} (${bmiCategory})
- Gordura corporal: ${body_fat_percentage ?? 'Não informada'}%
- Massa muscular: ${muscle_mass_kg ?? 'Não informada'} kg
- Medidas: ${Object.entries(measurements).map(([k, v]) => `${k}: ${v}cm`).join(', ')}${evolutionText}

TAREFA:
Gere um feedback motivador e profissional com 3 seções em JSON:

1. **summary** (1-2 frases): Visão geral do estado físico atual
2. **strengths** (array, 3-4 itens): Pontos positivos, evolução, áreas bem desenvolvidas
3. **improvements** (array, 3-4 itens): Áreas a melhorar, ações específicas sugeridas

REGRAS:
- Seja MOTIVADOR mas realista
- Se melhorou, celebre! Se piorou, seja empático
- Focalize em ação concreta (não genérico)
- Considere o contexto (primeira avaliação vs evolução)
- Linguagem acessível e não técnica demais

Formato esperado (JSON PURO, sem markdown):
{
  "summary": "Excelente progresso! Você está no caminho certo para atingir seu objetivo...",
  "strengths": [
    "Ganho de massa muscular visível em braços e ombros",
    "Redução significativa de gordura abdominal",
    "Consistência nos treinos refletida nos resultados"
  ],
  "improvements": [
    "Foco em ganhar um pouco mais de massa nas coxas",
    "Melhorar flexibilidade de ombro com alongamentos",
    "Aumentar ingestão proteica para potencializar músculos"
  ]
}`
  },

  /**
   * VFIT B2C — Gera plano de treino personalizado baseado no onboarding.
   * Output JSON com dias, exercícios, séries, reps, descanso.
   */
  generate_b2c_plan: (profile: {
    gender: string
    experience_level: string
    training_frequency: string
    goal: string
    training_location: string
    target_muscles: string[]
    age: number
    height_cm: number
    weight_kg: number
    target_weight_kg: number
    days_per_week: number
    session_duration: string
    injuries: string[]
    preferred_time: string
  }) => {
    const durationMinutes: Record<string, number> = {
      quick_15: 15,
      short_30: 30,
      medium_45: 45,
      long_60: 60,
    }
    const mins = durationMinutes[profile.session_duration] || 45

    return `Você é um personal trainer profissional especializado em criar planos de treino personalizados.

PERFIL DO ALUNO:
- Gênero: ${profile.gender}
- Idade: ${profile.age} anos
- Altura: ${profile.height_cm} cm
- Peso atual: ${profile.weight_kg} kg
- Meta de peso: ${profile.target_weight_kg} kg
- Nível: ${profile.experience_level}
- Frequência atual: ${profile.training_frequency}
- Objetivo: ${profile.goal}
- Local de treino: ${profile.training_location}
- Músculos-alvo: ${profile.target_muscles.join(', ')}
- Dias por semana: ${profile.days_per_week}
- Tempo por sessão: ${mins} minutos
- Lesões/restrições: ${profile.injuries.length ? profile.injuries.join(', ') : 'Nenhuma'}
- Horário preferido: ${profile.preferred_time}

REGRAS:
1. Crie EXATAMENTE ${profile.days_per_week} dias de treino
2. Cada dia deve ter entre 4-8 exercícios que caibam em ~${mins} minutos
3. Adapte ao nível: ${profile.experience_level === 'beginner' ? 'menos exercícios, mais descanso, séries menores' : profile.experience_level === 'intermediate' ? 'progressão moderada, técnicas básicas' : 'volume alto, técnicas avançadas (drop-set, super-set)'}
4. Respeite lesões: ${profile.injuries.length ? 'EVITE exercícios que agravem ' + profile.injuries.join(', ') : 'Sem restrições'}
5. Local ${profile.training_location}: use apenas exercícios compatíveis com esse espaço
6. Foque nos músculos-alvo mas mantenha equilíbrio
7. Nomes dos exercícios em português
8. Sugira peso inicial baseado no perfil (kg)

Formato esperado (JSON PURO, sem markdown):
{
  "plan_name": "Nome criativo do plano (ex: 'Força Total 4x')",
  "description": "Descrição breve do plano (1-2 frases)",
  "estimated_calories_per_session": 250,
  "days": [
    {
      "day_number": 1,
      "name": "Peito e Tríceps",
      "focus": "chest_triceps",
      "exercises": [
        {
          "name": "Supino Reto com Barra",
          "muscle_group": "chest",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 90,
          "weight_suggestion_kg": 20,
          "notes": "Controle a descida, 2s excêntrica"
        }
      ]
    }
  ]
}`
  },}
