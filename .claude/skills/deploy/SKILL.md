---
name: deploy
description: Executa o pipeline de deploy para produção. Sempre pede confirmação antes de executar. Uso: /deploy [patch|minor|major]
allowed-tools: Bash, Read
---

# Deploy Skill — IA + PERSONAL

Argumento: $ARGUMENTS (patch | minor | major — default: patch)

## IMPORTANTE

O deploy para produção requer **confirmação explícita do usuário** antes de executar.
Este skill é educacional — descreve o processo e prepara, mas não executa o deploy final.

## Checklist pré-deploy

Execute cada item e reporte o resultado:

1. **Branch correta**
   ```bash
   git branch --show-current
   ```
   Deve ser `main` para produção.

2. **Sem mudanças não commitadas**
   ```bash
   git status --short
   ```
   Deve estar limpo.

3. **Quality gate completo**
   ```bash
   npm run quality:ci
   ```
   Deve passar sem erros.

4. **Versão atual**
   ```bash
   node -p "require('./package.json').version"
   ```

## Preparação

5. Informe ao usuário o que será feito:
   ```
   📦 Deploy para PRODUÇÃO
   Tipo: $ARGUMENTS
   Versão atual: vX.Y.Z → nova versão: vX.Y.(Z+1)  [ou minor/major]

   Comando que será executado:
   npm run cf:deploy  (patch)
   npm run cf:deploy:minor  (minor)
   npm run cf:deploy:major  (major)

   Isso irá:
   1. Bump de versão no package.json
   2. Commit + tag git
   3. Deploy do Cloudflare Worker
   4. Build e deploy do frontend (Next.js/Pages)

   ⚠️ Esta ação é IRREVERSÍVEL sem rollback manual.
   Confirma o deploy? (responda "sim" para prosseguir)
   ```

6. **Aguarde confirmação explícita "sim" do usuário** antes de continuar.

7. Se confirmado, execute:
   ```bash
   npm run notify:start
   npm run cf:deploy     # ou cf:deploy:minor / cf:deploy:major
   npm run notify:end
   ```

8. Reporte o resultado e o novo número de versão.

## Rollback de emergência
Se algo der errado, consulte `docs/ULTRA-PLANO-MVP-PRODUCAO/INCIDENT-ROLLBACK-RUNBOOK.md`.
