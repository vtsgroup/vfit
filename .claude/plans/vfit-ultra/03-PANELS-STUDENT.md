# 03 — Painel do Aluno (B2C) — Cobertura Total

> Grupo `(app)`. Estado atual: **~85% completo**, com a melhor UX do produto (treino ativo). Objetivo: fechar os 15% e modernizar.

---

## 1. Inventário de telas × estado × ação

| Área | Rota(s) | Estado hoje | Ação no plano |
|------|---------|-------------|---------------|
| **Home/Treinos** | `/treinos`, `/treinos/[id]` | ✅ Bom | Polish + estados completos |
| **Criar treino** | `/treinos/novo` | 🔴 API não conectada (TODO) | **Conectar `POST /custom-workouts`** + UX |
| **Treino ativo** | `/treino-ativo`, `/concluido` | ⭐ Excelente | **Preservar**; só micro-polish |
| **Plano** | `/plano`, `/editar`, `/ajustes` | ✅ Bom (958 linhas inline) | Extrair componentes, estados |
| **Exercícios** | `/exercicios`, `/[id]`, `/detalhe` | ✅ Bom mas **duplicado** | **Unificar `[id]` vs `detalhe`** |
| **Músculos** | `/musculos/detalhe` | ⚠️ Só imagem | Tornar interativo ou remover |
| **Progresso** | `/progresso` + 4 subtelas | ✅ Bom | Estados + micro-interações |
| **Nutrição** | `/nutricao` (1110 linhas) | ✅ Forte (câmera IA, barcode) | Skeleton, separar seções |
| **Avaliações** | `/avaliacoes`, `/[id]`, `/nova` | ⭐ UI linda | Estados + compartilhamento |
| **IA Hub** | `/ia` | ✅ Hub bom | Conectar subpáginas reais |
| **IA subpáginas** | `/ia/dieta`, `/macros`, `/recuperacao`, `/treino-adaptado` | 🟡 Placeholder | **Implementar de verdade** (ver §3) |
| **Social** | `/social` | 🟡 "Em breve" inteiro | **⚠️ DECISÃO: entregar v1 ou remover** |
| **Perfil** | `/perfil` + 14 subtelas | ✅ Organizado | Corrigir TODOs, estados |
| **Assinatura** | `/perfil/assinatura` | 🔴 check sempre `false` | **Ligar entitlements reais** (doc 02) |

---

## 2. Correções 🔴 (críticas)

1. **`/perfil/assinatura` + `/perfil/page.tsx:65`** — substituir `// TODO: sempre false` por entitlements reais de `/auth/me` (depende de `lib/entitlements.ts`, doc 02). Mostrar: plano, trialing/active/expired, dias restantes, CTA.
2. **`/treinos/novo`** — conectar `POST /custom-workouts` (hoje TODO). Fluxo completo: criar → salvar → aparecer em `/treinos`. Inclui validação e feedback (toast sucesso/erro).
3. **`/perfil/editar`** — adicionar toast de erro (TODO presente). Garantir loading + sucesso.
4. **Rotas duplicadas de exercício** — consolidar `/exercicios/[id]` (canônica) e remover/redirecionar `/exercicios/detalhe`.

---

## 3. IA subpáginas — de placeholder a real

> Hub `/ia` é bom, mas as 4 subpáginas são fachada. Backend `ai.ts` (8 endpoints) + `plans.ts` (10) já existem — falta conectar e desenhar.

| Subpágina | Entregar |
|-----------|----------|
| `/ia/dieta` | Geração de plano alimentar a partir de objetivo/macros/restrições → salvar → ver no `/nutricao`. |
| `/ia/macros` | Calculadora de macros (TDEE, déficit/superávit) com explicação + aplicar ao plano. |
| `/ia/recuperacao` | Recomendações de recuperação (sono, descanso, deload) baseadas em volume/streak. |
| `/ia/treino-adaptado` | Ajuste do treino conforme performance registrada (mais/menos carga, troca de exercício). |

Cada uma com: input claro → loading (✨) → resultado acionável → CTA "aplicar". **Proteção a prompt injection** (doc 06) obrigatória nos prompts.

> **⚠️ DECISÃO 4:** IA avançada é **gate premium** (faz parte do valor do trial) ou parte do free? Recomendação: **premium** (durante trial todos têm; após, vira diferencial pago).

---

## 4. Social — decidir e executar

> **⚠️ DECISÃO 5:** `/social` está 100% "Em breve". Opções:
> - **(A) v1 enxuto:** feed de conquistas + ranking de streak entre alunos do mesmo personal + reações simples. Backend de XP/streak já existe.
> - **(B) Remover do nav** até ter recurso real (não mostrar "Em breve" — passa imagem de inacabado).
>
> Recomendação: **(A) v1 enxuto** se houver fôlego no S5; senão **(B)** temporário. Nada de "Em breve" no produto final.

---

## 5. Funcionalidades incompletas a fechar
- **Desafios** (`/perfil/desafios`) — estrutura básica → desafios reais (semanal, streak, volume) ligados ao XP.
- **Gamificação** (`/perfil/gamificacao`) — garantir XP/badges/streaks consistentes com backend (consolidar 7 tabelas XP — ver doc 06).
- **Offline** (`/perfil/offline`) — já forte no treino ativo; expor controles claros (o que está cacheado, limpar cache).

---

## 6. Os 4 estados em 100% das telas do aluno
Para **cada** rota acima, garantir:
- **Loading:** skeleton específico (não `return null`).
- **Vazio:** `EmptyStateDS` com ilustração + CTA de próxima ação.
- **Erro:** `ErrorRecovery` com botão "tentar novamente".
- **Sucesso:** conteúdo + micro-interações (entrada suave, optimistic onde fizer sentido).

Checklist por tela vive no TRACKING.md (seção S5).

---

## 7. Critério de "perfeito" (aluno)
- ✅ Zero TODO crítico, zero "Em breve" sem decisão.
- ✅ Toda subpágina de IA entrega valor real.
- ✅ Assinatura/entitlements corretos.
- ✅ Treino ativo intacto (não regredir a joia).
- ✅ 4 estados em 100% das telas; mobile impecável.
