# 13 — Decisões de negócio (B1, B2, B3)

## B1 — Números oficiais públicos

Definidos como canônicos em `config/constants.ts` (`PUBLIC_SOCIAL_PROOF`):

- Personais ativos: **2.500+**
- Alunos ativos: **15.000+**
- Satisfação: **98%**
- Nota média: **4.9**
- Base de avaliações públicas: **150+**

Aplicação prática:
- Hero da home passa a consumir constante única (evita divergência de copy).
- Comunicação de SEO/LLMs pode referenciar os mesmos números.

## B2 — Modelo e percentual de comissão de afiliados

Definição canônica em `config/constants.ts`:

- Comissão recorrente: **ativa**
- Pagamento: **Pix**
- Frequência de pagamento: **mensal**
- Tiers:
  - Bronze: **25%** (0+ indicações ativas)
  - Prata: **30%** (5+ indicações ativas)
  - Ouro: **35%** (15+ indicações ativas)

Aplicação prática:
- Landing `/afiliados` agora exibe tabela oficial de tiers e regra operacional.

## B3 — Narrativa integrada de nutrição (MVP vs roadmap)

Consolidação aplicada em `/nutricionistas`:

- **MVP:** contexto de treino + jornada integrada + captação de parceria.
- **Roadmap:** plano alimentar integrado + relatórios conjuntos + IA de suporte nutricional.

Resultado:
- Mensagem comercial alinhada para o momento atual sem prometer entrega fora do escopo.
