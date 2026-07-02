# VFIT — Arquitetura de Treinos (MVP)

**Goal:** Treinos funcionando em 1.5 semanas  
**Prioridade:** CRÍTICA  
**Esforço:** 12h human / 2h CC

---

## 📐 Data Model

### Tabelas (D1 SQLite)

```sql
-- 1. Workouts (criados pelo personal)
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  personal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT,
  difficulty_level TEXT (beginner|intermediate|advanced),
  status TEXT DEFAULT 'active' (active|archived),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (personal_id) REFERENCES personal_profiles(id)
);

-- 2. Workout Exercises (exercícios dentro do treino)
CREATE TABLE workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  order_index INT,
  exercise_name TEXT NOT NULL,
  target_muscle TEXT,
  sets INT,
  reps INT,
  weight_kg FLOAT (opcional),
  rest_seconds INT,
  notes TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- 3. Student Workouts (atribuições de treino a aluno)
CREATE TABLE student_workouts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  personal_id TEXT NOT NULL,
  workout_id TEXT NOT NULL,
  start_date DATE,
  end_date DATE (opcional — null = ongoing),
  status TEXT DEFAULT 'active' (active|paused|completed|skipped),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (personal_id) REFERENCES personal_profiles(id),
  FOREIGN KEY (workout_id) REFERENCES workouts(id),
  UNIQUE(student_id, workout_id, start_date)  -- Evita duplicação
);

-- 4. Workout Executions (check-in de quando aluno fez o treino)
CREATE TABLE workout_executions (
  id TEXT PRIMARY KEY,
  student_workout_id TEXT NOT NULL,
  execution_date DATE,
  completed_at TIMESTAMP,
  status TEXT DEFAULT 'pending' (pending|in_progress|completed|skipped|failed),
  notes TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (student_workout_id) REFERENCES student_workouts(id)
);

-- 5. Exercise Logs (detalhe de cada exercício realizado)
CREATE TABLE exercise_logs (
  id TEXT PRIMARY KEY,
  workout_execution_id TEXT NOT NULL,
  workout_exercise_id TEXT NOT NULL,
  sets_completed INT,
  reps_completed INT,
  weight_kg FLOAT,
  notes TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (workout_execution_id) REFERENCES workout_executions(id) ON DELETE CASCADE,
  FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
);

-- Índices
CREATE INDEX idx_workouts_personal ON workouts(personal_id);
CREATE INDEX idx_student_workouts_student ON student_workouts(student_id);
CREATE INDEX idx_student_workouts_personal ON student_workouts(personal_id);
CREATE INDEX idx_workout_executions_student_workout ON workout_executions(student_workout_id);
CREATE INDEX idx_exercise_logs_execution ON exercise_logs(workout_execution_id);
```

---

## 🔌 API Endpoints

### 1. Create Workout (Personal)

**Endpoint:** `POST /api/workouts`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Peito + Tríceps",
  "description": "Treino de força focado em tórax",
  "duration_minutes": 60,
  "difficulty_level": "intermediate",
  "exercises": [
    {
      "exercise_name": "Supino Reto",
      "target_muscle": "pectoral",
      "sets": 4,
      "reps": 8,
      "weight_kg": 80,
      "rest_seconds": 90,
      "notes": "Usar halteres"
    },
    {
      "exercise_name": "Rosca Direta",
      "target_muscle": "biceps",
      "sets": 3,
      "reps": 10,
      "weight_kg": 20,
      "rest_seconds": 60
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "wkt_abc123",
  "personal_id": "per_xyz789",
  "title": "Peito + Tríceps",
  "exercises": [{ ... }, { ... }],
  "created_at": "2026-07-02T10:30:00Z"
}
```

**Implementation Notes:**
- Validate JWT + role=personal
- Insert workout + exercises in transaction
- Idempotency key: hash(personal_id + title + exercises)
- Return idempotent response if duplicate

---

### 2. List Workouts (Personal's Own)

**Endpoint:** `GET /api/workouts?status=active&limit=20&offset=0`

**Response (200):**
```json
{
  "workouts": [
    {
      "id": "wkt_abc123",
      "title": "Peito + Tríceps",
      "difficulty_level": "intermediate",
      "duration_minutes": 60,
      "status": "active",
      "exercise_count": 8,
      "assigned_to_count": 3,
      "created_at": "2026-07-02T10:30:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### 3. Assign Workout to Student

**Endpoint:** `POST /api/student-workouts`

**Request:**
```json
{
  "student_id": "stu_abc123",
  "workout_id": "wkt_xyz789",
  "start_date": "2026-07-03",
  "end_date": "2026-07-10"
}
```

**Response (201):**
```json
{
  "id": "sw_abc123",
  "student_id": "stu_abc123",
  "workout_id": "wkt_xyz789",
  "status": "active",
  "assigned_at": "2026-07-02T11:00:00Z"
}
```

**Validation:**
- JWT + role=personal
- Personal_id matches workout owner
- student_id exists
- Não permitir duplicação (UNIQUE constraint)

---

### 4. Get Assigned Workouts (Student)

**Endpoint:** `GET /api/my-workouts?status=active`

**Response (200):**
```json
{
  "workouts": [
    {
      "id": "sw_abc123",
      "workout": {
        "id": "wkt_xyz789",
        "title": "Peito + Tríceps",
        "duration_minutes": 60,
        "exercises": [...]
      },
      "assigned_by": {
        "id": "per_xyz789",
        "name": "João Silva",
        "photo": "https://..."
      },
      "status": "active",
      "start_date": "2026-07-03",
      "end_date": "2026-07-10",
      "completed_dates": ["2026-07-03", "2026-07-04"],
      "assigned_at": "2026-07-02T11:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 5. Execute Workout (Student Check-in)

**Endpoint:** `POST /api/workout-executions`

**Request:**
```json
{
  "student_workout_id": "sw_abc123",
  "execution_date": "2026-07-03",
  "exercises": [
    {
      "workout_exercise_id": "we_abc1",
      "sets_completed": 4,
      "reps_completed": 8,
      "weight_kg": 80,
      "notes": "Peso aumentado"
    },
    {
      "workout_exercise_id": "we_abc2",
      "sets_completed": 3,
      "reps_completed": 10,
      "weight_kg": 20
    }
  ],
  "notes": "Treino cansativo, faltou dormir"
}
```

**Response (201):**
```json
{
  "id": "we_abc123",
  "student_workout_id": "sw_abc123",
  "execution_date": "2026-07-03",
  "status": "completed",
  "xp_earned": 100,
  "completed_at": "2026-07-03T18:30:00Z",
  "exercise_logs": [...]
}
```

**Business Logic:**
- Award XP (base 100 + bonus per exercise)
- Update streak if all workouts done this week
- Send WhatsApp notification to personal: "Treino completo! {student} fez {workout_title}"
- Sync to Zustand store in real-time (WebSocket OU polling)

---

### 6. Get Workout History (Student)

**Endpoint:** `GET /api/workout-executions?student_workout_id=sw_abc123&limit=30`

**Response (200):**
```json
{
  "executions": [
    {
      "id": "we_abc123",
      "execution_date": "2026-07-03",
      "status": "completed",
      "xp_earned": 100,
      "exercise_logs": [...]
    }
  ],
  "total": 12,
  "compliance_rate": 0.85
}
```

---

## 🖥️ Frontend Implementation

### Page: `/dashboard/workouts`

```tsx
// Aluno vê treinos atribuídos
export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useAtom(studentWorkoutsAtom);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // GET /api/my-workouts
    setLoading(true);
    fetch('/api/my-workouts')
      .then(r => r.json())
      .then(data => setWorkouts(data.workouts))
      .catch(err => /* Sentry.captureException(err) */)
      .finally(() => setLoading(false));
  }, []);
  
  return (
    <div className="space-y-4">
      <h1>Meus Treinos</h1>
      {workouts.map(sw => (
        <WorkoutCard key={sw.id} studentWorkout={sw} />
      ))}
    </div>
  );
}

// WorkoutCard — mostra treino + botão para executar
function WorkoutCard({ studentWorkout }) {
  return (
    <Card className="p-4">
      <h2>{studentWorkout.workout.title}</h2>
      <p>Por {studentWorkout.assigned_by.name}</p>
      <ExerciseList exercises={studentWorkout.workout.exercises} />
      <Button onClick={() => router.push(`/workouts/${studentWorkout.id}/execute`)}>
        Executar Treino
      </Button>
    </Card>
  );
}
```

### Page: `/workouts/[id]/execute`

```tsx
// Aluno executa treino (check-in)
export default function ExecuteWorkoutPage({ params }) {
  const [studentWorkout, setStudentWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // GET /api/my-workouts (ou cached)
    setStudentWorkout(workouts.find(w => w.id === params.id));
  }, []);
  
  const handleComplete = async (exerciseLogs) => {
    setLoading(true);
    try {
      const res = await fetch('/api/workout-executions', {
        method: 'POST',
        body: JSON.stringify({
          student_workout_id: studentWorkout.id,
          execution_date: new Date().toISOString().split('T')[0],
          exercises: exerciseLogs
        })
      });
      const data = await res.json();
      
      // Atualizar XP em tempo real
      useXpStore.getState().addXp(data.xp_earned);
      
      // Redirecionar para sucesso
      router.push(`/workouts/success?xp=${data.xp_earned}`);
    } catch (err) {
      // Offline fallback
      localStorage.setItem('pending_execution', JSON.stringify({
        student_workout_id: studentWorkout.id,
        exercises: exerciseLogs
      }));
      alert('Salvo offline. Será sincronizado quando você conectar.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h1>Executar: {studentWorkout?.workout.title}</h1>
      {studentWorkout?.workout.exercises.map(ex => (
        <ExerciseInput key={ex.id} exercise={ex} onSave={...} />
      ))}
      <Button onClick={handleComplete} disabled={loading}>
        {loading ? 'Salvando...' : 'Completar Treino'}
      </Button>
    </div>
  );
}
```

---

## 🧪 Test Plan

### Unit Tests

```typescript
// workouts.service.test.ts
describe('WorkoutService', () => {
  describe('createWorkout', () => {
    it('should create workout with exercises', async () => {
      const result = await createWorkout(personalId, {
        title: 'Peito',
        exercises: [...]
      });
      expect(result.id).toBeDefined();
      expect(result.exercises.length).toBe(2);
    });
    
    it('should prevent duplicate creation (idempotency)', async () => {
      const req1 = await createWorkout(personalId, payload, { idempotencyKey: 'key123' });
      const req2 = await createWorkout(personalId, payload, { idempotencyKey: 'key123' });
      expect(req1.id).toBe(req2.id);
    });
    
    it('should assign workout to student', async () => {
      const assignment = await assignWorkout(studentId, workoutId, {
        start_date: '2026-07-03'
      });
      expect(assignment.id).toBeDefined();
      expect(assignment.status).toBe('active');
    });
  });
  
  describe('executeWorkout', () => {
    it('should log exercise execution', async () => {
      const execution = await executeWorkout(studentWorkoutId, {
        exercises: [
          { workout_exercise_id: 'we1', sets: 4, reps: 8, weight: 80 }
        ]
      });
      expect(execution.status).toBe('completed');
      expect(execution.xp_earned).toBeGreaterThan(0);
    });
    
    it('should prevent duplicate execution same day', async () => {
      const ex1 = await executeWorkout(swId, { ... }, { date: '2026-07-03' });
      const ex2 = await executeWorkout(swId, { ... }, { date: '2026-07-03' });
      // Should return same ID or error
      expect(ex1.id).toBe(ex2.id);
    });
  });
});
```

### Integration Tests

```typescript
// workouts.e2e.test.ts
describe('Workouts E2E', () => {
  it('should allow personal to create and assign workout, student to execute', async () => {
    // 1. Personal cria treino
    const workout = await api.post('/api/workouts', {
      title: 'Leg Day',
      exercises: [...]
    }, { auth: personalToken });
    expect(workout.id).toBeDefined();
    
    // 2. Personal atribui a aluno
    const assignment = await api.post('/api/student-workouts', {
      student_id: studentId,
      workout_id: workout.id
    }, { auth: personalToken });
    expect(assignment.status).toBe('active');
    
    // 3. Aluno vê treino na sua lista
    const myWorkouts = await api.get('/api/my-workouts', {
      auth: studentToken
    });
    expect(myWorkouts.workouts).toContainEqual(
      expect.objectContaining({ id: assignment.id })
    );
    
    // 4. Aluno executa treino
    const execution = await api.post('/api/workout-executions', {
      student_workout_id: assignment.id,
      exercises: [...]
    }, { auth: studentToken });
    expect(execution.status).toBe('completed');
    
    // 5. XP atualizado
    const user = await api.get('/api/user/xp', { auth: studentToken });
    expect(user.xp).toBeGreaterThan(0);
  });
});
```

---

## 🚨 Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| Personal deletes treino que aluno tem atribuído | Soft delete (status=archived), aluno vê "Treino arquivado" |
| Aluno tenta executar mesma data 2x | Retorna error: "Treino já executado hoje" |
| Treino leva muito tempo (timeout) | Offline fallback + sync quando conectar |
| Treino atribuído com end_date vencida | Mostrar "Expired" no card, previne execution |
| Aluno tenta executar treino de outro personal | Retorna 403 Forbidden |
| Erro ao enviar WhatsApp notification | Log em Sentry, não bloqueia execution |
| Conexão cai durante POST /api/workout-executions | Retry com exponential backoff |

---

## 📱 Zustand State Management

```typescript
import { create } from 'zustand';

interface StudentWorkout {
  id: string;
  workout: Workout;
  status: 'active' | 'completed';
  // ...
}

export const useStudentWorkoutsStore = create((set) => ({
  workouts: [] as StudentWorkout[],
  loading: false,
  
  fetchWorkouts: async () => {
    set({ loading: true });
    const res = await fetch('/api/my-workouts');
    const data = await res.json();
    set({ workouts: data.workouts, loading: false });
  },
  
  executeWorkout: async (studentWorkoutId, exerciseLogs) => {
    const res = await fetch('/api/workout-executions', {
      method: 'POST',
      body: JSON.stringify({ student_workout_id: studentWorkoutId, exercises: exerciseLogs })
    });
    const execution = await res.json();
    
    // Otimistic update
    set(state => ({
      workouts: state.workouts.map(w =>
        w.id === studentWorkoutId 
          ? { ...w, status: 'completed' }
          : w
      )
    }));
    
    return execution;
  }
}));
```

---

## 🎯 Success Metrics (Week 1)

- ✅ Personal pode criar treino com 5+ exercícios
- ✅ Personal pode atribuir a múltiplos alunos
- ✅ Aluno vê treinos na dashboard
- ✅ Aluno executa treino + ganha XP
- ✅ Personal vê relatório de execução dos alunos (básico)
- ✅ Notificação WhatsApp quando treino é atribuído
- ✅ Offline fallback funciona
- ✅ Zero duplicação ou perda de dados

---

## ⚡ Implementation Timeline

```
Day 1:    Database schema + migrations
Day 2:    API endpoints (create, assign, execute)
Day 3:    Frontend pages (list, execute)
Day 4:    Zustand store + real-time sync
Day 5:    Tests + error handling
Day 6:    WhatsApp notifications
Day 7:    Deployment + smoke testing
```

**Total: 7 days (1 week) = 36-40 human hours / 5-6 CC hours**

