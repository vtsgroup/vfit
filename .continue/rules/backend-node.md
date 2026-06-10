---
name: backend-node-padrao
description: Padrões para APIs Node.js
globs: "**/*.{ts,js}"
---

- Usar Fastify como framework HTTP — nunca Express em código novo
- Validação de entrada e saída com Zod (via `fastify-type-provider-zod`)
- Retorno padrão de todas as rotas: `{ success: boolean, data?: T, error?: string }`
- Aplicar dependency injection — evitar importações diretas de serviços dentro de handlers
- Logs exclusivamente via `pino`; nunca `console.log` em produção
- Erros tratados em plugin centralizado de `errorHandler` — sem try/catch inline repetido
- Variáveis de ambiente validadas com Zod no bootstrap da aplicação
