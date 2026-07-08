# TRACKING — Plano Biometria v2 (App Lock + Enrollment + Step-Up)

> **Última atualização:** 2026-07-08 · Branch `feat/biometria-v2` · commit checkpoint `ccbf49cd`
> Plano completo: `~/.gstack/projects/vtsgroup-vfit/ceo-plans/2026-07-08-biometria-v2.md`
> **Este arquivo é o roteiro de execução de hoje à noite — cada tarefa tem arquivo, abordagem e critério de pronto já decididos. Não precisa re-derivar nada, só executar em ordem.**

---

## Progresso

- [x] Recon exaustivo do sistema passkey existente
- [x] Plano biometria v2 escrito
- [x] `/plan-eng-review` (6 decisões D2–D6 travadas + voz externa: 5 achados confirmados e absorvidos)
- [x] **ONDA 1 — Segurança**: B0 (idempotência) + B4 (step-up dynamic linking) + B5 (hardening) — backend + frontend
- [x] Testes onda 1: 23 unit novos (dynamic linking + anti double-spend) — 464/464 verde
- [x] **`/security-review`**: 1 achado HIGH confirmado e corrigido (double-spend), 1 avaliado como não-explorável (JWT type confusion → TODO defense-in-depth)
- [x] Commit checkpoint onda 1 (`ccbf49cd`)
- [ ] **Migration de produção** (bloqueia deploy — ver E0 abaixo)
- [ ] **ONDA 2 — UX**: B1 enrollment + B2 lock policy + B3 splash-lock
- [ ] Testes onda 2 (unit lock-policy + E2E WebAuthn virtual authenticator)
- [ ] Deploy web
- [ ] Smoke pós-deploy (saque real ou sandbox Asaas)
- [ ] Build TWA (AAB + APK) + release notes

**Progresso:** 6/12 etapas macro (50%) — onda de segurança 100% fechada.

---

## E0 — Migration de produção (fazer ANTES do deploy) 🔴 precisa de você

A onda 1 criou `migrations/hyperdrive/2026-07-08_withdrawal_idempotency.sql` (colunas `idempotency_key` + índices únicos parciais em `pix_transfers` e `payments`). **Sem rodar isso, os saques vão quebrar** (o código já espera essas colunas).

```bash
# Confirme que NEON_DATABASE_URL está no .env.local (já confirmado: está ✓), depois:
NEON_DATABASE_URL="$NEON_DATABASE_URL" node scripts/run-migration-neon.mjs migrations/hyperdrive/2026-07-08_withdrawal_idempotency.sql
```

Roda com `ADD COLUMN IF NOT EXISTS` e `CREATE UNIQUE INDEX IF NOT EXISTS` — idempotente, seguro rodar de novo se já tiver rodado parcialmente. **Toca banco de produção — por isso não rodei sozinho** (regra do projeto: só leio/escrevo `.env`, migrations em prod exigem sua confirmação explícita).

---

## ONDA 2 — UX (B1 + B2 + B3)

### B1 — Enrollment pós-cadastro

**O quê:** oferecer ativação de biometria logo após o cadastro (hoje só aparece 2s depois de chegar ao dashboard, via `PasskeyPrompt`, com dismiss de 7 dias — o aluno nunca vê a oferta, pois `PasskeyPrompt` só monta no dashboard do personal).

**Arquivos:**
- `src/app/(auth)/register/page.tsx` (ou os específicos `register/personal/page.tsx` / `register/student/page.tsx` — checar em qual(is) o submit final acontece) — após `handleSubmit` completar com sucesso (usuário já autenticado, tokens no store) e ANTES do redirect para onboarding/dashboard: mostrar um passo intermediário "Ative o desbloqueio por biometria".
- Reusar `useRegisterPasskey()` de `src/hooks/use-passkey.ts` (já faz todo o fluxo WebAuthn + marca `passkey_registered_${userId}` + ativa `vfit_biometric_auto_unlock`).
- UI: criar `src/components/auth/passkey-enrollment-step.tsx` — tela cheia (não modal, é um passo do fluxo), reusa o visual do `BiometricLockScreen`/`PasskeyPrompt` (ícone fingerprint, texto "Ative o desbloqueio rápido"), botão primário "Ativar" (chama `useRegisterPasskey().mutate()`) + link secundário "Agora não" (segue o fluxo normal). Só renderiza se `supportsPasskey()` (browser/dispositivo suporta WebAuthn) — senão pula direto.
- `src/app/dashboard/layout.tsx:24,55` (`PasskeyPrompt`) — **manter como está** (rede de segurança para quem pulou no cadastro ou cadastrou antes desta feature).
- **Novo:** montar `PasskeyPrompt` também em `src/app/(app)/layout.tsx` (hoje só existe no dashboard do personal) — o aluno nunca recebe a oferta de biometria hoje. Import + render igual ao padrão do dashboard/layout.tsx.

**Critério de pronto:** cadastro de personal E de aluno mostram a oferta uma vez; "Agora não" não trava o fluxo; registrar com sucesso ativa `vfit_biometric_auto_unlock` (via `useRegisterPasskey` já existente).

**Efeito colateral a verificar:** o `PasskeySettingsCard` (`src/components/settings/passkey-settings-card.tsx`, usado em `dashboard/settings/page.tsx:309`) continua funcionando para gerenciar/remover depois — não precisa mudar.

---

### B2 — Política de recorrência (lock policy)

**O quê:** hoje o cooldown biométrico é fixo (`BIOMETRIC_COOLDOWN_MS = 60*60*1000`, 1h, em `src/hooks/use-passkey.ts:140`). Trocar por política configurável: `always | daily | weekly | off`, default `daily`.

**Arquivos:**
- **Novo módulo puro** `src/lib/biometric-lock-policy.ts`:
  ```ts
  export type LockPolicy = 'always' | 'daily' | 'weekly' | 'off'
  export function lockIntervalMs(policy: LockPolicy): number // always=0, daily=24h, weekly=7d, off=Infinity
  export function isUnlockDue(input: { enabled: boolean; lastAuthAt: number | null; policy: LockPolicy; now?: number }): boolean
  ```
  `isUnlockDue`: `false` se `!enabled` ou `policy==='off'`; `true` se `!lastAuthAt`; senão `now - lastAuthAt >= lockIntervalMs(policy)`. Parâmetro `now` opcional (default `Date.now()`) — **necessário para os testes serem determinísticos** (não usar `Date.now()` direto dentro da função sem poder injetar).
- `src/hooks/use-passkey.ts`: adicionar `getLockPolicy()`/`setLockPolicy(policy)` (localStorage `vfit_biometric_lock_policy`, default `'daily'`). Manter `isBiometricInCooldown()` por compat mas redirecionar sua lógica interna para `isUnlockDue` com a policy salva (ou marcar como deprecated e migrar os 2 call-sites — `welcome/page.tsx:68` e `login/page.tsx:64` — para a nova função diretamente; preferir migrar, é mais limpo).
- UI de configuração — **dois lugares** (personal e aluno têm telas de config separadas):
  - `src/components/settings/passkey-settings-card.tsx` (dashboard/settings, personal): adicionar seletor (4 opções: Sempre / Diariamente / Semanalmente / Desativado) abaixo da lista de passkeys, só visível se `hasPasskeyRegistered`.
  - `src/app/(app)/perfil/seguranca/page.tsx` (aluno — **arquivo já existe, 54 linhas, ainda sem nada de passkey/biometria**): adicionar a mesma seção (lista de passkeys via `usePasskeys()` + seletor de política). Ler o arquivo primeiro para ver a estrutura visual atual e seguir o padrão.

**Critério de pronto:** trocar a política e reabrir o app respeita o novo intervalo; `off` nunca pede biometria; testes unit (ver B6 abaixo) cobrem as 4 janelas + clock skew.

---

### B3 — Splash → Lock → Destino (app lock no boot)

**Decisão já travada na review (D4): o lock é tratado como "destino de boot"** — reusa o contrato `isBootResolved` do splash-boot v2 (deployado hoje, v5.4.5) em vez de virar uma 2ª condição de saída da splash. A splash entrega o LOCK (não o conteúdo) quando o lock é necessário.

**Arquivos:**
- `src/stores/auth-store.ts`: adicionar `isUnlockRequired: boolean` + `setUnlocked: () => void` (seta `isUnlockRequired = false`). Computar `isUnlockRequired` na hidratação: `isAuthenticated && getLockPolicy() !== 'off' && hasPasskeyRegistered(user.id) && isUnlockDue({enabled: isBiometricAutoUnlockEnabled(), lastAuthAt: <ler vfit_biometric_last_auth_at>, policy: getLockPolicy()}) && isStandaloneDisplay()` (a função `isStandaloneDisplay` já existe em `src/components/ui/splash-screen.tsx` — importar/reusar, ou extrair para um util compartilhado se preferir não acoplar). **Browser comum NÃO tranca** (só standalone/TWA/PWA — comportamento "app-like").
- **Novo** `src/components/layout/boot-lock-gate.tsx` (`BootLockGate`): client component, monta nos layouts `dashboard/layout.tsx` e `(app)/layout.tsx` **fora dos providers pesados** (mesmo padrão do `SplashOrchestrator` — Zustand é singleton, não precisa de Provider). Lê `isUnlockRequired` do store:
  - Se `true`: renderiza `<BiometricLockScreen variant="unlock" onUnlocked={() => setUnlocked()} />` (novo variant — ver abaixo) por cima do conteúdo (overlay opaco full-screen, mesmo z-index alto do `BiometricLockScreen` atual).
  - Marca `setBootResolved(true)` (do auth-store, já existe do splash-boot v2) **quando o LOCK está visível** — é isso que faz a splash sair entregando o lock, não o conteúdo.
  - Se `false`: não renderiza nada (conteúdo normal segue seu próprio `isBootResolved` já existente nos gates).
- `src/components/auth/biometric-lock-screen.tsx`: adicionar prop `variant?: 'login' | 'unlock'` (default `'login'`, comportamento atual preservado) e `onUnlocked?: () => void`.
  - No modo `unlock`: sucesso chama `onUnlocked()` em vez de `router.push(dest)` — **não navega se já está no destino certo** (o usuário já estava vendo o app, só desbloqueando). Usa `bootDestination()` (`src/lib/boot-destination.ts`, do splash-boot v2) só como fallback se por algum motivo a rota atual não bate com o `user_type` (corrige o bug atual do modo login: redirect hardcoded `/dashboard`/`/dashboard/admin` em `biometric-lock-screen.tsx:114-118` que manda student/nutri para o lugar errado).
  - Continua fazendo o **login completo via passkey** (`useLoginWithPasskey`) mesmo no modo unlock — tokens frescos = mais seguro que só "confirmar presença" sem revalidar a sessão.
- **Offline (fail-open):** se `/auth/passkey/login/options` falhar por rede (erro de fetch, não erro de auth) → não travar o usuário. `onUnlocked()` é chamado mesmo assim (app é offline-first, tokens no store continuam válidos) + toast discreto "Sem conexão — biometria pulada" + log via `logClientIssue` (padrão já usado em `use-payments.ts`).
- **Válvula de segurança:** botão "Usar senha" no modo unlock → logout suave (`useAuthStore.getState().logout()`) → redirect `/login`. Nunca deixar o usuário preso atrás do lock sem saída.

**Critério de pronto:** com política `daily` e `lastAuthAt` vencido, abrir o app standalone mostra Splash → Lock → conteúdo, **zero frame de conteúdo antes do lock** (mesma garantia que os testes do splash-boot já verificam pra splash→destino). Dentro da janela: entra direto, sem lock. `off`: nunca tranca.

---

## B6 (parte 2) — Testes da Onda 2

### Unit (vitest)
- `tests/unit/biometric-lock-policy.test.ts`: `lockIntervalMs` para as 4 políticas; `isUnlockDue` — sem `lastAuthAt` (true), dentro da janela (false), fora da janela (true), `policy='off'` (sempre false independente de `lastAuthAt`), `enabled=false` (sempre false), clock skew (`lastAuthAt` no futuro — não deve quebrar, tratar como "dentro da janela").

### E2E (Playwright + CDP WebAuthn virtual authenticator)
Setup novo (a suíte do splash-boot usa `addInitScript` para emular standalone — aqui precisa ALÉM disso emular um autenticador WebAuthn real via CDP, que é diferente):
```ts
const client = await page.context().newCDPSession(page)
await client.send('WebAuthn.enable')
const { authenticatorId } = await client.send('WebAuthn.addVirtualAuthenticator', {
  options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true },
})
```
Cenários (`tests/e2e/biometria-v2.spec.ts`, novo arquivo):
1. Cadastro (personal e aluno) → sheet de enrollment aparece → ativar → passkey registrado no servidor.
2. Cadastro → "Agora não" → segue o fluxo normal sem travar.
3. Política `daily` + `lastAuthAt` vencido (seed via `localStorage` antes do `goto`, como a suíte splash-boot já faz) + standalone emulado → Splash → Lock → conteúdo, sem frame de conteúdo antes.
4. Dentro da janela (`lastAuthAt` recente) → entra direto, sem lock.
5. Política `off` → nunca mostra lock mesmo com `lastAuthAt` antigo.
6. Modo unlock: sucesso não navega para rota errada (student que estava em `/treinos/123` continua lá, não vai para `/dashboard`).
7. Offline (`page.route` abortando as chamadas de rede) → fail-open, conteúdo aparece mesmo sem completar a biometria.
8. "Usar senha" no lock → logout suave → `/login`.

### Gate final da Onda 2
```bash
npx vitest run                          # unit completo
npx playwright test tests/e2e/biometria-v2.spec.ts --project=chromium
npm run type-check && npm run type-check:workers
npm run build                           # inclui o splash-check gate (não deve regredir)
```

---

## Deploy (depois de Onda 2 verde)

1. **Migration já deve estar rodada** (E0, antes de tudo isso — ou rodar agora se ainda não rodou).
2. `npm run quality:ci` — gate completo (docs + security audit + lint + types + testes + build).
3. `npm run smoke:auth:local` — **tokens SMOKE_* provavelmente expirados** (pendência conhecida desde a sessão do splash-boot) → renovar em `vfit.app.br/dashboard/admin/smoke` (super_admin) antes, ou aceitar rodar sem esse smoke específico se for tarde.
4. Deploy:
   ```bash
   node scripts/cf-deploy.js minor --msg "feat(security): confirmação biométrica em saques + desbloqueio por app lock configurável; fix(saque): elimina risco de saque duplicado"
   ```
   **Minor** (não patch): a feature de biometria/step-up é user-facing nova, não só bugfix — mas confirme comigo antes se preferir patch (é taste call, sem consequência técnica).
   Se o gateway WhatsApp estiver fora do ar (problema conhecido, ver `DEPLOY.md`): `--allow-no-whatsapp`.
5. **Smoke pós-deploy do saque:** fazer 1 saque real pequeno (ou usar o Asaas sandbox se configurado) end-to-end — biometria/senha → saque → confirma no dashboard do Asaas que foi UMA transferência só, não duas.

---

## TWA — Build AAB + APK (ambiente confirmado: Java 24 + Android SDK + bubblewrap já instalados aqui, com conectividade externa funcionando — diferente do Cloudflare)

**Pré-requisito:** deploy web já feito (o TWA carrega o site ao vivo via Trusted Web Activity — o conteúdo vem do `vfit.app.br` publicado, não é embarcado no APK).

### Bump de versão
`twa/twa-manifest.json` atual: `appVersionName: "4.3.3"`, `appVersionCode: 433`.
Nova versão: `appVersionName: "4.4.0"` (minor — nova feature de biometria), `appVersionCode: 440`.

```bash
cd twa
# Editar twa-manifest.json: appVersionName "4.3.3"→"4.4.0", appVersionCode 433→440
# (o `startUrl: "/welcome"` fica como está — TODO-008 já registrado para revisar isso em release futuro)
```

### Build
```bash
cd twa
npx @bubblewrap/cli update   # regenera o projeto Android a partir do twa-manifest.json atualizado
npx @bubblewrap/cli build    # gera AAB + APK, assina com o keystore existente (twa/keystore/vfit-release.jks)
```
Vai pedir a senha do keystore (mesma usada nas releases anteriores — está em `.env.local`/gerenciador de senhas, não no repo).

### Onde os artefatos aparecem
- `twa/app-release-bundle.aab` — para upload na Play Store (Play App Signing).
- `twa/app-release-signed.apk` + `.apk.idsig` — APK assinado, para teste direto em dispositivo (`adb install`) ou distribuição fora da Play Store.
- Cópia de segurança: mover/copiar para `twa/releases/4.4.0/` (padrão já usado nas versões anteriores — ver `twa/releases/1.7.1/`, `1.7.2/`, `1.7.4/`).

### Verificação pós-build
```bash
ls -la twa/app-release-bundle.aab twa/app-release-signed.apk
unzip -p twa/app-release-bundle.aab base/manifest/AndroidManifest.xml 2>/dev/null | head -5   # ou usar bundletool/aapt se preferir conferir versionCode/versionName
```

### Release notes (Play Store — rascunho pronto, PT-BR)

**O que há de novo:**
- 🔐 Desbloqueio por biometria configurável — escolha com que frequência confirmar (sempre, diariamente, semanalmente ou nunca).
- 🔐 Confirmação biométrica obrigatória para autorizar saques — proteção extra para o seu dinheiro.
- ✨ Ative a biometria direto no cadastro, com um toque.

**Correções:**
- Corrigido risco de saque duplicado em caso de conexão instável ou clique duplo.
- Corrigido saque de comissão de afiliado que podia debitar sem completar o pagamento.

---

## Se algo travar hoje à noite (troubleshooting antecipado)

- **Migration falhar** (coluna já existe de tentativa anterior): script usa `IF NOT EXISTS` em tudo — seguro rodar de novo, não deve falhar por isso. Se falhar por outro motivo, colar o erro exato antes de tentar de novo.
- **`bubblewrap build` pedir Android SDK license**: `yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses` (ambiente já tem `cmdline-tools` instalado, confirmado nesta sessão).
- **Testes E2E do WebAuthn virtual authenticator falharem** por causa do dev server (cold compile, mesma causa-raiz documentada na sessão do splash-boot) → isolar o teste específico (`-g "nome do teste"`) e rodar sozinho primeiro; se passar isolado, é variância de dev server, não bug de produto.
- **`quality:ci` falhar em `security:audit:ci`**: novo código de step-up loga `actor`/`amount`/`método` — já revisado no security-review, não deveria disparar o audit de referências sensíveis; se disparar, é falso-positivo do scanner de padrões, investigar antes de suprimir.
