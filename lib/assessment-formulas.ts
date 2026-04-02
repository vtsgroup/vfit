/**
 * lib/assessment-formulas.ts
 *
 * Assessment Formulas — Protocolos Científicos de Composição Corporal
 *
 * Exports: Gender, ProtocolId, DensityFormula, ProtocolInfo, SkinfoldSite
 */

// ============================================
// Assessment Formulas — Protocolos Científicos de Composição Corporal
// VFIT — v2.0
//
// Referências:
// - Jackson & Pollock (1978, 1980)
// - Petroski (1995) — População Brasileira
// - Deurenberg et al. (1990)
// - Guedes (1985)
// - Faulkner (1968)
// - Siri (1961), Brozek (1963)
// - Lee et al. (2000) — Massa Muscular
// - Von Döbeln/Rocha (1975) — Massa Óssea
// - Wurch (1974) — Massa Residual
// - Mifflin-St Jeor (1990) — TMB
// - Lorentz — Peso Ideal
// - ACE, OMS, ABESO — Classificações
// ============================================

export type Gender = 'male' | 'female'

export type ProtocolId =
  | 'pollock_7'
  | 'pollock_3_male'
  | 'pollock_3_female'
  | 'petroski_7'
  | 'deurenberg'
  | 'guedes_male'
  | 'guedes_female'
  | 'faulkner'
  | 'bioimpedance'

export type DensityFormula = 'siri' | 'brozek'

export interface ProtocolInfo {
  id: ProtocolId
  name: string
  author: string
  year: number
  gender: Gender | 'both'
  skinfoldCount: number
  requiredSkinfolds: SkinfoldSite[]
  description: string
}

export type SkinfoldSite =
  | 'triceps'
  | 'chest'        // peitoral
  | 'axillary'     // axilar média
  | 'subscapular'  // subescapular
  | 'suprailiac'   // supra-ilíaca
  | 'abdominal'
  | 'thigh'        // coxa
  | 'biceps'

export interface SkinfoldData {
  triceps?: number
  chest?: number
  axillary?: number
  subscapular?: number
  suprailiac?: number
  abdominal?: number
  thigh?: number
  biceps?: number
}

// ============================================
// PROTOCOLOS — Metadata
// ============================================

export const PROTOCOLS: Record<ProtocolId, ProtocolInfo> = {
  pollock_7: {
    id: 'pollock_7',
    name: 'Pollock 7 Dobras',
    author: 'Jackson & Pollock',
    year: 1978,
    gender: 'both',
    skinfoldCount: 7,
    requiredSkinfolds: ['chest', 'axillary', 'triceps', 'subscapular', 'abdominal', 'suprailiac', 'thigh'],
    description: 'Protocolo mais completo e preciso. Utiliza 7 dobras cutâneas para estimar a densidade corporal.',
  },
  pollock_3_male: {
    id: 'pollock_3_male',
    name: 'Pollock 3 Dobras (Masculino)',
    author: 'Jackson & Pollock',
    year: 1978,
    gender: 'male',
    skinfoldCount: 3,
    requiredSkinfolds: ['chest', 'abdominal', 'thigh'],
    description: 'Versão simplificada para homens. Usa peitoral, abdominal e coxa.',
  },
  pollock_3_female: {
    id: 'pollock_3_female',
    name: 'Pollock 3 Dobras (Feminino)',
    author: 'Jackson & Pollock',
    year: 1978,
    gender: 'female',
    skinfoldCount: 3,
    requiredSkinfolds: ['triceps', 'suprailiac', 'thigh'],
    description: 'Versão simplificada para mulheres. Usa tríceps, supra-ilíaca e coxa.',
  },
  petroski_7: {
    id: 'petroski_7',
    name: 'Petroski Pop. Brasileira',
    author: 'Petroski',
    year: 1995,
    gender: 'both',
    skinfoldCount: 7,
    requiredSkinfolds: ['chest', 'axillary', 'triceps', 'subscapular', 'abdominal', 'suprailiac', 'thigh'],
    description: 'Adaptação para população brasileira. 7 dobras com fórmula específica para brasileiros.',
  },
  deurenberg: {
    id: 'deurenberg',
    name: 'Deurenberg',
    author: 'Deurenberg et al.',
    year: 1990,
    gender: 'both',
    skinfoldCount: 4,
    requiredSkinfolds: ['triceps', 'suprailiac', 'subscapular', 'biceps'],
    description: 'Protocolo europeu de 4 dobras. Usa tríceps, supra-ilíaca, subescapular e bíceps.',
  },
  guedes_male: {
    id: 'guedes_male',
    name: 'Guedes (Masculino)',
    author: 'Guedes',
    year: 1985,
    gender: 'male',
    skinfoldCount: 3,
    requiredSkinfolds: ['triceps', 'suprailiac', 'abdominal'],
    description: 'Protocolo brasileiro para homens. Usa tríceps, supra-ilíaca e abdominal.',
  },
  guedes_female: {
    id: 'guedes_female',
    name: 'Guedes (Feminino)',
    author: 'Guedes',
    year: 1985,
    gender: 'female',
    skinfoldCount: 3,
    requiredSkinfolds: ['thigh', 'suprailiac', 'subscapular'],
    description: 'Protocolo brasileiro para mulheres. Usa coxa, supra-ilíaca e subescapular.',
  },
  faulkner: {
    id: 'faulkner',
    name: 'Faulkner',
    author: 'Faulkner',
    year: 1968,
    gender: 'both',
    skinfoldCount: 4,
    requiredSkinfolds: ['triceps', 'subscapular', 'suprailiac', 'abdominal'],
    description: 'Protocolo clássico de 4 dobras. Calcula % gordura diretamente, sem densidade.',
  },
  bioimpedance: {
    id: 'bioimpedance',
    name: 'Bioimpedância',
    author: 'Entrada Direta',
    year: 0,
    gender: 'both',
    skinfoldCount: 0,
    requiredSkinfolds: [],
    description: 'Entrada direta dos valores obtidos por balança de bioimpedância.',
  },
}

// ============================================
// CÁLCULO DE DENSIDADE CORPORAL
// ============================================

/**
 * Soma das dobras para um protocolo específico
 */
export function sumSkinfolds(protocol: ProtocolId, data: SkinfoldData): number {
  const required = PROTOCOLS[protocol].requiredSkinfolds
  let sum = 0
  for (const site of required) {
    const value = data[site]
    if (value == null || value <= 0) {
      throw new Error(`Dobra "${site}" é obrigatória para o protocolo ${PROTOCOLS[protocol].name}`)
    }
    sum += value
  }
  return sum
}

/**
 * Calcula densidade corporal usando o protocolo selecionado
 *
 * @returns Densidade corporal (g/cm³) ou null se protocolo for bioimpedância/faulkner
 */
export function calculateBodyDensity(
  protocol: ProtocolId,
  gender: Gender,
  age: number,
  skinfolds: SkinfoldData
): number | null {
  // Faulkner e Bioimpedância não usam densidade
  if (protocol === 'faulkner' || protocol === 'bioimpedance') return null

  const sum = sumSkinfolds(protocol, skinfolds)
  const sumSq = sum * sum

  switch (protocol) {
    // Jackson & Pollock 7 dobras (1978)
    case 'pollock_7': {
      if (gender === 'male') {
        // D = 1.11200000 - 0.00043499(Σ7) + 0.00000055(Σ7)² - 0.00028826(idade)
        return 1.112 - 0.00043499 * sum + 0.00000055 * sumSq - 0.00028826 * age
      }
      // Feminino
      // D = 1.0970 - 0.00046971(Σ7) + 0.00000056(Σ7)² - 0.00012828(idade)
      return 1.097 - 0.00046971 * sum + 0.00000056 * sumSq - 0.00012828 * age
    }

    // Jackson & Pollock 3 dobras Masculino (1978)
    case 'pollock_3_male': {
      // D = 1.10938 - 0.0008267(Σ3) + 0.0000016(Σ3)² - 0.0002574(idade)
      // Σ3 = peitoral + abdominal + coxa
      return 1.10938 - 0.0008267 * sum + 0.0000016 * sumSq - 0.0002574 * age
    }

    // Jackson & Pollock 3 dobras Feminino (1978)
    case 'pollock_3_female': {
      // D = 1.0994921 - 0.0009929(Σ3) + 0.0000023(Σ3)² - 0.0001392(idade)
      // Σ3 = tríceps + supra-ilíaca + coxa
      return 1.0994921 - 0.0009929 * sum + 0.0000023 * sumSq - 0.0001392 * age
    }

    // Petroski População Brasileira (1995)
    case 'petroski_7': {
      if (gender === 'male') {
        // D = 1.10726863 - 0.00081201(Σ7) + 0.00000212(Σ7)² - 0.00041761(idade)
        return 1.10726863 - 0.00081201 * sum + 0.00000212 * sumSq - 0.00041761 * age
      }
      // Feminino: D = 1.19547130 - 0.07513507(log Σ7) - 0.00041072(idade)
      return 1.1954713 - 0.07513507 * Math.log10(sum) - 0.00041072 * age
    }

    // Deurenberg et al. (1990)
    case 'deurenberg': {
      // D = 1.1369 - 0.0598(log Σ4)
      // Σ4 = tríceps + supra-ilíaca + subescapular + bíceps
      return 1.1369 - 0.0598 * Math.log10(sum)
    }

    // Guedes Masculino (1985)
    case 'guedes_male': {
      // D = 1.17136 - 0.06706(log Σ3)
      // Σ3 = tríceps + supra-ilíaca + abdominal
      return 1.17136 - 0.06706 * Math.log10(sum)
    }

    // Guedes Feminino (1985)
    case 'guedes_female': {
      // D = 1.1665 - 0.07063(log Σ3)
      // Σ3 = coxa + supra-ilíaca + subescapular
      return 1.1665 - 0.07063 * Math.log10(sum)
    }

    default:
      return null
  }
}

// ============================================
// CONVERSÃO DENSIDADE → % GORDURA
// ============================================

/**
 * Siri (1961): %G = (4.95 / D - 4.50) × 100
 */
export function densityToFatSiri(density: number): number {
  return round((4.95 / density - 4.5) * 100, 2)
}

/**
 * Brozek (1963): %G = (4.57 / D - 4.142) × 100
 */
export function densityToFatBrozek(density: number): number {
  return round((4.57 / density - 4.142) * 100, 2)
}

/**
 * Converte densidade para % gordura usando a fórmula selecionada
 */
export function densityToFat(density: number, formula: DensityFormula = 'siri'): number {
  return formula === 'brozek' ? densityToFatBrozek(density) : densityToFatSiri(density)
}

// ============================================
// FAULKNER — Cálculo Direto de % Gordura
// ============================================

/**
 * Faulkner (1968): %G = 5.783 + 0.153(TR + SB + SI + AB)
 * Calcula % gordura diretamente, sem passar por densidade
 */
export function faulknerFatPercentage(skinfolds: SkinfoldData): number {
  const { triceps, subscapular, suprailiac, abdominal } = skinfolds
  if (triceps == null || subscapular == null || suprailiac == null || abdominal == null) {
    throw new Error('Faulkner requer: tríceps, subescapular, supra-ilíaca e abdominal')
  }
  const sum = triceps + subscapular + suprailiac + abdominal
  return round(5.783 + 0.153 * sum, 2)
}

// ============================================
// CÁLCULO PRINCIPAL — % Gordura por Protocolo
// ============================================

export interface FatPercentageResult {
  protocol: ProtocolId
  bodyDensity: number | null
  fatPercentage: number
  densityFormula: DensityFormula | 'direct'
  sumOfSkinfolds: number | null
}

/**
 * Calcula % gordura usando qualquer protocolo suportado
 *
 * @param protocol - Protocolo de dobras cutâneas
 * @param gender - Sexo biológico
 * @param age - Idade em anos
 * @param skinfolds - Valores das dobras cutâneas (mm)
 * @param densityFormula - Fórmula de conversão densidade→gordura (padrão: Siri)
 * @param directFatPercentage - % gordura direto (para bioimpedância)
 */
export function calculateFatPercentage(
  protocol: ProtocolId,
  gender: Gender,
  age: number,
  skinfolds: SkinfoldData,
  densityFormula: DensityFormula = 'siri',
  directFatPercentage?: number
): FatPercentageResult {
  // Bioimpedância: valor direto
  if (protocol === 'bioimpedance') {
    if (directFatPercentage == null) {
      throw new Error('Bioimpedância requer % gordura direto')
    }
    return {
      protocol,
      bodyDensity: null,
      fatPercentage: round(directFatPercentage, 2),
      densityFormula: 'direct',
      sumOfSkinfolds: null,
    }
  }

  // Faulkner: cálculo direto (sem densidade)
  if (protocol === 'faulkner') {
    const sum = sumSkinfolds(protocol, skinfolds)
    return {
      protocol,
      bodyDensity: null,
      fatPercentage: faulknerFatPercentage(skinfolds),
      densityFormula: 'direct',
      sumOfSkinfolds: sum,
    }
  }

  // Demais protocolos: densidade → gordura
  const density = calculateBodyDensity(protocol, gender, age, skinfolds)
  if (density == null) {
    throw new Error(`Não foi possível calcular a densidade para o protocolo ${protocol}`)
  }

  const sum = sumSkinfolds(protocol, skinfolds)
  const fat = densityToFat(density, densityFormula)

  // Sanity check
  if (fat < 0 || fat > 70) {
    throw new Error(
      `Resultado de % gordura inválido (${fat}%). Verifique os valores das dobras cutâneas.`
    )
  }

  return {
    protocol,
    bodyDensity: round(density, 7),
    fatPercentage: fat,
    densityFormula,
    sumOfSkinfolds: sum,
  }
}

// ============================================
// IMC
// ============================================

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return round(weightKg / (heightM * heightM), 2)
}

export type BMIClassification =
  | 'underweight_severe'   // < 16
  | 'underweight_moderate' // 16-16.9
  | 'underweight_mild'     // 17-18.4
  | 'normal'               // 18.5-24.9
  | 'overweight'           // 25-29.9
  | 'obese_1'              // 30-34.9
  | 'obese_2'              // 35-39.9
  | 'obese_3'              // ≥ 40

export interface BMIResult {
  value: number
  classification: BMIClassification
  label: string
  color: 'green' | 'yellow' | 'orange' | 'red'
}

const BMI_TABLE: { max: number; classification: BMIClassification; label: string; color: BMIResult['color'] }[] = [
  { max: 16, classification: 'underweight_severe', label: 'Magreza Grau III', color: 'red' },
  { max: 17, classification: 'underweight_moderate', label: 'Magreza Grau II', color: 'orange' },
  { max: 18.5, classification: 'underweight_mild', label: 'Magreza Grau I', color: 'yellow' },
  { max: 25, classification: 'normal', label: 'Normal', color: 'green' },
  { max: 30, classification: 'overweight', label: 'Sobrepeso', color: 'yellow' },
  { max: 35, classification: 'obese_1', label: 'Obesidade Grau I', color: 'orange' },
  { max: 40, classification: 'obese_2', label: 'Obesidade Grau II', color: 'red' },
  { max: Infinity, classification: 'obese_3', label: 'Obesidade Grau III', color: 'red' },
]

export function classifyBMI(bmi: number): BMIResult {
  const entry = BMI_TABLE.find((e) => bmi < e.max) ?? BMI_TABLE[BMI_TABLE.length - 1]
  return { value: round(bmi, 2), ...entry }
}

// ============================================
// % GORDURA — Classificação ACE
// ============================================

export type FatClassification = 'essential' | 'athlete' | 'fitness' | 'acceptable' | 'obese'

export interface FatClassificationResult {
  percentage: number
  classification: FatClassification
  label: string
  color: 'green' | 'yellow' | 'orange' | 'red'
  idealRange: { min: number; max: number }
}

// ACE (American Council on Exercise)
const FAT_TABLE_MALE: { max: number; classification: FatClassification; label: string; color: FatClassificationResult['color'] }[] = [
  { max: 6, classification: 'essential', label: 'Gordura Essencial', color: 'orange' },
  { max: 14, classification: 'athlete', label: 'Atleta', color: 'green' },
  { max: 18, classification: 'fitness', label: 'Fitness', color: 'green' },
  { max: 25, classification: 'acceptable', label: 'Aceitável', color: 'yellow' },
  { max: Infinity, classification: 'obese', label: 'Obesidade', color: 'red' },
]

const FAT_TABLE_FEMALE: { max: number; classification: FatClassification; label: string; color: FatClassificationResult['color'] }[] = [
  { max: 14, classification: 'essential', label: 'Gordura Essencial', color: 'orange' },
  { max: 21, classification: 'athlete', label: 'Atleta', color: 'green' },
  { max: 25, classification: 'fitness', label: 'Fitness', color: 'green' },
  { max: 32, classification: 'acceptable', label: 'Aceitável', color: 'yellow' },
  { max: Infinity, classification: 'obese', label: 'Obesidade', color: 'red' },
]

const IDEAL_FAT_RANGE: Record<Gender, { min: number; max: number }> = {
  male: { min: 10, max: 18 },
  female: { min: 18, max: 25 },
}

export function classifyFatPercentage(fatPercentage: number, gender: Gender): FatClassificationResult {
  const table = gender === 'male' ? FAT_TABLE_MALE : FAT_TABLE_FEMALE
  const entry = table.find((e) => fatPercentage < e.max) ?? table[table.length - 1]
  return {
    percentage: round(fatPercentage, 2),
    ...entry,
    idealRange: IDEAL_FAT_RANGE[gender],
  }
}

// ============================================
// RCQ — Relação Cintura-Quadril
// ============================================

export type WHRClassification = 'low' | 'moderate' | 'high' | 'very_high'

export interface WHRResult {
  value: number
  classification: WHRClassification
  label: string
  color: 'green' | 'yellow' | 'orange' | 'red'
}

// OMS
const WHR_TABLE_MALE: { max: number; classification: WHRClassification; label: string; color: WHRResult['color'] }[] = [
  { max: 0.90, classification: 'low', label: 'Baixo Risco', color: 'green' },
  { max: 0.96, classification: 'moderate', label: 'Risco Moderado', color: 'yellow' },
  { max: 1.0, classification: 'high', label: 'Risco Alto', color: 'orange' },
  { max: Infinity, classification: 'very_high', label: 'Risco Muito Alto', color: 'red' },
]

const WHR_TABLE_FEMALE: { max: number; classification: WHRClassification; label: string; color: WHRResult['color'] }[] = [
  { max: 0.80, classification: 'low', label: 'Baixo Risco', color: 'green' },
  { max: 0.86, classification: 'moderate', label: 'Risco Moderado', color: 'yellow' },
  { max: 0.90, classification: 'high', label: 'Risco Alto', color: 'orange' },
  { max: Infinity, classification: 'very_high', label: 'Risco Muito Alto', color: 'red' },
]

export function calculateWHR(waistCm: number, hipCm: number): number {
  if (hipCm <= 0) throw new Error('Circunferência do quadril deve ser > 0')
  return round(waistCm / hipCm, 3)
}

export function classifyWHR(whr: number, gender: Gender): WHRResult {
  const table = gender === 'male' ? WHR_TABLE_MALE : WHR_TABLE_FEMALE
  const entry = table.find((e) => whr < e.max) ?? table[table.length - 1]
  return { value: whr, ...entry }
}

// ============================================
// RISCO CARDIOVASCULAR POR CINTURA — ABESO
// ============================================

export type WaistRisk = 'normal' | 'elevated' | 'very_elevated'

export interface WaistRiskResult {
  waistCm: number
  classification: WaistRisk
  label: string
  color: 'green' | 'orange' | 'red'
}

export function classifyWaistRisk(waistCm: number, gender: Gender): WaistRiskResult {
  if (gender === 'male') {
    if (waistCm < 94) return { waistCm, classification: 'normal', label: 'Normal', color: 'green' }
    if (waistCm < 102) return { waistCm, classification: 'elevated', label: 'Risco Elevado', color: 'orange' }
    return { waistCm, classification: 'very_elevated', label: 'Risco Muito Elevado', color: 'red' }
  }
  // Feminino
  if (waistCm < 80) return { waistCm, classification: 'normal', label: 'Normal', color: 'green' }
  if (waistCm < 88) return { waistCm, classification: 'elevated', label: 'Risco Elevado', color: 'orange' }
  return { waistCm, classification: 'very_elevated', label: 'Risco Muito Elevado', color: 'red' }
}

// ============================================
// PESO IDEAL — Fórmula de Lorentz
// ============================================

export function calculateIdealWeight(heightCm: number, gender: Gender): number {
  if (gender === 'male') {
    // PI = (altura_cm - 100) - ((altura_cm - 150) / 4)
    return round((heightCm - 100) - ((heightCm - 150) / 4), 2)
  }
  // PI = (altura_cm - 100) - ((altura_cm - 150) / 2.5)
  return round((heightCm - 100) - ((heightCm - 150) / 2.5), 2)
}

// ============================================
// TMB — Taxa Metabólica Basal (Mifflin-St Jeor, 1990)
// ============================================

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  // Masculino: TMB = 10 × peso + 6.25 × altura(cm) - 5 × idade + 5
  // Feminino: TMB = 10 × peso + 6.25 × altura(cm) - 5 × idade - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Pouco ou nenhum exercício
  light: 1.375,        // 1-3 dias/semana
  moderate: 1.55,      // 3-5 dias/semana
  active: 1.725,       // 6-7 dias/semana
  very_active: 1.9,    // Exercícios intensos diários / trabalho braçal
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel = 'moderate'): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

// ============================================
// MASSA MUSCULAR — Lee et al. (2000)
// ============================================

/**
 * Massa Muscular Esquelética (kg) — Lee et al. (2000)
 * MM = 0.244 × peso + 7.80 × altura(m) + 6.6 × sexo(M=1,F=0) - 0.098 × idade + raça - 3.3
 *
 * Raça: 0 para brancos/hispânicos, 1.4 para negros, -1.2 para asiáticos
 * Simplificação: usamos 0 (padrão) se não informado
 */
export function calculateMuscleMass(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  raceAdjustment = 0
): number {
  const heightM = heightCm / 100
  const sexFactor = gender === 'male' ? 1 : 0
  const mm = 0.244 * weightKg + 7.80 * heightM + 6.6 * sexFactor - 0.098 * age + raceAdjustment - 3.3
  return round(Math.max(0, mm), 2)
}

// ============================================
// MASSA ÓSSEA — Von Döbeln modificada por Rocha (1975)
// ============================================

/**
 * MO = 3.02 × (altura(m)² × diâmetro_punho(m) × diâmetro_fêmur(m) × 400)^0.712
 *
 * Se diâmetros não estiverem disponíveis, estima com base na altura:
 * - Diâmetro punho ≈ 0.033 × altura(m) (média)
 * - Diâmetro fêmur ≈ 0.058 × altura(m) (média)
 */
export function calculateBoneMass(
  heightCm: number,
  wristDiameterCm?: number,
  femurDiameterCm?: number
): number {
  const heightM = heightCm / 100

  // Usa valores reais ou estimativas
  const wristM = wristDiameterCm ? wristDiameterCm / 100 : 0.033 * heightM
  const femurM = femurDiameterCm ? femurDiameterCm / 100 : 0.058 * heightM

  const mo = 3.02 * Math.pow(heightM * heightM * wristM * femurM * 400, 0.712)
  return round(Math.max(0, mo), 2)
}

// ============================================
// MASSA RESIDUAL — Wurch (1974)
// ============================================

/**
 * Masculino: MR = peso × 0.241
 * Feminino:  MR = peso × 0.209
 */
export function calculateResidualMass(weightKg: number, gender: Gender): number {
  const factor = gender === 'male' ? 0.241 : 0.209
  return round(weightKg * factor, 2)
}

// ============================================
// SOMATOTIPO — Classificação simplificada
// ============================================

export type Somatotype = 'ectomorph' | 'mesomorph' | 'endomorph' | 'ecto_mesomorph' | 'endo_mesomorph'

export interface SomatotypeResult {
  classification: Somatotype
  label: string
  description: string
}

/**
 * Classificação simplificada de somatotipo baseada em BMI e % gordura
 * (Heath-Carter completo requer medidas específicas como envergadura)
 */
export function classifySomatotype(bmi: number, fatPercentage: number, gender: Gender): SomatotypeResult {
  const isLowFat = gender === 'male' ? fatPercentage < 12 : fatPercentage < 20
  const isMedFat = gender === 'male' ? fatPercentage < 20 : fatPercentage < 28
  const isLowBMI = bmi < 22

  if (isLowBMI && isLowFat) {
    return {
      classification: 'ectomorph',
      label: 'Ectomorfo',
      description: 'Estrutura corporal magra, dificuldade para ganhar peso. Metabolismo acelerado.',
    }
  }

  if (!isLowBMI && isLowFat) {
    return {
      classification: 'mesomorph',
      label: 'Mesomorfo',
      description: 'Estrutura muscular, facilidade para ganhar massa muscular. Corpo atlético.',
    }
  }

  if (isLowBMI && isMedFat) {
    return {
      classification: 'ecto_mesomorph',
      label: 'Ecto-Mesomorfo',
      description: 'Magro com potencial muscular. Precisa de treino de força e boa alimentação.',
    }
  }

  if (!isLowBMI && isMedFat) {
    return {
      classification: 'endo_mesomorph',
      label: 'Endo-Mesomorfo',
      description: 'Forte com tendência a acumular gordura. Precisa de controle alimentar.',
    }
  }

  return {
    classification: 'endomorph',
    label: 'Endomorfo',
    description: 'Tendência a acumular gordura, metabolismo mais lento. Foco em atividade aeróbica.',
  }
}

// ============================================
// FFMI — Fat-Free Mass Index (Schutz et al., 2002)
// ============================================

/**
 * FFMI = Massa Magra (kg) / Altura (m)²
 * FFMI Normalizado = FFMI + 6.1 × (1.8 - Altura(m))
 *
 * Referências:
 * - Schutz et al. (2002) — Normalized FFMI
 * - Kouri et al. (1995) — Limites naturais masculinos (~25)
 * - VanItallie et al. (1990) — Conceito original
 */
export type FFMIClassification =
  | 'below_average'
  | 'average'
  | 'above_average'
  | 'excellent'
  | 'superior'
  | 'suspicious' // possível uso de AAS

export interface FFMIResult {
  ffmi: number
  ffmiNormalized: number
  classification: FFMIClassification
  label: string
  description: string
}

/**
 * Calcula FFMI e FFMI normalizado a partir da massa magra, altura e gênero.
 */
export function calculateFFMI(leanMassKg: number, heightCm: number, gender: Gender): FFMIResult {
  const heightM = heightCm / 100
  const ffmi = round(leanMassKg / (heightM * heightM), 1)
  // Normalização de Schutz et al.: corrige para altura de referência 1.80m
  const ffmiNormalized = round(ffmi + 6.1 * (1.8 - heightM), 1)

  const classification = classifyFFMI(ffmiNormalized, gender)
  return { ffmi, ffmiNormalized, ...classification }
}

function classifyFFMI(
  ffmiNorm: number,
  gender: Gender
): { classification: FFMIClassification; label: string; description: string } {
  if (gender === 'male') {
    if (ffmiNorm < 18) return { classification: 'below_average', label: 'Abaixo da média', description: 'Massa muscular abaixo da média. Foco em treino de hipertrofia e nutrição adequada.' }
    if (ffmiNorm < 20) return { classification: 'average', label: 'Média', description: 'Massa muscular dentro da média para homens. Há espaço para crescimento.' }
    if (ffmiNorm < 22) return { classification: 'above_average', label: 'Acima da média', description: 'Boa massa muscular. Treinamento consistente mostra resultados.' }
    if (ffmiNorm < 23.5) return { classification: 'excellent', label: 'Excelente', description: 'Massa muscular excelente. Nível avançado de treinamento.' }
    if (ffmiNorm < 25.5) return { classification: 'superior', label: 'Superior', description: 'Próximo do limite genético natural (~25). Dedicação excepcional.' }
    return { classification: 'suspicious', label: 'Acima do limite natural', description: 'FFMI acima de 25.5 excede o limite natural para a maioria dos homens (Kouri et al., 1995).' }
  }

  // Feminino — ranges ajustados (~2–3 pontos abaixo)
  if (ffmiNorm < 15) return { classification: 'below_average', label: 'Abaixo da média', description: 'Massa muscular abaixo da média. Foco em treino de força e nutrição proteica.' }
  if (ffmiNorm < 17) return { classification: 'average', label: 'Média', description: 'Massa muscular dentro da média para mulheres.' }
  if (ffmiNorm < 19) return { classification: 'above_average', label: 'Acima da média', description: 'Boa massa muscular. Nível intermediário de treinamento.' }
  if (ffmiNorm < 21) return { classification: 'excellent', label: 'Excelente', description: 'Massa muscular excelente para mulheres. Nível avançado.' }
  if (ffmiNorm < 22.5) return { classification: 'superior', label: 'Superior', description: 'Próximo do limite genético natural feminino. Dedicação excepcional.' }
  return { classification: 'suspicious', label: 'Acima do limite natural', description: 'FFMI acima do limite natural esperado para mulheres.' }
}

// ============================================
// UTILITÁRIO
// ============================================

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
