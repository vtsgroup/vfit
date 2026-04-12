# 09 — Matriz de Internal Linking por Cluster

## Objetivo

Distribuir autoridade entre páginas money e artigos pilar sem canibalização.

## Páginas money

- `/`
- `/app-personal-trainer`
- `/nutricionistas`
- `/afiliados`
- `/pricing`

## Matriz (origem → destino)

| Origem | Destino primário | Destinos secundários |
|---|---|---|
| `blog/app-treino-ia-gratis-iniciantes` | `/` | `/app-personal-trainer`, `/pricing` |
| `blog/ia-montar-treinos-personalizados-personal` | `/app-personal-trainer` | `/pricing`, `/nutricionistas` |
| `blog/melhores-apps-personal-trainer-2026` | `/app-personal-trainer` | `/pricing`, `/afiliados` |
| `blog/nutricionista-personal-trainer-trabalho-conjunto` | `/nutricionistas` | `/app-personal-trainer`, `/afiliados` |
| `blog/ia-personal-trainer` | `/app-personal-trainer` | `/pricing`, `/blog/melhores-apps-personal-trainer-2026` |
| `blog/retencao-alunos-personal` | `/app-personal-trainer` | `/pricing`, `/afiliados` |
| `blog/cobranca-automatica-personal` | `/pricing` | `/app-personal-trainer`, `/afiliados` |

## Regras

- Todo artigo novo deve apontar para 1 destino primário e 2 secundários
- Nenhum artigo deve ter mais de 1 CTA primário
- Toda página money deve receber links de ao menos 3 artigos diferentes

## Auditoria quinzenal

- [ ] conferir links quebrados
- [ ] conferir páginas money órfãs
- [ ] conferir distribuição por ICP
