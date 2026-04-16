# Midia de Exercicios - R2 e Painel Super Admin

## Problemas reportados

- Imagem de Peito foi atualizada, mas app continua exibindo imagem antiga
- Necessidade de enviar imagens de exercicios (ex: Supino Reto) via painel super admin

## Hipoteses tecnicas provaveis

- Cache de CDN/browser sem invalidacao
- Chave do objeto nao mudou (mesmo path, sem versao)
- Metadado no banco aponta para URL antiga
- App sem bust de cache no consumo da URL

## Solucao recomendada

### 1) Versionamento de asset

- Salvar arquivo com sufixo de versao/hash
- Exemplo logico: supino-reto-v3.webp
- URL final inclui versao para evitar hit em cache obsoleto

### 2) Metadados por exercicio

- exercise_id
- image_url
- image_version
- updated_by
- updated_at

### 3) Endpoint de admin (super_admin)

- Upload imagem
- Replace imagem existente
- Remover imagem
- Reprocessar miniatura

### 4) UI no painel admin

- Buscar exercicio por nome
- Upload por drag/drop e seletor de arquivo
- Preview imediato
- Confirmacao e historico de alteracoes

## Regras de validacao

- Formatos permitidos: webp, jpg, png
- Limite de tamanho definido por politica
- Sanitizacao de nome
- Verificacao de permissao super_admin

## Fluxo recomendado de atualizacao

1. Super admin seleciona exercicio
2. Faz upload da nova imagem
3. Worker salva no R2 com nova versao
4. Backend atualiza metadados no banco
5. Frontend recebe URL versionada
6. App mostra nova imagem imediatamente

## Casos de teste

- Trocar imagem de Peito e validar update no app sem limpar cache manual
- Trocar imagem de Supino Reto no painel e validar em lista e detalhe
- Simular upload invalido (tipo/tamanho) e validar erro amigavel
- Simular falha de rede e validar retry

## Criterios de aceite

- Upload de imagem de exercicio funcional via painel super admin
- Cache bust previsivel em 100% dos casos de replace
- Sem quebra de fallback de imagem quando asset nao existir
