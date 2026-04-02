# 🚀 VFIT — MEGA PLANO v2.0

> **Plano Ultra-Otimizado e Ultra-Moderno**
> Atualizado: 13/02/2026
> 25 Fases | ~120 tarefas | Prioridade por impacto + esforço

---

## 📊 Status Atual

| Área | Progresso | Status |
|---|---|---|
| Landing Page | 95% | ✅ Hero com vídeo, seções, CTA |
| Auth (Login/Register) | 95% | ✅ Ultra-compacto, role selector, OAuth |
| Dashboard Personal | 85% | ✅ Stats, alunos, treinos, cobranças |
| Dashboard Aluno | 70% | ⚠️ Funcional mas básico |
| Admin Panel | 90% | ✅ Glass dark, métricas, gestão |
| PWA | 95% | ✅ Install multi-browser, SW v5, offline |
| Pagamentos (Asaas) | 80% | ⚠️ Webhook, QR Code PIX |
| IA (Treinos) | 60% | ⚠️ Geração básica, falta refinamento |
| API Backend | 90% | ✅ 109 endpoints, Neon+D1+R2+KV |

---

## 🎯 FASE 1 — Polish Visual (1-2 dias)
**Impacto: ALTO | Esforço: BAIXO**

- [ ] 1.1 — Auth layout responsivo: verificar se login cabe 100% no mobile sem scroll (iPhone SE, 375px)
- [ ] 1.2 — Register page: atualizar para mesmo visual glass do login (compacto, trust badges)
- [ ] 1.3 — Forgot/Reset Password: mesma linguagem visual dark glass
- [ ] 1.4 — Dashboard sidebar: dark glass refinement (glassmorphism no hover, active glow)
- [ ] 1.5 — Mobile bottom nav: micro-animações de tab (scale + color transition)
- [ ] 1.6 — Toast notifications: glassmorphism + blur mais forte
- [ ] 1.7 — Loading states: skeleton screens com shimmer green (não spinners genéricos)
- [ ] 1.8 — Empty states: ilustrações SVG temáticas (haltere, timer, gráfico vazio)

---

## 🎯 FASE 2 — Landing Page Premium (2-3 dias)
**Impacto: ALTÍSSIMO | Esforço: MÉDIO**

- [ ] 2.1 — Navbar: shrink on scroll + glass blur intenso + CTA "Começar grátis" fixo
- [ ] 2.2 — Hero video: testar 3 fontes (Pixabay, Coverr, Mixkit) e escolher melhor
- [ ] 2.3 — Seção "Como Funciona": stepper animado com mockups interativos
- [ ] 2.4 — Seção "Funcionalidades": bento grid com hover 3D (perspective transform)
- [ ] 2.5 — Seção "Depoimentos": carousel infinito com cards glassmorphism
- [ ] 2.6 — Seção "Preços": cards com comparativo, toggle mensal/anual, badge "Popular"
- [ ] 2.7 — Seção "FAQ": accordion animado com ícone + em brand-primary
- [ ] 2.8 — Footer: mega footer com links, social, newsletter form
- [ ] 2.9 — Scroll animations: parallax suave no hero, reveal progressivo das seções
- [ ] 2.10 — Mobile optimization: hero text menor, CTA sticky bottom, seções empilhadas

---

## 🎯 FASE 3 — Dashboard Personal Trainer Pro (3-4 dias)
**Impacto: ALTÍSSIMO | Esforço: ALTO**

- [ ] 3.1 — Dashboard home: widgets draggable (react-grid-layout) com cards personalizáveis
- [ ] 3.2 — Gráfico de receita: chart real com Recharts (line + bar chart combo)
- [ ] 3.3 — Gráfico de alunos: crescimento mensal, taxa de retenção
- [ ] 3.4 — Card "Próximos treinos": agenda do dia com timeline vertical
- [ ] 3.5 — Card "Cobranças pendentes": lista com ação rápida (enviar lembrete)
- [ ] 3.6 — Card "IA Insights": sugestões automáticas (ex: "3 alunos não treinaram esta semana")
- [ ] 3.7 — Ação rápida: FAB (floating action button) com opções: + Aluno, + Treino, + Cobrança
- [ ] 3.8 — Notificações em tempo real: badge no header + dropdown com lista
- [ ] 3.9 — Command palette (⌘K): busca global em alunos, treinos, cobranças
- [ ] 3.10 — Breadcrumbs: navegação contextual em todas as sub-páginas

---

## 🎯 FASE 4 — Gestão de Alunos Premium (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 4.1 — Lista de alunos: grid/list toggle, avatar colorido, status (ativo/inativo/trial)
- [ ] 4.2 — Perfil do aluno: timeline de atividades, histórico de treinos, evolução de medidas
- [ ] 4.3 — Convite por link: gerar link único compartilhável (WhatsApp, email)
- [ ] 4.4 — Import de alunos: CSV upload com preview e mapeamento de colunas
- [ ] 4.5 — Tags e grupos: categorizar alunos (musculação, funcional, emagrecimento)
- [ ] 4.6 — Notas privadas: campo de texto rico no perfil do aluno
- [ ] 4.7 — Aniversariantes: card no dashboard com alunos que fazem aniversário esta semana
- [ ] 4.8 — Filtros avançados: por status, plano, data de cadastro, última atividade

---

## 🎯 FASE 5 — Treinos IA 2.0 (4-5 dias)
**Impacto: ALTÍSSIMO | Esforço: ALTO**

- [ ] 5.1 — Wizard de criação: stepper visual (objetivo → equipamentos → nível → gerar)
- [ ] 5.2 — Templates de treino: biblioteca com templates pré-definidos por objetivo
- [ ] 5.3 — IA com contexto: usar histórico do aluno (avaliações, logs) na geração
- [ ] 5.4 — Editor de treino: drag & drop de exercícios, reordenar séries
- [ ] 5.5 — Vídeos de exercícios: player inline com demonstração do movimento
- [ ] 5.6 — Substituição inteligente: IA sugere exercício alternativo equivalente
- [ ] 5.7 — Periodização: planejar mesociclos (4-8 semanas) com progressão automática
- [ ] 5.8 — PDF/compartilhar: exportar treino como PDF estilizado ou link público
- [ ] 5.9 — Duplicar treino: clonar e adaptar para outro aluno
- [ ] 5.10 — Histórico de versões: ver e restaurar versões anteriores do treino

---

## 🎯 FASE 6 — App do Aluno (3-4 dias)
**Impacto: ALTÍSSIMO | Esforço: ALTO**

- [ ] 6.1 — Home do aluno: treino do dia em destaque, card motivacional
- [ ] 6.2 — Treino interativo: checklist de exercícios com timer de descanso
- [ ] 6.3 — Log de treino: registrar séries × reps × carga em tempo real
- [ ] 6.4 — Histórico: calendário visual com dias treinados (heatmap estilo GitHub)
- [ ] 6.5 — Evolução: gráfico de carga por exercício ao longo do tempo
- [ ] 6.6 — Avaliação física: ver resultados e fotos de progresso (before/after)
- [ ] 6.7 — Chat com personal: mensagens simples (texto) via D1
- [ ] 6.8 — Notificações push: lembrete de treino, novo treino disponível
- [ ] 6.9 — Modo offline: cache do treino atual para treinar sem internet
- [ ] 6.10 — Gamificação: badges (7 dias seguidos, PR de carga, 100 treinos)

---

## 🎯 FASE 7 — Avaliações Físicas Pro (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 7.1 — Formulário wizard: dados corporais → medidas → fotos → análise
- [ ] 7.2 — Cálculos automáticos: IMC, % gordura (Pollock 7 dobras), taxa metabólica
- [ ] 7.3 — Comparativo visual: overlay side-by-side de avaliações anteriores
- [ ] 7.4 — Gráficos de evolução: peso, medidas, % gordura ao longo do tempo
- [ ] 7.5 — Upload de fotos: front/side/back com crop e compressão (R2)
- [ ] 7.6 — Relatório PDF: gerar relatório completo com gráficos e recomendações
- [ ] 7.7 — Lembrete automático: notificar aluno quando reavaliação é devida (30/60/90 dias)
- [ ] 7.8 — IA análise: sugestões baseadas nos resultados (ex: "aumente carboidrato pré-treino")

---

## 🎯 FASE 8 — Pagamentos Profissionais (3-4 dias)
**Impacto: ALTÍSSIMO | Esforço: ALTO**

- [ ] 8.1 — Asaas webhook: processamento robusto (signature, retry, idempotency)
- [ ] 8.2 — Fatura automática: gerar cobrança mensal recorrente por aluno
- [ ] 8.3 — Dashboard financeiro: receita, despesas, lucro líquido com gráfico
- [ ] 8.4 — Relatório financeiro: exportar para Excel/CSV
- [ ] 8.5 — Notificação de pagamento: email + push quando aluno paga ou atrasa
- [ ] 8.6 — Link de pagamento: gerar link compartilhável no WhatsApp
- [ ] 8.7 — Split payment: divisão automática personal + plataforma
- [ ] 8.8 — Histórico de saques: lista de transferências PIX com status
- [ ] 8.9 — Planos de assinatura: criar planos com preços diferentes (básico/premium/vip)
- [ ] 8.10 — Cupom de desconto: sistema de cupons para promoções

---

## 🎯 FASE 9 — Notificações Inteligentes (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 9.1 — Centro de notificações: página com todas as notificações, filtro por tipo
- [ ] 9.2 — Push notifications: Web Push API (VAPID keys) via Cloudflare Worker
- [ ] 9.3 — Email transacional: Resend API para: boas-vindas, pagamento, treino novo
- [ ] 9.4 — Templates de email: design responsivo dark com logo e botão CTA
- [ ] 9.5 — Configurações: toggle por tipo (push, email, in-app) por categoria
- [ ] 9.6 — Notificação de inatividade: alertar personal quando aluno não treina há X dias
- [ ] 9.7 — Badge counter: número de notificações não lidas no header + mobile nav

---

## 🎯 FASE 10 — Marketplace (3-4 dias)
**Impacto: ALTO | Esforço: ALTO**

- [ ] 10.1 — Perfil público do personal: bio, especialidades, fotos, avaliações
- [ ] 10.2 — Busca com filtros: localização, especialidade, preço, avaliação
- [ ] 10.3 — Mapa interativo: Google Maps com pins dos personals (geolocalização)
- [ ] 10.4 — Sistema de avaliações: 1-5 estrelas + texto, verificado (só alunos do personal)
- [ ] 10.5 — Agendamento trial: aluno pode agendar aula experimental
- [ ] 10.6 — Destaque pago: personal pode pagar para aparecer no topo
- [ ] 10.7 — SEO: páginas públicas indexáveis com rich snippets (schema.org)

---

## 🎯 FASE 11 — Programa de Afiliados (2-3 dias)
**Impacto: MÉDIO | Esforço: MÉDIO**

- [ ] 11.1 — Dashboard afiliado: link de indicação, QR Code, stats de conversão
- [ ] 11.2 — Tracking: cookie de 30 dias + UTM parameters
- [ ] 11.3 — Comissão automática: split no pagamento via Asaas
- [ ] 11.4 — Relatório: lista de indicados, conversões, comissões ganhas
- [ ] 11.5 — Materiais: banners, textos prontos para redes sociais
- [ ] 11.6 — Níveis: Bronze (5%) → Prata (7%) → Ouro (10%) baseado em volume

---

## 🎯 FASE 12 — Analytics e Relatórios (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 12.1 — Dashboard analytics: pageviews, sessões, retenção (Cloudflare Analytics API)
- [ ] 12.2 — Relatório de uso: quais features são mais usadas, tempo médio de sessão
- [ ] 12.3 — Relatório de alunos: taxa de retenção, churn rate, LTV médio
- [ ] 12.4 — Relatório financeiro: MRR, ARR, ticket médio, crescimento mês a mês
- [ ] 12.5 — Export: CSV e PDF para todos os relatórios
- [ ] 12.6 — Heatmap de atividade: calendário visual estilo GitHub de treinos por aluno
- [ ] 12.7 — Métricas da IA: quantos treinos gerados, tempo médio de geração, satisfação

---

## 🎯 FASE 13 — UX/UI Refinements (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 13.1 — Micro-interações: hover effects, active states, loading transitions
- [ ] 13.2 — Skeleton loaders: para todas as páginas com dados (alunos, treinos, cobranças)
- [ ] 13.3 — Infinite scroll: substituir paginação por scroll infinito onde faz sentido
- [ ] 13.4 — Drag & drop: reordenar exercícios, priorizar alunos
- [ ] 13.5 — Atalhos de teclado: ⌘K busca, ⌘N novo, ESC fechar modal
- [ ] 13.6 — Acessibilidade: ARIA labels, focus management, skip navigation
- [ ] 13.7 — Error boundaries: fallback UI gracioso para erros de componente
- [ ] 13.8 — Confirmação de ações destrutivas: modal bonito com animação
- [ ] 13.9 — Onboarding: wizard de boas-vindas para novos personals (setup inicial)

---

## 🎯 FASE 14 — Performance & SEO (1-2 dias)
**Impacto: ALTO | Esforço: BAIXO**

- [ ] 14.1 — Core Web Vitals: otimizar LCP, FID, CLS (meta: >90 Lighthouse)
- [ ] 14.2 — Image optimization: next/image com blur placeholder para todos os assets
- [ ] 14.3 — Code splitting: lazy load de páginas pesadas (admin, AI)
- [ ] 14.4 — Font optimization: Inter subset (latin), font-display: swap
- [ ] 14.5 — Prefetch: links críticos (dashboard → alunos, treinos)
- [ ] 14.6 — Meta tags: OpenGraph, Twitter Cards, JSON-LD structured data
- [ ] 14.7 — Sitemap: geração automática para páginas públicas
- [ ] 14.8 — robots.txt: configurar corretamente para indexação

---

## 🎯 FASE 15 — Segurança & Compliance (2-3 dias)
**Impacto: CRÍTICO | Esforço: MÉDIO**

- [ ] 15.1 — Rate limiting: por IP e por user (KV-based) em todos os endpoints
- [ ] 15.2 — CSRF protection: double-submit cookie pattern
- [ ] 15.3 — Input sanitization: zod validation em 100% dos inputs
- [ ] 15.4 — SQL injection: parameterized queries (já feito via pgQuery)
- [ ] 15.5 — XSS prevention: CSP headers rigorosos
- [ ] 15.6 — LGPD compliance: política de privacidade, direito ao esquecimento, export de dados
- [ ] 15.7 — Audit log: registrar ações críticas (login, alteração de dados, pagamentos)
- [ ] 15.8 — 2FA: autenticação de dois fatores via TOTP (Google Authenticator)
- [ ] 15.9 — Session management: invalidar sessões em outros dispositivos
- [ ] 15.10 — Backup automático: snapshot do Neon + export D1 (cron)

---

## 🎯 FASE 16 — PWA Advanced (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 16.1 — Background sync: queue de ações offline (log de treino, criar aluno)
- [ ] 16.2 — Push notifications: VAPID keys, subscription management, topic filtering
- [ ] 16.3 — Periodic background sync: atualizar dados em segundo plano
- [ ] 16.4 — Share target: app como alvo de compartilhamento (receber links/imagens)
- [ ] 16.5 — App shortcuts: atalhos dinâmicos baseados no tipo de usuário
- [ ] 16.6 — Badge API: número de notificações não lidas no ícone do app
- [ ] 16.7 — File handling: abrir PDFs de treino diretamente no app
- [ ] 16.8 — Splash screen: animated logo durante carregamento

---

## 🎯 FASE 17 — Chat & Comunicação (3-4 dias)
**Impacto: ALTO | Esforço: ALTO**

- [ ] 17.1 — Chat 1:1: personal ↔ aluno via D1 (polling ou Durable Objects)
- [ ] 17.2 — Mensagens rápidas: templates pré-definidos (bom treino, lembrete, parabéns)
- [ ] 17.3 — Envio de mídia: foto, áudio, vídeo (R2)
- [ ] 17.4 — Leitura confirmada: double check (entregue/lido)
- [ ] 17.5 — Broadcast: personal envia mensagem para todos os alunos de uma vez
- [ ] 17.6 — Integração WhatsApp: link direto para WhatsApp do personal/aluno
- [ ] 17.7 — Notificações: push quando nova mensagem recebida

---

## 🎯 FASE 18 — White Label (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 18.1 — Custom branding: personal pode trocar cores, logo, nome do app
- [ ] 18.2 — Custom domain: personal.meusite.com.br (via Cloudflare for SaaS)
- [ ] 18.3 — Favicon dinâmico: baseado no branding do personal
- [ ] 18.4 — Email templates: com branding personalizado
- [ ] 18.5 — PWA manifest dinâmico: nome e ícones do personal
- [ ] 18.6 — Remoção "Powered by": plano premium remove branding VFIT

---

## 🎯 FASE 19 — Integrações (2-3 dias)
**Impacto: MÉDIO | Esforço: MÉDIO**

- [ ] 19.1 — Google Calendar: sincronizar treinos como eventos
- [ ] 19.2 — Apple Health / Google Fit: importar dados de saúde
- [ ] 19.3 — Zapier webhook: permitir automações externas
- [ ] 19.4 — Planilha Google: exportar dados automaticamente
- [ ] 19.5 — Instagram: importar fotos de antes/depois
- [ ] 19.6 — Wearables: sincronizar com smartwatches (dados de FC, passos)

---

## 🎯 FASE 20 — Internacionalização (1-2 dias)
**Impacto: MÉDIO | Esforço: BAIXO**

- [ ] 20.1 — i18n setup: next-intl ou react-intl com pt-BR como default
- [ ] 20.2 — Tradução en-US: toda a UI (strings externalizadas)
- [ ] 20.3 — Tradução es: espanhol para mercado LATAM
- [ ] 20.4 — Currency handling: BRL, USD, EUR formatação dinâmica
- [ ] 20.5 — Date localization: formatos de data regionais
- [ ] 20.6 — RTL support: preparar CSS para árabe/hebraico (futuro)

---

## 🎯 FASE 21 — Testes & CI/CD (2-3 dias)
**Impacto: ALTO | Esforço: MÉDIO**

- [ ] 21.1 — Unit tests: Vitest para hooks, stores, utils (>80% coverage)
- [ ] 21.2 — Component tests: React Testing Library para componentes críticos
- [ ] 21.3 — E2E tests: Playwright para fluxos críticos (login → criar aluno → criar treino)
- [ ] 21.4 — API tests: Vitest para endpoints backend (mocking Neon)
- [ ] 21.5 — GitHub Actions: CI pipeline (lint → type-check → test → build)
- [ ] 21.6 — Auto-deploy: merge na main → deploy automático (Pages + Worker)
- [ ] 21.7 — Preview environments: PR cria preview URL automático
- [ ] 21.8 — Monitoring: error tracking (Sentry via Cloudflare integration)

---

## 🎯 FASE 22 — Monetização & Planos (2-3 dias)
**Impacto: ALTÍSSIMO | Esforço: MÉDIO**

- [ ] 22.1 — Planos: Free (5 alunos) → Pro (50 alunos, R$49/mês) → Business (ilimitado, R$99/mês)
- [ ] 22.2 — Billing page: gerenciar assinatura, upgrade/downgrade
- [ ] 22.3 — Trial: 14 dias Pro gratuito para novos personals
- [ ] 22.4 — Feature gates: limitar features por plano (IA, relatórios, white label)
- [ ] 22.5 — Usage tracking: monitorar uso por personal para enforce de limites
- [ ] 22.6 — Invoices: fatura mensal automática por email
- [ ] 22.7 — Cancelamento: fluxo de retention (ofertas, motivo do cancelamento)

---

## 🎯 FASE 23 — App Nativo (4-5 dias)
**Impacto: ALTO | Esforço: MUITO ALTO**

- [ ] 23.1 — Capacitor.js: wrapper nativo para iOS e Android
- [ ] 23.2 — Push nativo: Firebase Cloud Messaging + APNs
- [ ] 23.3 — Splash screen nativo: animação de logo
- [ ] 23.4 — Deep links: abrir treino específico via link
- [ ] 23.5 — Biometrics: Face ID / Touch ID para login
- [ ] 23.6 — Camera nativa: para fotos de avaliação (melhor qualidade)
- [ ] 23.7 — App Store / Play Store: listing com screenshots e descrição
- [ ] 23.8 — In-app updates: forçar atualização quando versão crítica disponível

---

## 🎯 FASE 24 — Social & Comunidade (2-3 dias)
**Impacto: MÉDIO | Esforço: MÉDIO**

- [ ] 24.1 — Feed público: personals compartilham dicas e resultados de alunos
- [ ] 24.2 — Ranking: top personals por avaliação, alunos, receita (público)
- [ ] 24.3 — Blog integrado: CMS simples para artigos de fitness
- [ ] 24.4 — Desafios: criar challenges semanais entre alunos do mesmo personal
- [ ] 24.5 — Certificados: gerar certificado de conclusão de programa
- [ ] 24.6 — Referral social: compartilhar conquistas no Instagram/WhatsApp

---

## 🎯 FASE 25 — Escala & Enterprise (3-5 dias)
**Impacto: ALTO | Esforço: MUITO ALTO**

- [ ] 25.1 — Multi-tenant: academias com múltiplos personals sob um admin
- [ ] 25.2 — API pública: REST API documentada com Swagger/OpenAPI
- [ ] 25.3 — Webhooks outbound: notificar sistemas externos de eventos
- [ ] 25.4 — SSO/SAML: login empresarial para academias
- [ ] 25.5 — SLA dashboard: uptime, latência, throughput em tempo real
- [ ] 25.6 — Horizontal scaling: Durable Objects para estado distribuído
- [ ] 25.7 — Data warehouse: exportar métricas para BigQuery/Redshift
- [ ] 25.8 — Multi-region: deploy em múltiplas regiões Cloudflare

---

## 📅 Cronograma Sugerido

### Sprint 1 (Semana 1) — Foundation
Fases 1 + 2 + 14 = Polish Visual + Landing Premium + Performance

### Sprint 2 (Semana 2-3) — Core Product
Fases 3 + 4 + 5 = Dashboard Pro + Alunos Premium + Treinos IA 2.0

### Sprint 3 (Semana 3-4) — User Experience
Fases 6 + 7 + 13 = App do Aluno + Avaliações Pro + UX Refinements

### Sprint 4 (Semana 4-5) — Revenue
Fases 8 + 22 + 11 = Pagamentos Pro + Monetização + Afiliados

### Sprint 5 (Semana 5-6) — Growth
Fases 9 + 10 + 12 = Notificações + Marketplace + Analytics

### Sprint 6 (Semana 6-7) — Platform
Fases 15 + 16 + 17 = Segurança + PWA Advanced + Chat

### Sprint 7 (Semana 7-8) — Scale
Fases 18 + 19 + 20 + 21 = White Label + Integrações + i18n + CI/CD

### Sprint 8+ (Futuro) — Enterprise
Fases 23 + 24 + 25 = App Nativo + Social + Enterprise

---

## 🏗️ Princípios Técnicos

1. **Mobile-first**: Tudo projetado para 375px primeiro, depois expande
2. **Dark-first**: Tema escuro é padrão, light mode é suporte
3. **Offline-first**: Dados críticos em cache, sync em background
4. **AI-first**: IA não é feature, é o core diferencial
5. **Performance**: <2s FCP, <3s LCP, 100ms FID, 0 CLS
6. **DX**: TypeScript strict, ESLint, auto-format, CI/CD
7. **Cost-effective**: Cloudflare free tier máximo (Workers, Pages, R2, KV, D1)

---

## 📐 Design System Tokens

```
Background:  #09090B → #111113 → #18181B
Primary:     #00D98E → #00C17E (hover)
Glass:       rgba(17,17,19,0.7) + blur(24px)
Border:      rgba(255,255,255,0.08)
Text:        #FAFAFA → #A1A1AA → #71717A
Radius:      12px (cards) → 16px (modals) → 24px (hero elements)
```

---

*Última atualização: 13/02/2026 — Gerado pelo Copilot*
