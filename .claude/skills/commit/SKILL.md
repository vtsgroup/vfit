---
name: commit
description: Analisa o diff, gera commit message Conventional Commits e executa o commit. Use ao terminar uma task.
allowed-tools: Bash, Read, Grep
---

# Commit Skill — IA + PERSONAL

## Processo

1. Verifique o que está staged: `git diff --cached --stat` e `git diff --cached`.
2. Se nada staged, liste arquivos modificados com `git status` e faça `git add` dos arquivos relevantes (nunca `git add -A` indiscriminado — verifique um a um).
3. Leia os últimos 5 commits para manter estilo: `git log --oneline -5`.
4. Gere commit message seguindo **Conventional Commits**:
   - `feat:` nova feature
   - `fix:` correção de bug
   - `refactor:` refatoração sem mudança de comportamento
   - `test:` adição/correção de testes
   - `docs:` documentação
   - `chore:` manutenção, bump de versão, configs
   - `style:` mudanças de DS/CSS sem lógica
   - `perf:` melhoria de performance
5. Corpo do commit (opcional): máximo 3 linhas, explique O QUE e POR QUÊ (não o como).
6. Execute o commit via heredoc para preservar formatação:
   ```bash
   git commit -m "$(cat <<'EOF'
   tipo: descrição curta em português

   Corpo opcional aqui.
   EOF
   )"
   ```
7. Mostre o hash do commit criado.

## Regras

- **NUNCA** faça `git push` — isso é sempre responsabilidade do usuário.
- **NUNCA** commite em `main` — o hook bloqueará, mas nem tente.
- Não inclua arquivos `.env`, `.env.local`, ou qualquer arquivo de secrets.
- Prefira commits atômicos (um propósito por commit).
