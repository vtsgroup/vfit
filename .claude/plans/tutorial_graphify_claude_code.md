# Tutorial Completo: Graphify + Claude Code (Economia de Tokens)

> Repositorio oficial: https://github.com/safishamsi/graphify
> Site: https://graphify.net
> Pacote PyPI: graphifyy (CLI continua sendo `graphify`)

## O que e o Graphify

Graphify e uma skill open-source (MIT) que transforma qualquer pasta de codigo,
docs, PDFs, imagens ou videos em um grafo de conhecimento (knowledge graph)
consultavel pelo Claude Code, Codex, Cursor, Gemini CLI e outros.

Em vez do Claude "grepar" e reler dezenas de arquivos toda vez que abre uma
sessao nova, ele passa a consultar um mapa pre-computado da estrutura do
projeto (funcoes, dependencias, modulos centrais/"god nodes" e clusters de
comunidades relacionadas).

Resultado documentado pelo mantenedor: ate 71.5x menos tokens por consulta em
corpora mistos, e entre 6.8x (revisao de codigo) e 49x (tarefas diarias em
repos grandes) em benchmarks de terceiros.

## Passo 0 - Pre-requisitos

- Python 3.10+
- Claude Code instalado e configurado
- Projeto com pelo menos ~100 arquivos para o ganho valer a pena (repos
  pequenos com menos de 30 arquivos nao se beneficiam muito, pois o Claude
  ja consegue ler tudo direto)

## Passo 1 - Instalar a skill

No terminal, dentro do seu projeto (ex: VFIT):

```bash
pip install graphifyy
graphify install
```

Isso registra a skill globalmente para o Claude Code, Codex, Cursor, etc.

## Passo 2 - Criar o mapa do projeto

Dentro do Claude Code, rode:

```
/graphify ~/.claude
```

ou, para mapear a pasta do projeto atual:

```
/graphify ./
```

O Graphify vai:
1. Escanear todos os arquivos (codigo, docs, schemas SQL, scripts, imagens, videos)
2. Extrair AST via Tree-sitter (localmente, sem enviar codigo bruto para LLM)
3. Rodar extracao semantica via LLM (envia apenas descricoes semanticas, nunca o codigo bruto)
4. Construir o grafo com NetworkX e aplicar deteccao de comunidades (algoritmo Leiden)
5. Gerar a pasta `graphify-out/` com:

```
graphify-out/
├── graph.html          # visualizacao interativa
├── GRAPH_REPORT.md     # nos centrais, "surpresas", perguntas sugeridas
├── graph.json          # grafo persistente e consultavel
└── cache/              # cache incremental
```

## Passo 3 - Configurar o CLAUDE.md (a parte que realmente economiza tokens)

Abra (ou crie) o arquivo `CLAUDE.md` na raiz do projeto e cole:

```markdown
## Context Navigation
1. SEMPRE consulte o knowledge graph primeiro (graphify-out/GRAPH_REPORT.md)
2. So leia arquivos brutos se eu pedir explicitamente
3. Use graphify-out/wiki/index.md como ponto de entrada, se existir
4. Antes de usar Grep ou Glob, verifique se a resposta ja esta no GRAPH_REPORT.md
5. Re-rode /graphify sempre que houver refatoracoes grandes (o grafo fica desatualizado)
```

Essas regras fazem o Claude parar de reler o projeto inteiro a cada sessao
nova e passar a navegar pela estrutura ja mapeada.

### Instalacao automatica da integracao (alternativa mais completa)

Existe tambem um comando que configura tudo de uma vez, incluindo um hook
`PreToolUse` que intercepta chamadas de `Grep`/`Glob` e injeta a instrucao
para consultar o grafo antes:

```bash
graphify claude install
```

Isso adiciona automaticamente:
- A diretriz no `CLAUDE.md` ("se existe um knowledge graph, consulte primeiro")
- O hook `PreToolUse` nas ferramentas de busca de arquivo
- O `GRAPH_REPORT.md` atualizado

## Passo 4 (Bonus) - Visualizar em 3D com Obsidian

1. Baixe o Obsidian (gratuito): https://obsidian.md
2. Abra a pasta do seu projeto (ou a pasta `graphify-out/`) como vault
3. Instale o plugin de plugins da comunidade BRAT
4. Pelo BRAT, adicione o plugin "3D Graph" (versao usada no tutorial: v2.4.1)
5. Ative a visualizacao 3D Graph View

Com isso, todo o seu projeto vira um mapa 3D giratorio, no qual cada nota/no
representa um arquivo ou conceito, e as arestas mostram as dependencias.

Voce tambem pode gerar o vault do Obsidian diretamente, pedindo ao Claude
Code: "baixe a documentacao X, mapeie com o Graphify, depois transforme isso
em um vault do Obsidian" — o Graphify tem export nativo para Obsidian
(`/graphify --obsidian`), que cria uma nota por conceito, todas interligadas
e referenciando o arquivo de origem.

## Passo 5 - Manutencao (evitar grafo desatualizado)

- Rode `/graphify` novamente apos refatoracoes grandes (leva de segundos a
  poucos minutos, dependendo do tamanho do repo)
- Em times, adicione um passo de CI que reconstrua o grafo a cada merge na
  branch principal
- Repos de ate ~5.000 arquivos funcionam bem; monorepos maiores devem rodar
  o Graphify por subpacote

## Resumo do ganho esperado

| Cenario | Economia de tokens reportada |
|---|---|
| Corpus misto (codigo + papers) | ate 71.5x |
| Revisao de codigo | ~6.8x |
| Tarefas diarias em repos grandes | ate 49x |
| Repos pequenos (<30 arquivos) | Ganho pouco relevante |

## Comando final para colar no Claude Code (tudo de uma vez)

```
pip install graphifyy
graphify install
graphify claude install
/graphify ./
```

Depois disso, cole o bloco "Context Navigation" no seu CLAUDE.md (Passo 3) e
o Claude Code passara a consultar o mapa antes de reler seus arquivos,
economizando tokens em toda sessao nova.
