---
name: bump-version
description: Incrementa a versão do projeto (semver) sem fazer deploy. Uso: /bump-version [patch|minor|major]
allowed-tools: Bash, Read, Edit
---

# Bump Version Skill — IA + PERSONAL

Argumento: $ARGUMENTS (patch | minor | major — default: patch)

## Processo

1. Leia a versão atual:
   ```bash
   node -p "require('./package.json').version"
   ```

2. Calcule a nova versão conforme semver:
   - `patch`: 5.2.5 → 5.2.6
   - `minor`: 5.2.5 → 5.3.0
   - `major`: 5.2.5 → 6.0.0

3. Execute o script de bump (atualiza package.json + sincroniza no worker):
   ```bash
   npm run version:patch    # ou version:minor / version:major
   ```
   O script `scripts/update-version.js` sincroniza a versão no código do worker automaticamente.

4. Verifique o resultado:
   ```bash
   node -p "require('./package.json').version"
   git diff package.json
   ```

5. Crie o commit:
   ```bash
   git add package.json
   git commit -m "chore: bump version to vX.Y.Z"
   ```

6. Reporte: "Versão atualizada de vA.B.C para vX.Y.Z. Execute `git push` quando pronto."

## Regras
- Não faça `git push` — responsabilidade do usuário.
- Não crie tag manualmente — o script `cf:deploy` faz isso automaticamente no momento do deploy.
