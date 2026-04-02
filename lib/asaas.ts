/**
 * lib/asaas.ts
 *
 * Asaas API Client — VFIT
 *
 * Exports: getAsaasBaseUrl, AsaasError, AsaasApiError, AsaasCustomer, CreateCustomerInput
 */

// ============================================
// Asaas API Client — VFIT
//
// Documentação Asaas: https://docs.asaas.com
// Sandbox: https://sandbox.asaas.com/api/v3
// Produção: https://api.asaas.com/v3
// ============================================

import type { Bindings } from '@workers/types'

// ============================================
// CONFIG
// ============================================

const ASAAS_SANDBOX_URL = 'https://sandbox.asaas.com/api/v3'
const ASAAS_PRODUCTION_URL = 'https://api.asaas.com/v3'

export function getAsaasBaseUrl(env: Bindings): string {
  // Chaves de homologação: $aact_hmlg_... → sandbox
  // Chaves de produção: $aact_prod_... ou $aact_ sem hmlg → produção
  const key = env.ASAAS_API_KEY || ''
  if (key.includes('_hmlg_')) return ASAAS_SANDBOX_URL
  if (key.startsWith('$aact_')) return ASAAS_PRODUCTION_URL
  return ASAAS_SANDBOX_URL
}

// ============================================
// BASE HTTP CLIENT
// ============================================

async function asaasFetch<T = unknown>(
  env: Bindings,
  path: string,
  options: {
    method?: string
    body?: Record<string, unknown>
    params?: Record<string, string>
  } = {}
): Promise<T> {
  const baseUrl = getAsaasBaseUrl(env)
  const url = new URL(`${baseUrl}${path}`)

  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, v)
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'access_token': env.ASAAS_API_KEY,
    'User-Agent': 'VFIT/1.0',
  }

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json() as T & { errors?: AsaasError[] }

  if (!res.ok) {
    const errorMsg = data.errors?.[0]?.description || `Asaas API error: ${res.status}`
    console.error(`[Asaas] ${options.method || 'GET'} ${path} → ${res.status}:`, JSON.stringify(data))
    throw new AsaasApiError(errorMsg, res.status, data.errors)
  }

  return data
}

// ============================================
// TYPES
// ============================================

export interface AsaasError {
  code: string
  description: string
}

export class AsaasApiError extends Error {
  statusCode: number
  errors?: AsaasError[]
  constructor(message: string, statusCode: number, errors?: AsaasError[]) {
    super(message)
    this.name = 'AsaasApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

// --- Customer ---
export interface AsaasCustomer {
  id: string
  name: string
  email?: string
  cpfCnpj?: string
  phone?: string
  mobilePhone?: string
  postalCode?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  externalReference?: string
  notificationDisabled?: boolean
}

export interface CreateCustomerInput {
  name: string
  email?: string
  cpfCnpj: string
  phone?: string
  mobilePhone?: string
  externalReference?: string
  notificationDisabled?: boolean
}

// --- Payment (Cobrança) ---
export interface AsaasPayment {
  id: string
  customer: string
  dateCreated: string
  dueDate: string
  value: number
  netValue: number
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
  status: string
  description?: string
  externalReference?: string
  invoiceUrl?: string
  bankSlipUrl?: string
  identificationField?: string      // Boleto: linha digitável
  pixTransaction?: {
    payload?: string                // PIX Copia e Cola
    encodedImage?: string           // QR Code base64
    expirationDate?: string
  }
  creditCard?: {
    creditCardNumber: string        // Últimos 4 dígitos
    creditCardBrand: string         // VISA, MASTERCARD, etc.
    creditCardToken: string         // Token para cobranças futuras
  }
  installmentCount?: number
  installmentValue?: number
  transactionReceiptUrl?: string
  confirmedDate?: string
  paymentDate?: string
  nossoNumero?: string
  split?: AsaasSplit[]
}

export interface CreatePaymentInput {
  customer: string          // Asaas customer ID
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'
  value: number
  dueDate: string           // YYYY-MM-DD
  description?: string
  externalReference?: string
  split?: AsaasSplit[]
  // Cartão de crédito (cobrança direta)
  creditCard?: CreditCardInput
  creditCardHolderInfo?: CreditCardHolderInfoInput
  creditCardToken?: string         // Token de cartão salvo
  // Parcelamento
  installmentCount?: number
  installmentValue?: number
  // Controle
  postalService?: boolean          // false = não enviar boleto por correio
}

export interface AsaasSplit {
  walletId: string
  fixedValue?: number
  percentualValue?: number
}

// --- Credit Card (Cobrança direta via API) ---
export interface CreditCardInput {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

export interface CreditCardHolderInfoInput {
  name: string
  email: string
  cpfCnpj: string
  postalCode: string
  addressNumber: string
  phone: string
  addressComplement?: string
}

// --- Subscription (Recorrência) ---
export interface AsaasSubscription {
  id: string
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  nextDueDate: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  externalReference?: string
  split?: AsaasSplit[]
}

export interface CreateSubscriptionInput {
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  nextDueDate: string      // YYYY-MM-DD (primeira cobrança)
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  description?: string
  externalReference?: string
  endDate?: string
  maxPayments?: number
  split?: AsaasSplit[]
}

// --- Transfer (PIX) ---
export interface AsaasTransfer {
  id: string
  type: 'PIX'
  value: number
  netValue: number
  status: 'PENDING' | 'BANK_PROCESSING' | 'DONE' | 'CANCELLED' | 'FAILED'
  transferFee: number
  scheduleDate?: string
  authorized: boolean
  failReason?: string
  pixTransaction?: {
    endToEndIdentifier?: string
  }
}

export interface CreatePixTransferInput {
  value: number
  pixAddressKey: string
  pixAddressKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP'
  description?: string
  scheduleDate?: string
}

// --- PIX QR Code ---
export interface AsaasPixQrCode {
  encodedImage: string     // Base64
  payload: string          // PIX Copia e Cola
  expirationDate: string
}

// --- Balance ---
export interface AsaasBalance {
  balance: number
}

// --- Payment Statistics ---
export interface AsaasPaymentStatistics {
  income: {
    estimated: number
    confirmed: number
    received: number
    overdue: number
  }
  expense: {
    estimated: number
    confirmed: number
  }
}

// ============================================
// CUSTOMER FUNCTIONS
// ============================================

/**
 * Criar cliente no Asaas
 */
export async function createCustomer(
  env: Bindings,
  input: CreateCustomerInput
): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>(env, '/customers', {
    method: 'POST',
    body: {
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj?.replace(/\D/g, ''),
      phone: input.phone?.replace(/\D/g, ''),
      mobilePhone: input.mobilePhone?.replace(/\D/g, ''),
      externalReference: input.externalReference,
      notificationDisabled: input.notificationDisabled ?? false,
    },
  })
}

/**
 * Buscar cliente por referência externa (user_id)
 */
export async function findCustomerByRef(
  env: Bindings,
  externalReference: string
): Promise<AsaasCustomer | null> {
  const result = await asaasFetch<{ data: AsaasCustomer[]; totalCount: number }>(
    env,
    '/customers',
    { params: { externalReference } }
  )
  return result.data?.[0] || null
}

/**
 * Buscar ou criar cliente no Asaas
 */
export async function getOrCreateCustomer(
  env: Bindings,
  input: CreateCustomerInput
): Promise<AsaasCustomer> {
  if (input.externalReference) {
    const existing = await findCustomerByRef(env, input.externalReference)
    if (existing) return existing
  }
  return createCustomer(env, input)
}

// ============================================
// PAYMENT FUNCTIONS (Cobranças Avulsas)
// ============================================

/**
 * Criar cobrança avulsa no Asaas
 */
export async function createAsaasPayment(
  env: Bindings,
  input: CreatePaymentInput
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(env, '/payments', {
    method: 'POST',
    body: input as unknown as Record<string, unknown>,
  })
}

/**
 * Buscar cobrança por ID
 */
export async function getPayment(
  env: Bindings,
  paymentId: string
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(env, `/payments/${paymentId}`)
}

/**
 * Buscar PIX QR Code de uma cobrança PIX
 */
export async function getPixQrCode(
  env: Bindings,
  paymentId: string
): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(env, `/payments/${paymentId}/pixQrCode`)
}

/**
 * Cancelar cobrança
 */
export async function cancelPayment(
  env: Bindings,
  paymentId: string
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(env, `/payments/${paymentId}`, {
    method: 'DELETE',
  })
}

/**
 * Listar cobranças de um cliente
 */
export async function listCustomerPayments(
  env: Bindings,
  customerId: string,
  params: Record<string, string> = {}
): Promise<{ data: AsaasPayment[]; totalCount: number }> {
  return asaasFetch(env, '/payments', {
    params: { customer: customerId, ...params },
  })
}

// ============================================
// SUBSCRIPTION FUNCTIONS (Cobranças Recorrentes)
// ============================================

/**
 * Criar assinatura recorrente
 */
export async function createSubscription(
  env: Bindings,
  input: CreateSubscriptionInput
): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>(env, '/subscriptions', {
    method: 'POST',
    body: input as unknown as Record<string, unknown>,
  })
}

/**
 * Buscar assinatura por ID
 */
export async function getSubscription(
  env: Bindings,
  subscriptionId: string
): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>(env, `/subscriptions/${subscriptionId}`)
}

/**
 * Cancelar assinatura
 */
export async function cancelSubscription(
  env: Bindings,
  subscriptionId: string
): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>(env, `/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
  })
}

/**
 * Listar cobranças geradas por uma assinatura
 */
export async function listSubscriptionPayments(
  env: Bindings,
  subscriptionId: string
): Promise<{ data: AsaasPayment[]; totalCount: number }> {
  return asaasFetch(env, `/subscriptions/${subscriptionId}/payments`)
}

// ============================================
// TRANSFER FUNCTIONS (Saques PIX)
// ============================================

/**
 * Criar transferência PIX
 */
export async function createPixTransfer(
  env: Bindings,
  input: CreatePixTransferInput
): Promise<AsaasTransfer> {
  return asaasFetch<AsaasTransfer>(env, '/transfers', {
    method: 'POST',
    body: {
      type: 'PIX',
      value: input.value,
      pixAddressKey: input.pixAddressKey,
      pixAddressKeyType: input.pixAddressKeyType,
      description: input.description,
      scheduleDate: input.scheduleDate,
    },
  })
}

/**
 * Consultar status de uma transferência
 */
export async function getTransfer(
  env: Bindings,
  transferId: string
): Promise<AsaasTransfer> {
  return asaasFetch<AsaasTransfer>(env, `/transfers/${transferId}`)
}

/**
 * Listar transferências
 */
export async function listTransfers(
  env: Bindings,
  params: Record<string, string> = {}
): Promise<{ data: AsaasTransfer[]; totalCount: number }> {
  return asaasFetch(env, '/transfers', { params })
}

// ============================================
// BALANCE / ACCOUNT FUNCTIONS
// ============================================

/**
 * Consultar saldo da conta Asaas
 */
export async function getBalance(env: Bindings): Promise<AsaasBalance> {
  return asaasFetch<AsaasBalance>(env, '/finance/balance')
}

/**
 * Consultar estatísticas de cobranças Asaas
 * Retorna receita estimada/confirmada/recebida/vencida + despesas
 */
export async function getPaymentStatistics(env: Bindings): Promise<AsaasPaymentStatistics> {
  return asaasFetch<AsaasPaymentStatistics>(env, '/finance/payment/statistics')
}

/**
 * Consultar dados da conta (sub-conta / wallet)
 */
export async function getAccountInfo(env: Bindings): Promise<Record<string, unknown>> {
  return asaasFetch(env, '/myAccount/commercialInfo')
}

// ============================================
// UTILITY: Map billing types
// ============================================

export function mapPaymentMethod(method: string): 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED' {
  const map: Record<string, 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'> = {
    pix: 'PIX',
    credit_card: 'CREDIT_CARD',
    boleto: 'BOLETO',
    undefined: 'UNDEFINED',
  }
  return map[method] || 'PIX'
}

export function mapBillingCycle(cycle: string): CreateSubscriptionInput['cycle'] {
  const map: Record<string, CreateSubscriptionInput['cycle']> = {
    weekly: 'WEEKLY',
    biweekly: 'BIWEEKLY',
    monthly: 'MONTHLY',
    quarterly: 'QUARTERLY',
    semiannually: 'SEMIANNUALLY',
    yearly: 'YEARLY',
    WEEKLY: 'WEEKLY',
    BIWEEKLY: 'BIWEEKLY',
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
    SEMIANNUALLY: 'SEMIANNUALLY',
    YEARLY: 'YEARLY',
  }
  return map[cycle] || 'MONTHLY'
}

export function mapPixKeyType(key: string): CreatePixTransferInput['pixAddressKeyType'] {
  const digits = key.replace(/\D/g, '')
  
  // Email: contém @
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return 'EMAIL'
  
  // CNPJ: 14 dígitos
  if (digits.length === 14) return 'CNPJ'
  
  // 11 dígitos: pode ser CPF ou CELULAR
  // Celular brasileiro: DDD (11-99) + 9 + 8 dígitos = 11 dígitos total
  // O 3º dígito é 9 para celulares (ex: 21 9 7360-3956)
  if (digits.length === 11) {
    const ddd = parseInt(digits.substring(0, 2), 10)
    const thirdDigit = digits[2]
    // DDDs válidos no Brasil: 11 a 99 (na prática 11-98)
    // Se 3º dígito é 9 e DDD é válido (>=11), é telefone celular
    if (thirdDigit === '9' && ddd >= 11 && ddd <= 99) return 'PHONE'
    // Caso contrário, é CPF
    return 'CPF'
  }
  
  // 10 dígitos: telefone fixo (DDD + 8 dígitos)
  if (digits.length === 10) return 'PHONE'
  
  // Telefone com +55: 13 dígitos (55 + DDD + 9 + 8 dígitos)
  if (digits.length === 13 && digits.startsWith('55')) return 'PHONE'
  
  // Chave aleatória (UUID/EVP)
  return 'EVP'
}
