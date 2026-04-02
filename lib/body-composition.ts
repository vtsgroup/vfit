/**
 * lib/body-composition.ts
 *
 * Body Composition — Motor de Cálculo Completo
 *
 * Exports: AssessmentInput, BodyCompositionResult, calculateBodyComposition, EvolutionDiff, AssessmentEvolution
 */

// ============================================
// Body Composition — Motor de Cálculo Completo
// VFIT — v2.0
//
// Recebe dados brutos da avaliação e retorna
// TODOS os indicadores calculados e classificados.
// ============================================

import {
  type Gender,
  type ProtocolId,
  type SkinfoldData,
  type DensityFormula,
  type ActivityLevel,
  type BMIResult,
  type FatClassificationResult,
  type WHRResult,
  type WaistRiskResult,
  type SomatotypeResult,
  type FatPercentageResult,
  type FFMIResult,
  calculateFatPercentage,
  calculateBMI,
  classifyBMI,
  classifyFatPercentage,
  calculateWHR,
  classifyWHR,
  classifyWaistRisk,
  calculateIdealWeight,
  calculateBMR,
  calculateTDEE,
  calculateMuscleMass,
  calculateBoneMass,
  calculateResidualMass,
  classifySomatotype,
  calculateFFMI,
} from './assessment-formulas'

// ============================================
// INPUT — Dados da Avaliação
// ============================================

export interface AssessmentInput {
  // Dados obrigatórios
  weightKg: number
  heightCm: number
  age: number
  gender: Gender

  // Protocolo de dobras
  protocol: ProtocolId
  skinfolds?: SkinfoldData
  densityFormula?: DensityFormula    // padrão: 'siri'
  directFatPercentage?: number       // para bioimpedância

  // Perímetros (opcionais)
  waistCm?: number
  hipCm?: number

  // Para massa óssea precisa (opcionais)
  wristDiameterCm?: number
  femurDiameterCm?: number

  // Para TDEE (opcional)
  activityLevel?: ActivityLevel

  // Bioimpedância — dados diretos (opcionais)
  bioimpedance?: {
    fatPercentage?: number
    muscleMassKg?: number
    boneMassKg?: number
    waterPercentage?: number
    visceralFatLevel?: number
    metabolicAge?: number
    basalMetabolicRate?: number
  }
}

// ============================================
// OUTPUT — Resultado Completo
// ============================================

export interface BodyCompositionResult {
  // Protocolo utilizado
  protocol: ProtocolId
  densityFormula: DensityFormula | 'direct'

  // Gordura corporal
  bodyDensity: number | null
  fatPercentage: number
  fatMassKg: number
  fatClassification: FatClassificationResult
  sumOfSkinfolds: number | null

  // Massa magra
  leanMassKg: number
  leanMassPercentage: number

  // Massa muscular
  muscleMassKg: number
  muscleMassPercentage: number

  // Massa óssea
  boneMassKg: number
  boneMassPercentage: number

  // Massa residual
  residualMassKg: number
  residualMassPercentage: number

  // IMC
  bmi: BMIResult

  // FFMI — Fat-Free Mass Index
  ffmi: FFMIResult

  // Peso ideal
  idealWeightKg: number
  weightToLoseKg: number        // positivo = precisa perder
  weightToGainMuscleKg: number  // positivo = pode ganhar

  // RCQ (se waist + hip disponíveis)
  whr: WHRResult | null
  waistRisk: WaistRiskResult | null

  // Somatotipo
  somatotype: SomatotypeResult

  // Metabolismo
  basalMetabolicRate: number   // kcal/dia
  totalDailyExpenditure: number // kcal/dia

  // Bioimpedância extras (se disponíveis)
  waterPercentage: number | null
  visceralFatLevel: number | null
  metabolicAge: number | null

  // Meta: gordura ideal
  idealFatPercentage: { min: number; max: number }

  // Timestamp do cálculo
  calculatedAt: string
}

// ============================================
// MOTOR DE CÁLCULO
// ============================================

/**
 * Calcula TODOS os indicadores de composição corporal
 * a partir dos dados brutos da avaliação.
 *
 * @throws Error se dados obrigatórios estiverem faltando
 */
export function calculateBodyComposition(input: AssessmentInput): BodyCompositionResult {
  const {
    weightKg,
    heightCm,
    age,
    gender,
    protocol,
    skinfolds = {},
    densityFormula = 'siri',
    directFatPercentage,
    waistCm,
    hipCm,
    wristDiameterCm,
    femurDiameterCm,
    activityLevel = 'moderate',
    bioimpedance,
  } = input

  // Validações básicas
  if (weightKg <= 0) throw new Error('Peso deve ser > 0')
  if (heightCm <= 0) throw new Error('Altura deve ser > 0')
  if (age <= 0 || age > 120) throw new Error('Idade deve ser entre 1 e 120')

  // === 1. % Gordura ===
  let fatResult: FatPercentageResult

  if (protocol === 'bioimpedance') {
    const bioFat = directFatPercentage ?? bioimpedance?.fatPercentage
    fatResult = calculateFatPercentage(protocol, gender, age, skinfolds, densityFormula, bioFat)
  } else {
    fatResult = calculateFatPercentage(protocol, gender, age, skinfolds, densityFormula)
  }

  const fatPercentage = fatResult.fatPercentage
  const fatMassKg = round(weightKg * fatPercentage / 100, 2)
  const leanMassKg = round(weightKg - fatMassKg, 2)
  const leanMassPercentage = round(100 - fatPercentage, 2)

  // === 2. Classificação de gordura ===
  const fatClassification = classifyFatPercentage(fatPercentage, gender)

  // === 3. IMC ===
  const bmiValue = calculateBMI(weightKg, heightCm)
  const bmi = classifyBMI(bmiValue)

  // === 3b. FFMI ===
  const ffmi = calculateFFMI(leanMassKg, heightCm, gender)

  // === 4. Massa Muscular ===
  let muscleMassKg: number
  if (bioimpedance?.muscleMassKg != null && bioimpedance.muscleMassKg > 0) {
    muscleMassKg = bioimpedance.muscleMassKg
  } else {
    muscleMassKg = calculateMuscleMass(weightKg, heightCm, age, gender)
  }
  const muscleMassPercentage = round((muscleMassKg / weightKg) * 100, 2)

  // === 5. Massa Óssea ===
  let boneMassKg: number
  if (bioimpedance?.boneMassKg != null && bioimpedance.boneMassKg > 0) {
    boneMassKg = bioimpedance.boneMassKg
  } else {
    boneMassKg = calculateBoneMass(heightCm, wristDiameterCm, femurDiameterCm)
  }
  const boneMassPercentage = round((boneMassKg / weightKg) * 100, 2)

  // === 6. Massa Residual ===
  const residualMassKg = calculateResidualMass(weightKg, gender)
  const residualMassPercentage = round((residualMassKg / weightKg) * 100, 2)

  // === 7. Peso Ideal ===
  const idealWeightKg = calculateIdealWeight(heightCm, gender)
  const weightToLoseKg = round(Math.max(0, weightKg - idealWeightKg), 2)

  // Quanto de massa magra pode ganhar (comparação com ideal para atleta)
  const idealLeanMass = round(idealWeightKg * (gender === 'male' ? 0.85 : 0.78), 2)
  const weightToGainMuscleKg = round(Math.max(0, idealLeanMass - leanMassKg), 2)

  // === 8. RCQ ===
  let whr: WHRResult | null = null
  let waistRisk: WaistRiskResult | null = null

  if (waistCm != null && waistCm > 0 && hipCm != null && hipCm > 0) {
    const whrValue = calculateWHR(waistCm, hipCm)
    whr = classifyWHR(whrValue, gender)
  }
  if (waistCm != null && waistCm > 0) {
    waistRisk = classifyWaistRisk(waistCm, gender)
  }

  // === 9. Somatotipo ===
  const somatotype = classifySomatotype(bmiValue, fatPercentage, gender)

  // === 10. Metabolismo ===
  let basalMetabolicRate: number
  if (bioimpedance?.basalMetabolicRate != null && bioimpedance.basalMetabolicRate > 0) {
    basalMetabolicRate = bioimpedance.basalMetabolicRate
  } else {
    basalMetabolicRate = calculateBMR(weightKg, heightCm, age, gender)
  }
  const totalDailyExpenditure = calculateTDEE(basalMetabolicRate, activityLevel)

  // === 11. Extras bioimpedância ===
  const waterPercentage = bioimpedance?.waterPercentage ?? null
  const visceralFatLevel = bioimpedance?.visceralFatLevel ?? null
  const metabolicAge = bioimpedance?.metabolicAge ?? null

  return {
    protocol,
    densityFormula: fatResult.densityFormula,

    bodyDensity: fatResult.bodyDensity,
    fatPercentage,
    fatMassKg,
    fatClassification,
    sumOfSkinfolds: fatResult.sumOfSkinfolds,

    leanMassKg,
    leanMassPercentage,

    muscleMassKg,
    muscleMassPercentage,

    boneMassKg,
    boneMassPercentage,

    residualMassKg,
    residualMassPercentage,

    bmi,

    ffmi,

    idealWeightKg,
    weightToLoseKg,
    weightToGainMuscleKg,

    whr,
    waistRisk,

    somatotype,

    basalMetabolicRate,
    totalDailyExpenditure,

    waterPercentage,
    visceralFatLevel,
    metabolicAge,

    idealFatPercentage: fatClassification.idealRange,

    calculatedAt: new Date().toISOString(),
  }
}

// ============================================
// EVOLUÇÃO — Comparação entre 2 avaliações
// ============================================

export interface EvolutionDiff {
  field: string
  label: string
  previousValue: number
  currentValue: number
  diff: number
  diffPercentage: number
  direction: 'up' | 'down' | 'stable'
  isPositive: boolean  // se a mudança é boa (ex: perder gordura = positivo)
  unit: string
}

export interface AssessmentEvolution {
  currentDate: string
  previousDate: string
  daysBetween: number
  diffs: EvolutionDiff[]
  overallScore: number  // 0-100 score de progresso
}

interface EvolutionInput {
  currentDate: string
  previousDate: string
  current: BodyCompositionResult
  previous: BodyCompositionResult
}

/**
 * Calcula a evolução entre 2 avaliações.
 * Retorna diffs para cada indicador com direção e se a mudança é positiva.
 */
export function calculateEvolution(input: EvolutionInput): AssessmentEvolution {
  const { current, previous, currentDate, previousDate } = input

  const daysBetween = Math.round(
    (new Date(currentDate).getTime() - new Date(previousDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  const diffs: EvolutionDiff[] = []

  // Helper para criar diff
  const addDiff = (
    field: string,
    label: string,
    prev: number | null | undefined,
    curr: number | null | undefined,
    unit: string,
    lowerIsBetter: boolean
  ) => {
    if (prev == null || curr == null) return
    const diff = round(curr - prev, 2)
    const direction: EvolutionDiff['direction'] =
      Math.abs(diff) < 0.01 ? 'stable' : diff > 0 ? 'up' : 'down'
    const isPositive = direction === 'stable' || (lowerIsBetter ? diff < 0 : diff > 0)
    const diffPercentage = prev !== 0 ? round((diff / prev) * 100, 2) : 0

    diffs.push({ field, label, previousValue: prev, currentValue: curr, diff, diffPercentage, direction, isPositive, unit })
  }

  // Peso — diminuir geralmente é bom (mas depende do contexto)
  addDiff('weight', 'Peso', previous.fatMassKg + previous.leanMassKg, current.fatMassKg + current.leanMassKg, 'kg', true)
  // Gordura %
  addDiff('fatPercentage', '% Gordura', previous.fatPercentage, current.fatPercentage, '%', true)
  // Massa Gorda
  addDiff('fatMass', 'Massa Gorda', previous.fatMassKg, current.fatMassKg, 'kg', true)
  // Massa Magra — aumentar é bom
  addDiff('leanMass', 'Massa Magra', previous.leanMassKg, current.leanMassKg, 'kg', false)
  // Massa Muscular
  addDiff('muscleMass', 'Massa Muscular', previous.muscleMassKg, current.muscleMassKg, 'kg', false)
  // IMC
  addDiff('bmi', 'IMC', previous.bmi.value, current.bmi.value, '', true)
  // RCQ
  if (previous.whr && current.whr) {
    addDiff('whr', 'RCQ', previous.whr.value, current.whr.value, '', true)
  }
  // TMB
  addDiff('bmr', 'TMB', previous.basalMetabolicRate, current.basalMetabolicRate, 'kcal', false)

  // Score geral (0-100): quanto mais indicadores "isPositive", melhor
  const positiveCount = diffs.filter((d) => d.isPositive).length
  const overallScore = diffs.length > 0 ? Math.round((positiveCount / diffs.length) * 100) : 50

  return {
    currentDate,
    previousDate,
    daysBetween,
    diffs,
    overallScore,
  }
}

// ============================================
// INTERPRETAÇÃO TEXTUAL
// ============================================

/**
 * Gera texto de interpretação dos resultados para exibição ao aluno.
 * Sem IA — texto baseado em regras.
 */
export function generateInterpretation(
  result: BodyCompositionResult,
  studentName: string,
  evolution?: AssessmentEvolution | null
): string {
  const parts: string[] = []

  // Saudação
  const firstName = studentName.split(' ')[0]

  // % Gordura
  const fatLabel = result.fatClassification.label.toLowerCase()
  parts.push(
    `${firstName}, sua avaliação mostra que você está na faixa **${result.fatClassification.label}** com **${result.fatPercentage}%** de gordura corporal.`
  )

  // Interpretação da gordura
  switch (result.fatClassification.classification) {
    case 'essential':
      parts.push('Atenção: sua gordura está no nível essencial. É importante não reduzir mais para manter a saúde hormonal e metabólica.')
      break
    case 'athlete':
      parts.push('Excelente! Você está no nível de um atleta. Continue mantendo seus treinos e alimentação.')
      break
    case 'fitness':
      parts.push('Ótimo resultado! Você está na faixa fitness, que é considerada saudável e esteticamente agradável.')
      break
    case 'acceptable':
      parts.push('Seu percentual está na faixa aceitável. Com ajustes na dieta e treino, você pode melhorar bastante.')
      break
    case 'obese':
      parts.push('Seu percentual de gordura está elevado. Vamos trabalhar juntos para reduzir esse valor com segurança.')
      break
  }

  // Massa Muscular
  parts.push(
    `Sua massa muscular é de **${result.muscleMassKg} kg** (${result.muscleMassPercentage}% do peso corporal).`
  )

  // Peso Ideal
  if (result.weightToLoseKg > 2) {
    parts.push(
      `Para atingir seu peso ideal de **${result.idealWeightKg} kg**, o foco é perder cerca de **${result.weightToLoseKg} kg** de gordura mantendo sua massa magra.`
    )
  } else if (result.weightToLoseKg <= 2) {
    parts.push(
      `Você está muito próximo do seu peso ideal de **${result.idealWeightKg} kg**. Foque na composição corporal.`
    )
  }

  // IMC
  parts.push(`Seu IMC é **${result.bmi.value}** (${result.bmi.label}).`)

  // RCQ
  if (result.whr) {
    parts.push(`Relação cintura-quadril: **${result.whr.value}** — ${result.whr.label}.`)
  }

  // Metabolismo
  parts.push(
    `Sua taxa metabólica basal é de **${result.basalMetabolicRate} kcal/dia**, com gasto total estimado de **${result.totalDailyExpenditure} kcal/dia**.`
  )

  // Evolução
  if (evolution && evolution.diffs.length > 0) {
    parts.push('')
    parts.push('📈 **Evolução desde a última avaliação:**')

    for (const diff of evolution.diffs) {
      if (diff.direction === 'stable') continue
      const arrow = diff.direction === 'up' ? '↑' : '↓'
      const emoji = diff.isPositive ? '✅' : '⚠️'
      parts.push(
        `${emoji} ${diff.label}: ${diff.previousValue} → ${diff.currentValue} ${diff.unit} (${arrow}${Math.abs(diff.diff)} ${diff.unit})`
      )
    }

    if (evolution.overallScore >= 70) {
      parts.push('\n🎉 **Progresso excelente!** Continue assim!')
    } else if (evolution.overallScore >= 50) {
      parts.push('\n👍 **Progresso bom.** Mantenha a consistência.')
    } else {
      parts.push('\n💪 **Vamos ajustar a rota!** Converse com seu personal sobre os próximos passos.')
    }
  }

  return parts.join('\n')
}

// ============================================
// UTILITÁRIOS DE PERÍMETROS
// ============================================

export interface PerimeterEvolution {
  name: string
  label: string
  previousCm: number | null
  currentCm: number | null
  diffCm: number | null
}

/**
 * Compara perímetros entre 2 avaliações.
 * Aceita medidas no formato measurements JSONB do banco.
 */
export function comparePerimeters(
  current: Record<string, number | undefined>,
  previous: Record<string, number | undefined>
): PerimeterEvolution[] {
  const labels: Record<string, string> = {
    chest: 'Peitoral',
    waist: 'Cintura',
    hips: 'Quadril',
    right_arm: 'Braço (D)',
    left_arm: 'Braço (E)',
    right_thigh: 'Coxa (D)',
    left_thigh: 'Coxa (E)',
    right_calf: 'Panturrilha (D)',
    left_calf: 'Panturrilha (E)',
    shoulders: 'Ombros',
    neck: 'Pescoço',
    right_forearm: 'Antebraço (D)',
    left_forearm: 'Antebraço (E)',
  }

  const allKeys = new Set([...Object.keys(current), ...Object.keys(previous)])
  const result: PerimeterEvolution[] = []

  for (const key of allKeys) {
    const curr = current[key] ?? null
    const prev = previous[key] ?? null
    if (curr == null && prev == null) continue

    result.push({
      name: key,
      label: labels[key] ?? key,
      currentCm: curr,
      previousCm: prev,
      diffCm: curr != null && prev != null ? round(curr - prev, 2) : null,
    })
  }

  return result
}

// ============================================
// UTILITÁRIO
// ============================================

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
