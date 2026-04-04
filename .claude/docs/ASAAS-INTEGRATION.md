# Asaas Payment Integration — Changelog

> **Data:** 09/02/2026  
> **Commit:** `fb8fb6b`  
> **Deploy Worker:** `3c3e035f-423f-4e2d-a309-6cd0ec868090`

---

## 📋 Resumo

Integração completa com a API de pagamentos Asaas, incluindo:
- Cobranças reais via PIX, Cartão e Boleto
- Assinaturas recorrentes (semanal, quinzenal, mensal, trimestral, semestral, anual)
- Saque PIX direto para conta do personal trainer
- Consulta de saldo (interno + Asaas)
- Contas de administrador criadas

---

## 👑 Contas de Administrador

| Nome | Email | Senha | Role |
|------|-------|-------|------|
| Emerson Xavier | `<admin_email>` | `<admin_password>` | admin |
| Victor Duarte | `<admin_email>` | `<admin_password>` | admin |

---

## 🗃️ Alterações no Banco de Dados

### Novas tabelas

1. **`payment_subscriptions`** — Assinaturas recorrentes
   - `payer_id`, `recipient_id`, `amount`, `billing_cycle`, `payment_method`
   - `status` (active, paused, cancelled, expired)
   - `asaas_subscription_id`, `platform_fee`, `commission_amount`, `net_amount`
   - `start_date`, `end_date`, `next_due_date`

2. **`pix_transfers`** — Saques PIX do personal
   - `personal_id`, `pix_key`, `pix_key_type`, `amount`, `fee`, `net_amount`
   - `status` (pending, processing, completed, failed, cancelled)
   - `asaas_transfer_id`

3. **`asaas_customers`** — Cache de IDs de clientes Asaas
   - `user_id` → `asaas_customer_id` (mapeamento)

### Alterações em tabelas existentes

- `users.role` — Nova coluna: `user`, `admin`, `super_admin` (default: `user`)

---

## 🔌 Novos Endpoints da API

### Cobranças (POST /payments melhorado)

O endpoint agora:
1. Cria automaticamente um cliente no Asaas (se não existir)
2. Gera a cobrança real na plataforma Asaas
3. Retorna QR Code PIX (quando método = PIX)
4. Pode ser usado sem Asaas (`create_in_asaas: false`)

**Response incluindo PIX:**
```json
{
  "id": "...",
  "asaas_payment_id": "pay_xxx",
  "invoice_url": "https://sandbox.asaas.com/...",
  "pix": {
    "qrCode": "base64...",
    "payload": "00020126...",
    "expirationDate": "2026-02-12T23:59:59Z"
  }
}
```

### Assinaturas Recorrentes

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/payments/subscriptions` | Criar assinatura |
| GET | `/payments/subscriptions` | Listar assinaturas |
| DELETE | `/payments/subscriptions/:id` | Cancelar assinatura |

### Saldo & Transferências PIX

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/payments/balance` | Saldo disponível |
| POST | `/payments/transfers/pix` | Solicitar saque PIX (mín R$10) |
| GET | `/payments/transfers` | Histórico de saques |

---

## 🎨 Frontend — Páginas Atualizadas

### Criar Cobrança (`/dashboard/payments/create`)
- **Abas Avulsa / Recorrente** — toggle visual entre os dois modos
- **PIX QR Code** — exibido automaticamente após criar cobrança PIX
- **Toggle Asaas** — opção de criar só no DB local ou também no Asaas
- **Recorrente** — campos de ciclo, data início/fim

### Saques PIX (`/dashboard/payments/withdraw`) — NOVA
- Cards de saldo (disponível, total recebido, total sacado, saldo Asaas)
- Formulário de saque com chave PIX e valor
- Validação de saldo disponível
- Histórico de transferências com status

### Financeiro (`/dashboard/payments`)
- Botão "Saques PIX" adicionado ao header

### Login (`/login`)
- Seção "Administradores" com botões para preencher credenciais admin

---

## 📁 Arquivos Criados/Modificados

### Novos
- `lib/asaas.ts` — Client completo da API Asaas (~350 linhas)
- `migrations/hyperdrive/0002_admin_subscriptions_transfers.sql` — Migration
- `src/app/dashboard/payments/withdraw/page.tsx` — Página de saques PIX

### Modificados
- `workers/api/payments.ts` — Integração Asaas real
- `workers/schemas/payments.ts` — Novos schemas Zod
- `src/hooks/use-payments.ts` — 12 hooks (payments, subscriptions, transfers, balance)
- `src/app/dashboard/payments/create/page.tsx` — Abas + QR code PIX
- `src/app/dashboard/payments/page.tsx` — Link saques PIX
- `src/app/(auth)/login/page.tsx` — Botões admin

---

## ⚙️ Configuração

### Secrets do Worker (Wrangler)
- `ASAAS_API_KEY` — Chave de API Asaas (sandbox: `$aact_YT...`)
- `ASAAS_WEBHOOK_TOKEN` — Token webhook Asaas (opcional)

### Detecção de Ambiente
- Sandbox: qualquer chave que NÃO comece com `$aact_`
- Produção: chave começando com `$aact_`
- URLs: `sandbox.asaas.com` vs `api.asaas.com`

---

## 🧪 Teste

```bash
# Login admin
curl -s -X POST "https://api.vfit.app.br/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<admin_email>","password":"<admin_password>","turnstile_token":"<turnstile_token_real>"}'

# Criar cobrança PIX (com Asaas)
curl -s -X POST "https://api.vfit.app.br/api/v1/payments" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payer_id":"STUDENT_ID","amount":150,"payment_method":"pix","create_in_asaas":true}'

# Ver saldo
curl -s "https://api.vfit.app.br/api/v1/payments/balance" \
  -H "Authorization: Bearer TOKEN"
```
