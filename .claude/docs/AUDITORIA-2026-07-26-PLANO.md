# Plano de Remediação — Auditoria completa 2026-07-26

Base: `vfit-production` v5.6.3. Seis auditorias paralelas (frontend/UX, backend/dados,
ruído/higiene, perf/infra/deploy, segurança, sweep IDOR).

**Legenda de confiança**
- ✅ = verificado diretamente nesta sessão (comando + saída no histórico)
- ◻ = reportado por agente com `file:line`, não re-verificado
- ⚑ = veio de agente que retornou com flag de política; tratado como pista e re-lido na fonte

Nada neste plano foi executado. Nenhuma linha de código foi alterada.

---

## 1. O padrão de fundo

Quatro auditorias independentes convergiram na mesma conclusão estrutural:
**o sistema foi construído para falhar em silêncio.**

| Camada | Mecanismo | Ref |
|---|---|---|
| Deploy | Worker deploya com `optional: true`; falha é engolida | `cf-deploy.js:305-306` ◻ |
| Deploy | `quality:ci` existe e nunca é invocado por caminho de deploy | `package.json:33` ◻ |
| Webhook | `catch` loga e devolve `200` → Asaas nunca reenvia | `payments.ts:520-525` ✅ |
| Rollback | `.catch(() => {})` no `DELETE FROM users` de compensação | `oauth.ts:304,326` ◻ |
| Sessão | `} catch {}` puro; aluno perde treino registrado | `workout-sessions.ts:212,217` ◻ |
| Auth | Turnstile *fail-open*: resultado só é logado | `auth.ts:225-232` ◻ |
| Auth | Rate limit *fail-open* se o KV falhar | `rate-limit.ts:94-100` ◻ |
| Observabilidade | Sem `[observability]` → logs do Worker não persistem | `wrangler.toml` ◻ |

O incidente já documentado em `DB-PROD-DIVERGENCE-RUNBOOK.md` (5 bloqueadores em
cascata, saque PIX em 500) é consequência previsível desse padrão, não azar.

**Consequência para o plano:** consertar *observabilidade e gates* vem antes de
otimizar qualquer coisa. Otimizar um sistema que não sabe quando quebrou é
desperdício.

---

## 2. Onda 0 — Bloqueia cobrar, ou perde dinheiro agora

Alvo: horas, não dias. Nenhum item aqui exige refatoração.

| # | Item | Ref | Por que é Onda 0 | Esf |
|---|---|---|---|---|
| 0.1 | CNPJ placeholder `XX.XXX.XXX/0001-XX` em páginas legais públicas | `privacidade/page.tsx:146`, `termos/page.tsx:102` ◻ | Cobrar Early Access com Termos/Privacidade inválidos é exposição jurídica direta | S |
| 0.2 | `UNIQUE` ausente em `affiliate_commissions(payment_id)` | `0001_initial_schema.sql:360-380` ✅ | Dois retries concorrentes do webhook creditam saldo em dobro. O padrão correto já existe no repo (`0034:36`, `0001:282`) — comissão é a exceção | S |
| 0.3 | Webhook devolve `200` em erro não-tratado | `payments.ts:520-525` ✅ | Asaas nunca reenvia; pagamento pago fica `pending` eterno. Classe de bug que já mordeu na v5.6.3 | S |
| 0.4 | `UPDATE payments` sem guarda de status | `payments.ts:485-492` ✅ | Reentrega reprocessa o bloco de comissão. O handler vizinho (`:389`) já tem a guarda — só espelhar | S |
| 0.5 | E-mail de usuário em ≥12 `console.log` de Worker | `payments.ts:985,987`; `auth.ts:383,800,1407`; `oauth.ts:236,421`; `passkey.ts:117` ◻ | PII em log de produção = exposição LGPD antes de cobrar | S |
| 0.6 | Token de bypass hardcoded `offshore-proz-cron-2024` | `workers/whatsapp/src/index.ts:157-160` ◻ | Senha fixa no código **e no histórico do git**. Se `ALLOW_FALLBACK_TOKEN=1`, qualquer um com acesso ao repo dispara WhatsApp em nome do sistema | S |
| 0.7 | Turnstile *fail-open* no `/auth/register` | `auth.ts:225-232`, `lib/turnstile.ts:96-113` ◻ | Anti-bot não existe na prática; única barreira é 3/h por IP | S |
| 0.8 | Webhook Asaas aceita a **API key mestra** como credencial | `payments.ts:133,646` ◻ | Vazar o token de webhook passa a equivaler a vazar a chave que move dinheiro | S |

**Critério de saída da Onda 0:** cada item com teste ou verificação explícita.
Para 0.2, provar com dois `INSERT` concorrentes que o segundo falha.
Para 0.3/0.4, provar com replay do mesmo evento que a comissão não duplica.

---

## 3. Onda 1 — Enxergar quando quebra

Sem esta onda, todas as demais são fé.

| # | Item | Ref | Ganho | Esf |
|---|---|---|---|---|
| 1.1 | Remover `optional: true` do deploy do Worker | `cf-deploy.js:305-306,313-315` ◻ | Uma linha; elimina a classe inteira "Pages novo + Worker velho, invisível" | S |
| 1.2 | `[observability] enabled = true` no `wrangler.toml` | ◻ | Sem isso não existe post-mortem possível | S |
| 1.3 | Rodar `quality:ci` antes de qualquer upload | `package.json:20,33` ◻ | Hoje lint/tipos/testes nunca bloqueiam produção | S |
| 1.4 | Smoke test pós-deploy com abort | `package.json:41-48` ◻ | 3 suítes já escritas e **nunca executadas** — maior assimetria esforço/valor do repo | M |
| 1.5 | Unificar dono do deploy (script local **ou** CI por tag) | `cf-deploy.js:331,334` + `deploy.yml` ◻ | Hoje um `cf:deploy` produz duas builds concorrentes; qual vence é corrida | M |
| 1.6 | Alerta sobre Analytics Engine (5xx, p95 por rota) | `middleware/analytics.ts:23-58` ◻ | Instrumentação já existe e é *write-only*; falta só consultar e disparar | M |
| 1.7 | Registrar deployment ID p/ rollback de 1 comando | ◻ | Hoje reverter é investigação, não comando | M |
| 1.8 | Rate limit *fail-closed* em login/reset/payments | `rate-limit.ts:94-100` ◻ | Degradação do KV hoje desliga brute-force protection sem alerta | M |

---

## 4. Onda 2 — Atomicidade do dinheiro

A refatoração de maior retorno do repositório, e a mais delicada.

**Causa-raiz:** `BEGIN` não aparece uma única vez em `workers/` ou `lib/` ◻ — o
driver `neon()` HTTP não abre transação multi-statement, e o produto é financeiro.

| # | Item | Ref | Esf |
|---|---|---|---|
| 2.1 | Migrar caminhos de dinheiro para `Pool`/`transaction()` do `@neondatabase/serverless` | `lib/db.ts` ◻ | L |
| 2.2 | Crédito de comissão numa transação única (hoje 3 escritas soltas) | `payments.ts:3248,3254-3261,3264` ◻ | M |
| 2.3 | Inserir pagamento local **antes** de criar cobrança no Asaas, ou compensar no catch | `payments.ts:935-942 → 1017-1029` ◻ | M |
| 2.4 | Padronizar idempotência: constraint no banco, nunca `SELECT` prévio | `payments.ts:3221-3227` ✅ | M |
| 2.5 | Expiração B2B derivada de `dueDate`/`confirmedDate`, não de `new Date()` | `payments.ts:428-429` ◻ | S |
| 2.6 | `externalReference` em JSON validado por Zod (hoje `split('_')` por índice) | `payments.ts:418-423` ◻ | S |
| 2.7 | Timeout (`AbortSignal`) em toda chamada externa — hoje **zero** no código | `lib/asaas.ts:63`, `api/ai.ts:607` ◻ | S |
| 2.8 | Reativar ou remover crons desligados | `wrangler.toml:175-184` ◻ | S |

**Sobre 2.8 — é bug de produto, não de infra.** Com os crons comentados, não rodam:
expiração de XP, reconciliação de consultas, lembretes de calendário, e o cálculo de
comissão de afiliado — que além de desligado, tem handler que só loga
`TODO: implement in LOTE 08` (`workers/index.ts:769`) ◻.

---

## 5. Onda 3 — Peso e custo

| # | Item | Medição | Ref | Esf |
|---|---|---|---|---|
| 3.1 | `inline-css.mjs` injeta 736 KB em cada um dos 149 HTMLs **e** rebaixa o CSS via JS | `out/index.html` = 1.277.566 B; HTML total 118 MB | `scripts/inline-css.mjs:109,72` ✅ | M |
| 3.2 | PNG de 3.417 KB servido `immutable` | 51% de `public/` | `profile-picture-victor.png` ✅ | S |
| 3.3 | `pdf-lib` no caminho quente do Worker por import estático | Worker gzip a 742,62 KiB = **72,5% do limite Free de 1 MiB** | `workers/index.ts:45` ◻ | S |
| 3.4 | Imagens do R2 servidas **pelo Worker** apesar de `R2_IMAGES_URL` existir | invocação + CPU por imagem | `workers/index.ts:110` ◻ | M |
| 3.5 | Polling de 3s em avaliações (1.200 req/h por aba) | 19 `refetchInterval` em `src/` | `use-assessments.ts:489` ◻ | M |
| 3.6 | Hyperdrive **bindado e não usado** | handshake até `sa-east-1` por request | `wrangler.toml:59-62` vs `lib/db.ts:143-161` ◻ | M |
| 3.7 | 582 `console.log` no Worker sem amostragem | custo linear ao tráfego | ◻ | M |
| 3.8 | 40 módulos de API importados eagerly, 0 dinâmicos | cold start | `workers/index.ts:53-91` ◻ | M |

**Sobre Cloudflare Images (pergunta do usuário):** não comprar ainda. Polish já está
ligado com WebP, cobrindo conversão de formato. O desperdício real é *dimensional*, e
o pior caso (3.2) é asset **estático** — resolve no build, de graça. Transformations
se paga nas fotos de avaliação (upload de usuário, tamanhos sob demanda), mas só
depois de 3.4, que é gratuito. Manter **"This zone only"**.

---

## 6. Onda 4 — Higiene

| # | Item | Volume | Esf |
|---|---|---|---|
| 4.1 | 29 módulos órfãos (0 importadores, verificados 1 a 1) | **6.758 LOC** ◻ | M |
| 4.2 | 5 scripts órfãos + `db:seed` apontando p/ arquivo inexistente | 1.242 LOC ◻ | S |
| 4.3 | `.psd` versionados | 15.484 KB ◻ | S |
| 4.4 | `twa/.gradle/`, `.claude/worktrees/.next/`, `out/`, QA screenshots | ~4,2 MB ◻ | S |
| 4.5 | `docs/CHANGELOG.md` duplicado e 10 dias atrasado vs `.claude/docs/` | 7.798 linhas ◻ | S |
| 4.6 | 33 branches locais já mergeadas | de 42 ◻ | S |
| 4.7 | 5 deps declaradas com 0 referências | ◻ | S |
| 4.8 | 3 sistemas de design token coexistindo; 5 componentes de botão | ◻ | L |

**O design system fantasma.** Convergência de três auditorias: `hero-ultra`,
`navbar-ultra`, `feature-cards-ultra`, `login/page-ultra.tsx` e `vfit-tokens.ts` estão
todos órfãos ◻ — mas `.claude/docs/` mantém ~45 KB de documentação **viva** descrevendo
eles, e a vitrine `redesign-showcase` vai para produção sem guarda, com gradientes
quebrados ✅. Documentação viva descrevendo código morto, publicado e visualmente
quebrado. Tratar como uma unidade: deletar componentes + arquivar docs + remover a
rota do build.

---

## 7. Segurança — o que NÃO é problema

O agente de segurança verificou e descartou explicitamente. Não reauditar:

- **SQL injection:** sweep completo. Todo `ORDER BY` dinâmico passa por mapa fechado;
  todo `SET ${clauses}` parte de schema Zod sem `.passthrough()`. `pgQuery(env, '... $1', [p])`
  é consistente nas rotas ativas.
- **JWT:** imune a alg confusion — algoritmo fixo, header `alg` do token ignorado,
  assinatura validada antes do parse. Segredos distintos para access/refresh. bcrypt 12 rounds.
- **CORS:** allowlist exata, sem wildcard com credentials; bypasses clássicos testados e bloqueados.
- **Webhooks:** *fail-closed* — sem token configurado, tudo é 401.
- **Segredos:** nenhum `.env` real versionado, nem no histórico. Nenhum token/senha logado.
- **Matemática da comissão:** `marketplace_creator_share: 70` é percentual, não fração.
  R$100 → R$70. Correto.
- **`/internal/db-admin`:** não existe mais no código atual.

Ressalvas remanescentes viraram itens 0.6–0.8 e 1.8, mais os MÉDIOs de CSP/`localStorage`
(Onda 2+, esforço L).

---

## 8. Sweep de IDOR / wiring de auth — fechado

O agente voltou **com flag de política** (`SECURITY WARNING`: auto-mode bloqueou uma
ação dele). Por isso o output foi tratado como pista, não como resultado. Os itens ✅
abaixo eu reli na fonte nesta sessão; os ◻⚑ vieram do agente e **não** foram
re-verificados por mim.

### 8.1 A fronteira `admin` < `super_admin` não é aplicada — dois caminhos ✅

O código *tenta* separar dois níveis: `requireSuperAdmin` ("Acesso restrito a super
administradores", `admin.ts:155`) protege as mutações de config; `requireAdmin`
(`admin.ts:69-79`) aceita `admin` **ou** `super_admin` e guarda todo o `adminRoutes`
via `use('*')`. Qualquer `admin` atravessa essa fronteira por duas vias independentes.

**(a) Escrita crua de `role` — achado desta verificação, o agente não viu**

`adminRoutes.patch('/personals/:id')` (`admin.ts:1208`) tem allowlist de campos
(`allowed = ['subscription_plan','subscription_expires_at','cref','specialties','bio']`,
linha 1212) — mas ela governa **só** o UPDATE em `personals`. Um segundo bloco
(linhas 1269-1279) escreve em `users` por fora dela:

```ts
if (body.full_name || body.email || body.role) {
  ...
  if (body.role) { userUpdates.push(`role = $${ui}`); userParams.push(body.role); ui++ }
  await pgQuery(c.env, `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${ui}`, [...userParams, id])
}
```

`body` vem de `await c.req.json()` cru — sem Zod — e **o valor de `role` não tem
allowlist**. `personals.id` é `UUID PRIMARY KEY REFERENCES users(id)`
(`migrations/hyperdrive/0001_initial_schema.sql:41`), logo o `WHERE id = :id` acerta
exatamente a linha de `users` daquele personal. Cadeia: `admin` usa (ou registra) uma
conta personal → `PATCH /api/v1/admin/personals/<id>` com `{"role":"super_admin"}` →
loga nessa conta → o JWT passa a carregar `role='super_admin'`. **Escalada vertical em
uma request.** Correção: allowlist de valor + exigir `requireSuperAdmin` para tocar em
`role`. Esforço S.

**(b) Modo simulação**

`POST /api/v1/admin/simulation/session` (`admin.ts:428`) é guardado por
`requireAdminOrSuperAdmin` (`admin.ts:162-168`), que aceita `admin`. A única checagem
do alvo é de **tipo**, não de vínculo (`if (!isSuperAdmin && target.user_type !== mode)`).
A sessão vai para `KV_SESSIONS` com TTL de 8h e, em `middleware/auth.ts:80-93`, toda
request seguinte troca a identidade:

```ts
const shouldApplySimulation = !pathname.startsWith('/api/v1/admin')   // :71
if ((payload.role === 'super_admin' || payload.role === 'admin') && shouldApplySimulation) {
  ...
  effectiveUserId = simulation.target_user_id
}
c.set('userId', effectiveUserId)                                       // :97
```

Como `shouldApplySimulation` exclui apenas `/api/v1/admin`, a troca vale em
`/api/v1/payments/*`, `/api/v1/students/*` etc. — **leitura e escrita** como a vítima,
inclusive rotas de dinheiro. Sem audit log: `grep audit|INSERT INTO|logger` no handler
não retorna nada. Correção: trocar o guard para `requireSuperAdmin`, exigir step-up,
registrar em audit log e bloquear métodos mutantes sob simulação. Esforço M.

**Calibragem.** O agente marcou (b) como ALTO e não CRÍTICO por exigir conta `admin`
já autenticada. Aceito o raciocínio para (b) isolado — mas com (a) no mesmo router a
conclusão muda: o nível `admin` **é** o nível `super_admin`, só que sem audit trail.
Se contas `admin` forem operadores terceirizados ou suporte, isto é CRÍTICO no seu
modelo de ameaça. Decisão de negócio, não técnica — precisa da sua resposta.

### 8.2 `plans.ts` — duas rotas sem wiring de auth ◻⚑

`POST /plans/generate` (`plans.ts:93`) e `POST /plans/save` (`:231`) não têm
`authMiddleware` nem `plans.use('*', ...)`; o arquivo só aplica auth por rota **a partir
da linha 335**. Nenhum middleware global popula auth. Consequências: em `/generate`,
`c.get('jwtPayload')` é sempre `undefined` → o gate de negócio "1 plano grátis"
(`canGenerateMorePlans`) **nunca executa**, mesmo com Bearer válido, e a rota de IA
fica aberta a anônimos; em `/save`, `c.get('userId')` é sempre `undefined` → a rota
**falha fechada** (400) em 100% das chamadas, ou seja, está morta.

O agente se autocorrigiu num ponto que vale registrar: `/generate` **não** está só sob
rate-limit genérico — tem entrada dedicada de 10/h por IP (`constants.ts:340`) ◻. Isso
reduz o abuso de custo a "precisa rotacionar IP"; o dano principal é o **gate de receita
inerte**. Correção: `authMiddleware` nas duas (ou `optionalAuth` em `/generate` se o
modo guest for pra valer — hoje não existe mecanismo de guest id no código). Esforço S.

### 8.3 Blacklist de token é *fail-open* ◻⚑

`middleware/auth.ts:64-68`: se o `KV_SESSIONS` falhar, o `catch` só faz `console.warn`
e segue. Todo token revogado volta a valer até o `exp` — logout, "encerrar sessões" e
revogação pós-incidente param de funcionar exatamente durante instabilidade. É o mesmo
antipadrão do rate-limit (`rate-limit.ts:94-100`, já na tabela da §1) e os dois compõem.
Correção: fail-closed (503) + alerta no Sentry. Esforço S.

### 8.4 Onde entra nas ondas

| Item | Onda | Esforço |
|---|---|---|
| 8.1(a) allowlist de valor em `role` | **0** — some com a fronteira admin/super_admin | S |
| 8.2 `authMiddleware` em `/generate` e `/save` | **0** — gate de receita inerte | S |
| 8.3 fail-closed na blacklist | **1** — junto com o fail-open do rate-limit | S |
| 8.1(b) simulação: guard + audit + read-only | **2** — mexe em fluxo de suporte | M |

Os três S somados são uma tarde de trabalho e fecham a maior parte do risco. O M da
simulação precisa de decisão de produto antes (suporte usa isso hoje?).

---

## 9. Fora de escopo deliberado

- `git filter-repo` nos `.psd` (size-pack 2,73 GiB): reescreve histórico, exige
  coordenação. Fazer só depois que o resto estabilizar.
- Migração de tokens para cookie `HttpOnly` + CSP com nonce: correto, mas esforço L
  e toca autenticação inteira. Depois da Onda 2.
- Consolidação dos 3 sistemas de design token: depois de 4.1.

## 10. Tarefa paralela registrada

Migração da conta Unipile do WhatsApp para `447446970650` (account id
`XtHqTYIdTyaC7VCGxUhmlQ`). Ao fazer: `UNIPILE_WHATSAPP_ACCOUNT_PHONE` e
`UNIPILE_WHATSAPP_GROUP_PROVIDER_ID` estão **hardcoded em `workers/whatsapp/wrangler.toml`**
(versionado) ◻. Atualizar `.env.local` sozinho não afeta produção. Mover para secret
em vez de recommitar novos valores.
