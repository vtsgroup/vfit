# TODOS — Itens adiados (VFIT ULTRA)

> Decisões do `/plan-ceo-review` (2026-06-21). Itens valiosos, mas fora do escopo imediato. Registrados para não se perderem (RULES §20 / princípio "tudo deferido escrito").

---

## Adiados do CEO Review (expansões)

### E3 — Coach IA proativo  ⏩ DEFERIDO
Em vez das 4 subpáginas de IA reativas, um coach que age sozinho: detecta queda de adesão, ajusta o plano, manda a mensagem certa na hora certa.
- **Por que adiar:** primeiro entregar as subpáginas de IA reais (S5) e acumular dados de uso; o coach proativo fica muito melhor com dados reais.
- **Pré-requisitos:** subpáginas IA reais (doc 03 §3), instrumentação de adesão (E1 check-in WhatsApp ajuda), infra Replicate/Workers AI.
- **Disparar quando:** após S5 + 4-6 semanas de dados de adesão.

### E4 — Radar de churn para o personal  ⏩ DEFERIDO
Previsão de cancelamento + nudge automático, fechando o loop do pipeline "em risco" existente.
- **Por que adiar:** depende de dados de adesão acumulados; melhor após o produto rodar com o novo trial.
- **Pré-requisitos:** dados de adesão (check-in WhatsApp E1), histórico de churn pós-trial (doc 02), pipeline "em risco" (já existe).
- **Disparar quando:** após 1-2 ciclos de trial completos com dados.

---

## Dívida técnica registrada (do backend audit, doc 06)
- Consolidar 7 tabelas de XP (over-engineered).
- OpenAPI/Swagger gerado dos tipos Hono.
- Estratégia de versionamento de API (v1→v2).
- CF Stream para vídeos >30s (Sprint E original).

---

## Fora de escopo confirmado (deste plano)
- i18n / multi-idioma (produto PT-BR).
- Integração com wearables (Apple Watch etc.).
- App nativo além do TWA atual.
- Reescrita de arquitetura (stack atual é adequada).
