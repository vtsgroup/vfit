// ============================================
// faqs.ts — Dados estáticos de FAQs para páginas legais e landing
// ============================================
//
// O que faz:
//   Define arrays de FaqItem para uso em FaqInline e FaqSection.
//   Dados estáticos — sem chamada de API.
//
// Exports principais:
//   FAQ_TERMOS — FAQs da página de Termos de Uso
//   FAQ_PRIVACIDADE — FAQs da Política de Privacidade
//   FAQ_LGPD — FAQs da página LGPD
//   FAQ_PRICING — FAQs da página de Preços
import type { FaqItem } from '@/components/shared/faq-inline'

/* ─── Termos de Uso ─── */
export const FAQ_TERMOS: FaqItem[] = [
  {
    question: 'Preciso aceitar os Termos para usar a plataforma?',
    answer:
      'Sim. Ao criar uma conta ou continuar usando o VFIT, você concorda integralmente com os Termos de Uso. Se discordar de qualquer cláusula, interrompa o uso imediatamente.',
  },
  {
    question: 'O que acontece se eu violar os Termos?',
    answer:
      'O VFIT pode suspender ou encerrar sua conta sem aviso prévio em caso de violação. Dependendo da gravidade, poderemos tomar medidas legais cabíveis.',
  },
  {
    question: 'Os Termos podem mudar sem aviso?',
    answer:
      'Sim, os Termos podem ser atualizados a qualquer momento. Notificamos alterações significativas por e-mail ou na plataforma. O uso continuado após alterações constitui aceitação tácita.',
  },
]

/* ─── Política de Privacidade ─── */
export const FAQ_PRIVACIDADE: FaqItem[] = [
  {
    question: 'Quais dados pessoais o VFIT coleta?',
    answer:
      'Coletamos dados de cadastro (nome, e-mail, telefone), dados de saúde dos alunos (peso, altura, medidas), dados financeiros (via Asaas, PCI DSS compliant) e dados de navegação anonimizados (Cloudflare Analytics).',
  },
  {
    question: 'Meus dados são compartilhados com terceiros?',
    answer:
      'Compartilhamos dados apenas com prestadores essenciais: Asaas (pagamentos), Cloudflare (hospedagem), Neon (banco de dados) e OneSignal (notificações). Nunca vendemos dados pessoais.',
  },
  {
    question: 'Como posso solicitar a exclusão dos meus dados?',
    answer:
      'Você pode excluir sua conta diretamente nas Configurações do app, ou enviar um e-mail para contato@vfit.app.br. A exclusão é processada em até 15 dias úteis conforme a LGPD.',
  },
  {
    question: 'Os dados são criptografados?',
    answer:
      'Sim. Usamos TLS 1.3 para dados em trânsito, senhas são armazenadas com bcrypt (cost 12), e o banco de dados PostgreSQL opera com SSL obrigatório.',
  },
]

/* ─── Política de Cookies ─── */
export const FAQ_COOKIES: FaqItem[] = [
  {
    question: 'O VFIT usa cookies de publicidade?',
    answer:
      'Não. Não utilizamos cookies de anúncios ou rastreamento de terceiros. Nosso analytics é privacy-first via Cloudflare Analytics Engine.',
  },
  {
    question: 'Posso desativar os cookies?',
    answer:
      'Cookies estritamente necessários (autenticação e segurança) não podem ser desativados pois são essenciais para o funcionamento. Cookies de analytics podem ser gerenciados nas configurações do seu navegador.',
  },
  {
    question: 'Quais cookies são obrigatórios?',
    answer:
      'São obrigatórios: token de sessão (JWT), preferência de tema, consent de cookies e tokens CSRF. Sem eles, a plataforma não funciona corretamente.',
  },
]

/* ─── LGPD ─── */
export const FAQ_LGPD: FaqItem[] = [
  {
    question: 'O que é a LGPD e como ela me protege?',
    answer:
      'A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) garante seus direitos sobre dados pessoais: acesso, correção, exclusão, portabilidade e revogação de consentimento.',
  },
  {
    question: 'O VFIT tem um Encarregado de Dados (DPO)?',
    answer:
      'Sim. Para exercer seus direitos ou esclarecer dúvidas, entre em contato com nosso DPO pelo e-mail lgpd@vfit.app.br.',
  },
  {
    question: 'Em quanto tempo minha solicitação LGPD é atendida?',
    answer:
      'Solicitações de exclusão são processadas em até 15 dias úteis. Solicitações de acesso e portabilidade são atendidas em até 5 dias úteis, conforme Art. 18 da LGPD.',
  },
]

/* ─── Excluir Conta ─── */
export const FAQ_EXCLUIR_CONTA: FaqItem[] = [
  {
    question: 'A exclusão da conta é reversível?',
    answer:
      'Não. Após a confirmação, todos os dados pessoais são permanentemente excluídos ou anonimizados. Não é possível recuperar a conta depois.',
  },
  {
    question: 'Meus dados financeiros também são excluídos?',
    answer:
      'Dados pessoais vinculados a pagamentos são anonimizados. Registros financeiros agregados podem ser retidos por até 5 anos conforme legislação fiscal (Art. 174, CTN), mas sem vinculação a dados identificáveis.',
  },
  {
    question: 'Quanto tempo demora a exclusão?',
    answer:
      'A exclusão é processada em até 15 dias úteis após a solicitação, conforme Art. 18 da LGPD. Você receberá uma confirmação por e-mail quando o processo for concluído.',
  },
]

/* ─── Sobre ─── */
export const FAQ_SOBRE: FaqItem[] = [
  {
    question: 'O que é o VFIT?',
    answer:
      'O VFIT é o app mais completo para personal trainers no Brasil. Combina gestão de alunos, prescrição de treinos com inteligência artificial, avaliações físicas, cobranças automáticas via Pix, gamificação e programa de afiliados — tudo em um só lugar.',
  },
  {
    question: 'Desde quando o VFIT existe?',
    answer:
      'O VFIT foi fundado em 2025 com a missão de empoderar personal trainers brasileiros com tecnologia de ponta. Hoje atendemos centenas de profissionais em todo o Brasil.',
  },
  {
    question: 'A plataforma é brasileira?',
    answer:
      'Sim, 100% brasileira. Nossa infraestrutura, suporte e pagamentos são pensados para o mercado fitness nacional, com PIX, boleto e integração completa com a legislação brasileira (LGPD).',
  },
]

/* ─── Contato ─── */
export const FAQ_CONTATO: FaqItem[] = [
  {
    question: 'Qual o prazo de resposta do suporte?',
    answer:
      'Respondemos e-mails em até 24 horas úteis. Para assuntos urgentes relacionados a pagamentos ou acesso, o atendimento via WhatsApp é mais rápido.',
  },
  {
    question: 'Vocês oferecem suporte técnico gratuito?',
    answer:
      'Sim, todos os planos — incluindo o gratuito — têm acesso ao suporte por e-mail. Planos Pro e Business contam com suporte prioritário.',
  },
  {
    question: 'Como faço para reportar um bug ou sugerir uma funcionalidade?',
    answer:
      'Envie um e-mail para contato@vfit.app.br com o assunto "Bug" ou "Sugestão", ou use o formulário de feedback disponível dentro da plataforma em Configurações.',
  },
]

/* ─── Carreiras ─── */
export const FAQ_CARREIRAS: FaqItem[] = [
  {
    question: 'As vagas são 100% remotas?',
    answer:
      'Sim, todas as posições no VFIT são 100% remotas. Você pode trabalhar de qualquer lugar do Brasil com horário flexível.',
  },
  {
    question: 'Como funciona o processo seletivo?',
    answer:
      'O processo tem 3 etapas: análise de currículo, conversa técnica (30-45min) e um desafio prático relacionado à vaga. Todo o processo é remoto e leva cerca de 2 semanas.',
  },
  {
    question: 'Posso me candidatar mesmo sem vaga aberta na minha área?',
    answer:
      'Sim! Envie seu currículo para vagas@vfit.app.br com o assunto "Banco de Talentos". Quando surgir uma oportunidade compatível, entraremos em contato.',
  },
]

/* ─── Blog: IA para Personal Trainer ─── */
export const FAQ_BLOG_IA: FaqItem[] = [
  {
    question: 'A IA substitui o personal trainer?',
    answer:
      'Não. Segundo o ACSM (American College of Sports Medicine), a prescrição de exercícios exige avaliação individualizada e supervisão profissional. A IA é uma ferramenta de apoio que automatiza tarefas operacionais — montagem de treinos, sugestões de exercícios, periodização inicial — mas o olhar clínico, a correção técnica e a relação com o aluno continuam sendo exclusivos do profissional.',
  },
  {
    question: 'Preciso saber programar para usar IA nos treinos?',
    answer:
      'Não. Plataformas como o VFIT já possuem IA integrada e pronta para uso. Você preenche o perfil do aluno (objetivos, limitações, equipamentos) e a IA gera sugestões completas de treino. Basta revisar, ajustar o que precisar e publicar — sem nenhum código ou conhecimento técnico.',
  },
  {
    question: 'Qual a diferença entre ChatGPT e uma IA especializada para personal trainers?',
    answer:
      'O ChatGPT gera treinos genéricos sem contexto — não conhece o histórico do aluno, não rastreia cargas anteriores e não acessa avaliações físicas. Uma IA especializada, como a do VFIT, considera progressão de cargas, frequência de execução, RPE e dados da avaliação para sugestões muito mais precisas e seguras, alinhadas às diretrizes da NSCA (National Strength and Conditioning Association).',
  },
]

/* ─── Blog: Retenção de Alunos ─── */
export const FAQ_BLOG_RETENCAO: FaqItem[] = [
  {
    question: 'Qual a taxa normal de churn para personal trainers?',
    answer:
      'Segundo o relatório anual da IHRSA (International Health, Racquet & Sportsclub Association), a taxa média de churn no mercado fitness é de 30-50% nos primeiros 3 meses. Com estratégias de retenção estruturadas — onboarding nos 14 primeiros dias, acompanhamento semanal e cobrança automática — é possível reduzir para menos de 15%.',
  },
  {
    question: 'Gamificação realmente funciona para reter alunos?',
    answer:
      'Sim. Pesquisas em behavioral design (como o modelo Hook de Nir Eyal) mostram que sistemas de recompensa variável — badges, XP, rankings — criam loops de motivação intrínseca. Na prática, alunos em programas gamificados apresentam 2x mais engajamento semanal e permanecem em média 4 meses a mais na base.',
  },
  {
    question: 'Quando devo intervir se um aluno parar de treinar?',
    answer:
      'Idealmente em até 48 horas após a última ausência não planejada. O ACE (American Council on Exercise) recomenda contato proativo e empático — não punitivo. Uma mensagem simples como "Vi que não treinou essa semana, está tudo bem?" recupera até 40% dos alunos em risco, segundo dados de mercado.',
  },
]

/* ─── Blog: Cobrança Automática ─── */
export const FAQ_BLOG_COBRANCA: FaqItem[] = [
  {
    question: 'Qual o melhor meio de pagamento para personal trainer?',
    answer:
      'Depende do perfil do aluno. PIX é o mais rápido e tem a menor taxa (~1%), sendo ideal para pagamentos pontuais. Para recorrência automática, o cartão de crédito é superior pois cobra automaticamente todo mês sem ação do aluno — segundo o Banco Central, transações recorrentes por cartão têm 95% de taxa de sucesso vs 78% do boleto.',
  },
  {
    question: 'Cobrança automática assusta o aluno?',
    answer:
      'Não, desde que haja transparência. Informe datas, valores e envie lembretes preventivos (D-3 e D-0). Na prática, pesquisas de UX em fintech mostram que 87% dos consumidores preferem a comodidade de pagamentos automáticos — o atrito de "lembrar de pagar" é o maior causador de inadimplência não intencional.',
  },
  {
    question: 'O que fazer quando um aluno atrasa o pagamento?',
    answer:
      'Use uma régua de lembretes automática progressiva: lembrete empático no dia do vencimento (D-0), notificação de atraso D+1, reenvio de link de pagamento D+3, e aviso de restrição de acesso D+7. O SEBRAE recomenda nunca cobrar pessoalmente — além de desconfortável, reduz a percepção profissional. Deixe o sistema automatizar.',
  },
]

/* ─── Pricing ─── */
export const FAQ_PRICING: FaqItem[] = [
  {
    question: 'Profissional precisa assinar plano para usar o VFIT?',
    answer:
      'Nao. O modelo atual nao exige assinatura obrigatoria de personal ou nutricionista para operar no VFIT.',
  },
  {
    question: 'Como o VFIT monetiza agora?',
    answer:
      'A receita principal vem de alunos pagantes e de consultorias oficiais com pagamento dentro da API da plataforma.',
  },
  {
    question: 'Consultoria pode ser cobrada fora do VFIT?',
    answer:
      'Para consultoria oficial da plataforma, nao. O fluxo exige pagamento confirmado no VFIT antes da entrega premium.',
  },
  {
    question: 'Quais pagamentos continuam no produto?',
    answer:
      'Pagamentos de aluno e consultoria continuam com PIX, cartao e boleto, processados via integracao de pagamento da plataforma.',
  },
  {
    question: 'O aluno premium continua com assinatura?',
    answer:
      'Sim. O billing do aluno permanece ativo e separado do fluxo de creator.',
  },
  {
    question: 'O que muda para quem ja usava plano de creator?',
    answer:
      'Os fluxos legados de assinatura de creator foram descontinuados e a operacao segue no modelo student-first.',
  },
]
