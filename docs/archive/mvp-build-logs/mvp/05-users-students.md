# LOTE 05 — API Users & Students

> **Status:** ✅ Concluído  
> **Commit:** _ver git log_  
> **Data:** 2026-02-06

---

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `workers/schemas/users.ts` | 10 Zod schemas + 9 types inferidos |
| `workers/api/users.ts` | 5 endpoints de user (GET/PATCH/DELETE me, photo upload) |
| `workers/api/personals.ts` | 5 endpoints personal (profile, settings, stats, public slug) |
| `workers/api/students.ts` | 8 endpoints students (CRUD, invite, status, self-update) |

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `workers/index.ts` | Montou `usersRoutes`, `personalsRoutes`, `studentsRoutes` |

---

## Endpoints

### Users (`/api/v1/users`) — Autenticado

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/users/me` | Dados completos user + profile (personal ou student) |
| `PATCH` | `/users/me` | Atualizar full_name, phone, profile_photo_url |
| `DELETE` | `/users/me` | Soft delete (desativar conta) |
| `POST` | `/users/me/photo` | Solicitar presigned info para upload |
| `PUT` | `/users/me/photo/upload` | Upload direto para R2 + atualiza profile_photo_url |

### Personals (`/api/v1/personals`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/personals/profile` | Personal | Perfil completo (user + personal) |
| `PATCH` | `/personals/profile` | Personal | Atualizar cref, specialties, bio, slug, etc. |
| `PATCH` | `/personals/settings` | Personal | Configurações (público, testimonials, fee) |
| `GET` | `/personals/stats` | Personal | Dashboard stats (students, revenue, workouts) |
| `GET` | `/personals/:slug` | Público | Perfil público com testimonials |

### Students (`/api/v1/students`)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/students` | Personal | Listar alunos (filtros, paginação, sort) |
| `POST` | `/students/invite` | Personal | Convidar aluno por email |
| `GET` | `/students/me` | Student | Perfil do próprio aluno |
| `PATCH` | `/students/me` | Student | Aluno atualiza próprio perfil |
| `GET` | `/students/:id` | Personal | Detalhes de um aluno |
| `PATCH` | `/students/:id` | Personal | Atualizar dados do aluno |
| `PATCH` | `/students/:id/status` | Personal | Mudar status (active/blocked/inactive/churned) |
| `DELETE` | `/students/:id` | Personal | Remover aluno (soft delete → churned) |

---

## Zod Schemas

- `updateUserSchema` — full_name?, phone?, profile_photo_url?
- `updatePersonalSchema` — cref?, specialties[]?, bio?, public_url_slug (regex), visibility flags
- `updatePersonalSettingsSchema` — is_public_profile?, show_testimonials?, show_transformations?, accepted_fee_percentage?
- `inviteStudentSchema` — email, full_name, phone?
- `updateStudentSchema` — date_of_birth?, gender?, height_cm?, goals[]?, medical_restrictions?, fitness_level?, payment_status?
- `updateStudentStatusSchema` — status (enum), reason?
- `studentSelfUpdateSchema` — date_of_birth?, gender?, height_cm?, goals[]?, medical_restrictions?, fitness_level?, consent flags
- `listStudentsQuerySchema` — page, per_page, status?, payment_status?, search?, sort, order
- `uploadPhotoSchema` — content_type (image/jpeg|png|webp|avif), filename?

---

## Features

### Listagem de Alunos
- Paginação: page, per_page (max 100)
- Filtros: status, payment_status, search (ILIKE nome/email)
- Sort: full_name, created_at, last_payment_date, total_workouts_completed, current_streak
- Order: asc/desc

### Convite de Aluno
- Gera invitation_token (64 chars hex)
- Se email já é student de outro personal → erro 409
- Se email já é student sem personal → vincula
- Se email novo → cria placeholder no students (user criado no register/student)
- Envia email de convite via queue

### Perfil Público
- GET `/personals/:slug` — sem auth
- Retorna dados do personal + testimonials (se habilitado)
- Somente perfis com `is_public_profile = true`

### Upload de Foto
- R2 direto: `profiles/{userId}/{uuid}.{ext}`
- Max 5MB, aceita jpeg/png/webp/avif
- Atualiza `users.profile_photo_url` automaticamente

### Ownership Check
- Todas operações de personal sobre students verificam `students.personal_id = userId`
- Retorna 404 se aluno não pertence ao personal (não revela existência)

### Status Change
- Atualiza contadores `active_students` do personal automaticamente
- Salva histórico de mudança no metadata do student (from/to/reason/date)

---

## Verificação

```bash
npx tsc --project tsconfig.workers.json --noEmit  # ✅ 0 erros
npm run build                                       # ✅ 0 erros
```
