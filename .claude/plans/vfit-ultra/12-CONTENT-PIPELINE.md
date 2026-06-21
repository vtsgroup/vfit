# 12 — Pipeline de Conteúdo (imagens, vídeos de treino, grupos musculares, avaliações)

> Pedido do usuário: "temos muitas coisas para adicionar — avaliações, imagens, vídeos de treino, imagens de grupos musculares, entre muitas outras." Este doc define **como** adicionar conteúdo em massa de forma sustentável.

---

## 1. Infra de mídia existente (reusar)
- **R2** `vfit-videos` (`videos.vfit.app.br`) — vídeos de exercícios (vertical 9:16 + horizontal 16:9).
- **R2** `vfit-images` (`images.vfit.app.br`) — fotos de avaliação, profile, logos, PDFs, **imagens de grupos musculares**.
- **CF Stream** (futuro) — vídeos >30s com adaptive bitrate (HLS).
- **CF Image Resizing** (a habilitar) — `/cdn-cgi/image/width=...,quality=80/...` (WebP/AVIF on-the-fly).
- **D1** `vfit-exercises` — biblioteca de exercícios, templates, grupos musculares, séries (cold data).
- Estratégia detalhada: `.claude/docs/MEDIA-STRATEGY.md`.

---

## 2. Tipos de conteúdo e onde vivem

| Conteúdo | Armazenamento | Tabela/Índice | Admin |
|----------|---------------|---------------|-------|
| **Vídeos de treino** (exercícios) | R2 vídeos (≤30s/≤10MB) ou Stream (>30s) | D1 `exercises.video_url` | `/admin/exercises` |
| **Imagens de exercício** (thumb) | R2 imagens | D1 `exercises.image_url` | `/admin/exercises` (upload já existe) |
| **Imagens de grupos musculares** (M/F) | R2 imagens | D1 `muscle_groups.{male,female}_image_url` | `/admin/muscle-groups` (editor visual já existe) |
| **Avaliações físicas** (fotos/PDF) | R2 imagens | PG `assessments` (+ self/measurements) | `/dashboard/assessments` |
| **Templates de treino** | D1 `templates` | D1 | `/admin/templates` (CRUD a criar — doc 06) |

---

## 3. O que falta para escalar conteúdo

### 3.1 Pipeline de ingestão em massa
- **Bulk upload** de vídeos/imagens de exercícios: tela admin de upload em lote (drag-drop múltiplo) → R2 → grava D1.
- **Encoder de vídeo** (queue `video-encoder` está TODO — doc 06): normalizar H.264, gerar poster, múltiplas qualidades.
- **Validação:** tamanho máx (10MB R2), content-type, dimensões (9:16 / 16:9).

### 3.2 CF Image Resizing (habilitar)
- Ligar no dashboard (Speed > Optimization) → servir WebP/AVIF redimensionado on-the-fly.
- Trocar URLs diretas por `images.vfit.app.br/cdn-cgi/image/...` nos componentes de imagem.
- Ganho: telas mais rápidas (LCP), menos banda. **Pré-requisito do redesign público (doc 10 §4).**

### 3.3 Grupos musculares
- Editor visual já existe (`/admin/muscle-groups`). Falta: **completar o conjunto** de imagens M/F para todos os grupos/sub-grupos e ligar nas telas `/musculos/detalhe` (aluno) e no body-map do onboarding.

### 3.4 Biblioteca de exercícios
- Garantir cada exercício com: vídeo, thumb, grupos musculares, dificuldade, equipamento, instruções. Preencher os faltantes via bulk pipeline.
- **CRUD de exercício no admin** (hoje só upload de mídia — doc 05 §2): criar/editar/arquivar exercício completo.

### 3.5 Avaliações
- Já robusto (v2 body composition + PDF + IA). Pipeline: PDF via queue (doc 06), soft-delete (preservar evolução), compartilhamento público (`/assessment/share`).

---

## 4. Governança de conteúdo
- **GC de mídia órfã** (doc 06 §5): job que remove do R2 o que foi soft-deleted no DB.
- **Naming/namespace:** chaves UUID + estrutura por domínio (evitar colisão em escala).
- **Cache:** TTL de exercícios de 7d → 12h **ou** invalidação por tag ao editar (doc 06 §2) — para conteúdo novo aparecer rápido.

---

## 5. Tarefas (TRACKING S-CONTENT)
- [ ] C.1 Habilitar CF Image Resizing + trocar URLs por variantes otimizadas
- [ ] C.2 Bulk upload admin (vídeos + imagens de exercício)
- [ ] C.3 Queue `video-encoder` (normalizar + poster + qualidades)
- [ ] C.4 CRUD completo de exercício no admin
- [ ] C.5 Completar imagens M/F de todos os grupos musculares + ligar nas telas
- [ ] C.6 Validação de upload (tamanho/tipo/dimensão) + GC de órfãos
- [ ] C.7 Invalidação de cache por tag (conteúdo novo aparece rápido)

---

## 6. Critério de "perfeito"
- ✅ Adicionar 100 exercícios com vídeo/imagem é um fluxo de minutos, não dias.
- ✅ Imagens otimizadas (WebP/AVIF) servidas via CF Image Resizing.
- ✅ Todos os grupos musculares com imagem M/F ligados nas telas.
- ✅ Sem mídia órfã; cache invalida ao editar.
