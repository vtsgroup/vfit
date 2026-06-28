// ============================================
// CF Pages Advanced Mode Worker
// Serves static assets + SPA rewrites + dynamic routes
//
// IMPORTANT: env.ASSETS.fetch() has "clean URL" behavior — requesting
// /path/file.html returns 308 → /path/file (without .html).
// Therefore ALL rewrite targets must use clean URLs (no .html extension).
// env.ASSETS.fetch('/avaliacoes/_') → finds _.html → returns 200.
// ============================================

// Dynamic route rewrites — map URL patterns to static stub files
// These rewrites serve the [id] stub page (_) for any slug,
// allowing Next.js useParams() to read the real ID from the URL.
// NOTE: No .html extension! CF Pages clean URLs resolve automatically.
const DYNAMIC_REWRITES = [
  // Static named routes MUST come before dynamic :id patterns
  { match: '/avaliacoes/nova', serve: '/avaliacoes/nova' },
  { match: '/treinos/novo', serve: '/treinos/novo' },
  // Dynamic [id] routes
  { prefix: '/treinos/', serve: '/treinos/_' },
  { prefix: '/exercicios/', serve: '/exercicios/_' },
  { prefix: '/avaliacoes/', serve: '/avaliacoes/_' },
  { prefix: '/progresso/exercicio/', serve: '/progresso/exercicio/_' },
  // Dashboard dynamic routes
  { prefix: '/dashboard/students/', suffix: '/view', serve: '/dashboard/students/view' },
  { prefix: '/dashboard/students/', suffix: '/edit', serve: '/dashboard/students/edit' },
  { prefix: '/dashboard/students/', suffix: '/import', serve: '/dashboard/students/import' },
  { prefix: '/dashboard/students/', suffix: '/assessment/new', serve: '/dashboard/students/assessment/new' },
  { prefix: '/dashboard/workouts/', suffix: '/view', serve: '/dashboard/workouts/view' },
  { prefix: '/dashboard/workouts/', suffix: '/create', serve: '/dashboard/workouts/create' },
  { prefix: '/dashboard/workouts/', suffix: '/execute', serve: '/dashboard/workouts/execute' },
  { prefix: '/dashboard/workouts/', suffix: '/exercises/create', serve: '/dashboard/workouts/exercises/create' },
  { prefix: '/dashboard/workouts/', suffix: '/exercises/library', serve: '/dashboard/workouts/exercises/library' },
  { prefix: '/dashboard/workouts/', suffix: '/media/library', serve: '/dashboard/workouts/media/library' },
];

// Simple file rewrites (non-dynamic)
const SIMPLE_REWRITES = {
  '/manifest.webmanifest': '/manifest.json',
  '/OneSignalSDK.sw.js': '/OneSignalSDKWorker.js',
};

// Simple 301 redirects
const PERMANENT_REDIRECTS = {
  '/default-icon': '/icons/icon-192.png',

  // ── Blog short links (/r/{shortId} → 301 → /blog/{slug}) ──
  // Usados pelo botão "Compartilhar" dos artigos. São APENAS redirects:
  // a canônica indexável continua sendo /blog/{slug}, /r/* está em
  // Disallow no robots.txt e o 301 consolida sinais no destino.
  // Manter em sincronia com `shortId` em src/data/blog-posts.ts.
  '/r/ia-gratis': '/blog/app-treino-ia-gratis-iniciantes',
  '/r/ia-treinos': '/blog/ia-montar-treinos-personalizados-personal',
  '/r/apps-pt': '/blog/melhores-apps-personal-trainer-2026',
  '/r/nutri-pt': '/blog/nutricionista-personal-trainer-trabalho-conjunto',
  '/r/ia-pt': '/blog/ia-personal-trainer',
  '/r/retencao': '/blog/retencao-alunos-personal',
  '/r/cobranca': '/blog/cobranca-automatica-personal',
};

function isAssetRequest(pathname) {
  return pathname.startsWith('/_next/static/') || /\.[a-z0-9]{2,8}$/i.test(pathname);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let { pathname } = url;

    // Legacy domain canonical redirect (host-level)
    // iapersonal.app.br/* -> vfit.app.br/* (preserve path + query)
    if (url.hostname === 'iapersonal.app.br' || url.hostname === 'www.iapersonal.app.br') {
      const redirectUrl = new URL(request.url);
      redirectUrl.protocol = 'https:';
      redirectUrl.hostname = 'vfit.app.br';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // Remove trailing slash (except root) — emit real HTTP 308 redirect
    // so CF Pages doesn't loop between file/directory resolution
    if (pathname.length > 1 && pathname.endsWith('/')) {
      const cleanUrl = new URL(request.url);
      cleanUrl.pathname = pathname.slice(0, -1);
      return Response.redirect(cleanUrl.toString(), 308);
    }

    // 1. Permanent redirects (301)
    if (PERMANENT_REDIRECTS[pathname]) {
      const redirectUrl = new URL(PERMANENT_REDIRECTS[pathname], request.url);
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // 2. Simple rewrites (serve different file, same URL)
    if (SIMPLE_REWRITES[pathname]) {
      const rewriteUrl = new URL(SIMPLE_REWRITES[pathname], request.url);
      return env.ASSETS.fetch(new Request(rewriteUrl, request));
    }

    // 3. Dynamic route rewrites
    for (const rule of DYNAMIC_REWRITES) {
      // Exact match (static named routes like /avaliacoes/nova)
      if (rule.match && pathname === rule.match) {
        const rewriteUrl = new URL(rule.serve, request.url);
        return env.ASSETS.fetch(new Request(rewriteUrl, request));
      }
      // Prefix + suffix match (dashboard routes like /dashboard/students/:id/view)
      if (rule.prefix && rule.suffix) {
        if (pathname.startsWith(rule.prefix) && pathname.endsWith(rule.suffix)) {
          const middle = pathname.slice(rule.prefix.length, pathname.length - rule.suffix.length);
          if (middle && !middle.includes('/')) {
            const rewriteUrl = new URL(rule.serve, request.url);
            return env.ASSETS.fetch(new Request(rewriteUrl, request));
          }
        }
        continue;
      }
      // Prefix-only match (simple dynamic routes like /treinos/:id)
      if (rule.prefix && !rule.suffix && !rule.match) {
        if (pathname.startsWith(rule.prefix)) {
          const rest = pathname.slice(rule.prefix.length);
          // Only match single segment (no nested slashes)
          if (rest && !rest.includes('/')) {
            const rewriteUrl = new URL(rule.serve, request.url);
            return env.ASSETS.fetch(new Request(rewriteUrl, request));
          }
        }
      }
    }

    // 4. Try serving the static asset directly
    // Original request URL is already a clean URL (no .html), so
    // env.ASSETS.fetch should return 200 or 404, not 308.
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
    } catch {
      // Asset not found, fall through to SPA fallback
    }

    // Missing hashed assets must stay 404. Serving index HTML for an old JS/CSS
    // chunk makes browsers reject it as "text/html" and can break the app shell.
    if (isAssetRequest(pathname)) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 5. SPA fallback — serve index.html for client-side routing
    // Use clean URL '/' (not '/index.html') to avoid 308 clean URL redirect
    const indexUrl = new URL('/', request.url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
