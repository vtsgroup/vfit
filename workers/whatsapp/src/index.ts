// ============================================
// index.ts — WhatsApp Gateway Worker (Unipile)
// ============================================
//
// O que faz:
//   Worker Cloudflare independente para integração com WhatsApp via Unipile.
//   Expõe endpoints de saúde, listagem de chats, envio de mensagem e notificação de task.
//   Autenticação via header X-Gateway-Secret comparado com Secrets Store.
//
// Exports principais:
//   default fetch handler — Hono app com 4 rotas
//
// Endpoints:
//   GET  /health — healthcheck
//   GET  /chats?q=&account_id= — lista chats Unipile
//   POST /send { text, chat_id?, group_name?, account_id? } — envia mensagem
//   POST /task-notify — notifica início/fim de task (start/end)
interface SecretsStoreBinding {
  get(): Promise<string>;
}

interface Env {
  // Vars
  UNIPILE_API_URL?: string;
  DEFAULT_GROUP_NAME?: string;
  UNIPILE_WHATSAPP_ACCOUNT_ID?: string;
  UNIPILE_WHATSAPP_GROUP_CHAT_ID?: string;
  UNIPILE_WHATSAPP_GROUP_NAME?: string;
  ALLOW_FALLBACK_TOKEN?: string;
  // Stable self-heal anchors (low-sensitivity identifiers → wrangler [vars])
  UNIPILE_WHATSAPP_ACCOUNT_PHONE?: string;
  UNIPILE_WHATSAPP_GROUP_PROVIDER_ID?: string;
  SELF_HEAL_ENABLED?: string;

  // Secrets (classic)
  UNIPILE_API_KEY?: string;
  ADMIN_AUTH_TOKEN?: string;
  AUTH_TOKEN?: string;
  CRON_SECRET?: string;

  // Secrets Store (optional)
  SS_UNIPILE_API_KEY?: SecretsStoreBinding;
  SS_ADMIN_AUTH_TOKEN?: SecretsStoreBinding;
  SS_AUTH_TOKEN?: SecretsStoreBinding;
  SS_CRON_SECRET?: SecretsStoreBinding;
  SS_UNIPILE_WHATSAPP_ACCOUNT_ID?: SecretsStoreBinding;
  SS_UNIPILE_WHATSAPP_GROUP_CHAT_ID?: SecretsStoreBinding;
  SS_UNIPILE_WHATSAPP_GROUP_NAME?: SecretsStoreBinding;
}

type Json = Record<string, unknown>;

const WORKER_NAME = 'vfit-whatsapp';
const WORKER_VERSION = '1.1.0';

function normalizeSecret(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed.length ? trimmed : null;
}

async function getSecretsStoreSecret(binding: unknown): Promise<string | null> {
  try {
    if (!binding || typeof binding !== 'object') return null;
    const get = (binding as { get?: unknown }).get;
    if (typeof get !== 'function') return null;
    const val = await (binding as { get: () => Promise<unknown> }).get();
    return normalizeSecret(val);
  } catch {
    return null;
  }
}

async function resolveEnvSecrets(env: Env): Promise<Env> {
  const resolved: Env = { ...env };

  resolved.UNIPILE_API_KEY =
    (await getSecretsStoreSecret(env.SS_UNIPILE_API_KEY))
    || normalizeSecret(env.UNIPILE_API_KEY)
    || '';

  resolved.ADMIN_AUTH_TOKEN =
    (await getSecretsStoreSecret(env.SS_ADMIN_AUTH_TOKEN))
    || normalizeSecret(env.ADMIN_AUTH_TOKEN)
    || '';

  resolved.AUTH_TOKEN =
    (await getSecretsStoreSecret(env.SS_AUTH_TOKEN))
    || normalizeSecret(env.AUTH_TOKEN)
    || '';

  resolved.CRON_SECRET =
    (await getSecretsStoreSecret(env.SS_CRON_SECRET))
    || normalizeSecret(env.CRON_SECRET)
    || '';

  resolved.UNIPILE_WHATSAPP_ACCOUNT_ID =
    (await getSecretsStoreSecret(env.SS_UNIPILE_WHATSAPP_ACCOUNT_ID))
    || normalizeSecret(env.UNIPILE_WHATSAPP_ACCOUNT_ID)
    || resolved.UNIPILE_WHATSAPP_ACCOUNT_ID;

  resolved.UNIPILE_WHATSAPP_GROUP_CHAT_ID =
    (await getSecretsStoreSecret(env.SS_UNIPILE_WHATSAPP_GROUP_CHAT_ID))
    || normalizeSecret(env.UNIPILE_WHATSAPP_GROUP_CHAT_ID)
    || resolved.UNIPILE_WHATSAPP_GROUP_CHAT_ID;

  resolved.UNIPILE_WHATSAPP_GROUP_NAME =
    (await getSecretsStoreSecret(env.SS_UNIPILE_WHATSAPP_GROUP_NAME))
    || normalizeSecret(env.UNIPILE_WHATSAPP_GROUP_NAME)
    || resolved.UNIPILE_WHATSAPP_GROUP_NAME;

  return resolved;
}

function json(data: Json, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(JSON.stringify(data, null, 2), { ...init, headers });
}

function withCorsHeaders(headers: Headers): Headers {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}


function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const [kind, token] = auth.split(' ');
  if (kind?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

function allowFallbackToken(env: Env): boolean {
  const raw = (env.ALLOW_FALLBACK_TOKEN || '').trim().toLowerCase();
  // Segurança: default = false. Só habilitar explicitamente.
  if (!raw) return false;
  return raw !== '0' && raw !== 'false' && raw !== 'no';
}

function isAuthorizedToken(incoming: string, env: Env): boolean {
  const allowed = [
    env.ADMIN_AUTH_TOKEN,
    env.CRON_SECRET,
    env.AUTH_TOKEN,
  ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0).map(v => v.trim());

  // Compat: token legado usado por automações internas.
  if (allowFallbackToken(env)) {
    allowed.push('offshore-proz-cron-2024');
  }

  return allowed.includes(incoming);
}

async function requireAuthOr401(request: Request, env: Env): Promise<Response | null> {
  const incoming = getBearerToken(request);
  if (!incoming) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAuthorizedToken(incoming, env)) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function getUnipileApiUrl(env: Env): string {
  return (env.UNIPILE_API_URL || 'https://api1.unipile.com:13123/api/v1').replace(/\/$/, '');
}

function getDefaultGroupName(env: Env): string {
  return (env.DEFAULT_GROUP_NAME || env.UNIPILE_WHATSAPP_GROUP_NAME || 'VFIT').trim();
}

async function unipileFetch(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  if (!env.UNIPILE_API_KEY) {
    return json({ success: false, error: 'UNIPILE_API_KEY não configurado' }, { status: 500 });
  }

  const url = `${getUnipileApiUrl(env)}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(init.headers);
  headers.set('X-API-KEY', env.UNIPILE_API_KEY);
  headers.set('accept', 'application/json');
  if (init.body && !headers.get('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, { ...init, headers });
}

async function listChats(env: Env, accountId: string): Promise<Array<{ id: string; name: string }>> {
  const res = await unipileFetch(env, `/chats?account_id=${encodeURIComponent(accountId)}&limit=100`);
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`Unipile chats ${res.status}: ${text.slice(0, 240)}`);
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  const items: Array<{ id?: string; name?: string }> = Array.isArray(parsed)
    ? parsed
    : (parsed && typeof parsed === 'object' && Array.isArray((parsed as { items?: unknown[] }).items))
      ? (parsed as { items?: unknown[] }).items as Array<{ id?: string; name?: string }>
      : [];

  return items
    .map((c) => ({ id: String(c?.id || ''), name: String(c?.name || '') }))
    .filter((c) => c.id && c.name);
}

/* ================================================================
   SELF-HEALING RESOLUTION — resilient to Unipile id rotation / reconnects
   ----------------------------------------------------------------
   Unipile chat_id & account_id are CONNECTION-SCOPED: they rotate when the
   WhatsApp account is reconnected or Unipile re-syncs. The only STABLE anchors
   are the account PHONE and the group provider_id (WhatsApp JID). We treat the
   stored chat_id as a fast-path cache; on a 404 ("Chat not found", verified
   against the live API) we re-resolve ONCE from the stable anchors and retry —
   never sending to the wrong group/account. No Secrets Store write-back (the
   binding is read-only and a write token would widen the blast radius); pure
   runtime re-resolution + a per-isolate warm cache instead.
   ================================================================ */

const MAX_CHAT_PAGES = 5;                 // GET /chats?limit=100 → scan up to 500 chats
const HEAL_CACHE_TTL_MS = 30 * 60 * 1000; // warm cache TTL (per-isolate, non-durable)

type ResolvedTarget = { accountId: string; chatId: string };
const warmTargetCache = new Map<string, { value: ResolvedTarget; at: number }>(); // key = providerId
const inflightResolve = new Map<string, Promise<ResolvedTarget>>();                // single-flight, key = providerId

function digitsOnly(s: string): string { return (s || '').replace(/\D/g, ''); }

function isSelfHealEnabled(env: Env): boolean {
  const raw = (env.SELF_HEAL_ENABLED ?? '1').trim().toLowerCase();
  return raw !== '0' && raw !== 'false' && raw !== 'no' && raw !== 'off';
}

// POST a message WITHOUT throwing — returns the HTTP status so the caller can classify.
async function postMessage(env: Env, chatId: string, text: string): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await unipileFetch(env, `/chats/${encodeURIComponent(chatId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  const body = await res.text().catch(() => '');
  return { ok: res.ok, status: res.status, body };
}

// 404 ("Chat not found") is the authoritative stale-chat signal (verified live).
// 401/403 (bad key) and 429/5xx (transient/outage) are NON-healable.
function isStaleChatStatus(status: number, body: string): boolean {
  if (status === 404) return true;
  if (status === 400 || status === 422) {
    return /chat.*(not found|does not exist|unknown)|resource_not_found/i.test(body || '');
  }
  return false;
}

// Resolve the live account id by EXACT phone match among WHATSAPP accounts.
// HARD invariant: exactly one match, else abort — never auto-pick "first WHATSAPP account".
async function resolveAccountIdByPhone(env: Env, phone: string): Promise<string> {
  const res = await unipileFetch(env, `/accounts?limit=100`);
  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`Unipile accounts ${res.status}: ${text.slice(0, 180)}`);
  let parsed: unknown = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  const items: Array<Record<string, unknown>> = Array.isArray(parsed)
    ? parsed as Array<Record<string, unknown>>
    : (parsed && typeof parsed === 'object' && Array.isArray((parsed as { items?: unknown[] }).items))
      ? (parsed as { items: Array<Record<string, unknown>> }).items
      : [];
  const want = digitsOnly(phone);
  const matches = items.filter((a) =>
    String(a?.type || '').toUpperCase() === 'WHATSAPP' && digitsOnly(String(a?.name || '')) === want
  );
  if (matches.length !== 1) {
    throw new Error(`account_resolve_failed: ${matches.length} WHATSAPP account(s) match phone ${want} (need exactly 1)`);
  }
  return String(matches[0].id);
}

// Resolve the live chat id by EXACT provider_id (WhatsApp group JID) — paginated.
// provider_id is the SOLE authority (group names are not unique → no name fallback).
async function resolveChatIdByProviderId(env: Env, accountId: string, providerId: string): Promise<string | null> {
  let cursor = '';
  for (let page = 0; page < MAX_CHAT_PAGES; page++) {
    const qs = `account_id=${encodeURIComponent(accountId)}&limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await unipileFetch(env, `/chats?${qs}`);
    const text = await res.text().catch(() => '');
    if (!res.ok) throw new Error(`Unipile chats ${res.status}: ${text.slice(0, 180)}`);
    let parsed: { items?: Array<Record<string, unknown>>; cursor?: string } = {};
    try { parsed = JSON.parse(text); } catch { parsed = {}; }
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const hit = items.find((c) => String(c?.provider_id || '') === providerId);
    if (hit) return String(hit.id);
    cursor = parsed.cursor ? String(parsed.cursor) : '';
    if (!cursor) {
      if (items.length === 100) console.warn('whatsapp.resolve: full page with no cursor — pagination may be capped');
      break;
    }
  }
  return null;
}

// Single-flight re-resolution from stable anchors, with a short warm cache.
async function resolveTargetFromAnchors(env: Env, phone: string, providerId: string): Promise<ResolvedTarget> {
  const cached = warmTargetCache.get(providerId);
  if (cached && Date.now() - cached.at < HEAL_CACHE_TTL_MS) return cached.value;

  const existing = inflightResolve.get(providerId);
  if (existing) return existing;

  const p = (async (): Promise<ResolvedTarget> => {
    const accountId = await resolveAccountIdByPhone(env, phone);
    const chatId = await resolveChatIdByProviderId(env, accountId, providerId);
    if (!chatId) throw new Error(`chat_resolve_failed: provider_id ${providerId} not found on account ${accountId}`);
    const value: ResolvedTarget = { accountId, chatId };
    warmTargetCache.set(providerId, { value, at: Date.now() });
    return value;
  })();
  inflightResolve.set(providerId, p);
  try { return await p; } finally { inflightResolve.delete(providerId); }
}

type ResilientSendOpts = { explicitChatId?: string; accountIdOverride?: string; groupNameOverride?: string; text: string };
type ResilientSendResult = { chat_id: string; account_id?: string; raw: string; healed: boolean; resolved_via: string };

// Single entry point for /send and /task-notify. Fast path = stored/explicit chat_id;
// on a stale 404 it self-heals from the stable anchors (DEFAULT group only).
async function resilientSend(env: Env, opts: ResilientSendOpts): Promise<ResilientSendResult> {
  const text = opts.text;
  const phone = (env.UNIPILE_WHATSAPP_ACCOUNT_PHONE || '').trim();
  const providerId = (env.UNIPILE_WHATSAPP_GROUP_PROVIDER_ID || '').trim();
  const explicitChatId = (opts.explicitChatId || '').trim();
  const accountOverride = (opts.accountIdOverride || '').trim();

  // Does this request target the worker's configured/default group?
  const defaultName = getDefaultGroupName(env).trim().toLowerCase();
  const ssGroupName = (env.UNIPILE_WHATSAPP_GROUP_NAME || '').trim().toLowerCase();
  const reqGroup = (opts.groupNameOverride || '').trim().toLowerCase();
  const targetsDefaultGroup = !explicitChatId && !accountOverride && (
    !reqGroup || reqGroup === defaultName || (!!ssGroupName && reqGroup === ssGroupName)
  );

  // Heal is ONLY safe for the default group, via its provider_id anchor.
  const healEligible = isSelfHealEnabled(env) && targetsDefaultGroup && !!phone && !!providerId;

  // ---- FAST PATH ----
  const warm = (targetsDefaultGroup && providerId) ? warmTargetCache.get(providerId) : undefined;
  const warmFresh = warm && Date.now() - warm.at < HEAL_CACHE_TTL_MS ? warm.value : undefined;
  const chatId = explicitChatId || warmFresh?.chatId || (env.UNIPILE_WHATSAPP_GROUP_CHAT_ID || '').trim();

  if (chatId) {
    const r = await postMessage(env, chatId, text);
    if (r.ok) {
      // Cache ONLY a default-group send resolved from our own anchors/env — never an arbitrary explicit chat_id.
      if (targetsDefaultGroup && providerId && !explicitChatId) {
        const accountId = warmFresh?.accountId || (env.UNIPILE_WHATSAPP_ACCOUNT_ID || '').trim();
        if (accountId) warmTargetCache.set(providerId, { value: { accountId, chatId }, at: Date.now() });
      }
      return { chat_id: chatId, raw: r.body, healed: false, resolved_via: 'stored' };
    }
    if (!isStaleChatStatus(r.status, r.body)) {
      throw new Error(`Unipile send ${r.status}: ${r.body.slice(0, 200)}`);
    }
    if (!healEligible) {
      // Explicit chat_id / account override / non-default group / heal disabled → NEVER retarget.
      throw new Error(`Unipile send ${r.status} (stale id; self-heal não elegível — alvo explícito ou grupo não-default): ${r.body.slice(0, 150)}`);
    }
    // ---- HEAL (single attempt) ----
    const target = await resolveTargetFromAnchors(env, phone, providerId);
    if (target.chatId === chatId) {
      throw new Error(`Unipile send ${r.status} mas re-resolução retornou o mesmo chat id (não estava obsoleto): ${r.body.slice(0, 150)}`);
    }
    const r2 = await postMessage(env, target.chatId, text);
    if (!r2.ok) throw new Error(`Unipile send (healed) ${r2.status}: ${r2.body.slice(0, 200)}`);
    console.log(JSON.stringify({ evt: 'whatsapp.self_heal', old_chat_id: chatId, new_chat_id: target.chatId, account_id: target.accountId, provider_id: providerId }));
    return { chat_id: target.chatId, account_id: target.accountId, raw: r2.body, healed: true, resolved_via: 'provider_id' };
  }

  // ---- NO chat id configured → resolve from anchors (default group only) ----
  if (!healEligible) {
    throw new Error('Sem chat_id configurado e self-heal indisponível (faltam anchors UNIPILE_WHATSAPP_ACCOUNT_PHONE / UNIPILE_WHATSAPP_GROUP_PROVIDER_ID, ou alvo não-default).');
  }
  const target = await resolveTargetFromAnchors(env, phone, providerId);
  const r3 = await postMessage(env, target.chatId, text);
  if (!r3.ok) throw new Error(`Unipile send (resolved) ${r3.status}: ${r3.body.slice(0, 200)}`);
  console.log(JSON.stringify({ evt: 'whatsapp.resolved_cold', new_chat_id: target.chatId, account_id: target.accountId, provider_id: providerId }));
  return { chat_id: target.chatId, account_id: target.accountId, raw: r3.body, healed: true, resolved_via: 'provider_id' };
}

function formatBrt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0m';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m${String(seconds).padStart(2, '0')}s`;
  return `${seconds}s`;
}

function buildStartMessage(params: {
  title: string;
  taskId: string;
  startedAtIso: string;
  actorLabel: string;
  priority?: string;
  action?: string;
  details?: string;
  linkUrl?: string;
}): string {
  const headline = `⏱️ Iniciando etapa: ${params.title}${params.priority ? ` (${params.priority})` : ''}.`;
  const actionBlock = params.action ? [`Por que agora: ${params.action.trim()}`] : [];
  const detailsBlock = params.details ? [`Resultado esperado: ${params.details.trim()}`] : [];
  const linkBlock = params.linkUrl ? [params.linkUrl.trim()] : [];

  return [
    `[🤖 ${params.actorLabel}]`,
    '',
    headline,
    ...(actionBlock.length ? ['', ...actionBlock] : []),
    ...(detailsBlock.length ? ['', ...detailsBlock] : []),
    ...(linkBlock.length ? ['', `Ver: ${linkBlock[0]}`] : []),
    '',
    `ID: ${params.taskId}`,
    `Início (BRT): ${formatBrt(params.startedAtIso)}`,
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildEndMessage(params: {
  title: string;
  taskId: string;
  startedAtIso?: string;
  endedAtIso: string;
  actorLabel: string;
  priority?: string;
  summary?: string[];
  deployVersion?: string;
  status?: 'success' | 'failed';
  linkUrl?: string;
}): string {
  const startedMs = params.startedAtIso ? new Date(params.startedAtIso).getTime() : NaN;
  const endedMs = new Date(params.endedAtIso).getTime();
  const durationMs = Number.isFinite(startedMs) && Number.isFinite(endedMs) ? endedMs - startedMs : NaN;
  const status = params.status || 'success';

  const defaultSummary = [
    status === 'success'
      ? `Resultado direto: ${params.title} concluído com sucesso.`
      : `Resultado direto: ${params.title} finalizado com pendências.`,
    'Motivo: garantir continuidade operacional com rastreabilidade no grupo.',
    'Vantagem prática: decisão rápida com contexto de início, fim e duração.',
  ];

  const summaryLines = params.summary?.length ? params.summary : defaultSummary;
  const spacedSummary = summaryLines.length
    ? summaryLines.flatMap((line, idx) => (idx === 0 ? [line] : ['', line]))
    : [];

  const statusLine = status === 'success' ? '✅ Finalizado' : '❌ Encerrado com falha';
  const deployBlock = params.deployVersion ? ['', `Deploy: ${params.deployVersion}.`] : [];
  const linkBlock = params.linkUrl ? ['', `Ver: ${params.linkUrl.trim()}`] : [];

  return [
    `[🤖 ${params.actorLabel}]`,
    '',
    `${statusLine}: ${params.title}${params.priority ? ` (${params.priority})` : ''}.`,
    '',
    ...spacedSummary,
    ...deployBlock,
    ...linkBlock,
    '',
    `ID: ${params.taskId}`,
    params.startedAtIso ? `Início (BRT): ${formatBrt(params.startedAtIso)}` : null,
    `Fim (BRT): ${formatBrt(params.endedAtIso)}`,
    Number.isFinite(durationMs) ? `Duração: ${formatDurationMs(durationMs)}` : null,
    `Status: ${status === 'success' ? 'SUCESSO' : 'FALHA'}`,
    '',
    status === 'success'
      ? '👍🏻 Se puder, confirma com um ok aqui no grupo.'
      : '👍🏻 Se puder, dá um ok aqui na thread quando estiver revisado.',
  ]
    .filter((v) => v !== null && v !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildTaskNotifyMessage(params: {
  event: 'start' | 'end';
  title: string;
  taskId: string;
  actorLabel: string;
  startedAtIso?: string;
  endedAtIso?: string;
  priority?: string;
  action?: string;
  details?: string;
  summary?: string[];
  deployVersion?: string;
  status?: 'success' | 'failed';
  linkUrl?: string;
}): string {
  const nowIso = new Date().toISOString();
  const startedAtIso = params.startedAtIso || (params.event === 'start' ? nowIso : undefined);
  const endedAtIso = params.endedAtIso || (params.event === 'end' ? nowIso : undefined);

  return params.event === 'start'
    ? buildStartMessage({
      title: params.title,
      taskId: params.taskId,
      startedAtIso: startedAtIso || nowIso,
      actorLabel: params.actorLabel,
      priority: params.priority,
      action: params.action,
      details: params.details,
      linkUrl: params.linkUrl,
    })
    : buildEndMessage({
      title: params.title,
      taskId: params.taskId,
      startedAtIso,
      endedAtIso: endedAtIso || nowIso,
      actorLabel: params.actorLabel,
      priority: params.priority,
      summary: params.summary,
      deployVersion: params.deployVersion,
      status: params.status,
      linkUrl: params.linkUrl,
    });
}

async function readJsonBody<T = unknown>(request: Request): Promise<T> {
  const text = await request.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON');
  }
}

function clampText(text: string, max = 5000): string {
  const t = String(text || '').trim();
  if (!t) return '';
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

const whatsappWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      const headers = withCorsHeaders(new Headers());
      return new Response(null, { status: 204, headers });
    }

    const envResolved = await resolveEnvSecrets(env).catch((err) => {
      // Health não deve falhar por falta de secret.
      if (path === '/health' || path === '/') return env;
      throw err;
    });

    try {
      // Health
      if ((path === '/' || path === '/health') && request.method === 'GET') {
        const headers = withCorsHeaders(new Headers());
        return json({
          success: true,
          data: {
            status: 'ok',
            worker: WORKER_NAME,
            version: WORKER_VERSION,
            unipile_api_url: getUnipileApiUrl(envResolved),
            auth: {
              admin_auth_token: Boolean(envResolved.ADMIN_AUTH_TOKEN),
              cron_secret: Boolean(envResolved.CRON_SECRET),
              auth_token: Boolean(envResolved.AUTH_TOKEN),
              allow_fallback_token: allowFallbackToken(envResolved),
            },
            unipile: {
              api_key: Boolean(envResolved.UNIPILE_API_KEY),
              whatsapp_account_id: Boolean(envResolved.UNIPILE_WHATSAPP_ACCOUNT_ID),
              group_chat_id: Boolean(envResolved.UNIPILE_WHATSAPP_GROUP_CHAT_ID),
              default_group_name: getDefaultGroupName(envResolved),
              account_phone: Boolean(envResolved.UNIPILE_WHATSAPP_ACCOUNT_PHONE),
              group_provider_id: Boolean(envResolved.UNIPILE_WHATSAPP_GROUP_PROVIDER_ID),
              self_heal: isSelfHealEnabled(envResolved),
            },
          },
        }, { headers });
      }

      // Auth gate (everything else)
      const authError = await requireAuthOr401(request, envResolved);
      if (authError) {
        const headers = withCorsHeaders(new Headers(authError.headers));
        return new Response(authError.body, { status: authError.status, headers });
      }

      // GET /chats
      if (path === '/chats' && request.method === 'GET') {
        const q = (url.searchParams.get('q') || '').trim().toLowerCase();
        const accountId =
          (url.searchParams.get('account_id') || '').trim()
          || (envResolved.UNIPILE_WHATSAPP_ACCOUNT_ID || '').trim();

        if (!accountId) {
          return json({ success: false, error: 'UNIPILE_WHATSAPP_ACCOUNT_ID não configurado (env/secret) ou account_id ausente' }, { status: 400 });
        }

        const items = await listChats(envResolved, accountId);
        const filtered = items.filter((c) => (q ? c.name.toLowerCase().includes(q) : true));
        return json({
          success: true,
          data: {
            account_id: accountId,
            count: filtered.length,
            items: filtered,
          },
        });
      }

      // POST /send
      if (path === '/send' && request.method === 'POST') {
        const body = await readJsonBody<{ text?: string; chat_id?: string; group_name?: string; account_id?: string }>(request);

        const text = clampText(body?.text || '', 8000);
        if (!text) return json({ success: false, error: 'text é obrigatório' }, { status: 400 });

        const result = await resilientSend(envResolved, {
          text,
          explicitChatId: typeof body?.chat_id === 'string' ? body.chat_id : undefined,
          accountIdOverride: typeof body?.account_id === 'string' ? body.account_id : undefined,
          groupNameOverride: typeof body?.group_name === 'string' ? body.group_name : undefined,
        });
        return json({ success: true, data: { ...result } });
      }

      // POST /task-notify
      if (path === '/task-notify' && request.method === 'POST') {
        const body = await readJsonBody<Record<string, unknown>>(request);

        const event = String(body?.event || '').trim();
        if (event !== 'start' && event !== 'end') {
          return json({ success: false, error: 'event deve ser start|end' }, { status: 400 });
        }

        const title = clampText(body?.title as string || '', 200);
        if (!title) return json({ success: false, error: 'title é obrigatório' }, { status: 400 });

        const actorLabel = clampText(body?.actor_label as string || 'Developer Agent', 60);
        const taskId = clampText(body?.task_id as string || `DEV-${crypto.randomUUID().slice(0, 8)}`, 80);

        const nowIso = new Date().toISOString();
        const startedAtIso = String(body?.started_at as string || (event === 'start' ? nowIso : '')).trim() || undefined;
        const endedAtIso = String(body?.ended_at as string || (event === 'end' ? nowIso : '')).trim() || undefined;

        const priority = body?.priority ? clampText(body.priority as string, 80) : undefined;
        const action = body?.action ? clampText(body.action as string, 1500) : undefined;
        const details = body?.details ? clampText(body.details as string, 3000) : undefined;

        const summary: string[] | undefined = Array.isArray(body?.summary)
          ? (body.summary as unknown[]).map((v: unknown) => clampText(String(v || ''), 300)).filter(Boolean).slice(0, 24)
          : undefined;

        const deployVersion = body?.deploy_version ? clampText(body.deploy_version as string, 60) : undefined;
        const status = body?.status === 'failed' ? 'failed' : (body?.status === 'success' ? 'success' : undefined);
        const linkUrl = body?.link_url ? clampText(body.link_url as string, 2048) : undefined;

        const groupNameOverride = body?.group_name ? clampText(body.group_name as string, 140) : undefined;
        const accountIdOverride = (body?.account_id as string || '').trim() || undefined;

        const message = buildTaskNotifyMessage({
          event,
          title,
          taskId,
          actorLabel,
          startedAtIso,
          endedAtIso,
          priority,
          action,
          details,
          summary,
          deployVersion,
          status,
          linkUrl,
        });

        const result = await resilientSend(envResolved, {
          text: message,
          accountIdOverride,
          groupNameOverride,
        });

        return json({
          success: true,
          data: {
            task_id: taskId,
            event,
            started_at: startedAtIso || null,
            ended_at: endedAtIso || null,
            healed: result.healed,
            unipile: { chat_id: result.chat_id, raw: result.raw },
          }
        });
      }

      // POST /format — retorna a mensagem formatada (sem enviar no Unipile)
      if (path === '/format' && request.method === 'POST') {
        const body = await readJsonBody<Record<string, unknown>>(request);

        const event = String(body?.event || '').trim();
        if (event !== 'start' && event !== 'end') {
          return json({ success: false, error: 'event deve ser start|end' }, { status: 400 });
        }

        const title = clampText(body?.title as string || '', 200);
        if (!title) return json({ success: false, error: 'title é obrigatório' }, { status: 400 });

        const actorLabel = clampText(body?.actor_label as string || 'Developer Agent', 60);
        const taskId = clampText(body?.task_id as string || `DEV-${crypto.randomUUID().slice(0, 8)}`, 80);

        const startedAtIso = String(body?.started_at as string || '').trim() || undefined;
        const endedAtIso = String(body?.ended_at as string || '').trim() || undefined;
        const priority = body?.priority ? clampText(body.priority as string, 80) : undefined;
        const action = body?.action ? clampText(body.action as string, 1500) : undefined;
        const details = body?.details ? clampText(body.details as string, 3000) : undefined;
        const summary: string[] | undefined = Array.isArray(body?.summary)
          ? (body.summary as unknown[]).map((v: unknown) => clampText(String(v || ''), 300)).filter(Boolean).slice(0, 24)
          : undefined;
        const deployVersion = body?.deploy_version ? clampText(body.deploy_version as string, 60) : undefined;
        const status = body?.status === 'failed' ? 'failed' : (body?.status === 'success' ? 'success' : undefined);
        const linkUrl = body?.link_url ? clampText(body.link_url as string, 2048) : undefined;

        const message = buildTaskNotifyMessage({
          event,
          title,
          taskId,
          actorLabel,
          startedAtIso,
          endedAtIso,
          priority,
          action,
          details,
          summary,
          deployVersion,
          status,
          linkUrl,
        });

        return json({
          success: true,
          data: {
            task_id: taskId,
            event,
            started_at: startedAtIso || null,
            ended_at: endedAtIso || null,
            message,
          }
        });
      }

      return json({ success: false, error: 'Not found' }, { status: 404 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      return json({ success: false, error: message }, { status: 500 });
    }
  },
};

export default whatsappWorker;
