/**
 * seed-emerson-assessment.mjs
 * Cria o aluno Emerson Xavier e insere avaliação completa do PDF (28/01/2026)
 * Run: node scripts/seed-emerson-assessment.mjs
 */
import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'crypto'

// ─── Config ───────────────────────────────────────────────────────────────────
const DB_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!DB_URL) { console.error('❌ DATABASE_URL não encontrada'); process.exit(1) }

const PERSONAL_ID = 'f1bc775d-7b7b-4702-adeb-dc9255082d03' // Victor Agostinho Melo Duarte

// ─── Dados do Emerson Xavier (PDF 28/01/2026) ────────────────────────────────
const EMERSON = {
  full_name: 'Emerson Xavier',
  email: 'emerson.xavier@vfit.student.br', // placeholder
  birth_date: '1989-12-01', // ~36 anos em jan/2026
  gender: 'male',
  height_cm: 183,
}

const ASSESSMENT = {
  date: '2026-01-28',
  weight_kg: 99.0,
  height_cm: 183,
  protocol: 'pollock_7',
  density_formula: 'siri',
  gender: 'male',
  age: 36,
  activity_level: 'moderate',
  skinfolds: { chest:15, axillary:12, triceps:9, subscapular:18, suprailiac:14, abdominal:34, thigh:14 },
  measurements: {
    shoulders: 125, chest: 113, scapular_waist: 125, waist: 101, abdomen: 104,
    hips: 109, neck: 45,
    right_thigh: 60, left_thigh: 60,
    right_calf: 44, left_calf: 43,
    right_arm: 36, left_arm: 35.5,
    right_arm_contracted: 40, left_arm_contracted: 39.5,
    right_forearm: 33, left_forearm: 31,
    thorax_inspired: 113, thorax_expired: 113,
    // Anamnese
    anamnesis_self_image: 10, anamnesis_self_esteem: 10,
    anamnesis_daily_energy: 5, anamnesis_stress: 2, anamnesis_sleep_quality: 4,
    anamnesis_meals_per_day: 2, anamnesis_water_liters: 2.5,
    anamnesis_medications: 'Remédio para dormir + antidepressivo',
    anamnesis_activity_goal_per_week: 5,
    // Metas
    goal_health_bf_pct: 14, goal_health_weight_kg: 95, goal_health_waist_cm: 95,
    goal_aesthetic_bf_min: 10, goal_aesthetic_bf_max: 12,
    goal_aesthetic_weight_min: 89, goal_aesthetic_weight_max: 93,
  },
  notes: 'Avaliação realizada em 28/01/2026 — Victor Agostinho Melo Duarte.\nPaciente em uso de medicação para sono e antidepressivo. Energia diária comprometida (5/10). Objetivo: redução de gordura com manutenção de massa muscular.',
}

// ─── Fórmulas (replicando exatamente assessment-formulas.ts) ────────────────

function r(v, d) { return Math.round(v * Math.pow(10,d)) / Math.pow(10,d) }

// Pollock 7 Dobras — Masculino
function bodyDensityPollock7Male(sum, age) {
  return 1.112 - 0.00043499 * sum + 0.00000055 * sum * sum - 0.00028826 * age
}

// Siri: %G = (4.95/D − 4.5) × 100
function siri(d) { return r((4.95 / d - 4.5) * 100, 2) }

// BMI
function bmi(w, h) { const hm = h/100; return r(w/(hm*hm), 2) }
function classifyBMI(v) {
  if (v < 18.5) return 'Magreza'
  if (v < 25)   return 'Normal'
  if (v < 30)   return 'Sobrepeso'
  if (v < 35)   return 'Obesidade Grau I'
  if (v < 40)   return 'Obesidade Grau II'
  return 'Obesidade Grau III'
}

// Fat classification (ACE Male)
function classifyFat(pct) {
  if (pct < 6)  return 'Gordura Essencial'
  if (pct < 14) return 'Atleta'
  if (pct < 18) return 'Fitness'
  if (pct < 25) return 'Aceitável'
  return 'Obesidade'
}

// WHR (OMS male)
function classifyWHR(whr) {
  if (whr < 0.90) return { c:'low', l:'Baixo Risco' }
  if (whr < 0.96) return { c:'moderate', l:'Risco Moderado' }
  if (whr < 1.0)  return { c:'high', l:'Risco Alto' }
  return { c:'very_high', l:'Risco Muito Alto' }
}

// Waist risk (ABESO male)
function classifyWaist(cm) {
  if (cm < 94)  return { c:'normal', l:'Normal' }
  if (cm < 102) return { c:'elevated', l:'Risco Elevado' }
  return { c:'very_elevated', l:'Risco Muito Elevado' }
}

// Ideal weight — Lorentz (male)
function idealWeight(h) { return r((h-100) - (h-150)/4, 2) }

// BMR — Mifflin-St Jeor (male)
function bmr(w, h, age) { return Math.round(10*w + 6.25*h - 5*age + 5) }

// TDEE
const ACTIVITY = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 }
function tdee(bmrVal, level) { return Math.round(bmrVal * ACTIVITY[level]) }

// Muscle mass — Lee et al. (2000)
function muscleMass(w, h, age) {
  const hm = h/100
  return r(Math.max(0, 0.244*w + 7.80*hm + 6.6 - 0.098*age + 0 - 3.3), 2)
}

// Bone mass — Von Döbeln/Rocha (1975)
function boneMass(h) {
  const hm = h/100
  const wrist = 0.033 * hm
  const femur = 0.058 * hm
  return r(Math.max(0, 3.02 * Math.pow(hm*hm * wrist * femur * 400, 0.712)), 2)
}

// Residual mass — Wurch (1974) male
function residualMass(w) { return r(w * 0.241, 2) }

// FFMI (Schutz et al.)
function ffmi(lean, h) {
  const hm = h/100
  const f = r(lean/(hm*hm), 1)
  const fn = r(f + 6.1*(1.8 - hm), 1)
  return { ffmi: f, ffmiNormalized: fn }
}
function classifyFFMI(fn) {
  if (fn < 18)   return { c:'below_average', l:'Abaixo da média' }
  if (fn < 20)   return { c:'average', l:'Média' }
  if (fn < 22)   return { c:'above_average', l:'Acima da média' }
  if (fn < 23.5) return { c:'excellent', l:'Excelente' }
  if (fn < 25.5) return { c:'superior', l:'Superior' }
  return { c:'suspicious', l:'Acima do limite natural' }
}

// Somatotype
function somatotype(bmiVal, fatPct) {
  const isLowFat = fatPct < 12
  const isMedFat = fatPct < 20
  const isLowBMI = bmiVal < 22
  if (isLowBMI && isLowFat)  return 'Ectomorfo'
  if (!isLowBMI && isLowFat) return 'Mesomorfo'
  if (isLowBMI && isMedFat)  return 'Ecto-Mesomorfo'
  if (!isLowBMI && isMedFat) return 'Endo-Mesomorfo'
  return 'Endomorfo'
}

// Water % estimate
function waterPct(lean, weight) { return r(73.2 * (lean / weight), 2) }

// ─── Calcular tudo ─────────────────────────────────────────────────────────
const sk = ASSESSMENT.skinfolds
const sumSk = sk.chest + sk.axillary + sk.triceps + sk.subscapular + sk.suprailiac + sk.abdominal + sk.thigh

const density    = r(bodyDensityPollock7Male(sumSk, ASSESSMENT.age), 7)
const fatPct     = siri(density)
const fatMass    = r(ASSESSMENT.weight_kg * (fatPct/100), 2)
const leanMass   = r(ASSESSMENT.weight_kg - fatMass, 2)
const leanMassPct= r((leanMass / ASSESSMENT.weight_kg) * 100, 2)
const muscleMassKg  = muscleMass(ASSESSMENT.weight_kg, ASSESSMENT.height_cm, ASSESSMENT.age)
const muscleMassPct = r((muscleMassKg / ASSESSMENT.weight_kg) * 100, 2)
const boneMassKg = boneMass(ASSESSMENT.height_cm)
const residualMassKg = residualMass(ASSESSMENT.weight_kg)
const bmiVal     = bmi(ASSESSMENT.weight_kg, ASSESSMENT.height_cm)
const bmiClass   = classifyBMI(bmiVal)
const fatClass   = classifyFat(fatPct)
const whr        = r(ASSESSMENT.measurements.waist / ASSESSMENT.measurements.hips, 3)
const whrClass   = classifyWHR(whr)
const waistClass = classifyWaist(ASSESSMENT.measurements.waist)
const idealWt    = idealWeight(ASSESSMENT.height_cm)
const weightToLose = r(ASSESSMENT.weight_kg - idealWt, 2)
const bmrVal     = bmr(ASSESSMENT.weight_kg, ASSESSMENT.height_cm, ASSESSMENT.age)
const tdeeVal    = tdee(bmrVal, ASSESSMENT.activity_level)
const ffmiData   = ffmi(leanMass, ASSESSMENT.height_cm)
const ffmiClass  = classifyFFMI(ffmiData.ffmiNormalized)
const somat      = somatotype(bmiVal, fatPct)
const waterPctVal= waterPct(leanMass, ASSESSMENT.weight_kg)

const bodyComposition = {
  fatPercentage: fatPct, fatMassKg: fatMass,
  leanMassKg: leanMass, leanMassPercentage: leanMassPct,
  muscleMassKg, boneMassKg, residualMassKg,
  waterPercentage: waterPctVal,
  bmi: { value: bmiVal, classification: bmiClass },
  fatClassification: { percentage: fatPct, classification: fatClass.toLowerCase().replace(' ','_'), label: fatClass, idealRange: { min:10, max:18 } },
  whr: { value: whr, classification: whrClass.c, label: whrClass.l },
  waistRisk: { classification: waistClass.c, label: waistClass.l },
  idealWeightKg: idealWt,
  weightToLoseKg: weightToLose,
  basalMetabolicRate: bmrVal,
  totalDailyExpenditure: tdeeVal,
  ffmi: { ffmi: ffmiData.ffmi, ffmiNormalized: ffmiData.ffmiNormalized, classification: ffmiClass.c, label: ffmiClass.l },
  somatotype: { classification: somat.toLowerCase().replace(/-/g,'_').replace(' ','_'), label: somat },
  sumOfSkinfolds: sumSk,
  bodyDensity: density,
  _gender: 'male',
  _activityLevel: 'moderate',
}

console.log('\n📊 Composição corporal calculada:')
console.log(`   Densidade:    ${density}`)
console.log(`   % Gordura:    ${fatPct}%  (${fatClass})`)
console.log(`   Massa Gorda:  ${fatMass} kg`)
console.log(`   Massa Magra:  ${leanMass} kg`)
console.log(`   Massa Musc:   ${muscleMassKg} kg`)
console.log(`   BMI:          ${bmiVal}  (${bmiClass})`)
console.log(`   RCQ:          ${whr}  (${whrClass.l})`)
console.log(`   Risco Cintura:${waistClass.l}`)
console.log(`   Peso Ideal:   ${idealWt} kg  (a perder: ${weightToLose} kg)`)
console.log(`   TMB:          ${bmrVal} kcal`)
console.log(`   TDEE:         ${tdeeVal} kcal`)
console.log(`   FFMI norm:    ${ffmiData.ffmiNormalized}  (${ffmiClass.l})`)
console.log(`   Somatotipo:   ${somat}`)
console.log(`   Água:         ${waterPctVal}%\n`)

// ─── Conectar ao Neon ──────────────────────────────────────────────────────
const sql = neon(DB_URL)

async function run() {
  // 1. Verificar se Emerson já existe
  const existing = await sql`
    SELECT id FROM users WHERE email = ${EMERSON.email} LIMIT 1
  `

  let studentId
  if (existing.length > 0) {
    studentId = existing[0].id
    console.log(`✅ Usuário Emerson já existe: ${studentId}`)
  } else {
    // 2. Criar usuário
    const userId = randomUUID()
    await sql`
      INSERT INTO users (id, email, full_name, user_type, birth_date, email_verified, is_active, language, timezone)
      VALUES (
        ${userId},
        ${EMERSON.email},
        ${EMERSON.full_name},
        'student',
        ${EMERSON.birth_date},
        true,
        true,
        'pt-BR',
        'America/Sao_Paulo'
      )
    `
    console.log(`✅ Usuário criado: ${userId}`)

    // 3. Criar perfil na tabela students
    await sql`
      INSERT INTO students (id, personal_id, gender, height_cm, status, payment_status)
      VALUES (
        ${userId},
        ${PERSONAL_ID},
        ${EMERSON.gender},
        ${EMERSON.height_cm},
        'active',
        'paid'
      )
    `
    console.log(`✅ Perfil de aluno criado`)
    studentId = userId
  }

  // 4. Verificar se avaliação já existe
  const existingAssessment = await sql`
    SELECT id FROM assessments
    WHERE student_id = ${studentId}
    AND assessment_date = ${ASSESSMENT.date}
    AND personal_id = ${PERSONAL_ID}
    LIMIT 1
  `
  if (existingAssessment.length > 0) {
    console.log(`⚠️  Avaliação já existe: ${existingAssessment[0].id}`)
    console.log('   Pulando inserção.')
    return
  }

  // 5. Inserir avaliação completa
  const assessmentId = randomUUID()
  await sql`
    INSERT INTO assessments (
      id, student_id, personal_id, assessment_date,
      weight_kg, height_cm,
      protocol, protocol_version, density_formula,
      skinfolds, measurements,
      body_fat_percentage, fat_mass_kg, lean_mass_kg,
      lean_mass_percentage, muscle_mass_kg, muscle_mass_percentage,
      bone_mass_kg, residual_mass_kg,
      body_density, sum_of_skinfolds,
      bmi, bmi_classification,
      fat_classification,
      waist_hip_ratio, waist_hip_classification, waist_risk,
      ideal_weight_kg, weight_to_lose_kg,
      basal_metabolic_rate, total_daily_expenditure,
      somatotype,
      water_percentage,
      body_composition,
      notes
    ) VALUES (
      ${assessmentId},
      ${studentId},
      ${PERSONAL_ID},
      ${ASSESSMENT.date},
      ${ASSESSMENT.weight_kg},
      ${ASSESSMENT.height_cm},
      ${'pollock_7'},
      ${'v2'},
      ${'siri'},
      ${JSON.stringify(ASSESSMENT.skinfolds)},
      ${JSON.stringify(ASSESSMENT.measurements)},
      ${fatPct},
      ${fatMass},
      ${leanMass},
      ${leanMassPct},
      ${muscleMassKg},
      ${muscleMassPct},
      ${boneMassKg},
      ${residualMassKg},
      ${density},
      ${sumSk},
      ${bmiVal},
      ${bmiClass},
      ${fatClass},
      ${whr},
      ${whrClass.l},
      ${waistClass.l},
      ${idealWt},
      ${weightToLose},
      ${bmrVal},
      ${tdeeVal},
      ${somat},
      ${waterPctVal},
      ${JSON.stringify(bodyComposition)},
      ${ASSESSMENT.notes}
    )
  `

  console.log(`\n✅ Avaliação inserida com sucesso!`)
  console.log(`   Assessment ID: ${assessmentId}`)
  console.log(`   Student ID:    ${studentId}`)
  console.log(`\n🔗 Ver avaliação em:`)
  console.log(`   https://vfit.app.br/dashboard/assessments/${assessmentId}`)
  console.log(`\n👤 Aluno no app:`)
  console.log(`   https://vfit.app.br/dashboard/alunos/${studentId}\n`)
}

run().catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })
