/**
 * src/hooks/use-payments.ts
 *
 * Payments hooks — TanStack Query
 *
 * Exports: PaymentListItem, PaymentDetail, PaymentStats, PaymentListResponse, PaymentListParams
 * Hooks: useMutation, useQuery, useQueryClient, useRouter, useAuthStore, usePayments
 * Features: Auth: useAuthStore · React Query
 */

// ============================================
// Payments hooks — TanStack Query
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { logClientIssue } from '@/lib/debug-logger'

// ============================================
// Types
// ============================================

export interface PaymentListItem {
  id: string
  payer_id: string
  payer_name: string
  recipient_id: string
  amount: number
  platform_fee: number
  commission: number
  net_amount: number
  status: 'pending' | 'confirmed' | 'failed' | 'refunded' | 'cancelled'
  payment_method: 'pix' | 'credit_card' | 'boleto'
  due_date: string | null
  paid_at: string | null
  description: string | null
  invoice_url: string | null
  receipt_url: string | null
  asaas_payment_id: string | null
  created_at: string
}

export interface PaymentDetail extends PaymentListItem {
  recipient_name: string
  stripe_payment_intent_id: string | null
  updated_at: string
}

export interface PaymentStats {
  summary: {
    total_revenue: number
    total_received: number
    total_pending: number
    total_overdue: number
    total_platform_fees: number
    total_commissions: number
    payment_count: number
  }
  monthly_revenue: {
    month: string
    revenue: number
    count: number
  }[]
}

export interface PaymentListResponse {
  payments: PaymentListItem[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface PaymentListParams {
  page?: number
  per_page?: number
  status?: string
  payment_method?: string
  payer_id?: string
  date_from?: string
  date_to?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface CreatePaymentInput {
  payer_id: string
  amount: number
  payment_method: 'pix' | 'credit_card' | 'boleto'
  due_date?: string
  description?: string | null
  create_in_asaas?: boolean
}

export interface CreatePaymentResponse {
  id: string
  amount: number
  platform_fee: number
  commission: number
  net_amount: number
  status: string
  payment_method: string
  due_date: string
  asaas_payment_id: string | null
  invoice_url: string | null
  pix: {
    qrCode?: string
    payload?: string
    expirationDate?: string
  } | null
}

export interface CreatePaymentLinkInput {
  payer_id: string
  amount: number
  payment_method?: 'pix' | 'credit_card' | 'boleto'
  due_date?: string
  description?: string | null
  message_template?: string | null
}

export interface CreatePaymentLinkResponse {
  payment_id: string
  asaas_payment_id: string
  invoice_url: string | null
  whatsapp_url: string | null
  whatsapp_phone: string | null
  message_preview: string
  fallback: boolean
  amount: number
  due_date: string
}

// --- Subscription Types ---

export interface SubscriptionItem {
  id: string
  payer_id: string
  payer_name: string
  recipient_id: string
  amount: number
  billing_cycle: string
  payment_method: string
  status: string
  start_date: string
  end_date: string | null
  next_due_date: string | null
  asaas_subscription_id: string | null
  platform_fee: number
  commission_amount: number
  net_amount: number
  total_charges: number
  total_paid: number
  description: string | null
  created_at: string
}

export interface CreateSubscriptionInput {
  payer_id: string
  amount: number
  payment_method: 'pix' | 'credit_card' | 'boleto'
  billing_cycle: string
  start_date: string
  end_date?: string
  description?: string | null
}

// --- Transfer Types ---

export interface PixTransferItem {
  id: string
  personal_id: string
  pix_key: string
  pix_key_type: string
  amount: number
  fee: number
  net_amount: number
  status: string
  asaas_transfer_id: string | null
  requested_at: string
  completed_at: string | null
  created_at: string
}

export interface BalanceInfo {
  available_balance: number
  total_received: number
  total_withdrawn: number
  asaas_balance: number | null
}

export interface RequestPixTransferInput {
  amount: number
  pix_key: string
  description?: string
}

// ============================================
// Query hooks
// ============================================

export function usePayments(params: PaymentListParams = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const queryString = new URLSearchParams()
  if (params.page) queryString.set('page', String(params.page))
  if (params.per_page) queryString.set('per_page', String(params.per_page))
  if (params.status) queryString.set('status', params.status)
  if (params.payment_method) queryString.set('payment_method', params.payment_method)
  if (params.payer_id) queryString.set('payer_id', params.payer_id)
  if (params.date_from) queryString.set('date_from', params.date_from)
  if (params.date_to) queryString.set('date_to', params.date_to)
  if (params.sort) queryString.set('sort', params.sort)
  if (params.order) queryString.set('order', params.order)

  const qs = queryString.toString()

  return useQuery<PaymentListResponse>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const res = await api.get<PaymentListResponse>(`/payments${qs ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function usePayment(id: string, options?: { pollingEnabled?: boolean }) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<{ payment: PaymentDetail }>({
    queryKey: ['payments', id],
    queryFn: async () => {
      const res = await api.get<{ payment: PaymentDetail }>(`/payments/${id}`)
      return res.data
    },
    enabled: isReady && !!id,
    ...APP_QUERY_CACHE.detail,
    // Polling automático quando status=pending (PIX aguardando pagamento)
    refetchInterval: (query) => {
      if (!options?.pollingEnabled) return false
      const status = query.state.data?.payment?.status
      if (status !== 'pending') return false

      const method = query.state.data?.payment?.payment_method
      if (method === 'pix') return 5000
      if (method === 'boleto') return 60_000
      return 15_000
    },
  })
}

export function usePaymentStats() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<PaymentStats>({
    queryKey: ['payments', 'stats'],
    queryFn: async () => {
      const res = await api.get<PaymentStats>('/payments/stats')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.stats,
  })
}

// ============================================
// Subscription hooks
// ============================================

export function useSubscriptions(params: { page?: number; status?: string; payer_id?: string } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.status) qs.set('status', params.status)
  if (params.payer_id) qs.set('payer_id', params.payer_id)

  return useQuery<{ subscriptions: SubscriptionItem[]; meta: { page: number; per_page: number; total: number; total_pages: number } }>({
    queryKey: ['subscriptions', params],
    queryFn: async () => {
      const res = await api.get<{ subscriptions: SubscriptionItem[]; meta: { page: number; per_page: number; total: number; total_pages: number } }>(`/payments/subscriptions${qs.toString() ? `?${qs}` : ''}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: CreateSubscriptionInput) =>
      api.post('/payments/subscriptions', data),
    onMutate: () => {
      void logClientIssue({
        level: 'info',
        source: 'payments.create-subscription',
        message: 'Tentando criar assinatura recorrente',
      })
    },
    onSuccess: () => {
      toast.success('Assinatura recorrente criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      router.push('/dashboard/payments')
      void logClientIssue({
        level: 'info',
        source: 'payments.create-subscription',
        message: 'Assinatura recorrente criada com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar assinatura')
      void logClientIssue({
        level: 'error',
        source: 'payments.create-subscription',
        message: err.message || 'Erro ao criar assinatura',
      })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/payments/subscriptions/${id}`),
    onMutate: (id: string) => {
      void logClientIssue({
        level: 'info',
        source: 'payments.cancel-subscription',
        message: 'Tentando cancelar assinatura',
        context: { id },
      })
    },
    onSuccess: () => {
      toast.success('Assinatura cancelada')
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      void logClientIssue({
        level: 'info',
        source: 'payments.cancel-subscription',
        message: 'Assinatura cancelada com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao cancelar assinatura')
      void logClientIssue({
        level: 'error',
        source: 'payments.cancel-subscription',
        message: err.message || 'Erro ao cancelar assinatura',
      })
    },
  })
}

// ============================================
// Balance & Transfer hooks
// ============================================

export function useBalance() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<BalanceInfo>({
    queryKey: ['payments', 'balance'],
    queryFn: async () => {
      const res = await api.get<BalanceInfo>('/payments/balance')
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.stats,
  })
}

export function useTransfers(params: { page?: number } = {}) {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery<{ transfers: PixTransferItem[]; meta: { page: number; per_page: number; total: number; total_pages: number } }>({
    queryKey: ['transfers', params],
    queryFn: async () => {
      const qs = params.page ? `?page=${params.page}` : ''
      const res = await api.get<{ transfers: PixTransferItem[]; meta: { page: number; per_page: number; total: number; total_pages: number } }>(`/payments/transfers${qs}`)
      return res.data
    },
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
    refetchInterval: (query) => {
      const hasPending = (query.state.data?.transfers ?? []).some(
        (transfer) => transfer.status === 'pending' || transfer.status === 'processing'
      )
      return hasPending ? 15_000 : false
    },
  })
}

export function useRequestPixTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RequestPixTransferInput) =>
      api.post('/payments/transfers/pix', data),
    onMutate: () => {
      void logClientIssue({
        level: 'info',
        source: 'payments.request-pix-transfer',
        message: 'Tentando solicitar saque PIX',
      })
    },
    onSuccess: () => {
      toast.success('Saque PIX solicitado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['payments', 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      void logClientIssue({
        level: 'info',
        source: 'payments.request-pix-transfer',
        message: 'Saque PIX solicitado com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao solicitar saque')
      void logClientIssue({
        level: 'error',
        source: 'payments.request-pix-transfer',
        message: err.message || 'Erro ao solicitar saque',
      })
    },
  })
}

// ============================================
// Checkout hooks (Student in-app payment)
// ============================================

export interface CheckoutPayInput {
  payment_method: 'pix' | 'credit_card' | 'boleto'
  cpf?: string
  card_holder_name?: string
  card_number?: string
  expiry_month?: string
  expiry_year?: string
  ccv?: string
  holder_name?: string
  holder_email?: string
  holder_cpf?: string
  holder_phone?: string
  holder_postal_code?: string
  holder_address_number?: string
  installment_count?: number
  credit_card_token?: string
}

export interface CheckoutPayResult {
  payment_id: string
  asaas_payment_id: string
  status: 'pending' | 'confirmed'
  payment_method: string
  fallback?: boolean
  invoice_url?: string | null
  message?: string
  pix?: { qrCode: string; payload: string; expirationDate: string } | null
  boleto?: { identificationField: string | null; bankSlipUrl: string | null; nossoNumero: string | null } | null
  credit_card?: { number: string; brand: string; token: string | null } | null
}

export function useCheckoutPay(paymentId: string) {
  const queryClient = useQueryClient()

  return useMutation<{ data: CheckoutPayResult }, Error, CheckoutPayInput>({
    mutationFn: (data) =>
      api.post<CheckoutPayResult>(`/payments/${paymentId}/pay`, data),
    onMutate: (data) => {
      void logClientIssue({
        level: 'info',
        source: 'payments.checkout-pay',
        message: `Iniciando tentativa de pagamento (${data.payment_method})`,
        context: { paymentId, payment_method: data.payment_method },
      })
    },
    onSuccess: (response) => {
      const result = (response as { data?: CheckoutPayResult })?.data
      if (result?.status === 'confirmed') {
        toast.success('Pagamento confirmado com sucesso!')
      }
      queryClient.invalidateQueries({ queryKey: ['payments', paymentId] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] })
      void logClientIssue({
        level: 'info',
        source: 'payments.checkout-pay',
        message: `Retorno do checkout: status=${result?.status ?? 'unknown'}`,
        context: {
          paymentId,
          status: result?.status,
          payment_method: result?.payment_method,
          fallback: result?.fallback,
        },
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao processar pagamento')
      void logClientIssue({
        level: 'error',
        source: 'payments.checkout-pay',
        message: err.message || 'Erro ao processar pagamento',
        context: { paymentId },
      })
    },
  })
}

// ============================================
// Mutation hooks
// ============================================

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation<{ data: CreatePaymentResponse }, Error, CreatePaymentInput>({
    mutationFn: (data) =>
      api.post<CreatePaymentResponse>('/payments', data),
    onMutate: () => {
      void logClientIssue({
        level: 'info',
        source: 'payments.create-payment',
        message: 'Tentando criar cobrança',
      })
    },
    onSuccess: () => {
      toast.success('Cobrança criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] })
      void logClientIssue({
        level: 'info',
        source: 'payments.create-payment',
        message: 'Cobrança criada com sucesso',
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao criar cobrança')
      void logClientIssue({
        level: 'error',
        source: 'payments.create-payment',
        message: err.message || 'Erro ao criar cobrança',
      })
    },
  })
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient()

  return useMutation<{ data: CreatePaymentLinkResponse }, Error, CreatePaymentLinkInput>({
    mutationFn: (data) => api.post<CreatePaymentLinkResponse>('/payments/link', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] })
      toast.success('Link de pagamento gerado com sucesso!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao gerar link de pagamento')
    },
  })
}

export function useUpdatePaymentStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { status: string; paid_at?: string | null }) =>
      api.patch(`/payments/${id}`, data),
    onMutate: () => {
      void logClientIssue({
        level: 'info',
        source: 'payments.update-status',
        message: 'Tentando atualizar status de pagamento',
        context: { id },
      })
    },
    onSuccess: () => {
      toast.success('Status atualizado!')
      queryClient.invalidateQueries({ queryKey: ['payments', id] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] })
      void logClientIssue({
        level: 'info',
        source: 'payments.update-status',
        message: 'Status de pagamento atualizado com sucesso',
        context: { id },
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar status')
      void logClientIssue({
        level: 'error',
        source: 'payments.update-status',
        message: err.message || 'Erro ao atualizar status',
        context: { id },
      })
    },
  })
}

export function useCancelPayment(id: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => api.delete(`/payments/${id}`),
    onMutate: async () => {
      void logClientIssue({
        level: 'info',
        source: 'payments.cancel-payment',
        message: 'Tentando cancelar pagamento',
        context: { id },
      })

      await queryClient.cancelQueries({ queryKey: ['payments'] })

      const previousList = queryClient.getQueriesData<PaymentListResponse>({ queryKey: ['payments'] })

      // Optimistic: remover pagamento de todas as queries de lista
      queryClient.setQueriesData<PaymentListResponse>(
        { queryKey: ['payments'] },
        (old) => {
          if (!old?.payments) return old
          return {
            ...old,
            payments: old.payments.filter((p) => p.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          }
        }
      )

      return { previousList }
    },
    onError: (err: Error, _, context) => {
      if (context?.previousList) {
        for (const [queryKey, data] of context.previousList) {
          queryClient.setQueryData(queryKey, data)
        }
      }
      toast.error(err.message || 'Erro ao cancelar pagamento')
      void logClientIssue({
        level: 'error',
        source: 'payments.cancel-payment',
        message: err.message || 'Erro ao cancelar pagamento',
        context: { id },
      })
    },
    onSuccess: () => {
      toast.success('Pagamento cancelado')
      router.push('/dashboard/payments')
      void logClientIssue({
        level: 'info',
        source: 'payments.cancel-payment',
        message: 'Pagamento cancelado com sucesso',
        context: { id },
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'stats'] })
    },
  })
}
