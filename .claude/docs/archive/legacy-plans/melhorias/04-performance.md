# Melhorias — Performance

> Base de code splitting e page transitions implementada nos Sprints 37–38.
> Este documento propõe otimizações adicionais para Core Web Vitals e experiência percebida.

---

## 1. Service Worker com Cache Strategy para Assets Estáticos

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 43

**Problema:** Assets estáticos (JS, CSS, fontes, imagens) são re-baixados entre sessões, aumentando tempo de carregamento em redes lentas.

**Proposta:** Implementar Service Worker com estratégia `Cache First` para assets com hash no nome (imutáveis) e `Stale While Revalidate` para dados que mudam raramente.

**Estratégias por tipo de recurso:**

| Recurso | Estratégia | TTL |
|---|---|---|
| JS/CSS com hash (`_next/static/`) | Cache First | Imutável |
| Fontes (`/fonts/`) | Cache First | 1 ano |
| Imagens de exercícios (R2) | Stale While Revalidate | 7 dias |
| Dados de exercícios (`/api/exercises`) | Stale While Revalidate | 1 hora |
| Dados do usuário (`/api/profile`) | Network First | Sem cache |

**Implementação:**
- `public/sw.js` registrado em `app/layout.tsx` via `useEffect`
- Workbox para geração automática do service worker (ou Serwist, fork TypeScript-first)
- `next.config.ts` — verificar compatibilidade com `output: 'export'`

---

## 2. Prefetch de Rotas Frequentes no Hover

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 42

**Problema:** Navegação entre seções do dashboard sente uma latência perceptível mesmo com SSR estático, porque o JS da rota é baixado na hora do clique.

**Proposta:** Usar `router.prefetch()` do Next.js nas rotas mais acessadas assim que o usuário passa o mouse sobre o link de navegação (hover).

**Rotas prioritárias para prefetch:**
- `/dashboard/workout` (treino ativo)
- `/dashboard/students` (lista de alunos)
- `/dashboard/gamification`
- `/dashboard/progress`

**Implementação:**
- Componente `nav-item.tsx` do sidebar: adicionar `onMouseEnter={() => router.prefetch(href)}`
- Mobile: prefetch ao `onFocus` (touch devices não têm hover)
- Evitar prefetch em conexões lentas: verificar `navigator.connection.effectiveType !== '2g'`

---

## 3. Virtual Scrolling em Listas Longas

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 42

**Problema:** Listas com muitos itens (biblioteca de exercícios com centenas de exercícios, histórico de treinos) renderizam todos os itens no DOM, causando lentidão em dispositivos de entrada.

**Proposta:** Implementar virtual scrolling nas listas com potencial de crescimento ilimitado.

**Listas candidatas:**
- Biblioteca de exercícios (D1 — pode ter centenas de exercícios)
- Histórico de treinos do aluno
- Lista de alunos do personal (quando chegar a dezenas/centenas)
- Leaderboard de gamificação

**Implementação:**
- Biblioteca `@tanstack/react-virtual` (da mesma organização do TanStack Query, já no stack)
- `use-virtual-list.ts` — wrapper customizado com integração ao TanStack Query infinite scroll
- Item height fixo para melhor performance (evitar `measureElement` quando possível)

---

## 4. Image Optimization: Lazy Load + Blur Placeholder

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** Imagens de exercícios (thumbnails, GIFs de demonstração) carregam sem placeholder, causando layout shift (CLS) e consumo de dados desnecessário para imagens fora da viewport.

**Proposta:** Usar `next/image` com `loading="lazy"` e `placeholder="blur"` para todas as imagens de conteúdo.

**Implementação:**
- Substituir `<img>` por `<Image>` de `next/image` em componentes de exercício
- Para imagens do R2: gerar blur data URL de 8px × 8px no momento do upload
- Armazenar `blur_hash` ou `placeholder_url` junto com a URL da imagem no banco
- Endpoint `GET /exercises/:id/image` retorna `{ url, width, height, blurDataURL }`
- CLS zero: sempre especificar `width` e `height` no componente `<Image>`

---

## 5. Bundle Analyzer: Identificar Chunks Pesados

**Prioridade:** 🔴 Alta | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** Após 40 sprints de desenvolvimento, o bundle JavaScript provavelmente tem dependências pesadas que podem ser lazy-loaded ou substituídas.

**Proposta:** Executar análise do bundle e criar baseline documentado. Identificar os 5 maiores contribuintes e propor otimização para cada um.

**Implementação:**
```bash
# Instalar apenas como devDependency
npm install --save-dev @next/bundle-analyzer

# next.config.ts — envolvido com withBundleAnalyzer
# ANALYZE=true npm run build
```

**Candidatos prováveis de otimização:**
- `framer-motion` — usar apenas `LazyMotion` + `domAnimation` subset
- `date-fns` — usar tree-shaking ou trocar por `dayjs` (menor)
- Ícones SVG — garantir que não estão sendo importados como sprite completo

---

## 6. Critical CSS Inline para FCP

**Prioridade:** 🟡 Média | **Esforço:** M | **Sprint sugerida:** 43

**Problema:** O CSS crítico (acima do fold) é carregado como arquivo externo, atrasando o First Contentful Paint (FCP).

**Proposta:** Extrair e inlinear o CSS necessário para renderizar o conteúdo acima do fold diretamente no `<head>`.

**Implementação:**
- Tailwind v4 já faz purge automático — verificar se CSS crítico está sendo gerado corretamente
- Ferramenta: `critters` (usada internamente pelo Angular CLI) pode ser adaptada para Next.js
- Alternativa: identificar manualmente os componentes do layout base e garantir que seus estilos estão no bundle principal
- Medir impacto com `npm run quality:ci` e comparar FCP antes/depois

---

## 7. Stale-While-Revalidate para Dados de Exercícios

**Prioridade:** 🟡 Média | **Esforço:** P | **Sprint sugerida:** 41

**Problema:** A biblioteca de exercícios (dados do D1) é re-buscada em cada navegação, mesmo sendo dados que mudam raramente (talvez mensalmente).

**Proposta:** Configurar `staleTime` e `gcTime` agressivos no TanStack Query para dados de exercícios.

**Implementação:**
```typescript
// src/hooks/use-exercises.ts
useQuery({
  queryKey: ['exercises'],
  queryFn: fetchExercises,
  staleTime: 1000 * 60 * 60,      // 1 hora — não re-busca se cache recente
  gcTime: 1000 * 60 * 60 * 24,    // 24 horas — mantém em memória
})
```

- Adicionar header `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` no endpoint do worker
- `Cloudflare Cache` fará cache na edge automaticamente com esse header
- Invalidar cache manualmente via `queryClient.invalidateQueries(['exercises'])` quando admin atualizar dados

---

## Resumo

| # | Item | Prioridade | Esforço | Sprint |
|---|---|---|---|---|
| 1 | Service Worker cache strategy | 🟡 Média | M | 43 |
| 2 | Prefetch de rotas no hover | 🟡 Média | P | 42 |
| 3 | Virtual scrolling em listas longas | 🟡 Média | M | 42 |
| 4 | Image lazy load + blur placeholder | 🟡 Média | P | 41 |
| 5 | Bundle analyzer (baseline) | 🔴 Alta | P | 41 |
| 6 | Critical CSS inline para FCP | 🟡 Média | M | 43 |
| 7 | Stale-while-revalidate para exercícios | 🟡 Média | P | 41 |
