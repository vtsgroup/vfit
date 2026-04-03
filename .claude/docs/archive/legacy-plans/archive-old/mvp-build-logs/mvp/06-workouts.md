# LOTE 06 — API Workouts

> Data: $(date +%Y-%m-%d)
> Commit: pendente

## Arquivos Criados

### `workers/schemas/workouts.ts`
- 9 Zod schemas + 9 tipos TypeScript
- `createWorkoutSchema` — com array inline de exercises
- `updateWorkoutSchema` — campos parciais (name, description, status, dates, notes)
- `addExerciseSchema` — exercício individual
- `updateExerciseSchema` — atualização parcial
- `reorderExercisesSchema` — array de {id, order_index}
- `completeWorkoutSchema` — feeling enum + exercises_completed JSONB + notas
- `listWorkoutsQuerySchema` — filtros student_id, status, search, sort, order, paginação
- `listLogsQuerySchema` — filtros student_id, workout_id, feeling + paginação
- `cloneTemplateSchema` — template D1 → PG workout

### `workers/api/workouts.ts`
16 endpoints totais:

**Personal (CRUD)**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST   | /workouts | Criar treino (com exercises inline opcionais) |
| GET    | /workouts | Listar treinos (filtros, paginação, sort) |
| GET    | /workouts/:id | Detalhes com exercises + últimos 10 logs |
| PATCH  | /workouts/:id | Atualizar metadata |
| DELETE | /workouts/:id | Soft delete (archive) |
| POST   | /workouts/:id/duplicate | Duplicar treino + exercises |

**Exercises (Personal)**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST   | /workouts/:id/exercises | Adicionar exercício |
| PATCH  | /workouts/:id/exercises/:eid | Atualizar exercício |
| DELETE | /workouts/:id/exercises/:eid | Remover exercício |
| PUT    | /workouts/:id/exercises/reorder | Reordenar |

**Student**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | /workouts/my | Meus treinos (com stats) |
| POST   | /workouts/:id/complete | Registrar conclusão |

**Logs**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | /workouts/logs | Histórico (personal vê todos seus, student vê próprios) |
| GET    | /workouts/logs/:id | Detalhe de um log |

**Template**
| Método | Rota | Descrição |
|--------|------|-----------|
| POST   | /workouts/clone-template | Clonar template D1 → PG |

### Padrões Implementados

1. **Ownership verification**: `ensureStudentBelongsToPersonal()` e `ensureWorkoutOwnership()`
2. **findWorkoutWithExercises()**: Busca workout + exercises joinados + student_name
3. **Badge system**: Verificação automática ao completar treino (first_workout, 10/50 treinos, streak 7/30)
4. **Soft delete**: Archive em vez de DELETE real
5. **Cross-DB**: exercise_id e template_id são TEXT referenciando D1 (cold data)
6. **Dynamic SET clause**: Padrão reutilizável para PATCH com índices dinâmicos

### Montagem no index.ts
```typescript
app.route('/api/v1/workouts', workoutsRoutes)
```

## Validação
- ✅ `tsc --project tsconfig.workers.json --noEmit` — 0 erros
- ✅ `npm run build` — build OK
