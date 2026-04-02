# Plano ULTRA Completo — Redesign + Logo (v1) — 24/02/2026

> **Status:** EM EXECUÇÃO (parcial)  
> **Objetivo macro:** elevar o visual para **premium/profissional** (sidebar escura + cards limpos), mantendo a identidade verde e **sem quebrar** fluxo/auth/mobile.

## 📈 Progresso (atual)

**Estimativa:** ~80% concluído.

✅ Já executado (resumo):
- Dashboard **full-width** (desktop) + telas destravadas
- Logo “rounded-square” (15px) e sem repetição feia no header desktop
- Avatar crop + correções de URL
- Lembretes da Agenda + preferências (24h/1h/15m)
- WhatsApp gateway (Unipile) + Secrets Store + domínio `whatsapp.iapersonal.app.br` + mensagens start/end

🟡 Falta (design/polimento):
- Variantes “hero”/hierarquia nos KPIs (linha 1 escura) + ajustes finos
- Padronização final de listas (densidade/hover/badges) em Students/Payments
- QA final (desktop/mobile + light/dark)

---

## 0) Definição do “OK”

Quando você disser **OK PLANO**, a execução começa pela **Fase 0 → Fase 1 → ...** (em ordem).  
Se você disser **OK PLANO + LOGO X**, eu já executo também a parte de **colocação da logo** (Fase 2.2).

---

## 1) Contexto atual do projeto (o que já existe)

### 1.1 Design system já implementado (Tailwind v4)
- Tokens e utilitários globais: [src/app/globals.css](src/app/globals.css)
- Layout dashboard (sidebar + header + mobile nav): [src/components/layout/dashboard-layout.tsx](src/components/layout/dashboard-layout.tsx)
- Sidebar atual (desktop): [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx)
- Header atual (topbar): [src/components/layout/header.tsx](src/components/layout/header.tsx)
- Drawer mobile (logo/brand no drawer): [src/components/layout/mobile-nav.tsx](src/components/layout/mobile-nav.tsx)
- KPI cards reutilizáveis: [src/components/dashboard/stats-card.tsx](src/components/dashboard/stats-card.tsx)

### 1.2 Assets existentes (para usar como placeholder inicial)
- [public/AI-logo.png](public/AI-logo.png)
- [public/vfit-ext.png](public/vfit-ext.png)
- PWA icons: [public/icons/](public/icons/)

---

## 2) Direção visual (resumo do redesign proposto)

### 2.1 O “mashup” desejado
- **Sidebar**: verde floresta/escuro (premium, separa navegação do conteúdo)
- **Conteúdo**: branco/cinza frio limpo, cards brancos com sombra suave
- **CTAs**: verde (principal) + preto/chumbo para ações secundárias importantes
- **KPI**: primeira linha com cards mais “hero” (escuros, texto claro), segunda linha mais neutra

### 2.2 Resultado esperado (checklist)
- [ ] Sidebar com identidade forte e legível (contraste)
- [ ] Hierarquia clara nos KPIs (linha 1 manda, linha 2 apoia)
- [ ] Menos “ruído” visual (cores em excesso)
- [ ] Logo consistente (mesma proporção, padding, cantos, borda suave)
- [ ] Dark mode continua bom (sem regressão)

---

## 3) Tokens (proposta) — sem quebrar os tokens atuais

**Regra:** não vamos “renomear tudo”. Vamos **adicionar** tokens específicos do redesign e migrar por etapas.

### 3.1 Novos tokens sugeridos
Adicionar em [src/app/globals.css](src/app/globals.css) (em `@theme`):

- `--color-sidebar-bg` (verde floresta)
- `--color-sidebar-active` (verde médio)
- `--color-sidebar-text` (branco 75%)
- `--color-sidebar-text-active` (branco)
- `--color-sidebar-dot` (verde vivo)
- `--color-bg-page` (cinza frio tipo `#F8FAFC`)
- `--color-kpi-dark` (fundo KPI escuro)
- `--color-kpi-text` (texto KPI)

> Observação: `--color-brand-primary` e estados (`--color-success|warning|error`) permanecem.

### 3.2 Utilitários CSS sugeridos
Ainda em [src/app/globals.css](src/app/globals.css):
- `.sidebar-premium` (bg sólido + borda sutil + sem “glass” se preferir)
- `.kpi-card-dark` (bg `--color-kpi-dark`, texto `--color-kpi-text`, borda suave)

---

## 4) Plano de execução (ULTRA detalhado)

### Fase 0 — Baseline e segurança (sem mudar UI)
**Objetivo:** garantir que qualquer mudança visual tenha “antes/depois” e rollback fácil.
- [ ] Capturar screenshots de referência (desktop + mobile):
  - Dashboard
  - Students list
  - Payments list
  - Login
- [ ] Mapear componentes “núcleo” (nav + cards + listas)
- [ ] Definir “não-regressões” (itens que não podem quebrar):
  - Auth (login/logout)
  - Navegação (sidebar/drawer)
  - Tema (light/dark)

**Saída:** checklist pronto + lista de telas (sem código).

---

### Fase 1 — Fundação de tokens (mínimo impacto)
**Arquivos-alvo:**
- [src/app/globals.css](src/app/globals.css)

**Tarefas:**
- [ ] Inserir os tokens novos (sem alterar os existentes)
- [ ] Criar utilitários `.sidebar-premium` e `.kpi-card-dark`
- [ ] Garantir que `.dark` tenha overrides coerentes (principalmente sidebar)

**Aceite:** build ok + nenhuma mudança visual ainda (ou mudança irrelevante).

---

### Fase 2 — Logo/Brand (placeholder primeiro, refinamento depois)

#### Fase 2.1 — Padronizar assets de logo
**Objetivo:** ter um “contrato” único pra logo (mesmo que o PNG inicial não seja perfeito).

**Estrutura sugerida:**
- `public/brand/logo.png` (placeholder inicial)
- `public/brand/logo-round.png` (placeholder round)
- `public/brand/logo.svg` (futuro: transparente)

**Regras visuais (para o round futuro):**
- round (círculo)
- borda suave (1px) cinza com opacidade (ex.: `rgba(255,255,255,0.18)` no escuro / `rgba(0,0,0,0.10)` no claro)
- fundo inicialmente pode existir (temporário)
- depois migrar para transparente

#### Fase 2.2 — Colocar a logo em locais específicos (sem bagunçar layout)

| Local | Arquivo | Onde | Comportamento | Nota |
|---|---|---|---|---|
| Sidebar (desktop) | [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx) | topo (bloco “Logo”) | clicar leva ao `/dashboard` | trocar `Sparkles` por imagem/logo | 
| Drawer mobile | [src/components/layout/mobile-nav.tsx](src/components/layout/mobile-nav.tsx) | header do drawer | clicar leva ao `/dashboard` | mesma proporção da sidebar |
| Header (topbar) | [src/components/layout/header.tsx](src/components/layout/header.tsx) | lado esquerdo (antes do título ou como botão home) | opcional: clicar em home | manter título legível |
| Login | [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx) | acima do `h1` | sem link (ou link leve) | manter “ultra-compact” |

**Aceite:** logo aparece consistente (tamanho/padding), sem “pular” layout no collapse.

---

### Fase 3 — Sidebar premium (desktop + mobile drawer)
**Arquivos-alvo:**
- [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx)
- [src/components/layout/mobile-nav.tsx](src/components/layout/mobile-nav.tsx)

**Tarefas:**
- [ ] Trocar de `nav-glass` para `.sidebar-premium` (se aprovado)
- [ ] Itens inativos com opacidade (texto e ícones)
- [ ] Item ativo: fundo `--color-sidebar-active` + **dot** `--color-sidebar-dot`
- [ ] Seções (caps): cor/opacity mais suave e consistente

**Aceite:** contraste e legibilidade A+ (principalmente em monitores ruins).

---

### Fase 4 — Header premium (clean)
**Arquivo-alvo:**
- [src/components/layout/header.tsx](src/components/layout/header.tsx)

**Tarefas:**
- [ ] Remover excesso de bordas “brancas” hardcoded e mover para tokens
- [ ] Ajustar sombra (mais clean, menos “frosted”) se necessário
- [ ] (Opcional) inserir logo pequena à esquerda

**Aceite:** header mais clean, sem perder “glass identity” se a gente quiser manter.

---

### Fase 5 — KPIs e hierarquia (linha 1 escura)
**Arquivos-alvo:**
- [src/components/dashboard/stats-card.tsx](src/components/dashboard/stats-card.tsx)
- (onde o grid é montado) dashboards que usam `StatsCard`

**Tarefas:**
- [ ] Criar variante `variant="dark"` (ou `tone="hero"`) no `StatsCard`
- [ ] Aplicar nos KPIs principais (linha 1)
- [ ] Linha 2 mantém card branco/limpo com borda mais definida

**Aceite:** “bate o olho” e entende o que é principal.

---

### Fase 6 — Listas e páginas (Students/Payments)
**Objetivo:** padronizar listas (hover, separadores, badges, densidade).

**Tarefas (alto nível):**
- [ ] List row: hover leve + separador `--border-color`
- [ ] Badges: sistema de cores padrão (verde/laranja/vermelho/cinza)
- [ ] Reduzir variação de cores em ícones/avatares (quando possível)

**Aceite:** listas mais “enterprise”, menos coloridas sem intenção.

---

### Fase 7 — Páginas “clean” (Payment success / estados vazios)
**Objetivo:** ter páginas sem sidebar/topbar quando fizer sentido.

**Tarefas:**
- [ ] Criar layout centrado (card ~400px) para confirmações
- [ ] Botão primário preto/chumbo em ações neutras + verde só onde é CTA principal

---

### Fase 7.1 — Avatar “recortável” (crop) + URL/CSP perfeitos
**Objetivo:** permitir que o usuário ajuste a foto (drag/zoom) como nos sites principais, e garantir que a foto **carrega sempre** (sem 404/CSP).

**Arquivos-alvo (frontend):**
- [src/components/profile/photo-upload.tsx](src/components/profile/photo-upload.tsx) — modal de recorte + upload do arquivo recortado
- [src/components/ui/avatar.tsx](src/components/ui/avatar.tsx) — normalização robusta de URL (key `profiles/...`, host quebrado etc.)

**Arquivos-alvo (backend):**
- [workers/api/users.ts](workers/api/users.ts) — garantir URL pública válida (fallback + normalização)

**Tarefas:**
- [ ] UI de crop (round preview) com zoom + aplicar
- [ ] Gerar arquivo final 512×512 (WebP) antes do upload
- [ ] Corrigir casos onde o backend retorna URL inválida (ex.: `https://profiles/...`)
- [ ] Garantir que o domínio final esteja permitido no `img-src` do CSP (Pages headers)

**Aceite:**
- Foto aparece em header/sidebar/settings sem falhar
- Usuário consegue ajustar enquadramento (rosto centralizado) antes de salvar

---

### Fase 7.2 — Layout 100% “full desktop” (todas as abas)
**Objetivo:** no desktop, **todas as telas do dashboard** devem usar o espaço inteiro com espaçamento adequado (sem ficar limitado em `max-w-7xl`).

**Arquivos-alvo:**
- [src/components/layout/dashboard-layout.tsx](src/components/layout/dashboard-layout.tsx) — container full-width no desktop
- (por tela) ajustes finos de grid/colunas/altura (ex.: Agenda)

**Aceite:**
- Desktop: abas ocupam 100% da largura disponível (sem canaletas gigantes)
- Ajustes finos por página (ex.: Agenda) sem quebrar mobile

---

### Fase 8 — Notificações + Lembretes (Agenda)
**Objetivo:** lembretes automáticos (push + in-app) para eventos da agenda.

**Tarefas (MVP):**
- [ ] Definir política de lembrete padrão (ex.: 24h e 1h antes)
- [ ] Cron (Workers) para varrer eventos futuros e disparar lembretes
- [ ] Push via OneSignal (best-effort, nunca quebrar endpoint principal)
- [ ] Preferências do usuário: ligar/desligar lembretes
- [ ] UI de janelas de lembrete: 24h / 1h / 15m (por usuário)

**Aceite:**
- Personal e aluno recebem lembretes (quando opt-in) de forma confiável
- Sem spam: deduplicação por evento + janela de envio

---

### Fase 8.1 — Worker WhatsApp (Unipile) + Secrets Store (mensagens de progresso)
**Objetivo:** enviar mensagens padrão no grupo WhatsApp **VFIT** quando tarefas começam/terminam (ex.: deploy, features concluídas), com **link para ver**.

**Worker existente no repo (gateway):**
- [workers/whatsapp/src/index.ts](workers/whatsapp/src/index.ts) — endpoints `/chats`, `/send`, `/task-notify`
- [workers/whatsapp/wrangler.toml](workers/whatsapp/wrangler.toml) — bindings do Secrets Store

**Secrets Store (Cloudflare) — referência:**
- https://developers.cloudflare.com/secrets-store/
- Workers integration: https://developers.cloudflare.com/secrets-store/integrations/workers/

#### 8.1.1 Secrets necessários (Secrets Store)
Criar (ou setar via Dashboard) os secrets no store:
- `UNIPILE_API_KEY` (sua chave)
- `UNIPILE_WHATSAPP_ACCOUNT_ID` (id da conta WhatsApp no Unipile)
- `UNIPILE_WHATSAPP_GROUP_CHAT_ID` (id do chat do grupo — opcional, mas recomendado)
- `UNIPILE_WHATSAPP_GROUP_NAME` (ex.: `VFIT`) — fallback quando chat_id não estiver setado
- `ADMIN_AUTH_TOKEN` (token para chamar o worker)

> Exemplo Wrangler (produção):
> `npx wrangler secrets-store secret create <STORE_ID> --name UNIPILE_API_KEY --scopes workers --remote`

#### 8.1.2 Descobrir o chat_id do grupo (sem saber o ID)
1) Faça uma chamada autenticada em:
  - `GET /chats?q=personal%20ia&account_id=<UNIPILE_WHATSAPP_ACCOUNT_ID>`
2) Pegue o `id` do grupo correto e salve em `UNIPILE_WHATSAPP_GROUP_CHAT_ID`.

#### 8.1.3 Templates padrão (start/end)
Usar `POST /task-notify` com payload:
- `event`: `start|end`
- `title`: título curto (ex.: "Deploy v2.9.6")
- `task_id`: id de rastreio
- `summary`: bullets (end)
- `deploy_version`: ex.: `v2.9.6`
- `link_url`: **link para ver** (ex.: `https://iapersonal.app.br/dashboard`)

#### 8.1.4 Integração com deploy pipeline (automático)
O script de deploy suporta agora:
- `--include-whatsapp` (deploy do worker WhatsApp junto)
- Notificações start/end (best-effort) se variáveis locais estiverem setadas:
  - `WHATSAPP_NOTIFY_URL` (ex.: `https://whatsapp.iapersonal.app.br/task-notify`)
  - `WHATSAPP_NOTIFY_TOKEN` (Bearer)
  - `WHATSAPP_GROUP_NAME` (opcional)
  - `WHATSAPP_LINK_URL` (opcional)

**Arquivo:** [scripts/cf-deploy.js](scripts/cf-deploy.js)

---

### Fase 9 — QA + Deploy + Docs
**QA obrigatório:**
- [ ] Desktop (>= 1280) + Mobile (iPhone SE)
- [ ] Light + Dark + System
- [ ] Sidebar collapsed/expanded
- [ ] Navegação (links)

**Pós-deploy (obrigatório no mesmo PR):**
- [ ] Atualizar [docs/CHANGELOG.md](docs/CHANGELOG.md)
- [ ] Se necessário: atualizar docs de UI/execução no pacote ULTRA

---

## 5) Decisões pendentes (pra você destravar rápido)

1) Sidebar no **light mode** deve ser **sempre escura** (premium) ou acompanhar tema?  
2) Header mantém “glass” ou fica sólido/clean (sem blur)?  
3) Logo inicial: usar `AI-logo.png` ou `vfit-ext.png` como placeholder?  
4) No header, a logo entra **antes do título** ou a gente mantém só na sidebar/drawer?

---

## 6) Próximo passo

Quando você disser **OK PLANO**, eu começo pela **Fase 0** e já preparo o PR com as mudanças em lote (tokens → logo → sidebar → header → KPIs).