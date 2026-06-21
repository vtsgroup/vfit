# 04 — Painel do Personal (B2B / Dashboard) — Cobertura Total

> Grupo `dashboard`. Estado atual: **~80-85% completo**. É o painel que gera receita (personal cobra alunos via Asaas). Objetivo: fechar lacunas e elevar ao nível "ferramenta profissional impecável".

---

## 1. Inventário de telas × estado × ação

| Área | Rota(s) | Estado hoje | Ação no plano |
|------|---------|-------------|---------------|
| **Home** | `/dashboard` | ✅ KPIs, receita, atividade | Estados + refino visual |
| **Complete profile / onboarding** | `/complete-profile`, `/onboarding` | ✅ | Virar destino do "cadastro adiado" (doc 02 B.5) |
| **Alunos** | `/students` (+view/edit/invite/import) | ✅ CRUD completo | Estados, paginação consistente |
| **Avaliação de aluno** | `/students/assessment/new` | ✅ | Polish |
| **Treinos** | `/workouts` (+create/view/execute) | ✅ (create = 1993 linhas!) | **Quebrar mega-form em wizard** |
| **Exercícios (lib)** | `/workouts/exercises/{create,library}`, `/exercises` | ✅ | Estados |
| **Mídia** | `/workouts/media/library` | ✅ | Validar tamanho upload (doc 06) |
| **Avaliações** | `/assessments` (+create/view/success) | ✅ v2 | Estados; PDF via queue (doc 06) |
| **Nutrição (nutricionista)** | `/meal-plans`, `/nutrition-assessments` | 🟡 Estrutura rasa | Completar lógica + **compartilhar com aluno** |
| **Mensagens** | `/messages` | ✅ (N+1 backend) | Corrigir N+1 (doc 06) + estados |
| **Notificações** | `/notifications` | ✅ | Estados |
| **Agenda** | `/calendar` | 🟡 MVP | **Agendamento por horário** + lembretes (cron já existe) |
| **Pagamentos** | `/payments` (+create/view/checkout/withdraw) | ✅ Robusto | Validação due_date (doc 06) + estados |
| **Financeiro** | `/financeiro` | ✅ Gráficos, export | Estados; consistência de números |
| **Planos** | `/plans` (+checkout/success) | ✅ | Alinhar com trial 30d (doc 02) |
| **Marketplace** | `/marketplace` (+create/view/checkout) | 🟡 Parcial | **⚠️ DECISÃO: completar ou ocultar** |
| **Afiliados** | `/affiliates` | 🟡 Subdesenvolvido | Completar (commission cron — doc 06) |
| **IA** | `/ai` | 🟡 Hub limitado | Ferramentas reais (gerar treino/conteúdo) |
| **Logs** | `/logs` | ✅ | Estados |
| **Settings** | `/settings` | ✅ | Estados |

---

## 2. Correções e melhorias prioritárias

### 🔴 Estruturais
1. **`/workouts/create` (1993 linhas)** — refatorar em **wizard multi-step** com:
   - Passos: dados → exercícios → séries/repetições → revisão.
   - Validação progressiva (erro ao sair do campo).
   - **Auto-save de rascunho** (debounce) — não perder trabalho.
2. **Calendar MVP → agendamento real** — slots por horário, disponibilidade, vínculo com aluno, lembrete automático (cron `calendar-reminders` já existe).
3. **Nutricionista (`/meal-plans`)** — completar: criar plano alimentar → **compartilhar com o aluno** (hoje não compartilha — gap de backend, doc 06).

### 🟡 Completude
4. **Afiliados** — fechar fluxo: gerar link → rastrear indicação → calcular comissão (commission cron está placeholder) → pagar via withdraw.
5. **`/ai` (personal)** — ferramentas que economizam tempo do personal: gerar treino para aluno, gerar mensagem/conteúdo, sugerir progressão. Backend `ai.ts`/`plans.ts` já existe.
6. **Marketplace** — ⚠️ DECISÃO 6: completar (vender templates entre personais) ou ocultar até ter massa crítica. Recomendação: **ocultar do nav** até S6+ se não houver demanda validada (evitar tela meia-boca).

---

## 3. Impacto do novo trial (doc 02) no dashboard
- **Widget de trial** no topo do dashboard: "Premium grátis · faltam N dias" + CTA suave.
- **Pós-trial read-only** (⚠️ DECISÃO 2 do doc 02): personal vê alunos/dados mas não cria/edita até assinar. Tela de upgrade clara e não-hostil.
- **`/plans`** e **`/complete-profile`** alinhados com o novo ciclo de vida.

---

## 4. Paginação & consistência (cross-cutting com doc 06)
Todas as listas do dashboard (`students`, `workouts`, `payments`, `assessments`) devem usar:
- Mesmo padrão de paginação (`page`/`per_page`) e mesma shape de resposta (`{success,data,pagination}`).
- Mesmos filtros/busca/ordenação visuais.

---

## 5. Os 4 estados em 100% das telas do personal
Igual ao aluno (doc 03 §6): loading skeleton, vazio com CTA, erro com retry, sucesso polido. Checklist no TRACKING (S6).

---

## 6. Critério de "perfeito" (personal)
- ✅ Mega-form de treino vira wizard com auto-save.
- ✅ Calendar com agendamento real + lembretes.
- ✅ Nutricionista compartilha plano com aluno.
- ✅ Afiliados e IA do personal entregam valor real.
- ✅ Nada "meia-boca": Marketplace decidido (completo ou oculto).
- ✅ Trial 30d integrado; 4 estados em 100% das telas.
