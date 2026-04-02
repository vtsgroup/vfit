# Cloudflare Secrets Map — Segurança Total

## Padrão de naming recomendado
- Produção: `*_PROD` quando necessário por segregação externa.
- Staging: `*_STG`.
- Sempre documentar owner, rotação e criticidade.

## Secrets atuais (bindings críticos)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `REPLICATE_API_TOKEN`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_KEY`
- `NEON_DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI`
- `TURNSTILE_SECRET_KEY`
- `R2_VIDEOS_URL`
- `R2_IMAGES_URL`

## Inventário por domínio
1. **Auth/JWT**: `JWT_SECRET`, `JWT_REFRESH_SECRET`
2. **Pagamentos**: Asaas + Stripe
3. **IA**: Replicate
4. **Comunicação**: Resend + OneSignal
5. **Banco**: Neon
6. **OAuth**: Google/Facebook
7. **Bot protection**: Turnstile
8. **Storage URL**: R2 public URLs

## Inventário automatizado (fonte de verdade)
- Arquivo gerado: [docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-INVENTORY.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-INVENTORY.generated.md)
- Comando: `npm run security:inventory`
- Fonte de dados: `workers/types.ts` (`Bindings`)

## Registry de ownership por domínio

| Domínio | Owner | Backup owner | Criticidade padrão | Rotação padrão |
|---|---|---|---|---|
| Auth/JWT | Backend Security Owner | SRE Lead | P0 | 90 dias |
| Pagamentos | Payments Owner | Backend Security Owner | P0 | 90 dias |
| Banco | Data Platform Owner | SRE Lead | P0 | 90 dias |
| OAuth | Identity Owner | Backend Security Owner | P1 | 90 dias |
| Bot protection | Security Operations | SRE Lead | P1 | 180 dias |
| IA | AI Platform Owner | Backend Owner | P1 | 180 dias |
| Comunicação | Engagement Owner | Backend Owner | P1 | 180 dias |
| Storage URL | Infra Owner | SRE Lead | P2 | Sob demanda |

## Política de rotação e expiração
- **P0 (JWT/Pagamentos/Banco):** rotação a cada 90 dias ou imediata após incidente.
- **P1 (OAuth/Turnstile/IA/Comunicação):** rotação a cada 180 dias; OAuth recomendado 90 dias.
- **P2 (URLs públicas):** revisão semestral de domínio/certificados e integridade.
- Sempre registrar: data de rotação, owner executor, impacto, validação pós-rotação.

## Checklist operacional por lote (segurança)
- [x] Inventário por domínio atualizado.
- [x] Owners e criticidade definidos por domínio.
- [x] Política de rotação documentada.
- [x] Registro de rotação iniciado por secret (Lote 004).
- [x] Runbook de emergência com playbook de incidente (Lote 004).
- [ ] Scanner de segredos em CI com bloqueio (Lote 006).

## Artefatos operacionais do Lote 004
- Runbook: [docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-ROTATION-RUNBOOK.md](docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-ROTATION-RUNBOOK.md)
- Log de rotação: [docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-ROTATION-LOG.md](docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-ROTATION-LOG.md)
- Drill de recuperação: [docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-RECOVERY-DRILL.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-RECOVERY-DRILL.generated.md)

## Artefatos operacionais do Lote 005
- Auditoria automática de referências sensíveis: [docs/ULTRA-PLANO-MVP-PRODUCAO/SENSITIVE-REFERENCES-AUDIT.generated.md](docs/ULTRA-PLANO-MVP-PRODUCAO/SENSITIVE-REFERENCES-AUDIT.generated.md)
- Comando: `npm run security:audit`

## Artefatos operacionais do Lote 006
- Workflow CI: [.github/workflows/security-sensitive-scan.yml](.github/workflows/security-sensitive-scan.yml)
- Comando de bloqueio: `npm run security:audit:ci` (`--fail-on=P0`)

## Checklist de segurança (obrigatório)
- [ ] Segredos nunca em `.env` versionado.
- [ ] Rotação trimestral para JWT/Payments/OAuth.
- [ ] Rotação imediata após incidente.
- [ ] Alertas para erros de webhook e auth.
- [ ] Validação em CI para bloquear strings sensíveis.

## Comandos operacionais
- Inserir secret: `echo "valor" | npx wrangler secret put NOME --env=""`
- Validar versão wrangler antes de deploy.
- Revisar bindings no output do deploy.

## Lotes de segurança
- Lote 03: inventário automatizado + policy. ✅
- Lote 04: rotação segura e runbook. ✅
- Lote 05: auditoria de logs e redaction. ✅
- Lote 06: scanner de segredos em CI. ✅
