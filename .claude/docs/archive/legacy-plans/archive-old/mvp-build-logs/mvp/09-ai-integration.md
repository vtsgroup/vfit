# LOTE 09 — AI Integration

> **Status:** ✅ CONCLUÍDO
> **Commit:** `ebc1d69`
> **Backend:** 9/9 lotes concluídos (100%)

---

## Resumo

Integração completa com IA via Replicate API. 7 schemas Zod, 8 endpoints, helpers para chamada de API, extração de JSON e tracking de uso.

---

## Arquivos Criados

### `workers/schemas/ai.ts`
- 7 schemas Zod v4:
  - `generateWorkoutSchema` — student_id, goal, complexity (basic/advanced), extra_instructions
  - `comparePhotosSchema` — before_url, after_url, assessment_id (opt)
  - `assistantChatSchema` — question, context_type (students/billing/workouts/general)
  - `generateContentSchema` — type (instagram_post/instagram_story/email_marketing/whatsapp_message), topic
  - `analyzeSentimentSchema` — feedback, student_id (opt)
  - `smartBillingSchema` — limit (default 20)
  - `transcribeVideoSchema` — video_url, language (default pt), exercise_id (opt)
- 7 tipos TypeScript exportados

### `workers/api/ai.ts`
8 endpoints:

| Endpoint | Método | Auth | Modelo IA | Descrição |
|----------|--------|------|-----------|-----------|
| `/ai/workout/generate` | POST | personal | selectModel(workout, complexity) | Gera treino completo via IA |
| `/ai/photos/compare` | POST | personal | CLIP (photo_analysis) | Compara fotos antes/depois |
| `/ai/assistant` | POST | any auth | gemini (assistant) | Chat geral com contexto BD |
| `/ai/content/generate` | POST | personal | gemini (content_generation) | Marketing: instagram/email/whatsapp |
| `/ai/sentiment/analyze` | POST | personal | gemini (sentiment_analysis) | Analisa sentimento de feedback |
| `/ai/billing/smart` | POST | personal | gemini (assistant) | Sugestões de cobrança inteligente |
| `/ai/video/transcribe` | POST | personal | whisper (video_transcription) | Transcrição via queue |
| `/ai/usage` | GET | any auth | — | Uso mensal por task_type |

### Helpers internos
- `callReplicate(env, model, input)` — Chamada Replicate API (sync mode com `Prefer: wait`). Dev fallback com mock quando token não configurado.
- `extractJSON(text)` — Extrai JSON de resposta IA (suporta markdown code blocks, objetos soltos, arrays)
- `trackAIUsage(env, userId, taskType, model, tokens)` — Registra uso em `ai_usage_logs` para billing/analytics

---

## Fluxo de Dados

```
Request → Auth Middleware → Parse Schema → selectModel(task, complexity)
    → Build prompt (PROMPTS.*) → callReplicate → extractJSON
    → trackAIUsage → Analytics Engine → Response
```

## Modelos IA Utilizados

| Task | Modelo | Provider |
|------|--------|----------|
| workout_basic | gemini-2.5-flash | Replicate |
| workout_advanced | llama-3.1-70b-instruct | Replicate |
| photo_analysis | clip-vit-large-patch14 | Replicate |
| assistant | gemini-2.5-flash | Replicate |
| video_transcription | whisper-large-v3 | Replicate |
| content_generation | gemini-2.5-flash | Replicate |
| sentiment_analysis | gemini-2.5-flash | Replicate |

## Prompts Utilizados (lib/ai-prompts.ts)

- `PROMPTS.create_workout(studentData, goal)` — JSON com treino completo
- `PROMPTS.analyze_photos(before, after)` — Análise de evolução corporal
- `PROMPTS.smart_billing_suggestion(billingData)` — Estratégia de cobrança
- `PROMPTS.assistant(question, context)` — Resposta geral + ações sugeridas
- `PROMPTS.content_generation(type, topic, name)` — Conteúdo marketing formatado
- `PROMPTS.sentiment_analysis(feedback)` — Score + sentimento + alerta

---

## Montagem

```typescript
// workers/index.ts
import { aiRoutes } from './api/ai'
app.route('/api/v1/ai', aiRoutes)
```

## Status Backend Completo

| Módulo | Endpoints | Lote |
|--------|-----------|------|
| Auth + OAuth | 13 | 04 |
| Users/Personals/Students | 18 | 05 |
| Workouts | 16 | 06 |
| Assessments/Reviews/Notifications | 25 | 07 |
| Payments/Affiliates | 24 | 08 |
| AI | 8 | 09 |
| **TOTAL** | **104** | — |

> 🎉 **Backend 100% completo.** Próximo: LOTE 10 — Frontend Layout
