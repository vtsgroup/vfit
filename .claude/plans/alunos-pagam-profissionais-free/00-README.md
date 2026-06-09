# Plano Mestre — Alunos Pagam, Profissionais Sem Plano

Status: DRAFT
Data: 2026-06-09
Branch base: main
Modo escolhido: SCOPE EXPANSION (autônomo, usuário indisponível)
Abordagem escolhida: B) Strangler por domínios

## Objetivo de negócio

Migrar o modelo de receita do VFIT para:

1. Profissionais (personal e nutricionista) sem assinatura obrigatória.
2. Alunos como principal fonte de receita recorrente.
3. Consultorias obrigatoriamente pagas dentro da API do VFIT (exclusividade transacional).
4. Profissionais monetizando por taxa da plataforma, IA, venda e consultoria, sem bloqueio por plano.

## Premissa central

A monetização precisa sair do "paywall de creator" e virar "paywall de consumo + transação" com reconciliação robusta.

## Abordagens avaliadas

### A) Minimal viable cutoff (Completeness: 6/10)
- Desliga cobrança de profissionais rapidamente.
- Risco alto de buracos de conciliação e de exclusividade de consultoria.

### B) Strangler por domínios (Completeness: 9/10) — Escolhida
- Migração faseada em entitlement, billing, consultoria e ledger.
- Mantém rollback por domínio e reduz blast radius.

### C) Ideal architecture one-shot (Completeness: 10/10)
- Arquitetura final completa de uma vez.
- Alto risco operacional de big-bang em produção.

## Escopo aceito (expansão)

1. Remoção do gating de assinatura para profissionais/nutricionistas.
2. Reposicionamento de cobrança B2C para alunos.
3. Novo domínio de consultoria paga com exclusividade transacional na API.
4. Ledger financeiro interno para auditoria, repasse e disputa.
5. Feature flags e rollout por ondas.
6. Observabilidade e runbooks de produção como entregáveis de sprint.

## Itens deste pacote

- 01-CONTEXTO-E-DOMINIOS.md
- 02-ARQUITETURA-E-FLUXOS.md
- 03-MIGRACAO-DADOS-E-CONTRATOS.md
- 04-ROADMAP-EXECUCAO.md
- 05-RISCOS-SEGURANCA-E-RESGATE.md
- 06-TESTES-OBSERVABILIDADE-E-GO-LIVE.md
- TRACKING.md
