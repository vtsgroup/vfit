# Checklist LGPD por Fluxo

> Lote 013 — Governança de privacidade por fluxo
> Atualizado em 20/02/2026

## Objetivo
Padronizar verificação LGPD por fluxo de produto, com evidências técnicas e estado de conformidade.

## Matriz por fluxo

| Fluxo | Direito LGPD | Implementação técnica | Evidência | Status |
|---|---|---|---|---|
| Cadastro/Login | Transparência e consentimento | Termos + Privacidade + Cookies + consent banner | `/termos`, `/privacidade`, `/cookies`, `cookie-consent.tsx` | ✅ |
| Perfil do usuário | Acesso e atualização | `GET/PATCH /users/me` | `workers/api/users.ts` | ✅ |
| Portabilidade de dados | Art. 18, V | `GET /users/me/data-export` + ação em Configurações | `workers/api/users.ts`, `src/app/dashboard/settings/page.tsx` | ✅ |
| Exclusão/anonimização | Art. 16 | `DELETE /users/me` + confirmação forte em Configurações | `workers/api/users.ts`, `src/app/dashboard/settings/page.tsx` | ✅ |
| Notificações | Minimização e controle | leitura, marcação e limpeza de notificações lidas | `workers/api/notifications.ts` | ✅ |
| Mídia de perfil (R2) | Limitação de retenção | cleanup best-effort de fotos no delete LGPD | `users.delete('/me')` | ✅ |
| Sessões | Segurança e revogação | revogação de sessão KV no delete LGPD | `users.delete('/me')` | ✅ |
| Pagamentos | Obrigação legal de retenção | dados fiscais preservados e PII anonimizada | comentário e fluxo em `users.delete('/me')` | ✅ |

## Checklist operacional por release

- [ ] Validar fluxo de exportação de dados em conta `personal`.
- [ ] Validar fluxo de exportação de dados em conta `student`.
- [ ] Validar exclusão com anonimização e logout forçado.
- [ ] Confirmar que navbar e botão IA não foram alterados por ajustes LGPD.
- [ ] Atualizar changelog e lote correspondente.

## Riscos residuais

1. Export JSON pode crescer para contas com grande volume histórico (avaliar compressão futura).
2. Confirmar periodicamente que campos novos de schema entram no export quando necessário.
3. Manter revisão jurídica quando houver mudança de política de retenção.
