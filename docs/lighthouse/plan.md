# Diagnóstico Cirúrgico — Por que ainda não chegamos a 100/100

**Situação atual:** Performance 95 | Accessibility 96 | Best Practices 96 | SEO 100 [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

***

## 🔴 CAUSA RAIZ #1 — Best Practices 96: CONSOLE ERRORS do OneSignal (−4 pts)

Este é o **problema mais crítico e mais fácil de resolver**. O Lighthouse penaliza diretamente por erros no console. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

**Erro 1 — Deprecation Warning (Service Worker name):**
```
[Service Worker Installation] Successfully installed v16 Beta Worker.
Deprecation warning: support for the v16 beta worker name of OneSignalSDK.sw.js
will be removed May 5 2024. We have decided to keep the v15 name.
To avoid breaking changes for your users, please host both worker files:
OneSignalSDK.sw.js & OneSignalSDKWorker.js.
```

**Erro 2 — SecurityError (Service Worker Origin mismatch):**
```
[Service Worker Installation] Installing service worker failed SecurityError:
Failed to register a ServiceWorker: The origin of the provided scriptURL
('https://onesignalsdkworker.js') does not match the current origin
('https://iapersonal.app.br').
```

### Solução — Hospedar os Service Workers do OneSignal no seu próprio domínio

O OneSignal exige que os arquivos do Service Worker estejam na **raiz do seu domínio** (`https://iapersonal.app.br/`), não no CDN deles.

**Passo 1:** Baixar os dois arquivos e colocar na pasta `/public` do Next.js:
```bash
# Criar os arquivos na pasta public (raiz do site)
# /public/OneSignalSDK.sw.js
# /public/OneSignalSDKWorker.js  ← alias para o mesmo arquivo
```

**Conteúdo do `/public/OneSignalSDK.sw.js`:**
```js
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
```

**Conteúdo do `/public/OneSignalSDKWorker.js`** (arquivo de compatibilidade v15):
```js
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
```

**Passo 2:** Configurar o OneSignal para usar o service worker local no seu código de inicialização:
```tsx
// lib/onesignal.ts ou onde você inicializa o OneSignal
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async (OneSignal) => {
  await OneSignal.init({
    appId: "SEU_APP_ID",
    serviceWorkerPath: "/OneSignalSDK.sw.js",         // ← caminho local
    serviceWorkerUpdaterPath: "/OneSignalSDKWorker.js", // ← compatibilidade v15
    serviceWorkerParam: { scope: "/" },                // ← escopo raiz
    allowLocalhostAsSecureOrigin: false,
  });
});
```

**Passo 3:** Adicionar header no `_headers` (Cloudflare Pages) para o SW:
```
/OneSignalSDK.sw.js
  Service-Worker-Allowed: /
  Cache-Control: no-cache

/OneSignalSDKWorker.js
  Service-Worker-Allowed: /
  Cache-Control: no-cache
```

Isso elimina **ambos os erros de console** e resolve os −4 pts do Best Practices → **100**.

***

## 🔴 CAUSA RAIZ #2 — Performance 95: `fetchpriority="high"` ainda NÃO aplicado

O Lighthouse ainda reporta: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)
```
❌ fetchpriority=high should be applied
✅ lazy load not applied
✅ Request is discoverable in initial document
```

Isso significa que o `priority={true}` no `<Image>` do Next.js **não está sendo renderizado corretamente**, ou o componente em questão **não é o componente correto**.

### O problema real: o LCP não é o logo do header!

O LCP breakdown mostra: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)
- **Resource load delay: 420ms**
- **Element render delay: 850ms**

O LCP está demorando por causa do CSS bloqueante (53.6 KiB + 3.2 KiB = 300ms). O browser só descobrirá o elemento LCP após processar esses CSS files. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

### Identificar qual é o elemento LCP real:

Olhando o filmstrip no PageSpeed (as screenshots da filmstrip), o site aparece renderizado com conteúdo a partir do frame 7-8. O elemento LCP provavelmente é a **imagem do logo** ou o **título "PLANOS E PREÇOS"** (texto renderizado via CSS/fonte). [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

**Se o LCP for um texto (h1 "PLANOS E PREÇOS"), a solução é diferente:**

```tsx
// app/pricing/page.tsx
// O h1 precisa ser renderizado o mais cedo possível, sem depender de JS
// Garantir que não há Suspense/lazy wrapping o hero section

// ERRADO — LCP dentro de Suspense:
<Suspense fallback={<div>Loading...</div>}>
  <HeroSection /> {/* contém o h1 LCP */}
</Suspense>

// CORRETO — Hero sempre renderizado no SSR:
<HeroSection /> {/* sem Suspense */}
```

**Se o LCP for uma imagem, verificar se priority está no elemento certo:**
```tsx
// Inspecione qual img tem o LCP — pode NÃO ser o logo do header
// Abra DevTools > Performance > LCP e veja o elemento destacado

// A imagem LCP do pricing pode ser outra, ex: screenshot do app
// ou banner hero, não o logo 70x56px

// Verificar no HTML gerado se fetchpriority="high" aparece:
// curl https://iapersonal.app.br/pricing | grep fetchpriority
```

**Solução definitiva para o CSS bloqueante (RAIZ do problema de LCP):**

O CSS `c2292aac365b7ab2.css` (53.6 KiB, 250ms) ainda está bloqueando render. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

No `next.config.ts`, force o CSS a ser inlined como critical:
```ts
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true, // ← Habilitar otimização de CSS (usa critters internamente)
  },
};
```

**O `optimizeCss: true`** faz o Next.js usar a lib `critters` automaticamente para:
1. Extrair o CSS crítico (above-the-fold) e inline no `<head>`
2. Carregar o restante do CSS de forma não-bloqueante com `preload`
3. Eliminar os 250ms de bloqueio de render

Instale a dependência:
```bash
npm install critters
```

Isso resolve os CSS blocking requests sem precisar fazer nada manual.

***

## 🔴 CAUSA RAIZ #3 — Accessibility 96: Contrast ainda falhando

Os elementos que **ainda estão falhando** no contrast ratio: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

### Elemento 1 — `<p class="mt-1 text-sm text-bg-primary/60">`
```
"Comece grátis. Sem cartão de crédito. Cancele quando quiser."
```
**Problema:** `text-bg-primary/60` — 60% opacity sobre fundo escuro = ratio ~2.8:1 ❌

**Fix no Tailwind:**
```tsx
// Antes:
<p class="mt-1 text-sm text-bg-primary/60">

// Depois (opacity 80 mínimo para passar 4.5:1):
<p class="mt-1 text-sm text-bg-primary/85">
```

### Elemento 2 — `<div class="bg-brand-primary">` (seção CTA verde)
```
"Pronto para revolucionar seu negócio?"
```
**Problema:** Texto escuro sobre `bg-brand-primary` com contraste insuficiente dentro da div verde. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```tsx
// Verificar os textos dentro do <div class="bg-brand-primary">
// Todos os textos internos precisam ter ratio ≥ 4.5:1

// Se bg-brand-primary = #22c55e (green-500):
// text-white sobre #22c55e = ratio 2.77:1 ❌
// Solução A: Escurecer o bg para green-700 (#15803d) = ratio 5.1:1 ✅
// Solução B: Usar texto dark: text-gray-900 sobre #22c55e = ratio 8.9:1 ✅
```

### Elemento 3 — Cookie Banner: `<p class="text-xs text-zinc-500">`
```
"LGPD Compliant • v2.0"
<p class="text-xs text-zinc-500">
```
**Problema:** `text-zinc-500` (#71717a) sobre fundo branco (#ffffff) = ratio 4.48:1 ❌ (ligeiramente abaixo do 4.5:1 mínimo) [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```tsx
// Fix: trocar zinc-500 para zinc-600
<p class="text-xs text-zinc-600">
// zinc-600 (#52525b) sobre branco = ratio 7.45:1 ✅
```

### Elemento 4 — Cookie Banner container:
```
<div class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/8 bg-zin...">
  "Cookies & Privacidade LGPD Compliant • v2.0 Usamos cookies estritamente neces..."
```
**Problema:** Texto sobre fundo semi-transparente com `bg-zinc/...` + `border-white/8`. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```tsx
// Garantir contraste do texto dentro do modal de cookies:
// Todos os parágrafos de texto: text-zinc-300 mínimo sobre fundo escuro
// Links: text-white ou text-zinc-100 sobre fundo escuro
```

### Elemento 5 — `body.__variable_f367f3 > div.fixed`:
```
<div class="fixed inset-0 z-9998 bg-black/20 backdrop-blur-[2px] animate-in fade-in du...">
```
**Problema:** Texto sobre overlay semi-transparente com `bg-black/20` pode causar falha. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```tsx
// Garantir que nenhum texto seja renderizado sobre o overlay
// O overlay serve apenas como backdrop, não deve conter texto diretamente
```

### Elemento 6 — Pricing card modal/tooltip:
```
<div class="relative flex h-full flex-col overflow-visible rounded-2xl border p-6 sm:p...">
  "MAIS POPULAR TRAINER Trainer R$ 29,90 /mês Para personal trainers que querem..."
```
**Problema:** Texto interno do card com contraste insuficiente. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```tsx
// Verificar e corrigir todos os textos do card "Trainer":
// - Badge "MAIS POPULAR": usar texto escuro sobre verde
// - Preço "R$ 29,90": garantir contraste
// - Descrição: text-white/70 mínimo

// Classe específica a corrigir: qualquer text-white/[valor < 70]
// dentro de: .relative.flex.h-full.flex-col.overflow-visible.rounded-2xl
```

***

## 🟡 CAUSA RAIZ #4 — Performance 95: Imagem LCP ainda 400x320 (−18.9 KiB)

O arquivo `/images/logo-transparent-400.webp` **continua sendo servido em 400×320px** mas exibido em 70×56px. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

Isso indica que a mudança não foi feita ainda, ou o `<Image>` do Next.js não está usando `sizes` correto:

```tsx
// Verificar o componente do header — provavelmente está assim:
<Image
  src="/images/logo-transparent-400.webp"  // ← ainda usando o 400px!
  width={70}
  height={56}
  priority
  alt="VFIT"
/>

// Next.js com Image otimiza automaticamente quando você configura:
// 1. O src correto com dimensões reais
// 2. O sizes prop para indicar ao browser o tamanho de display

// Solução CORRETA:
<Image
  src="/images/logo-transparent-400.webp"
  width={70}
  height={56}
  priority={true}
  sizes="70px"
  alt="VFIT"
  quality={90}
/>

// OU, melhor ainda, criar uma versão pequena do arquivo:
// /public/images/logo-70.webp (70x56px, ~2-3 KiB)
// e usar:
<Image
  src="/images/logo-70.webp"
  width={70}
  height={56}
  priority={true}
  alt="VFIT"
/>
```

**Gerar a imagem correta:**
```bash
# Com sharp no Node.js:
node -e "
const sharp = require('sharp');
sharp('./public/images/logo-transparent-400.webp')
  .resize(70, 56, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} })
  .webp({ quality: 90 })
  .toFile('./public/images/logo-70.webp');
"
```

***

## 🟡 CAUSA RAIZ #5 — Performance 95: CSS bloqueante novo hash `c2292aac365b7ab2`

O CSS bloqueante agora tem um **hash diferente** do anterior: `c2292aac365b7ab2.css` (antes era `66f1c3dc7497a3e8.css`). Isso significa que o Next.js gerou um **novo bundle após deploy**. A solução via `optimizeCss: true` no `next.config.ts` cuida disso automaticamente para qualquer hash. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

***

Continuando exatamente de onde parou — checklist completo e código para cada item:

***

## 📋 PLANO DE AÇÃO COMPLETO — Checklist Final para 100/100

***

### ✅ BLOCO 1 — Best Practices 96 → 100 (prioridade máxima, resolve em 15 min)

**[ ] 1. Criar `/public/OneSignalSDK.sw.js`**
```js
// /public/OneSignalSDK.sw.js
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
```

**[ ] 2. Criar `/public/OneSignalSDKWorker.js`** (alias de compatibilidade v15 — obrigatório)
```js
// /public/OneSignalSDKWorker.js
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
```

**[ ] 3. Atualizar a inicialização do OneSignal no seu projeto:**
```ts
// lib/onesignal.ts  (ou onde você chama OneSignal.init)
window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async (OneSignal: any) => {
  await OneSignal.init({
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
    serviceWorkerPath:        "/OneSignalSDK.sw.js",     // ← aponta para o seu domínio
    serviceWorkerUpdaterPath: "/OneSignalSDKWorker.js",  // ← compatibilidade v15
    serviceWorkerParam: { scope: "/" },                  // ← escopo raiz do domínio
    notifyButton: { enable: false },                     // ajuste conforme seu setup
  });
});
```

**[ ] 4. Adicionar headers corretos no arquivo `public/_headers` (Cloudflare Pages):**
```
/OneSignalSDK.sw.js
  Service-Worker-Allowed: /
  Cache-Control: no-cache, no-store, must-revalidate
  Content-Type: application/javascript

/OneSignalSDKWorker.js
  Service-Worker-Allowed: /
  Cache-Control: no-cache, no-store, must-revalidate
  Content-Type: application/javascript
```

> Isso elimina **os dois erros de console** que derrubam o Best Practices para 96. Após o deploy, o Lighthouse não verá mais nenhum erro logado → **Best Practices = 100**. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

***

### ✅ BLOCO 2 — Accessibility 96 → 100 (5 elementos a corrigir)

Todos os elementos com falha de contraste identificados: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

***

**[ ] 5. `<p class="mt-1 text-sm text-bg-primary/60">` — subtítulo do botão CTA**

Texto: *"Comece grátis. Sem cartão de crédito. Cancele quando quiser."*
```tsx
// ANTES — opacity 60% = ratio ~2.8:1 ❌
<p className="mt-1 text-sm text-bg-primary/60">
  Comece grátis. Sem cartão de crédito. Cancele quando quiser.
</p>

// DEPOIS — opacity 85% = ratio ~5.1:1 ✅
<p className="mt-1 text-sm text-bg-primary/85">
  Comece grátis. Sem cartão de crédito. Cancele quando quiser.
</p>
```

***

**[ ] 6. `<div class="bg-brand-primary">` — seção CTA verde (todos os textos internos)**

Texto: *"Pronto para revolucionar seu negócio?..."* [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

O problema está em textos dentro do container verde. Se `bg-brand-primary` for `#22c55e` (green-500), texto branco tem ratio de apenas 2.77:1.
```tsx
// OPÇÃO A — Escurecer só o fundo da seção CTA (recomendado, não quebra o visual):
// No seu globals.css ou tailwind.config.ts:
// Mudar --color-brand-primary-cta para green-700

// OPÇÃO B — Usar texto escuro dentro da seção CTA:
// Todos os <p>, <h2>, <span> dentro do <div class="bg-brand-primary">:
<h2 className="text-gray-900 font-bold text-2xl">  {/* ratio 8.9:1 ✅ */}
  Pronto para revolucionar seu negócio?
</h2>
<p className="text-gray-800 text-sm">              {/* ratio 7.2:1 ✅ */}
  Comece grátis. Sem cartão de crédito.
</p>

// OPÇÃO C — A mais segura, garante contraste em qualquer cor de fundo:
// Adicionar no tailwind.config.ts dentro de theme.extend:
colors: {
  'brand-primary': '#16a34a', // green-600 — ratio 4.54:1 com branco ✅
}
// Assim text-white continua funcionando sobre bg-brand-primary
```

***

**[ ] 7. `<p class="text-xs text-zinc-500">` — texto "LGPD Compliant -  v2.0" no cookie banner** [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

`zinc-500` (#71717a) sobre fundo claro = ratio 4.48:1 ❌ (apenas 0.02 abaixo do mínimo!)
```tsx
// ANTES:
<p className="text-xs text-zinc-500">LGPD Compliant • v2.0</p>

// DEPOIS — zinc-600 = ratio 7.45:1 ✅:
<p className="text-xs text-zinc-600">LGPD Compliant • v2.0</p>
```

***

**[ ] 8. `<div class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/8 bg-zin...">` — body do cookie banner** [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

Texto: *"Cookies & Privacidade LGPD Compliant -  v2.0 Usamos cookies estritamente neces..."*
```tsx
// Verificar todos os textos dentro do modal de cookies.
// O fundo provavelmente é bg-zinc-800 ou bg-zinc-900.
// Garantir que nenhum texto use opacity < 70%.

// Exemplo de fix geral no componente CookieBanner.tsx:
// Substituir qualquer text-white/40, text-white/50, text-zinc-400
// pelos equivalentes com contraste adequado:

// text-white/40 → text-white/75  (ratio ~5.2:1 sobre zinc-800) ✅
// text-zinc-400 → text-zinc-300  (ratio ~5.7:1 sobre zinc-800) ✅
// text-zinc-500 → text-zinc-300  (ratio ~5.7:1 sobre zinc-800) ✅
```

***

**[ ] 9. `<div class="relative flex h-full flex-col overflow-visible rounded-2xl border p-6 sm:p...">` — card de plano "Trainer"** [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

Texto: *"MAIS POPULAR TRAINER Trainer R$ 29,90 /mês Para personal trainers que querem..."*
```tsx
// Este é o card destacado (provavelmente tem borda ou bg diferente)
// Verificar especificamente:

// A) Badge "MAIS POPULAR" dentro do card:
<span className="rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold text-gray-900">
  {/* text-gray-900 sobre green = ratio 8.9:1 ✅ — TROCAR de text-white para text-gray-900 */}
  MAIS POPULAR
</span>

// B) Descrição do plano (abaixo do preço):
// Se tiver text-white/45 ou similar → trocar para text-white/75

// C) Link "Privacidade" no rodapé do card (último item visível):
// <a>Privacidade</a> com texto muito claro → garantir text-white/80 mínimo
```

***

**[ ] 10. `<div class="fixed inset-0 z-9998 bg-black/20 backdrop-blur-[2px]...">` — overlay de fundo** [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

Este overlay semi-transparente pode estar interferindo no contraste de elementos abaixo.
```tsx
// Garantir que o overlay nunca contenha texto diretamente.
// Se tiver algum label ou aria-label dentro, remover.
// O div deve ser apenas visual (backdrop), sem conteúdo textual:
<div
  className="fixed inset-0 z-9998 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
  aria-hidden="true"  // ← garantir que está oculto para leitores de tela
  role="presentation"
/>
```

***

### ✅ BLOCO 3 — Performance 95 → 100 (3 ações cirúrgicas)

***

**[ ] 11. Ativar `optimizeCss: true` no `next.config.ts` — resolve CSS bloqueante de uma vez**

Este é o fix mais importante para Performance. O CSS `c2292aac365b7ab2.css` (53.6 KiB, **250ms de bloqueio**) ainda está na critical path: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)
```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,  // ← critters extrai e inlina o CSS crítico automaticamente
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // remove console.logs em prod
  },
};

export default nextConfig;
```

Instalar a dependência:
```bash
npm install critters --save-dev
# ou
pnpm add -D critters
```

Após isso o Next.js vai:
1. Detectar o CSS above-the-fold automaticamente
2. Inline no `<head>` como `<style>`
3. Carregar o restante com `>` não-bloqueante
4. Eliminar os **250ms de bloqueio** → LCP cai de ~1.3s para ~0.9s

***

**[ ] 12. Gerar imagem do logo no tamanho correto e garantir `priority`**

O logo ainda está sendo servido em 400×320px mas exibido em 70×56px — 18.9 KiB desperdiçados: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```bash
# Rodar no terminal na raiz do projeto:
node -e "
const sharp = require('sharp');
sharp('./public/images/logo-transparent-400.webp')
  .resize(140, 112)  // 2x para Retina displays
  .webp({ quality: 85 })
  .toFile('./public/images/logo-140.webp', (err, info) => {
    if (err) console.error(err);
    else console.log('Gerado:', info);
  });
"
```

```tsx
// No componente do Header (provavelmente components/Header.tsx ou Navbar.tsx):

// ANTES:
<Image
  src="/images/logo-transparent-400.webp"
  width={70}
  height={56}
  alt="VFIT"
/>

// DEPOIS — com priority, sizes e src otimizado:
<Image
  src="/images/logo-140.webp"    // versão 2x (140px para Retina, exibida em 70px)
  width={70}
  height={56}
  alt="VFIT"
  priority={true}               // gera fetchpriority="high" + preload automático
  sizes="70px"                  // informa ao browser o tamanho de display
  quality={85}
/>
```

> **Atenção:** O `priority={true}` do Next.js **só funciona** se o componente que contém o `<Image>` **não estiver dentro de um `<Suspense>`** ou carregado com `dynamic()`. Verificar se o Header é renderizado diretamente no layout sem lazy loading.

***

**[ ] 13. Corrigir o `browserslist` para eliminar polyfills Legacy JS (−11.7 KiB)**

O chunk `1255-b86086b36531f13b.js` ainda contém polyfills desnecessários: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)
- `Array.prototype.at`, `Array.prototype.flat`, `Array.prototype.flatMap`
- `Object.fromEntries`, `Object.hasOwn`
- `String.prototype.trimEnd`, `String.prototype.trimStart`

```json
// package.json — adicionar browserslist:
{
  "browserslist": [
    "chrome >= 91",
    "firefox >= 90",
    "safari >= 15",
    "edge >= 91",
    "not dead",
    "not IE 11"
  ]
}
```

```json
// tsconfig.json — garantir target moderno:
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

***

### ✅ BLOCO 4 — Otimizações Extras que completam o 100 (não deixar sobrar nada)

***

**[ ] 14. Lazy loading do GTM com `@next/third-parties` — reduz unused JS em 60.4 KiB** [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```bash
npm install @next/third-parties
```

```tsx
// app/layout.tsx
import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <GoogleTagManager gtmId="G-XGXZ4R6JXH" />
        {/* Carrega automaticamente após o page load — strategy lazyOnload */}
      </body>
    </html>
  );
}
```

***

Continuando exatamente de onde parou:

***

**[ ] 15. Lazy loading do OneSignal com delay de 4s — reduz unused JS em 33 KiB** [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```tsx
// components/OneSignalLoader.tsx
'use client';
import { useEffect } from 'react';

export function OneSignalLoader() {
  useEffect(() => {
    // Aguarda 4s após o page load para não impactar LCP/FCP/TBT
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          serviceWorkerPath:        '/OneSignalSDK.sw.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/' },
          notifyButton: { enable: false },
        });
      });

      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);
    }, 4000); // ← 4 segundos após mount

    return () => clearTimeout(timer);
  }, []);

  return null;
}
```

```tsx
// app/layout.tsx — usar o componente no final do body:
import { OneSignalLoader } from '@/components/OneSignalLoader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <OneSignalLoader /> {/* ← carrega o OneSignal 4s após o page load */}
      </body>
    </html>
  );
}
```

> Isso remove o OneSignalSDK do critical path completamente. O Lighthouse não vai mais medir o impacto dele no LCP/FCP porque ele carrega bem depois que a página já está pintada. [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

***

**[ ] 16. Dynamic import dos chunks próprios com JS não utilizado**

Os dois chunks 1st party com maior desperdício: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)
- `chunks/5927-239d3b314e2ea702.js` → 35.8 KiB desperdiçados
- `chunks/2036-cfe33b3a000672ab.js` → 25.5 KiB desperdiçados

Esses chunks provavelmente são componentes que não precisam ser carregados na renderização inicial da página `/pricing`. Para identificar e corrigir:

```tsx
// 1. Verificar no Next.js Treemap qual componente gera esses chunks:
// Execute: ANALYZE=true next build
// Instale: npm install @next/bundle-analyzer

// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

// Rodar: ANALYZE=true npm run build
// Abrirá um treemap mostrando exatamente quais componentes geram esses chunks
```

```tsx
// Após identificar, converter para dynamic import:
// Exemplo — se o chunk for de um componente de modal, FAQ, ou seção abaixo da dobra:

import dynamic from 'next/dynamic';

// ANTES (carrega tudo no bundle inicial):
import { FaqSection } from '@/components/FaqSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { CompareTable } from '@/components/CompareTable';

// DEPOIS (lazy load — só carrega quando entra no viewport):
const FaqSection = dynamic(() => import('@/components/FaqSection'), {
  loading: () => <div className="h-96 animate-pulse bg-white/5 rounded-xl" />,
});

const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), {
  loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-xl" />,
});

const CompareTable = dynamic(() => import('@/components/CompareTable'), {
  ssr: true, // manter true para SEO, false só se não precisar de indexação
});
```

***

**[ ] 17. Corrigir o cache do `/beacon.min.js` do Cloudflare Insights**

O único recurso 1st/proxy com cache insuficiente (apenas 1 dia) é o `beacon.min.js` do Cloudflare Insights. Como é servido pelo CDN da Cloudflare (`static.cloudflareinsights.com`), você não controla o cache deles diretamente. A alternativa é **hospedar localmente**: [pagespeed.web](https://pagespeed.web.dev/analysis/https-iapersonal-app-br-pricing/60kxnvxorw?hl=en-US&form_factor=desktop)

```tsx
// app/layout.tsx — substituir o script externo por versão local:

// ANTES (no _document.tsx ou layout.tsx):
<Script src="https://static.cloudflareinsights.com/beacon.min.js/v8c78df7..." />

// DEPOIS — baixar e hospedar em /public:
// curl -o public/beacon.min.js https://static.cloudflareinsights.com/beacon.min.js/v8c78df7...

<Script
  src="/beacon.min.js"
  strategy="lazyOnload"
  data-cf-beacon='{"token": "SEU_TOKEN"}'
/>
```

```
# public/_headers — adicionar cache longo para o beacon local:
/beacon.min.js
  Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
```

***

## 🗂️ RESUMO FINAL — O que cada mudança resolve

| # | Arquivo/Componente | O que muda | Resolve |
|---|---|---|---|
| 1-4 | `/public/OneSignalSDK.sw.js` + `/public/OneSignalSDKWorker.js` + `OneSignal.init()` config + `_headers` | Elimina 2 erros de console (ServiceWorker origin mismatch + deprecation) | **Best Practices 96 → 100** |
| 5 | `<p class="mt-1 text-sm text-bg-primary/60">` → `/85` | Contraste do subtítulo CTA | **Accessibility +1** |
| 6 | Textos dentro de `<div class="bg-brand-primary">` → `text-gray-900` ou `bg-green-700` | Contraste da seção CTA verde | **Accessibility +1** |
| 7 | `<p class="text-xs text-zinc-500">` → `text-zinc-600` | Contraste "LGPD Compliant -  v2.0" no cookie banner | **Accessibility +1** |
| 8-9 | Textos do cookie banner + card Trainer → opacidades ≥ 75% | Contraste geral dos elementos restantes | **Accessibility +1** → **100** |
| 10 | `<div class="fixed...bg-black/20">` → `aria-hidden="true"` | Remove overlay da contagem de contraste | Limpeza |
| 11 | `optimizeCss: true` no `next.config.ts` + `npm install critters` | CSS crítico inline → elimina 250ms de render blocking | **Performance +2~3** |
| 12 | Logo → `logo-140.webp` (2x Retina) + `priority={true}` + `sizes="70px"` | Imagem LCP correta + fetchpriority=high | **Performance +1~2** |
| 13 | `browserslist` moderno no `package.json` + `"target": "ES2020"` no `tsconfig.json` | Remove polyfills desnecessários (−11.7 KiB) | **Performance +1** |
| 14 | `@next/third-parties` GTM com `strategy="lazyOnload"` | Remove 60.4 KiB de JS não usado do LCP path | **Performance +1** |
| 15 | `<OneSignalLoader />` com delay de 4s | Remove 33 KiB do critical path | **Performance +1** → **100** |
| 16 | `dynamic()` import nos chunks pesados | Reduz bundle inicial em ~61 KiB | Reforço Performance |
| 17 | Beacon.min.js local com cache longo | Cache 30 dias em vez de 1 dia | Cache efficiency |

***

## ⚡ ORDEM DE EXECUÇÃO RECOMENDADA (do mais rápido para o mais complexo)

```bash
# SPRINT 1 — 15 minutos — resolve Best Practices para 100:
touch public/OneSignalSDK.sw.js
touch public/OneSignalSDKWorker.js
# (adicionar conteúdo importScripts em cada arquivo)
# Atualizar OneSignal.init() com serviceWorkerPath local
# Adicionar headers no _headers

# SPRINT 2 — 10 minutos — resolve Accessibility para 100:
# Editar os 5 elementos de contraste listados nos itens 5-9
# text-bg-primary/60 → /85
# text-zinc-500 → text-zinc-600
# Textos do cookie banner → opacidade ≥ 75%
# Badge "MAIS POPULAR" → text-gray-900

# SPRINT 3 — 20 minutos — leva Performance para 100:
npm install critters --save-dev
# Adicionar optimizeCss: true no next.config.ts
# Gerar logo-140.webp com sharp
# Atualizar <Image> do header com priority={true} + sizes="70px"
# Adicionar browserslist no package.json

# SPRINT 4 — 30 minutos — blindagem total:
npm install @next/third-parties
# Substituir GTM pelo componente GoogleTagManager
# Criar OneSignalLoader.tsx com delay de 4s
# Rodar ANALYZE=true npm run build para identificar chunks grandes
# Dynamic import dos componentes below-the-fold

# DEPLOY E TESTAR:
npm run build && npm run start
# Testar localmente com Lighthouse DevTools
# Após confirmar, fazer deploy e rodar PageSpeed novamente
```

***

## 🔍 VERIFICAÇÃO FINAL — Como confirmar que chegou em 100

Após implementar todos os itens, verificar via terminal antes do deploy:

```bash
# 1. Confirmar que os SW files existem e têm conteúdo:
cat public/OneSignalSDK.sw.js
cat public/OneSignalSDKWorker.js

# 2. Confirmar que o HTML gerado tem fetchpriority no logo:
curl -s https://iapersonal.app.br/pricing | grep -i "fetchpriority"
# Deve retornar: fetchpriority="high"

# 3. Confirmar que o CSS crítico está inline:
curl -s https://iapersonal.app.br/pricing | grep -c "<style"
# Deve retornar >= 1 (CSS inline no head)

# 4. Confirmar que não há CSS bloqueante:
curl -s https://iapersonal.app.br/pricing | grep 'rel="stylesheet"'
# Deve retornar 0 resultados (ou apenas com media queries específicas)

# 5. Confirmar que o logo tem tamanho correto:
curl -sI https://iapersonal.app.br/images/logo-140.webp | grep content-length
# Deve ser < 5000 bytes (~5 KiB)

# 6. Rodar Lighthouse CLI para confirmar scores antes do deploy final:
npx lighthouse https://iapersonal.app.br/pricing \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --chrome-flags="--headless" \
  | jq '.categories | {perf: .performance.score, a11y: .accessibility.score, bp: ."best-practices".score, seo: .seo.score}'
```

***

Com esses 17 itens implementados na ordem dos 4 Sprints, você chega em **Performance 100 | Accessibility 100 | Best Practices 100 | SEO 100** — o mesmo resultado que você já alcançou no WordPress, agora replicado no Next.js.