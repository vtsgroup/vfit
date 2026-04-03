# 11. Muscle Mapping Editor — Ultra-Modern Anatomy System

**Versão:** v2.0 (Last-Gen, 2026)  
**Escopo:** Sprint 46 (Admin Panel), NÃO v1.1.0  
**Usuário:** Super-admin (Victor) — Desktop-only  
**Tech:** SVG + Interactive Diagrams + React-Konva  

---

## 🎯 Vision

```
┌─────────────────────────────────────────────────────────┐
│  VFIT Muscle Mapping: Ultra-Modern Anatomy Editor      │
│                                                         │
│  Click em área do corpo → expande subgrupos            │
│  "Peitoral" → "Superior" | "Médio" | "Inferior"       │
│  Atribui exercícios a cada região com precisão         │
│  SVG técnico (não emoji), last-gen UI                  │
│  Admin (Victor) otimizado para desktop                  │
└─────────────────────────────────────────────────────────┘
```

---

## ❌ NÃO em v1.1.0

**Por quê?**
- Escopo: +8.5h (de 5.5h → 15h+)
- Quebra timeline crítica
- Precisa novos endpoints + componentes
- Admin panel não tá pronto

**Recomendação**: Move para Sprint 46 (Jun 14-27, 2 weeks depois)

---

## ✅ SIM em Sprint 46

**Admin Panel Sprint** (já previsto):

```
Sprint 46 (2 weeks, 80h total):
├─ Workout CRUD ✅ (já previsto)
├─ Exercise CRUD ✅ (já previsto)
├─ Muscle Mapping Editor ← NOVO, fits here (8.5h de 80h)
├─ Recipe CRUD ✅
└─ Analytics ✅
```

---

## Architecture

### Database Schema (4 new tables)

```sql
-- 1. Muscle Groups (Peito, Costas, Pernas, etc)
CREATE TABLE muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,    -- "Peito", "Costas"
  description TEXT,                      -- "Muscle group superior do torso"
  anatomical_region VARCHAR(50),         -- "chest", "back", "shoulders"
  icon_url VARCHAR(2048),                -- Para app icon (não emoji!)
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. Muscle Subgroups (Peitoral Superior, Médio, Inferior)
CREATE TABLE muscle_subgroups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id UUID NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,            -- "Peitoral Superior"
  description TEXT,
  
  -- SVG Coordinates (for clickable areas in diagram)
  coordinate_x INT,                      -- X position in SVG
  coordinate_y INT,                      -- Y position
  coordinate_width INT,                  -- Width of clickable area
  coordinate_height INT,                 -- Height
  
  -- Optional: SVG path for precise click detection
  svg_path_d TEXT,                       -- SVG path data: "M 100 100 L 200 100 ..."
  
  color_primary VARCHAR(7),              -- Color when selected: #10b981
  color_secondary VARCHAR(7),            -- Color when hover: #34d399
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(muscle_group_id, name)
);

-- 3. Muscle Diagrams (SVG/PNG files with clickable regions)
CREATE TABLE muscle_diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id UUID NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
  diagram_type VARCHAR(10) NOT NULL,    -- "SVG" or "PNG"
  diagram_url VARCHAR(2048),             -- R2 URL: https://vfit-media.r2.../diagrams/chest.svg
  
  -- If SVG: raw SVG data (for inline rendering + editing)
  svg_data TEXT,                         -- Full SVG markup with clickable <path> tags
  
  -- Metadata
  view_angle VARCHAR(50),                -- "front", "back", "side"
  region VARCHAR(100),                   -- "Upper Body", "Lower Body"
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(muscle_group_id, view_angle)
);

-- 4. Exercise-Muscle Mapping (link exercises to specific muscle subgroups)
CREATE TABLE exercise_muscle_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_subgroup_id UUID NOT NULL REFERENCES muscle_subgroups(id) ON DELETE CASCADE,
  
  -- Primary vs secondary muscle
  is_primary BOOLEAN DEFAULT true,       -- Primary muscle worked
  
  -- Intensity/activation (optional, for future)
  activation_level INT,                  -- 1-10 scale (optional)
  
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(exercise_id, muscle_subgroup_id)
);

-- Indexes for fast queries
CREATE INDEX idx_muscle_groups_region ON muscle_groups(anatomical_region);
CREATE INDEX idx_subgroups_group ON muscle_subgroups(muscle_group_id);
CREATE INDEX idx_subgroups_coords ON muscle_subgroups(coordinate_x, coordinate_y);
CREATE INDEX idx_diagrams_group ON muscle_diagrams(muscle_group_id);
CREATE INDEX idx_exercise_mapping_exercise ON exercise_muscle_mapping(exercise_id);
CREATE INDEX idx_exercise_mapping_muscle ON exercise_muscle_mapping(muscle_subgroup_id);
```

---

### API Endpoints (8 CRUD + upload)

```typescript
// 1. MUSCLE GROUPS (Admin CRUD)
GET    /api/v1/admin/muscle-groups
POST   /api/v1/admin/muscle-groups
PUT    /api/v1/admin/muscle-groups/:id
DELETE /api/v1/admin/muscle-groups/:id

// 2. MUSCLE SUBGROUPS (Admin CRUD)
GET    /api/v1/admin/muscle-groups/:id/subgroups
POST   /api/v1/admin/muscle-groups/:id/subgroups
PUT    /api/v1/admin/muscle-subgroups/:id
DELETE /api/v1/admin/muscle-subgroups/:id

// 3. EXERCISE MAPPING (Admin CRUD)
POST   /api/v1/admin/exercises/:id/map-muscles
DELETE /api/v1/admin/exercises/:id/map-muscles/:muscle_id
GET    /api/v1/admin/exercises/:id/muscles (get linked muscles)

// 4. DIAGRAMS (Upload + Read)
POST   /api/v1/admin/diagrams/upload (multipart/form-data: SVG or PNG)
GET    /api/v1/admin/muscle-groups/:id/diagram (get diagram SVG)

// 5. STUDENT-FACING (Read-only)
GET    /api/v1/muscle-diagrams/:id (public, cached)
GET    /api/v1/exercises/:id/muscles (which muscles does this work?)
```

---

## Frontend Components (Admin Panel)

```
/src/app/dashboard/admin/muscle-mapping/
├─ page.tsx                      // Main admin page
├─ MuscleMapEditor.tsx           // Tabs wrapper
├─ tabs/
│  ├─ MuscleGroupTab.tsx         // CRUD muscle groups
│  ├─ SubgroupTab.tsx            // Edit subgroups (coords)
│  ├─ ExerciseMappingTab.tsx      // Link exercises → muscles
│  └─ DiagramTab.tsx             // Upload/manage diagrams
├─ components/
│  ├─ MuscleGroupTable.tsx       // Sortable table of groups
│  ├─ SubgroupCoordinateEditor.tsx // SVG click → define coords
│  ├─ DiagramUploader.tsx        // R2 upload
│  ├─ DiagramViewer.tsx          // SVG renderer + click detection
│  ├─ ExerciseSearch.tsx         // Search + multi-select exercises
│  ├─ PrimarySecondaryToggle.tsx // Toggle muscle importance
│  └─ MuscleDiagramPreview.tsx   // Live preview with overlay
└─ hooks/
   ├─ useMuscleGroups.ts         // Fetch groups
   ├─ useMuscleMapping.ts        // Exercise-muscle links
   └─ useDiagramCoordinates.ts   // Manage SVG coordinates
```

---

## Component Examples

### 1. SubgroupCoordinateEditor (Interactive)

```typescript
/**
 * Let admin click on SVG diagram to define clickable regions
 * - Display large SVG of muscle group
 * - Click to set x,y,width,height for each subgroup
 * - Show bounding boxes in real-time
 * - Save coordinates to DB
 */

<MuscleEditorCanvas>
  {/* SVG diagram loads from R2 */}
  <img src={diagramUrl} alt="Muscle diagram" usemap="#muscle-map" />
  
  {/* Canvas overlay for click detection */}
  <canvas
    ref={canvasRef}
    onClick={handleDiagramClick}
    onMouseMove={handleHover}
  />
  
  {/* Subgroups list on right: click to select, shows bounding box */}
  <SubgroupList subgroups={subgroups} onSelect={highlightSubgroup} />
  
  {/* Save button: stores coords to DB */}
  <Button onClick={saveCoordinates}>Save Coordinates</Button>
</MuscleEditorCanvas>
```

### 2. ExerciseMuscleMapper (Assign exercises)

```typescript
/**
 * Admin selects exercise → shows muscle diagram → click muscles → save mapping
 */

<div>
  {/* Exercise search */}
  <ExerciseSearch onSelect={(ex) => setSelectedExercise(ex)} />
  
  {/* Muscle diagram with clickable subgroups */}
  {selectedExercise && (
    <MuscleMapper>
      <DiagramViewer muscleGroup="chest" selectedSubgroups={selected} />
      <SubgroupList
        subgroups={muscleSubgroups}
        onToggle={(subgroupId) => toggleSelect(subgroupId)}
      />
      
      {/* Primary vs Secondary toggle for each selected */}
      {selected.map((id) => (
        <PrimarySecondaryToggle
          key={id}
          muscleId={id}
          isPrimary={isPrimary(id)}
          onToggle={() => togglePrimary(id)}
        />
      ))}
      
      <Button onClick={saveMapping}>Save Muscle Mapping</Button>
    </MuscleMapper>
  )}
</div>
```

### 3. MuscleDiagramViewer (Student-facing, read-only)

```typescript
/**
 * When student views an exercise, shows which muscles are worked
 * - Diagram with highlighted regions
 * - Primary vs secondary color coding
 */

<DiagramViewer
  muscleGroup="chest"
  highlightedSubgroups={[
    { id: 'chest-upper', isPrimary: true, color: '#10b981' },
    { id: 'chest-mid', isPrimary: false, color: '#34d399' },
  ]}
  interactive={false} // read-only for students
/>
```

---

## Design: Ultra-Modern (2026)

### Color Scheme for Muscle Mapping

```
Primary muscle:    #10b981 (brand green, solid)
Secondary muscle:  #34d399 (brand green, lighter)
Highlight (hover): #6ee7b7 (brand green, even lighter)
Background:        rgba(255,255,255,0.05) glass effect
Border:            rgba(255,255,255,0.1)

Dark text on hover: #050a12 (for contrast)
```

### Interactions

```
Hover subgroup:     Scale 1.05 + glow effect (shadow: 0 0 20px #10b981/30)
Click subgroup:     Toggle selected (border: 2px #10b981)
Drag to define:     Visual feedback (cursor: crosshair, temporary rectangle)
Save coords:        Toast: "Coordinates saved" (green checkmark)
```

### Responsive (Admin = Mostly Desktop)

```typescript
// Mobile: simplified view (read-only, show diagram only)
<div className="md:hidden">
  <DiagramViewer muscleGroup="chest" interactive={false} />
  <p className="text-xs text-text-muted">Use desktop to edit</p>
</div>

// Desktop: full editor
<div className="hidden md:block">
  <MuscleMapEditor />
</div>
```

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Diagrams** | SVG (not PNG) | Scalable, clickable, light, editor-friendly |
| **Click Detection** | SVG path + Canvas.hitRegion or react-konva | Precise, performant |
| **Upload** | R2 (Cloudflare) | Existing infrastructure, CDN included |
| **Storage** | Inline SVG data + R2 reference | Flexibility |
| **Frontend** | React + TypeScript | Components, state management |
| **Library** | react-konva (optional) | Canvas/SVG manipulation if needed |
| **Animation** | Framer Motion | Smooth transitions |

---

## Implementation Timeline (Sprint 46)

```
📅 Week 1:
  Day 1-2: DB schema (40 min) + migrations (20 min)
  Day 3-4: API endpoints (2.5h)
  Day 5: Test API with Postman

📅 Week 2:
  Day 1-2: Frontend components (4.5h)
  Day 3-4: Integration + testing (1.5h)
  Day 5: Polish + admin UX refinement

Total: ~9h (fits in 80h Sprint 46)
```

---

## Rollout Strategy

### Phase 1: Internal (Sprint 46)
- Victor (super-admin) tests muscle mapping editor
- Define muscle groups for all major body parts
- Create high-quality SVG diagrams (hire designer if needed)
- Map existing 500+ exercises to muscles

### Phase 2: Student Feature (Sprint 47)
- Students see muscle diagrams when viewing exercises
- Visual feedback: "This exercise targets your Chest (Upper)" with highlight
- No editing, just read-only diagrams

### Phase 3: Advanced (Sprint 48+)
- Student customization: "Focus on these muscles" → personalized workouts
- Progress tracking per muscle group
- Advanced analytics: "Muscle imbalance detection"

---

## Quality Checklist

- [ ] SVG diagrams load fast (< 100KB each)
- [ ] Click detection accurate (no false positives)
- [ ] Coordinates save to DB correctly
- [ ] Exercise-muscle links persist
- [ ] Student view doesn't show broken diagrams
- [ ] Mobile gracefully degrades (shows text fallback)
- [ ] Dark mode contrast OK (WCAG AA)
- [ ] Admin can bulk import exercises + muscles
- [ ] Audit trail: log all admin changes

---

## Future Enhancements (Post-v1.1)

- 3D anatomy model (Three.js) for advanced visualization
- Machine learning: Auto-detect muscle groups from exercise description
- Athlete profiles: "Weak muscle groups" based on training history
- Muscle imbalance detection: "You're training chest 2x more than back"

---

## Summary: Muscle Mapping Strategy

```
❌ v1.1.0: DON'T include Muscle Mapping
   Reason: +8.5h scope, breaks 5.5h timeline

✅ Sprint 46: Include Muscle Mapping in Admin Panel
   Reason: Fits 80h budget, aligns roadmap, Admin-first design

🏗️ Tech: 4 DB tables + 8 API endpoints + 5 React components
🎨 Design: SVG diagrams + ultra-modern UI (glass + spring animations)
📱 Responsive: Desktop-optimized (admin), mobile fallback
⏰ Timeline: 9h within Sprint 46

→ v1.2 (Sprint 47): Student-facing muscle diagrams (read-only)
→ v1.3 (Sprint 48): Advanced muscle analytics + personalization
```

---

**Plan ahead, execute flawlessly! 🚀**
