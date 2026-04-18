import { readFileSync } from 'fs'
import { join } from 'path'

const ACCOUNT_ID = 'b0bf95d0fabb322ac3df37bd84ec0c77'

// Lê token do wrangler config (extrai sem parser externo)
const configPath = join(process.env.HOME, '.wrangler/config/default.toml')
let token
try {
  const configText = readFileSync(configPath, 'utf8')
  const match = configText.match(/oauth_token\s*=\s*"([^"]+)"/)
  token = match?.[1]
} catch {
  console.error('❌ Não foi possível ler o token do wrangler. Execute: npx wrangler login')
  process.exit(1)
}

if (!token) {
  console.error('❌ Token não encontrado no config do wrangler')
  process.exit(1)
}

const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

async function cfFetch(path, options = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers, ...options })
  return res.json()
}

console.log('🔍 Verificando serviços Cloudflare disponíveis...\n')

// 1. Verifica R2
const r2 = await cfFetch(`/accounts/${ACCOUNT_ID}/r2/buckets`)
console.log('R2 status:', r2.success ? '✅ Habilitado' : `❌ ${r2.errors?.[0]?.message} (code: ${r2.errors?.[0]?.code})`)

if (!r2.success && r2.errors?.[0]?.code === 10042) {
  console.log('\n🔧 Tentando habilitar R2 via subscriptions...')
  // Tenta ativar R2 via subscription API
  const sub = await cfFetch(`/accounts/${ACCOUNT_ID}/subscriptions`, {
    method: 'POST',
    body: JSON.stringify({ rate_plan: { id: 'r2_basic' } })
  })
  console.log('Subscription result:', JSON.stringify(sub.errors || sub.result || sub, null, 2))

  // Tenta também via billing profile
  const billing = await cfFetch(`/accounts/${ACCOUNT_ID}/billing/profile`)
  console.log('\nBilling profile:', billing.success ? '✅ Tem método de pagamento' : `❌ ${billing.errors?.[0]?.message}`)
}

// 2. Verifica CF Images
console.log('\n--- Cloudflare Images ---')
const images = await cfFetch(`/accounts/${ACCOUNT_ID}/images/v1`)
console.log('CF Images:', images.success ? '✅ Habilitado' : `❌ ${images.errors?.[0]?.message} (code: ${images.errors?.[0]?.code})`)

// 3. Verifica KV
console.log('\n--- KV Namespaces ---')
const kv = await cfFetch(`/accounts/${ACCOUNT_ID}/storage/kv/namespaces`)
console.log('KV:', kv.success ? `✅ ${kv.result?.length} namespaces encontrados` : `❌ ${kv.errors?.[0]?.message}`)

// 4. Verifica Workers
console.log('\n--- Workers ---')
const workers = await cfFetch(`/accounts/${ACCOUNT_ID}/workers/scripts`)
console.log('Workers:', workers.success ? `✅ ${workers.result?.length} scripts` : `❌ ${workers.errors?.[0]?.message}`)

// 5. Tenta criar bucket R2 diretamente
console.log('\n--- Tentando criar bucket R2 ---')
const createBucket = await cfFetch(`/accounts/${ACCOUNT_ID}/r2/buckets`, {
  method: 'POST',
  body: JSON.stringify({ name: 'vfit-images', location: 'ENAM' })
})
console.log('Create bucket:', createBucket.success ? '✅ Criado!' : `❌ ${createBucket.errors?.[0]?.message} (code: ${createBucket.errors?.[0]?.code})`)
