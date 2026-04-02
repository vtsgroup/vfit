# Cronograma Executivo — Pronto para Lançamento na Segunda (02/03/2026)

> Status: Draft operacional aberto (com placeholders para você detalhar)  
> Janela: 26/02/2026 (quinta) → 02/03/2026 (segunda)  
> Regra de lançamento: manter SEO em `noindex` até gate final de segunda.

---

## 1) Objetivo da semana

Entregar pacote completo de pré-lançamento com:

1. Redesign completo (ondas prioritárias)
2. Regras de cadastro/compliance (CPF/CREF)
3. Evolução de afiliados (incluindo aluno)
4. SEO em escala com bloqueio de indexação até o go-live
5. Base de agentes Unipile (Instagram: post, DM, comentários, atendimento)
6. Modo de simulação do super admin (Aluno/Personal/Super Admin)

Campos em aberto:
- Meta de conversão da semana: [A DEFINIR]
- Meta de páginas SEO da semana: [A DEFINIR]
- Meta de cobertura de redesign: [A DEFINIR]

---

## 2) Escopo obrigatório desta entrega

## 2.1 Cadastro e compliance

### Regras obrigatórias
- CPF obrigatório para alunos e personals.
- CPF único global (não pode repetir em hipótese nenhuma).
- CREF obrigatório para personals.
- Aluno pode se cadastrar sem vínculo com personal.
- Aluno pode criar vínculo com personal posteriormente.

### Itens técnicos
- Migration de CPF/CREF + índices/constraints de unicidade.
- Validação backend (schemas + rotas + mensagens de erro claras).
- Ajustes de frontend (campos, máscaras, UX e textos).
- Backfill/compatibilidade para dados antigos.

Campos em aberto:
- Formato de CPF armazenado (normalizado vs mascarado): [A DEFINIR]
- Política para CREF internacional/exceções: [A DEFINIR]
- Estratégia de migração dos usuários sem CPF: [A DEFINIR]

## 2.2 API de CPF (autofill)

### Objetivo
Reduzir atrito de cadastro puxando dados para evitar preenchimento manual completo.

### Entregas
- Integração com provedor de consulta CPF (camada adapter).
- Fallback quando consulta falhar.
- Consentimento/termo de uso e trilha de auditoria.

Campos em aberto:
- Provedor escolhido: [A DEFINIR]
- Campos a autopreencher: [A DEFINIR]
- Política LGPD e retenção: [A DEFINIR]

## 2.3 Afiliados e afiliação perfeita

### Objetivo
Unificar lógica de afiliação para personal e aluno, com rastreabilidade.

### Entregas
- Regras para afiliado de aluno (comissionamento/atribuição).
- Fluxo de vínculo posterior aluno↔personal sem quebrar afiliação.
- Painel admin para auditoria de vínculo e comissões.

Campos em aberto:
- Regra financeira de afiliado para aluno: [A DEFINIR]
- Prioridade de atribuição (último clique, primeiro clique etc.): [A DEFINIR]

## 2.4 Super Admin com modo simulação

### Objetivo
Super admin alterna visualização e permissões para testar painéis reais.

### Entregas
- Toggle de modo: Super Admin / Personal / Aluno.
- Modo Personal com features de plano premium habilitadas.
- Modo Aluno padrão para revisão completa da experiência.
- Banner de contexto para evitar ações perigosas no modo simulado.

Campos em aberto:
- Limites de ação em modo simulado (somente leitura vs escrita): [A DEFINIR]
- Auditoria obrigatória de troca de modo: [A DEFINIR]

## 2.5 SEO em escala (pré-lançamento)

### Entrega
- Criação de páginas SEO em lotes.
- Todas as páginas em noindex até segunda.
- Checklist de abertura de indexação no gate final.

Campos em aberto:
- Quantidade de páginas por lote: [A DEFINIR]
- Clusters prioritários: [A DEFINIR]

## 2.6 Agentes Unipile em Workers (Instagram)

### Objetivo
Criar base do sistema próprio de automação e atendimento em tempo real.

### Fase inicial (esta semana)
- Estrutura de agentes no Worker (arquitetura e filas de eventos).
- Módulos iniciais:
  - postagem
  - resposta de DM
  - resposta a comentários
  - atendimento assistido
- Regras de segurança/limites/rate limit.

Campos em aberto:
- Catálogo de intents/respostas: [A DEFINIR]
- SLA de resposta: [A DEFINIR]
- Política de handoff humano: [A DEFINIR]

---

## 3) Cronograma diário (quinta → segunda)

## Quinta (26/02) — Planejamento fechado + base técnica

### Objetivos do dia
- Fechar arquitetura da semana.
- Abrir tasks técnicas por trilha.
- Garantir baseline de validação e docs.

### Entregas mínimas
- Documento de cronograma (este arquivo) ✅
- Backlog por trilha com owners [A DEFINIR]
- Definição de gates de sexta/sábado/domingo/segunda

### Gate do dia
- Aprovação executiva do escopo semanal

---

## Sexta (27/02) — Compliance + Fundações de dados

### Objetivos do dia
- Implementar CPF/CREF obrigatório e unicidade.
- Abrir fluxo de aluno sem vínculo obrigatório.

### Entregas mínimas
- Migration + constraints CPF único
- Validações backend/frontend de CPF/CREF
- Ajuste de cadastro aluno sem personal
- Testes unitários e de contrato

### Gate do dia
- Quality gate parcial (`lint`, `type-check`, `tests`) sem regressão

Campos em aberto:
- Estratégia de dados legados: [A DEFINIR]

---

## Sábado (28/02) — Afiliados + Modo Super Admin + SEO lote 1

### Objetivos do dia
- Fechar regras de afiliados para aluno.
- Entregar modo simulação do super admin.
- Publicar primeira onda de páginas SEO em noindex.

### Entregas mínimas
- Regras de afiliação aluno definidas no backend
- Toggle de modo super admin funcional
- Páginas SEO lote 1 publicadas com noindex
- Testes de autorização/simulação

### Gate do dia
- QA funcional das jornadas críticas

Campos em aberto:
- Escopo do lote 1 SEO: [A DEFINIR]

---

## Domingo (01/03) — Unipile Agents base + SEO lote 2 + hardening

### Objetivos do dia
- Subir base dos agentes Unipile no Worker.
- Expandir SEO lote 2 ainda em noindex.
- Hardening final de estabilidade.

### Entregas mínimas
- Estrutura de agentes em produção controlada
- Fluxos mínimos (post/DM/comment/reply) com segurança básica
- SEO lote 2 publicado em noindex
- Auditoria de segurança operacional

### Gate do dia
- Go/no-go pré-lançamento com pendências críticas zeradas

Campos em aberto:
- Escopo real de automações para segunda: [A DEFINIR]

---

## Segunda (02/03) — Launch Day

### Objetivos do dia
- Fechar validação final.
- Liberar indexação SEO após aprovação.
- Publicar release oficial com comunicação.

### Entregas mínimas
- Smoke auth e quality gate final
- Go/no-go final aprovado
- Mudança de noindex → index conforme checklist
- Deploy final + changelog + docs de release

### Gate final de lançamento
- Somente lançar se todos os blocos críticos estiverem verdes

Campos em aberto:
- Janela exata de deploy: [A DEFINIR]
- Plano de comunicação (interno/externo): [A DEFINIR]

---

## 4) Checklist operacional de lançamento

- [ ] Smoke auth autenticado
- [ ] Quality CI completo
- [ ] Go/no-go gerado
- [ ] Segurança web audit atualizada
- [ ] Migrations aplicadas e validadas
- [ ] SEO noindex removido apenas após gate final
- [ ] WhatsApp start/end das operações críticas
- [ ] Changelog e docs atualizados na mesma sessão

---

## 5) Riscos críticos da semana

1. Escopo grande em janela curta
   - Mitigação: priorização por impacto e gate diário.
2. Mudanças regulatórias (CPF/CREF) com dados legados
   - Mitigação: estratégia de transição e validação progressiva.
3. SEO em volume com risco técnico
   - Mitigação: templates estáveis e publicação por lotes.
4. Agentes Unipile em tempo real
   - Mitigação: fase inicial com limites, observabilidade e fallback humano.

Campos em aberto:
- Critérios de rollback por trilha: [A DEFINIR]

---

## 6) Espaço permanente para novas IDEIAS

### Ideias novas (backlog aberto)
- [A DEFINIR]
- [A DEFINIR]
- [A DEFINIR]

### Regra
Toda nova ideia entra aqui primeiro, depois é movida para sprint apenas se:
- tiver objetivo mensurável,
- tiver owner,
- tiver impacto e risco avaliados.

---

## 7) Próximo documento recomendado

Criar `PLANO-DETALHADO-ONDA-0-2026-03-02.md` com:
- owners reais,
- tarefas em nível de endpoint/tela,
- estimativa em horas,
- ordem de execução técnica.

Status atual:
- ✅ Documento detalhado criado em:
   - `docs/ULTRA-PLANO-MVP-PRODUCAO/PLANO-DETALHADO-ONDA-0-2026-03-02.md`

Estratégia de execução contínua:
- ✅ Sprint train sem pausa com deploy incremental definida em:
   - `docs/ULTRA-PLANO-MVP-PRODUCAO/SPRINT-TRAIN-SEM-PAUSA-COM-DEPLOYS-2026-03-02.md`

> Este cronograma foi montado para execução rápida com governança e abertura para evolução.  
> Os campos `[A DEFINIR]` devem ser preenchidos conforme você adicionar detalhes reais.
