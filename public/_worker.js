// ============================================
// CF Pages Advanced Mode Worker
// Serves static assets + SPA rewrites + dynamic routes
//
// In Advanced Mode, _redirects is NOT processed by CF Pages.
// This worker handles all routing: static files, dynamic [id]
// rewrites, and SPA fallback.
// ============================================

// Dynamic route rewrites — map URL patterns to static stub files
// These rewrites serve the [id] stub page (_.html) for any slug,
// allowing Next.js useParams() to read the real ID from the URL.
const DYNAMIC_REWRITES = [
  // Static named routes MUST come before dynamic :id patterns
  { match: '/avaliacoes/nova', serve: '/avaliacoes/nova.html' },
  { match: '/treinos/novo', serve: '/treinos/novo.html' },
  // Dynamic [id] routes
  { prefix: '/treinos/', serve: '/treinos/_.html' },
  { prefix: '/exercicios/', serve: '/exercicios/_.html' },
  { prefix: '/avaliacoes/', serve: '/avaliacoes/_.html' },
  { prefix: '/progresso/exercicio/', serve: '/progresso/exercicio/_.html' },
  // Dashboard dynamic routes
  { prefix: '/dashboard/students/', suffix: '/view', serve: '/dashboard/students/view.html' },
  { prefix: '/dashboard/students/', suffix: '/edit', serve: '/dashboard/students/edit.html' },
  { prefix: '/dashboard/students/', suffix: '/import', serve: '/dashboard/students/import.html' },
  { prefix: '/dashboard/students/', suffix: '/assessment/new', serve: '/dashboard/students/assessment/new.html' },
  { prefix: '/dashboard/workouts/', suffix: '/view', serve: '/dashboard/workouts/view.html' },
  { prefix: '/dashboard/workouts/', suffix: '/create', serve: '/dashboard/workouts/create.html' },
  { prefix: '/dashboard/workouts/', suffix: '/execute', serve: '/dashboard/workouts/execute.html' },
  { prefix: '/dashboard/workouts/', suffix: '/exercises/create', serve: '/dashboard/workouts/exercises/create.html' },
  { prefix: '/dashboard/workouts/', suffix: '/exercises/library', serve: '/dashboard/workouts/exercises/library.html' },
  { prefix: '/dashboard/workouts/', suffix: '/media/library', serve: '/dashboard/workouts/media/library.html' },
];

// Simple file rewrites (non-dynamic)
const SIMPLE_REWRITES = {
  '/manifest.webmanifest': '/manifest.json',
  '/OneSignalSDK.sw.js': '/OneSignalSDKWorker.js',
};

// Simple 301 redirects
const PERMANENT_REDIRECTS = {
  '/default-icon': '/icons/icon-192.png',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let { pathname } = url;

    // Remove trailing slash (except root)
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
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
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
    } catch {
      // Asset not found, fall through to SPA fallback
    }

    // 5. SPA fallback — serve index.html for client-side routing
    const indexUrl = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
