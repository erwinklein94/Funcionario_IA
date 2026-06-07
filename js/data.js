/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Dados-semente
   ========================================================= */

/* OFERTAS publicadas por PROGRAMADORES
   type: 'hire'  -> funcionário IA pronto
   type: 'maint' -> serviço de manutenção / operação (mensal) */
const SEED_LISTINGS = [
  {
    id: 'l-001', type: 'hire', title: 'ANALYST-7 · Analista de Dados',
    role: 'Analista de Dados Financeiros', dev: 'núcleo.kernel',
    price: 4800, unit: 'única',
    summary: 'Agente que ingere planilhas e ERPs, gera relatórios semanais e responde perguntas em linguagem natural sobre os números.',
    tasks: [
      'Consolidar dados de vendas de múltiplas fontes',
      'Gerar dashboards e relatórios automáticos',
      'Detectar anomalias e desvios de meta',
      'Responder perguntas via chat sobre indicadores'
    ],
    stack: ['Python', 'LangChain', 'Postgres', 'GPT-4o']
  },
  {
    id: 'l-002', type: 'hire', title: 'SDR-AUTO · Pré-vendas',
    role: 'Representante de Pré-vendas (SDR)', dev: 'lia.systems',
    price: 3200, unit: 'única',
    summary: 'Qualifica leads por e-mail e WhatsApp, agenda reuniões no calendário e atualiza o CRM sozinho.',
    tasks: [
      'Responder e qualificar leads 24/7',
      'Agendar reuniões automaticamente',
      'Atualizar status no CRM (HubSpot/Pipedrive)',
      'Enviar follow-ups personalizados'
    ],
    stack: ['Node.js', 'OpenAI', 'WhatsApp API', 'HubSpot']
  },
  {
    id: 'l-003', type: 'maint', title: 'Operação & Tuning · ANALYST-7',
    role: 'Manutenção de Agente', dev: 'núcleo.kernel',
    price: 890, unit: 'mês',
    summary: 'Monitoramento, ajuste de prompts, atualização de modelo e suporte para qualquer funcionário IA já em produção.',
    tasks: [
      'Monitorar custo de tokens e desempenho',
      'Reduzir alucinações e ajustar prompts',
      'Atualizar para novos modelos quando saírem',
      'Suporte e correções em até 24h'
    ],
    stack: ['Observability', 'Eval', 'Prompt Eng.']
  },
  {
    id: 'l-004', type: 'hire', title: 'SUPPORT-TIER1 · Suporte N1',
    role: 'Atendente de Suporte Nível 1', dev: 'mira.dev',
    price: 2600, unit: 'única',
    summary: 'Atende tickets, consulta a base de conhecimento e escala só o que humano precisa ver.',
    tasks: [
      'Responder tickets de suporte recorrentes',
      'Buscar respostas na base de conhecimento (RAG)',
      'Classificar e escalar casos complexos',
      'Manter tom de voz da marca'
    ],
    stack: ['RAG', 'Zendesk', 'Claude', 'Pinecone']
  },
  {
    id: 'l-005', type: 'maint', title: 'Plantão & SLA · qualquer agente',
    role: 'Manutenção de Agente', dev: 'mira.dev',
    price: 1200, unit: 'mês',
    summary: 'Plantão mensal com SLA, ajustes de comportamento e relatório de desempenho do seu funcionário IA.',
    tasks: [
      'Plantão com SLA de resposta',
      'Ajustes mensais de comportamento',
      'Relatório de uso e qualidade',
      'Backups e versionamento de prompts'
    ],
    stack: ['SLA', 'Monitoring', 'Versioning']
  }
];

/* VAGAS publicadas por CLIENTES (o que procuram) */
const SEED_JOBS = [
  {
    id: 'j-001', type: 'job', title: 'Procuro: Analista de Estoque IA',
    role: 'Analista de Estoque / Compras', client: 'Distribuidora Norte',
    budget: 5000, unit: 'única',
    summary: 'Distribuidora quer um agente que preveja ruptura de estoque e sugira pedidos de compra automaticamente.',
    tasks: [
      'Ler movimentação de estoque do ERP (Bling)',
      'Prever quando cada item vai acabar',
      'Sugerir ordens de compra com prazo',
      'Alertar gestor sobre itens críticos por e-mail'
    ],
    stack: ['Integração ERP', 'Previsão de demanda'],
    posted: 'há 2 dias'
  },
  {
    id: 'j-002', type: 'job', title: 'Procuro: Redator IA para blog',
    role: 'Redator de Conteúdo SEO', client: 'agência Vértice',
    budget: 1800, unit: 'mês',
    summary: 'Precisamos de um agente que escreva 20 artigos/mês otimizados para SEO seguindo nosso guia de marca.',
    tasks: [
      'Pesquisar palavras-chave por tópico',
      'Escrever artigos de 1.200+ palavras',
      'Seguir tom de voz e diretrizes da marca',
      'Entregar rascunho no WordPress'
    ],
    stack: ['SEO', 'WordPress API', 'Brand voice'],
    posted: 'há 5 horas'
  },
  {
    id: 'j-003', type: 'job', title: 'Procuro: Recrutador IA (triagem)',
    role: 'Analista de Recrutamento', client: 'TechFolks RH',
    budget: 3500, unit: 'única',
    summary: 'Queremos um agente que faça a triagem inicial de currículos e a primeira entrevista por texto.',
    tasks: [
      'Ler e pontuar currículos contra a vaga',
      'Conduzir entrevista inicial por chat',
      'Resumir candidatos para o recrutador humano',
      'Marcar entrevistas dos aprovados'
    ],
    stack: ['Parsing CV', 'Scoring', 'Calendário'],
    posted: 'há 1 dia'
  }
];
