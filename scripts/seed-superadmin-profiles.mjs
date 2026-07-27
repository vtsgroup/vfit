/**
 * seed-superadmin-profiles.mjs
 *
 * Cria os perfis que faltam (personals / nutritionists / students) para a conta
 * super_admin, permitindo que o MODO SIMULAÇÃO funcione nos 3 modos com 1 login.
 *
 * Por que é necessário:
 *   students.personal_id  UUID NOT NULL REFERENCES personals(id)
 *   personals.cref        VARCHAR(20) UNIQUE NOT NULL
 *   nutritionists.crn     VARCHAR(20) UNIQUE NOT NULL
 * Sem essas linhas a simulação bate em "não possui perfil na tabela students".
 *
 * Segurança:
 *   - is_public_profile = FALSE e public_url_slug = NULL nos dois perfis
 *     => o endpoint público (WHERE public_url_slug=$1 AND is_public_profile=true)
 *        NUNCA encontra essa conta. Não aparece pra usuário nenhum.
 *   - 100% aditivo: ON CONFLICT (id) DO NOTHING. Não altera nada existente.
 *   - Não roda sem confirmar qual conta será afetada.
 *
 * Run:
 *   DATABASE_URL=... node scripts/seed-superadmin-profiles.mjs --email seu@email.com
 *   DATABASE_URL=... node scripts/seed-superadmin-profiles.mjs --email seu@email.com --apply
 */
import { neon } from '@neondatabase/serverless'

const DB_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!DB_URL) {
  console.error('❌ DATABASE_URL não encontrada')
  process.exit(1)
}

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const emailIdx = args.indexOf('--email')
const EMAIL = emailIdx !== -1 ? args[emailIdx + 1] : null

const sql = neon(DB_URL)

// Placeholders — não são registros profissionais reais, e o perfil fica oculto.
const CREF = 'ADMIN-SUPER-0001'
const CRN = 'ADMIN-SUPER-0001'
const REFERRAL = 'ADMINSUPER01'
const UF = 'SP'

async function main() {
  // 1. Localizar a conta -------------------------------------------------
  const users = EMAIL
    ? await sql`SELECT id, email, full_name, user_type, role, is_active
                FROM users WHERE email = ${EMAIL} LIMIT 2`
    : await sql`SELECT id, email, full_name, user_type, role, is_active
                FROM users WHERE role = 'super_admin' LIMIT 5`

  if (users.length === 0) {
    console.error(EMAIL
      ? `❌ Nenhum usuário com email ${EMAIL}`
      : '❌ Nenhum usuário com role=super_admin. Use --email seu@email.com')
    process.exit(1)
  }
  if (users.length > 1) {
    console.error('❌ Mais de uma conta encontrada. Especifique com --email:')
    for (const u of users) console.error(`   - ${u.email}  (role=${u.role})`)
    process.exit(1)
  }

  const user = users[0]
  console.log('👤 Conta alvo:')
  console.log(`   id        ${user.id}`)
  console.log(`   email     ${user.email}`)
  console.log(`   nome      ${user.full_name}`)
  console.log(`   user_type ${user.user_type}`)
  console.log(`   role      ${user.role}`)
  console.log(`   is_active ${user.is_active}`)
  console.log()

  if (user.role !== 'super_admin') {
    console.error(`❌ ABORTADO: role="${user.role}" não é super_admin.`)
    console.error('   Este script só deve rodar na sua conta administrativa.')
    process.exit(1)
  }

  // 2. Estado atual ------------------------------------------------------
  const [[p], [n], [s]] = await Promise.all([
    sql`SELECT id FROM personals      WHERE id = ${user.id}`,
    sql`SELECT id FROM nutritionists  WHERE id = ${user.id}`,
    sql`SELECT id FROM students       WHERE id = ${user.id}`,
  ]).then((r) => r.map((rows) => [rows[0]]))

  console.log('📋 Perfis existentes:')
  console.log(`   personals      ${p ? '✅ já existe' : '❌ faltando'}`)
  console.log(`   nutritionists  ${n ? '✅ já existe' : '❌ faltando'}`)
  console.log(`   students       ${s ? '✅ já existe' : '❌ faltando'}`)
  console.log()

  if (p && n && s) {
    console.log('✨ Nada a fazer — os 3 perfis já existem.')
    return
  }

  // 3. Checar colisão de CREF/CRN/referral_code --------------------------
  const [crefTaken, crnTaken, refTaken, refNutTaken] = await Promise.all([
    sql`SELECT id FROM personals     WHERE cref = ${CREF} AND id <> ${user.id}`,
    sql`SELECT id FROM nutritionists WHERE crn  = ${CRN}  AND id <> ${user.id}`,
    sql`SELECT id FROM personals     WHERE referral_code = ${REFERRAL} AND id <> ${user.id}`,
    sql`SELECT id FROM nutritionists WHERE referral_code = ${REFERRAL} AND id <> ${user.id}`,
  ])
  if (crefTaken.length || crnTaken.length || refTaken.length || refNutTaken.length) {
    console.error('❌ Placeholder CREF/CRN/referral já usado por outra conta.')
    console.error('   Edite as constantes no topo do script.')
    process.exit(1)
  }

  if (!APPLY) {
    console.log('🔍 DRY-RUN. Seria inserido:')
    if (!p) console.log(`   + personals      cref=${CREF} uf=${UF} is_public_profile=FALSE slug=NULL`)
    if (!n) console.log(`   + nutritionists  crn=${CRN}  uf=${UF} referral=${REFERRAL} is_public_profile=FALSE slug=NULL`)
    if (!s) console.log(`   + students       personal_id=${user.id}  (você é seu próprio treinador)`)
    console.log('\n   Rode de novo com --apply para gravar.')
    return
  }

  // 4. Inserir (aditivo, idempotente) ------------------------------------
  if (!p) {
    await sql`
      INSERT INTO personals (id, cref, cref_state, referral_code, is_public_profile, public_url_slug)
      VALUES (${user.id}, ${CREF}, ${UF}, ${REFERRAL}, FALSE, NULL)
      ON CONFLICT (id) DO NOTHING`
    console.log('   ✅ personals criado (oculto do público)')
  }
  if (!n) {
    await sql`
      INSERT INTO nutritionists (id, crn, crn_state, referral_code, is_public_profile, public_url_slug)
      VALUES (${user.id}, ${CRN}, ${UF}, ${REFERRAL}, FALSE, NULL)
      ON CONFLICT (id) DO NOTHING`
    console.log('   ✅ nutritionists criado (oculto do público)')
  }
  if (!s) {
    await sql`
      INSERT INTO students (id, personal_id, status)
      VALUES (${user.id}, ${user.id}, 'active')
      ON CONFLICT (id) DO NOTHING`
    console.log('   ✅ students criado (self-linked)')
  }

  // 5. Verificar ---------------------------------------------------------
  const [vp, vn, vs, leak, leakNut] = await Promise.all([
    sql`SELECT id FROM personals     WHERE id = ${user.id}`,
    sql`SELECT id FROM nutritionists WHERE id = ${user.id}`,
    sql`SELECT id FROM students      WHERE id = ${user.id}`,
    sql`SELECT id FROM personals     WHERE id = ${user.id} AND is_public_profile = TRUE`,
    sql`SELECT id FROM nutritionists WHERE id = ${user.id} AND is_public_profile = TRUE`,
  ])

  console.log('\n🔎 Verificação final:')
  console.log(`   personals      ${vp.length ? '✅' : '❌'}`)
  console.log(`   nutritionists  ${vn.length ? '✅' : '❌'}`)
  console.log(`   students       ${vs.length ? '✅' : '❌'}`)
  console.log(`   vazamento personals      ${leak.length ? '❌ EXPOSTO!' : '✅ oculto'}`)
  console.log(`   vazamento nutritionists  ${leakNut.length ? '❌ EXPOSTO!' : '✅ oculto'}`)

  if (vp.length && vn.length && vs.length && !leak.length && !leakNut.length) {
    console.log('\n✨ Pronto. Teste a simulação nos 3 modos.')
  } else {
    console.error('\n⚠️  Estado inesperado — revise antes de usar.')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('❌ Erro:', e.message)
  process.exit(1)
})
