# Sprint 11 — Audit: Performance & Bundle

> **Fase:** 3 · **Prioridade:** 🟡 ALTA · **Estimativa:** 4-6h
> **Objetivo:** Bundle menor, imagens otimizadas, CSS limpo

---

## 🎯 Problemas (da auditoria)

1. **framer-motion full bundle** — 37 imports sem LazyMotion (coberto no Sprint 9)
2. **xlsx/pdf-lib/qrcode static imports** — ~300KB+ carregados upfront
3. **3.3MB PNG** — `photo-placeholder-female.png` não otimizado
4. **CSS dead code** — 18 keyframes + 30+ classes não referenciados
5. **Image optimization** — Imagens sem next/image ou CF Image Resizing
6. **Fonts** — Verificar se está usando font-display: swap

---

## 📋 Tasks

### T11.1 — Comprimir imagens grandes
**Encontrar todas as imagens >500KB:**

```bash
find public/ -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +500k
```

**Otimizações:**
- `photo-placeholder-female.png` (3.3MB) → comprimir para <200KB ou converter para WebP
- Qualquer PNG >500KB → WebP com quality 80
- Usar `sharp` ou `squoosh` para batch optimization

```bash
# Script de compressão:
npx sharp-cli --input public/images/photo-placeholder-female.png --output public/images/photo-placeholder-female.webp --quality 80 --format webp
```

### T11.2 — next/image para imagens locais
**Onde possível**, usar `<Image>` do Next.js para otimização automática:

```tsx
// ❌ <img src="/images/hero.png" />
// ✅ <Image src="/images/hero.webp" width={400} height={300} alt="..." />
```

**Nota:** Em static export (`output: 'export'`), next/image tem limitações.
Usar `unoptimized` prop ou CF Image Resizing para prod.

### T11.3 — CSS Dead Code Audit
**Script para auditar keyframes:**

```bash
# Listar todos os keyframes definidos
grep -oP '@keyframes \K\w+' src/app/globals.css | sort

# Para cada um, verificar se é referenciado
for kf in $(grep -oP '@keyframes \K\w+' src/app/globals.css); do
  refs=$(grep -rl "$kf" src/ --include="*.tsx" --include="*.ts" --include="*.css" | wc -l)
  if [ "$refs" -le 1 ]; then
    echo "UNUSED: $kf (only in globals.css)"
  fi
done
```

**Remover** todos os keyframes sem referência no código.

### T11.4 — CSS Dead Classes
**Auditar classes customizadas:**

```bash
# Listar classes definidas em globals.css
grep -oP '\.\K[\w-]+(?=\s*\{)' src/app/globals.css | sort -u

# Verificar uso
for cls in $(grep -oP '\.\K[\w-]+(?=\s*\{)' src/app/globals.css); do
  refs=$(grep -rl "$cls" src/ --include="*.tsx" --include="*.ts" | wc -l)
  if [ "$refs" -eq 0 ]; then
    echo "UNUSED: .$cls"
  fi
done
```

### T11.5 — Font optimization
**Verificar em `src/app/layout.tsx`:**

```tsx
// ✅ Correto
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // ← OBRIGATÓRIO para performance
  preload: true,
})
```

### T11.6 — Prefetch optimization
**Verificar links com prefetch desnecessário:**

```bash
grep -rn "prefetch" src/ --include="*.tsx"
```

**Regra:**
- Links na navbar → `prefetch={true}` (serão clicados)
- Links em listas longas → `prefetch={false}` (evita requests desnecessários)
- Links em modais → `prefetch={false}`

### T11.7 — Bundle analysis
**Adicionar script de análise:**

```json
// package.json
"analyze": "ANALYZE=true next build"
```

```typescript
// next.config.ts
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config: any) => config

module.exports = withBundleAnalyzer(nextConfig)
```

### T11.8 — Lazy load de componentes pesados
**Componentes que devem ser lazy-loaded:**

```tsx
// ❌ Import estático de componente pesado
import { ExcelExportButton } from '@/components/admin/excel-export'

// ✅ Dynamic import
const ExcelExportButton = dynamic(
  () => import('@/components/admin/excel-export').then(m => m.ExcelExportButton),
  { loading: () => <Button loading>Exportar</Button> }
)
```

**Candidatos:**
- Componentes de export (Excel, PDF)
- QR code generator
- Calendário complexo
- Crop de imagem
- Charts/gráficos

---

## ✅ Critérios de Aceite

- [ ] Zero imagens >500KB no public/
- [ ] CSS keyframes dead code removido
- [ ] CSS classes dead code removido
- [ ] Fonts com display: swap
- [ ] Componentes pesados lazy-loaded
- [ ] Bundle analysis configurado
- [ ] xlsx/pdf-lib carregados dinamicamente (Sprint 9)

---

## 📁 Arquivos Impactados

```
public/images/ — compressão de imagens
src/app/globals.css — cleanup CSS
src/app/layout.tsx — font config
next.config.ts — bundle analyzer
~5-10 componentes com import dinâmico
```
