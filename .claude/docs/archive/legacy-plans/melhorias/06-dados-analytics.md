# Melhorias — Dados & Analytics

> Propostas para instrumentação do produto, visibilidade operacional e conformidade com LGPD.

---

## 1. Event Tracking para Funil de Onboarding (GA4 + BigQuery)

**Prioridade:** 🔴 Alta | **Esforço:** M | **Sprint sugerida:** 42

**Problema:** Não temos visibilidade de onde os usuários abandonam o onboarding. Sem dados, decisões de produto são baseadas em intuição.

**Proposta:** Instrumentar todos os steps do onboarding com eventos GA4. Conectar GA4 ao BigQuery para análise histórica e funil.

**Eventos a rastrear:**

| Evento | Parâmetros |
|---|---|
| `onboarding_started` | `user_id`, `plan`, `source` |
| `onboarding_step_viewed` | `step_name`, `step_index` |
| `onboarding_step_completed` | `step_name`, `step_index`, `duration_ms` |
| `onboarding_abandoned` | `last_step`, `reason` (timeout/close) |
| `onboarding_completed` | `total_duration_ms`, `steps_skipped` |

**Implementação:**
- `src/lib/analytics.ts` — wrapper para `gtag()` com tipagem TypeScript
- GA4 já configurado? Verificar `app/layout.tsx` para tag existente
- BigQuery: habilitar export GA4 → BigQuery no Google Analytics Admin (gratuito)
- Dashboard no Looker Studio (gratuito) conectado ao BigQuery

---

## 2. Dashboard de Produto Interno para Admins

**Prioridade:** 🔴 Alta | **Esforço:** G | **Sprint sugerida:** 43–44

**Problema:** Métricas de negócio (MAU, DAU, conversão, churn) estão espalhadas em Asaas, Neon e logs de worker sem uma visão consolidada.

**Proposta:** Página `/admin/analytics` com KPIs de produto em tempo real.

**Métricas do painel:**

| Métrica | Fonte |
|---|---|
| MAU / DAU | Neon — tabela de eventos de login |
| Novos cadastros (7d, 30d) | Neon — tabela users |
| Taxa de conversão trial → pro | Asaas + Neon JOIN |
| Churn mensal | Asaas — assinaturas canceladas |
| Treinos completados (hoje, 7d) | Neon — tabela workouts |
| XP médio por usuário ativo | Neon — gamificação |

**Implementação:**
- Endpoint `GET /admin/analytics/summary` — queries SQL agregadas com cache KV de 5 min
- Novo handler `workers/api/admin-analytics.ts`
- Página `/dashboard/admin/analytics` protegida por `requiredType="admin"`
- Componentes de gráfico: considerar `recharts` (já no projeto?) ou `chart.js` via CDN

---

## 3. Cohort Analysis: Retenção por Mês de Cadastro

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 44

**Problema:** Não sabemos se os usuários que se cadastraram há 3 meses ainda estão ativos, ou se a retenção varia por período de aquisição.

**Proposta:** Query SQL de cohort que agrupa usuários pelo mês de cadastro e mede a porcentagem que retornou a cada mês subsequente.

**Query base:**

```sql
-- Cohort de retenção mensal
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('month', created_at) AS cohort_month
  FROM users
),
activity AS (
  SELECT
    user_id,
    DATE_TRUNC('month', created_at) AS activity_month
  FROM workout_sessions
)
SELECT
  c.cohort_month,
  EXTRACT(MONTH FROM AGE(a.activity_month, c.cohort_month)) AS months_since_signup,
  COUNT(DISTINCT a.user_id)::float / COUNT(DISTINCT c.user_id) AS retention_rate
FROM cohorts c
LEFT JOIN activity a USING (user_id)
GROUP BY 1, 2
ORDER BY 1, 2;
```

**Saída:** Tabela exportável para Looker Studio ou Google Sheets.

---

## 4. Heatmap de Abandono por Tela

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 43

**Problema:** Sabemos que usuários saem do app, mas não sabemos em qual tela estão quando saem.

**Proposta:** Rastrear evento `page_exit` com a rota atual ao sair do app (pagehide/visibilitychange).

**Implementação:**
- `src/hooks/use-page-exit-tracking.ts` — listener para `visibilitychange` que envia evento ao mudar para `hidden`
- Evento: `{ page: router.pathname, time_on_page_ms, scroll_depth_percent }`
- Armazenar em tabela `page_events` no Neon ou enviar direto para GA4
- Visualizar no painel admin como lista de "top páginas de saída"

**Nota:** Ferramenta externa como Hotjar ou Microsoft Clarity pode substituir implementação própria com mais features (mapa de calor visual, gravação de sessão). Custo: Clarity é gratuito.

---

## 5. A/B Testing com Feature Flags via KV

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 43

**Problema:** Não temos infraestrutura para testar variações de produto de forma controlada.

**Proposta:** Usar Cloudflare KV como store de feature flags para A/B testing simples.

**Formato da flag no KV:**

```json
{
  "key": "ab:checkout:cta-copy",
  "variants": ["Assinar agora", "Começar hoje"],
  "rollout": [50, 50],
  "enabled": true
}
```

**Implementação:**
- `workers/lib/feature-flags.ts` — lê flags do KV, atribui variante por `userId % 100`
- Endpoint `GET /feature-flags` — retorna flags aplicáveis ao usuário autenticado
- `use-feature-flag.ts` — hook React para consumir flags no frontend
- Logging: cada uso de flag registra variante para análise posterior

---

## 6. Export de Dados do Usuário (LGPD)

**Prioridade:** 🔴 Alta | **Esforço:** M | **Sprint sugerida:** 42

**Problema:** A LGPD (Lei 13.709/2018) exige que o usuário possa solicitar e receber todos os seus dados pessoais. Não ter essa funcionalidade é risco legal.

**Proposta:** Funcionalidade de export de dados na área de configurações do usuário. Gera ZIP com JSON de todos os dados do usuário.

**Dados incluídos no export:**
- Perfil pessoal (nome, email, peso, altura, etc.)
- Histórico de treinos
- Medidas corporais
- Auto-avaliações
- XP e conquistas de gamificação
- Preferências e configurações

**Implementação:**
- Endpoint `POST /account/export-data` — dispara job assíncrono
- Worker processa e salva ZIP no R2 com URL assinada (TTL 24h)
- Envia email via Resend com link para download
- Tempo máximo de processamento: 5 minutos (worker timeout considerations)
- Política: máximo 1 export por 30 dias (evitar abuso)

---

## 7. Anomaly Detection em XP (Anti-cheat)

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 44

**Problema:** O sistema de XP pode ser explorado por usuários que repetem ações automaticamente para ganhar XP rapidamente, distorcendo o leaderboard e reduzindo o valor do sistema.

**Proposta:** Detecção de padrões anômalos no ganho de XP e limitação automática (rate limiting por ação).

**Regras de proteção:**

| Regra | Limite | Ação |
|---|---|---|
| XP por ação por minuto | Max 1 evento/ação/min | Ignorar silenciosamente |
| XP por ação por dia | Configurável por `XP_PER_ACTION` | Truncar no máximo diário |
| XP total por dia | Max 3× média dos últimos 7 dias | Flagear para revisão |
| Padrão de requisição (intervalos regulares) | Desvio padrão < 2s por 10+ eventos | Bloquear e notificar admin |

**Implementação:**
- Rate limiting no endpoint `POST /gamification/xp` via `workers/middleware/rate-limit.ts`
- Campo `xp_flagged: boolean` na tabela de gamificação
- Cron diário: análise de outliers no XP do dia anterior
- Notificação ao admin: usuários com XP > 3σ da média
- `docs/XP-GOVERNANCE.md` já existe — expandir com regras de anti-cheat

---

## Resumo

| # | Item | Prioridade | Esforço | Sprint |
|---|---|---|---|---|
| 1 | Event tracking onboarding GA4 | 🔴 Alta | M | 42 |
| 2 | Dashboard interno de produto (admin) | 🔴 Alta | G | 43–44 |
| 3 | Cohort analysis retenção | 🟡 Média | M | 44 |
| 4 | Heatmap de abandono por tela | 🟡 Média | P | 43 |
| 5 | A/B testing com feature flags KV | 🟡 Média | M | 43 |
| 6 | Export de dados do usuário (LGPD) | 🔴 Alta | M | 42 |
| 7 | Anomaly detection em XP (anti-cheat) | 🟡 Média | M | 44 |
