# 📱 Mapa de Telas — Prioridade de Redesign

> Todas as 65 páginas ordenadas por impacto e frequência de uso.

---

## Classificação de Prioridade

| Tier | Impacto | Páginas | Critério |
|:----:|---------|:-------:|----------|
| 🔴 P0 | Crítico — vitrine | 12 | Primeira impressão / conversão |
| 🟡 P1 | Alto — uso diário | 18 | Páginas mais acessadas |
| 🟢 P2 | Médio — funcional | 20 | Funcionalidades completas |
| ⚪ P3 | Baixo — raro | 15 | Páginas administrativas/legais |

---

## 🔴 P0 — Vitrine & Conversão (12 páginas)

> Redesenhar PRIMEIRO — impacto direto em conversão e retenção.

| # | Página | Rota | O que redesenhar |
|---|--------|------|-----------------|
| 1 | **Landing Hero** | `/` | Video poster, headline, CTAs, mockup |
| 2 | **Landing Features** | `/` (section) | Cards com ícones animados, hover effects |
| 3 | **Landing Pricing** | `/` (section) | Cards glow, toggle mensal/anual |
| 4 | **Landing How It Works** | `/` (section) | Timeline interativa, steps visuais |
| 5 | **Login** | `/login` | Split screen, visual premium |
| 6 | **Register** | `/register` | Stepper visual, progress bar |
| 7 | **Dashboard Home** | `/dashboard` | KPI cards, charts, quick actions |
| 8 | **Lista de Alunos** | `/dashboard/students` | Cards com avatar, stats inline |
| 9 | **Onboarding** | wizard (pós-registro) | Steps visuais, progress |
| 10 | **Blog index** | `/blog` | Grid de artigos, hero destaque |
| 11 | **Pricing page** | `/register?plan=*` | Full pricing comparison |
| 12 | **Perfil público** | `/profile/[slug]` | Card profissional, serviços |

---

## 🟡 P1 — Uso Diário (18 páginas)

> Redesenhar na segunda onda — são as telas que o personal usa todo dia.

| # | Página | Rota | Foco |
|---|--------|------|------|
| 13 | Detalhe aluno | `/dashboard/students/[id]` | Tabs, evolução, gráficos |
| 14 | Editar aluno | `/dashboard/students/[id]/edit` | Form premium |
| 15 | Lista treinos | `/dashboard/workouts` | Grid visual, filtros |
| 16 | Criar treino | `/dashboard/workouts/create` | Form com preview |
| 17 | Detalhe treino | `/dashboard/workouts/[id]` | Player, exercícios |
| 18 | Editar treino | `/dashboard/workouts/[id]/edit` | Form inline |
| 19 | Treino IA | `/dashboard/workouts/ai` | Chat-like, geração visual |
| 20 | Financeiro | `/dashboard/financial` | Dashboard charts |
| 21 | Pagamentos lista | `/dashboard/payments` | Tabela com badges |
| 22 | Chat | `/dashboard/chat` | Messaging UI |
| 23 | Notificações | `/dashboard/notifications` | Lista com ações |
| 24 | Configurações | `/dashboard/settings` | Tabs organized |
| 25 | Avaliações lista | `/dashboard/assessments` | Grid com fotos |
| 26 | Nova avaliação | `/dashboard/assessments/create` | Wizard steps |
| 27 | Resultado avaliação | `/dashboard/assessments/[id]` | Visual com gráficos |
| 28 | Calendário | `/dashboard/calendar` | Heatmap + agenda |
| 29 | Treino do aluno | `/dashboard/students/[id]/workouts` | Lista contextual |
| 30 | Marketplace | `/dashboard/marketplace` | Grid de serviços |

---

## 🟢 P2 — Funcionalidades Completas (20 páginas)

| # | Página | Rota |
|---|--------|------|
| 31 | Forgot password | `/forgot-password` |
| 32 | Reset password | `/reset-password` |
| 33 | Verify email | `/verify-email` |
| 34 | OAuth callback | `/auth/callback` |
| 35 | Pagamentos aluno | `/dashboard/students/[id]/payments` |
| 36 | Avaliações aluno | `/dashboard/students/[id]/assessments` |
| 37 | Evolução aluno | `/dashboard/students/[id]/evolution` |
| 38 | Progresso aluno | `/dashboard/students/[id]/progress` |
| 39 | Comparar avaliações | `/dashboard/assessments/compare` |
| 40 | Detalhe pagamento | `/dashboard/payments/[id]` |
| 41 | Configurações profile | `/dashboard/settings/profile` |
| 42 | Configurações conta | `/dashboard/settings/account` |
| 43 | Configurações notificações | `/dashboard/settings/notifications` |
| 44 | Configurações segurança | `/dashboard/settings/security` |
| 45 | Blog VFIT | `/blog/ia-personal-trainer` |
| 46 | Blog Cobrança | `/blog/cobranca-automatica-personal` |
| 47 | Blog Retenção | `/blog/retencao-alunos-personal` |
| 48 | Sobre | `/sobre` |
| 49 | Contato | `/contato` |
| 50 | Register personal | `/register/personal` |

---

## ⚪ P3 — Administrativo & Legal (15 páginas)

| # | Página | Rota |
|---|--------|------|
| 51 | Admin dashboard | `/dashboard/admin` |
| 52 | Admin users | `/dashboard/admin/users` |
| 53 | Admin user detail | `/dashboard/admin/users/[id]` |
| 54 | Admin financeiro | `/dashboard/admin/financial` |
| 55 | Admin ferramentas | `/dashboard/admin/tools` |
| 56 | Admin features | `/dashboard/admin/features` |
| 57 | Admin analytics | `/dashboard/admin/analytics` |
| 58 | Privacidade | `/privacidade` |
| 59 | Termos | `/termos` |
| 60 | Cookies | `/cookies` |
| 61 | LGPD | `/lgpd` |
| 62 | Carreiras | `/carreiras` |
| 63 | Register student | `/register/student` |
| 64 | Treino execução | `/dashboard/workouts/[id]/execute` |
| 65 | Offline page | `/offline` |

---

## 📊 Métricas de Impacto

| Tier | Páginas | % do Tráfego | Impacto Conversão |
|:----:|:-------:|:------------:|:-----------------:|
| P0 | 12 | ~65% | 🔥 Máximo |
| P1 | 18 | ~25% | ⚡ Alto |
| P2 | 20 | ~8% | 📈 Médio |
| P3 | 15 | ~2% | 📊 Baixo |

---

## 🎯 Ordem de Execução Recomendada

```
Semana 1: Foundation (tokens + componentes base)
Semana 2: P0 Landing (items 1-4, 10-11)
Semana 3: P0 Auth + Onboarding (items 5-6, 9)
Semana 4: P0 Dashboard Core (items 7-8, 12)
Semana 5: P1 CRUD principal (items 13-19)
Semana 6: P1 Financeiro + Chat (items 20-24)
Semana 7: P1 + P2 restantes (items 25-50)
Semana 8: P3 + Polish + Performance
```

---

*Atualizar status conforme avança → marcar ✅ quando concluído.*
