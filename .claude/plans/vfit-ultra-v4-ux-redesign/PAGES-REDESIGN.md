# VFIT Ultra v4 — Pages Redesign Details

> **Documento:** Especificação página-por-página do redesign B2C  
> **Última atualização:** 10/04/2026  
> **Responsável por:** Layout, mudanças visuais, componentes por página

---

## 📋 Índice de Páginas

1. [Treinos Page (S4)](#treinos-page-s4)
2. [Plano Page (S5)](#plano-page-s5)
3. [Exercícios Library Page (S6)](#exercícios-library-page-s6)
4. [Exercício Detail Page (S6)](#exercício-detail-page-s6)

---

## 🏋️ Treinos Page (S4)

**Arquivo:** `src/app/(app)/treinos/page.tsx`

### Estado Atual
- Todos os cards usam `.glass-card rounded-2xl border border-brand-primary/20`
- Cores iguais, layouts iguais, visual monótono
- ProgressRing pequeno (120x120)
- KPI grid com cores iguais

### Redesign Sprint S4

#### Seção 1: Treino do Dia (Hero Card)

**ANTES:**
```tsx
<div className="glass-card rounded-2xl border border-green-500/20 p-6">
  <h2>Treino do Dia</h2>
  <p>Peito e Costas</p>
  <ProgressRing percent={65} />
</div>
```

**DEPOIS:**
```tsx
<div className="glass-ultra relative rounded-2xl p-6 overflow-hidden">
  {/* Left border strip — 3px verde */}
  <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500/80" />
  
  <div className="pl-2">
    <div className="mb-4">
      <span className="text-xs font-medium text-emerald-400">TREINO DO DIA</span>
      <h2 className="text-2xl font-black text-white">Peito e Costas</h2>
    </div>

    {/* ProgressRing maior — 160x160 */}
    <div className="flex items-center gap-6">
      <ProgressRing percent={65} size={160} color="#10b981" />
      
      <div className="space-y-2">
        <div className="text-sm text-text-secondary">Próximo exercício em</div>
        <div className="text-xl font-black text-white">Supino Inclinado</div>
        <div className="text-xs text-text-secondary">5 minutos</div>
      </div>
    </div>

    {/* CTA — start/continue button */}
    <Button className="mt-6 w-full" size="lg">
      Continuar Treino
    </Button>
  </div>
</div>
```

**Mudanças visuais:**
- Glass ultra em vez de glass regular
- Strip verde 3px na esquerda (visual anchor)
- ProgressRing 160x160 (vs 120)
- Informação do próximo exercício visível
- CTA proeminente com Button `lg`

#### Seção 2: KPI Grid (4 Cards Coloridos)

**ANTES:**
```tsx
<div className="grid grid-cols-2 gap-4">
  <KPICard icon="footprints" label="Passos" value="8,234" />
  <KPICard icon="droplet" label="Água" value="2.1L" />
  {/* ... todos com glass-card padrão */}
</div>
```

**DEPOIS:**
```tsx
<div className="grid grid-cols-2 gap-4">
  <KPICard
    icon="footprints"
    label="Passos"
    value={8234}
    unit="passos"
    color="blue"
    trend={{ delta: 12, isPositive: true }}
  />
  <KPICard
    icon="droplet"
    label="Água"
    value={2.1}
    unit="L"
    color="cyan"
    trend={{ delta: -5, isPositive: false }}
  />
  <KPICard
    icon="moon"
    label="Sono"
    value={7.5}
    unit="h"
    color="purple"
    trend={{ delta: 8, isPositive: true }}
  />
  <KPICard
    icon="flame"
    label="Calorias"
    value={2100}
    unit="kcal"
    color="amber"
    trend={{ delta: 0, isPositive: false }}
  />
</div>
```

**Mudanças visuais:**
- Cada card tem cor própria temática
- Icon container colorido (rgba background)
- Label com melhor contraste (zinc-400 em vez de zinc-500)
- Trend badge com seta e percentual
- Hover: scale + colored shadow

#### Seção 3: Card Nutrição

**ANTES:**
```tsx
<div className="glass-card rounded-2xl border border-yellow-500/20 p-6">
  <h3>Nutrição</h3>
  <div>Proteína: 120g / 150g</div>
  <div style={{...}} /> {/* barra de progresso simples */}
</div>
```

**DEPOIS:**
```tsx
<GlassCard variant="glass" className="space-y-4 rounded-2xl">
  {/* Header com gradiente temático amber */}
  <div className="space-y-2 rounded-lg bg-linear-to-r from-amber-500/20 via-transparent to-transparent p-3">
    <h3 className="text-sm font-semibold text-amber-100">NUTRIÇÃO DO DIA</h3>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-black text-white">120g</span>
      <span className="text-xs text-amber-300">150g meta</span>
    </div>
  </div>

  {/* Protein Progress Bar — animated spring */}
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-secondary">Proteína</span>
      <span className="font-medium text-amber-300">80%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: '80%' }}
        transition={{ type: 'spring', stiffness: 80, damping: 30 }}
      />
    </div>
  </div>

  {/* Other macros — compact */}
  <div className="grid grid-cols-2 gap-2 text-xs">
    <div className="rounded-lg bg-white/5 p-2">
      <div className="text-text-secondary">Carbs</div>
      <div className="font-black text-white">45g</div>
    </div>
    <div className="rounded-lg bg-white/5 p-2">
      <div className="text-text-secondary">Gordura</div>
      <div className="font-black text-white">30g</div>
    </div>
  </div>
</GlassCard>
```

#### Seção 4: Card Avaliação

**ANTES:**
```tsx
<div className="glass-card rounded-2xl border border-blue-500/20 p-6">
  <h3>Como você se sente?</h3>
  <Button>Avaliar Sessão</Button>
</div>
```

**DEPOIS:**
```tsx
<GlassCard variant="glass" className="space-y-4 rounded-2xl">
  {/* Header com gradiente violeta */}
  <div className="space-y-2 rounded-lg bg-linear-to-r from-violet-500/20 via-transparent to-transparent p-3">
    <h3 className="text-sm font-semibold text-violet-100">FEEDBACK DA SESSÃO</h3>
    <p className="text-xs text-text-secondary">Sua avaliação ajuda a personalizar treinos</p>
  </div>

  {/* Emoji Rating — interativo */}
  <div className="flex justify-around py-2">
    {[
      { emoji: '😞', value: 1 },
      { emoji: '😐', value: 2 },
      { emoji: '😊', value: 3 },
      { emoji: '🤩', value: 4 },
    ].map((option) => (
      <button
        key={option.value}
        onClick={() => submitRating(option.value)}
        className={cn(
          'text-3xl transition-all hover:scale-125',
          selectedRating === option.value ? 'scale-125' : 'opacity-50'
        )}
      >
        {option.emoji}
      </button>
    ))}
  </div>

  {/* CTA — Assessment */}
  <Button size="lg" className="w-full" variant="assessment">
    <Trophy className="h-4 w-4" />
    Registrar Avaliação
  </Button>
</GlassCard>
```

#### Seção 5: Templates Explorer

**ANTES:**
```tsx
<div className="space-y-4">
  <h3>Explorar Templates</h3>
  <div className="grid grid-cols-2 gap-4">
    {templates.map((t) => (
      <div key={t.id} className="glass-card rounded-2xl p-4">
        <div className="h-24 bg-white/10" />
        <p>{t.name}</p>
      </div>
    ))}
  </div>
</div>
```

**DEPOIS:**
```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">Explorar Templates</h3>
    <Button variant="ghost" size="sm">
      Ver Todos →
    </Button>
  </div>
  <div className="grid grid-cols-2 gap-4">
    {templates.map((template) => {
      const colorMap = {
        'peito': { gradient: 'from-red-500 to-red-600', icon: 'target' },
        'costas': { gradient: 'from-blue-500 to-blue-600', icon: 'spine' },
        // ...
      }
      const colors = colorMap[template.muscleGroup]

      return (
        <div
          key={template.id}
          className="group cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-105"
        >
          {/* Template Thumbnail — gradient + icon */}
          <div className={cn(
            'h-32 bg-linear-to-br flex items-center justify-center relative overflow-hidden',
            colors.gradient
          )}>
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-20 bg-pattern-dots" />
            <DSIcon name={colors.icon} size={48} className="text-white opacity-60" />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>

          {/* Template Info */}
          <div className="glass-card rounded-b-xl p-3 space-y-1">
            <h4 className="text-sm font-semibold text-white line-clamp-1">{template.name}</h4>
            <p className="text-xs text-text-secondary">{template.duration} min • {template.difficulty}</p>
          </div>
        </div>
      )
    })}
  </div>
</div>
```

---

## 📋 Plano Page (S5)

**Arquivo:** `src/app/(app)/plano/page.tsx`

### Estado Atual
- MuscleChip usa `style` inline com hex colors (violação)
- ExerciseCard com design flat
- Tabs sem indicador 3D

### Redesign Sprint S5

#### Header — Greeting com Gradiente

**ANTES:**
```tsx
<h1 className="text-3xl font-bold">Olá, {userName}</h1>
```

**DEPOIS:**
```tsx
<h1 className="text-4xl font-black bg-linear-to-r from-brand-primary via-brand-mint to-brand-primary/80 bg-clip-text text-transparent">
  {getGreeting()}, {userName}! 🔥
</h1>
<p className="mt-2 text-sm text-text-secondary">{getMotivationalPhrase()}</p>
```

#### Day Selector Tabs — 3D Indicator

**ANTES:**
```tsx
<div className="flex gap-2 border-b border-white/10">
  {days.map((day) => (
    <button
      key={day}
      className={cn(
        'px-4 py-2 border-b-2 transition',
        activeDay === day ? 'border-brand-primary text-white' : 'border-transparent text-text-secondary'
      )}
      onClick={() => setActiveDay(day)}
    >
      {day}
    </button>
  ))}
</div>
```

**DEPOIS:**
```tsx
<div className="flex gap-2 p-1 bg-white/3 rounded-lg">
  {days.map((day) => (
    <motion.button
      key={day}
      className={cn(
        'relative px-4 py-2 rounded-md transition text-sm font-medium',
        activeDay === day
          ? 'text-white'
          : 'text-text-secondary hover:text-text-primary'
      )}
      onClick={() => setActiveDay(day)}
      layout
    >
      {activeDay === day && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 bg-brand-primary/20 rounded-md shadow-[0_0_12px_rgba(34,197,94,0.2)]"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">{day}</span>
    </motion.button>
  ))}
</div>
```

#### Exercise Cards — Glassmorfismo Temático

**ANTES:**
```tsx
<div className="rounded-2xl border border-white/6 bg-bg-secondary p-4">
  <img src={imageUrl} />
  <h4>{exerciseName}</h4>
  <span>{sets}x{reps}</span>
</div>
```

**DEPOIS:**
```tsx
{exercises.map((exercise) => (
  <ExerciseCard
    key={exercise.id}
    id={exercise.id}
    name={exercise.name}
    muscleGroup={exercise.muscleGroup}
    difficulty={exercise.difficulty}
    imageUrl={exercise.imageUrl}
    sets={exercise.sets}
    reps={exercise.reps}
    onClick={() => openExerciseDetail(exercise.id)}
  />
))}
```

**Componente ExerciseCard renderiza:**
- Thumbnail com gradiente por grupo muscular
- Ícone DSIcon do grupo muscular visível
- Difficulty badge colorido (verde=iniciante, amber=intermediário, red=avançado)
- Sets x Reps em badge com background

#### Muscle Group Filter Chips

**ANTES:**
```tsx
<button
  style={{ backgroundColor: MUSCLE_COLORS[muscle] }}
  onClick={() => filterByMuscle(muscle)}
>
  {muscle}
</button>
```

**DEPOIS:**
```tsx
<MuscleChip
  muscle={muscle}
  isActive={activeMuscles.includes(muscle)}
  onClick={() => toggleMuscleFilter(muscle)}
/>
```

**MuscleChip renderiza:**
- DSIcon do grupo muscular (não emoji)
- Label capitalizado
- Ativo: cor temática + shadow glow
- Inativo: white/8 background

---

## 🔍 Exercícios Library Page (S6)

**Arquivo:** `src/app/(app)/exercicios/page.tsx`

### Estado Atual
- Usa `MUSCLE_EMOJI` (violação regra 16)
- Grid flat, sem personalidade
- Filtros sem ícones

### Redesign Sprint S6

#### Tabs Muscle/Equipment/Favorites

**ANTES:**
```tsx
<div className="flex gap-4 border-b border-white/10">
  {['Músculos', 'Equipamento', 'Favoritos'].map((tab) => (
    <button className={cn('px-4 py-2 border-b-2', activeTab === tab && 'border-brand-primary')}>
      {tab}
    </button>
  ))}
</div>
```

**DEPOIS:**
```tsx
<motion.div className="flex gap-1 p-1 bg-white/3 rounded-lg">
  {tabs.map((tab) => (
    <motion.button
      key={tab.id}
      className={cn(
        'relative px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition',
        activeTab === tab.id
          ? 'text-white'
          : 'text-text-secondary hover:text-text-primary'
      )}
      onClick={() => setActiveTab(tab.id)}
      layout
    >
      <DSIcon name={tab.icon} size={16} />
      {tab.label}
      
      {activeTab === tab.id && (
        <motion.div
          layoutId="exercise-tab-indicator"
          className="absolute inset-0 bg-brand-primary/20 rounded-md shadow-[0_0_12px_rgba(34,197,94,0.2)]"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  ))}
</motion.div>
```

#### Muscle Filter Chips

**ANTES:**
```tsx
{MUSCLE_EMOJI.map((muscle) => (
  <button key={muscle} className="px-3 py-1 rounded-full">
    {muscle} {MUSCLE_EMOJI[muscle]}
  </button>
))}
```

**DEPOIS:**
```tsx
<div className="flex flex-wrap gap-2">
  {MUSCLE_GROUPS.map((muscle) => (
    <button
      key={muscle}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition',
        activeFilters.includes(muscle)
          ? 'bg-(--muscle-${muscle}-primary) text-white shadow-[0_0_12px_var(--muscle-${muscle}-primary)]'
          : 'bg-white/8 text-text-secondary hover:bg-white/12'
      )}
      onClick={() => toggleMuscleFilter(muscle)}
    >
      <DSIcon name={getMuscleIcon(muscle)} size={14} />
      <span className="capitalize">{muscle}</span>
    </button>
  ))}
</div>
```

#### Exercise Grid — Cards Temáticos

**ANTES:**
```tsx
<div className="grid grid-cols-2 gap-4">
  {exercises.map((ex) => (
    <div className="rounded-2xl p-4 bg-white/3">
      <img src={ex.image} />
      <h4>{ex.name}</h4>
    </div>
  ))}
</div>
```

**DEPOIS:**
```tsx
<motion.div
  className="grid grid-cols-2 gap-4"
  layout
>
  {filteredExercises.map((exercise, index) => (
    <motion.div
      key={exercise.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <ExerciseCard
        id={exercise.id}
        name={exercise.name}
        muscleGroup={exercise.muscleGroup}
        difficulty={exercise.difficulty}
        imageUrl={exercise.imageUrl}
        onClick={() => navigateToDetail(exercise.id)}
      />
    </motion.div>
  ))}
</motion.div>
```

---

## 📖 Exercício Detail Page (S6)

**Arquivo:** `src/app/(app)/exercicios/[id]/client-page.tsx`

### Estado Atual
- Usa `DIFFICULTY_MAP`, `MUSCLE_ICON_MAP` (hardcoded)
- Layout flat para instruções

### Redesign Sprint S6

#### Hero Section — Glassmorfismo Temático

**ANTES:**
```tsx
<div className="relative h-64 bg-gradient-to-b from-white/10 to-transparent">
  <img src={exerciseImage} className="h-full w-full object-cover" />
</div>
```

**DEPOIS:**
```tsx
<div className="relative h-80 rounded-2xl overflow-hidden mb-6">
  {/* Background com gradiente do grupo muscular */}
  <div
    className="absolute inset-0 bg-linear-to-br"
    style={{
      backgroundImage: `linear-gradient(135deg, var(--muscle-${muscleGroup}-primary), var(--muscle-${muscleGroup}-primary)/50)`,
    }}
  />
  
  {/* Exercise Image */}
  <div className="absolute inset-0">
    <img src={exerciseImage} className="h-full w-full object-cover opacity-60" />
    <div className="absolute inset-0 bg-black/20" />
  </div>

  {/* Overlay Info */}
  <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
    <div>
      <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
        {muscleGroup} • {difficulty}
      </span>
    </div>

    {/* Title */}
    <div>
      <h1 className="text-4xl font-black leading-tight">{exerciseName}</h1>
    </div>
  </div>
</div>

{/* Info Chips Row */}
<div className="flex gap-2 overflow-x-auto pb-4">
  <div className="flex-shrink-0 rounded-lg glass-card px-4 py-3 text-center">
    <div className="text-xs text-text-secondary">Dificuldade</div>
    <div className="text-sm font-black text-white capitalize">{difficulty}</div>
  </div>
  <div className="flex-shrink-0 rounded-lg glass-card px-4 py-3 text-center">
    <div className="text-xs text-text-secondary">Grupo Muscular</div>
    <div className="flex items-center justify-center gap-1">
      <DSIcon name={getMuscleIcon(muscleGroup)} size={16} />
      <span className="text-sm font-black text-white capitalize">{muscleGroup}</span>
    </div>
  </div>
  {equipment && (
    <div className="flex-shrink-0 rounded-lg glass-card px-4 py-3 text-center">
      <div className="text-xs text-text-secondary">Equipamento</div>
      <div className="text-sm font-black text-white capitalize">{equipment}</div>
    </div>
  )}
</div>
```

#### Instructions — Glassmorfismo com Ícones

**ANTES:**
```tsx
<div className="space-y-4 prose prose-invert">
  {instructions.map((instr, i) => (
    <p key={i}>{instr}</p>
  ))}
</div>
```

**DEPOIS:**
```tsx
<div className="space-y-3">
  {instructions.map((instruction, index) => (
    <motion.div
      key={index}
      className="glass-card rounded-xl p-4 flex gap-3 items-start"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Step Number Badge */}
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
        <span className="text-sm font-black text-brand-primary">{index + 1}</span>
      </div>

      {/* Instruction Text */}
      <div className="flex-1 pt-0.5">
        <p className="text-sm text-text-primary leading-relaxed">{instruction}</p>
      </div>
    </motion.div>
  ))}
</div>
```

#### CTA Bottom — Add to Workout

**ANTES:**
```tsx
<button className="w-full rounded-lg bg-brand-primary p-4 font-semibold">
  Adicionar ao Treino
</button>
```

**DEPOIS:**
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 pt-12">
  <Button size="lg" className="w-full" variant="primary">
    <Plus className="h-4 w-4" />
    Adicionar ao Treino
  </Button>
</div>
```

---

## ✅ Checklist por Página

### Treinos (S4)
- [ ] Hero card com glass-ultra + strip 3px
- [ ] ProgressRing 160x160
- [ ] KPI grid 2x2 com cores temáticas
- [ ] Nutrição card com gradiente amber + barra animada
- [ ] Avaliação card com gradiente violet + emoji rating
- [ ] Templates com thumbnail gradiente + ícone

### Plano (S5)
- [ ] Header greeting com gradiente de texto
- [ ] Day selector tabs com indicator 3D
- [ ] ExerciseCard renderizando com cores temáticas
- [ ] MuscleChip usando tokens (ZERO hex)
- [ ] Hover effects em todos os elementos

### Exercícios (S6)
- [ ] Tabs com ícones + sliding indicator
- [ ] Muscle filter chips com DSIcon
- [ ] Exercise grid com animação staggered
- [ ] Hero section com gradiente temático
- [ ] Instructions com step badges numerados

---

## 📐 Espaciamento Padrão

Usar escala 4px (Tailwind v4):
- Gaps: gap-2 (8px), gap-3 (12px), gap-4 (16px), gap-6 (24px)
- Padding: p-3 (12px), p-4 (16px), p-6 (24px)
- Margin: mb-2 (8px), mb-4 (16px), mt-6 (24px)
