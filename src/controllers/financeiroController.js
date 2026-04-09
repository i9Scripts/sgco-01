import { PrismaClient, FormaPagamento, StatusPagamento, StatusConsulta } from '@prisma/client';
const prisma = new PrismaClient();

// Função auxiliar para criar ou obter uma consulta vinculada ao paciente
async function obterOuCriarConsulta(pacienteId, consultorioId) {
  // Verificar se já existe uma consulta para o paciente
  let consulta = await prisma.consulta.findFirst({
    where: { pacienteId, consultorioId },
    orderBy: { createdAt: 'desc' },
  });

  // Se não existir, criar uma nova consulta
  if (!consulta) {
    const anamnese = await prisma.anamnese.findFirst({
      where: { pacienteId, consultorioId },
      orderBy: { createdAt: 'desc' },
    });

    consulta = await prisma.consulta.create({
      data: {
        paciente: { connect: { idPaciente: pacienteId } },
        consultorio: { connect: { idConsultorio: consultorioId } },
        anamnese: anamnese ? { connect: { idAnam: anamnese.idAnam } } : undefined,
        valorPago: 0,
        valorTotal: 0,
        statusConsulta: StatusConsulta.Agendada,
        statusPagamento: StatusPagamento.Pendente,
      },
    });
  }

  return consulta;
}

// GET para exibir o formulário de cobrança para um paciente específico
export const renderizarCobranca = async (req, res) => {
  const { pacienteId } = req.params;
  const { parceiroId: queryParceiroId } = req.query;
  const consultorioId = req.session.consultorio.idConsultorio;

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { idPaciente: parseInt(pacienteId) },
    });

    if (!paciente) {
      req.flash('error', 'Paciente não encontrado.');
      return res.redirect('/pacientes');
    }

    const parceiros = await prisma.parceiro.findMany({
      where: { consultorioId },
    });

    const produtos = await prisma.produto.findMany({
      where: { consultorioId },
    });

    // `Servico` model may not exist yet in Prisma schema; guard the call
    let servicos = [];
    if (prisma.servico && typeof prisma.servico.findMany === 'function') {
      servicos = await prisma.servico.findMany({
        where: { consultorioId },
      });
    }

    let parceiro = null;
    let descontoParceiro = 0;

    if (queryParceiroId) {
      parceiro = await prisma.parceiro.findUnique({
        where: { idParceiro: parseInt(queryParceiroId) },
      });
      if (parceiro) descontoParceiro = parceiro.desconto.toNumber();
    }

    res.render('financeiro/cobrar', {
      pageTitle: 'Registrar Cobrança',
      pageIcon: 'bi-cash-coin',
      paciente,
      parceiros,
      produtos,
      servicos,
      parceiro,
      valorDesconto: descontoParceiro.toFixed(2),
      formasPagamento: Object.values(FormaPagamento),
    });
  } catch (error) {
    console.error('Erro ao renderizar formulário de cobrança:', error);
    req.flash('error', 'Erro ao carregar dados para cobrança.');
    res.redirect('/pacientes');
  }
};

// POST para registrar um novo lançamento financeiro (pagamento) com múltiplos itens
export const processarCobranca = async (req, res) => {
  const {
    pacienteId,
    items: itemsJson,
    valorDesconto,
    valorFinal: valorFinalFromClient,
    dataPagamento,
    formaPagamento,
    observacao,
    parceiroId,
  } = req.body;

  const consultorioId = req.session.consultorio.idConsultorio;
  let items = [];

  try {
    if (itemsJson) {
      items = JSON.parse(itemsJson);
    }

    // Recalcular total a partir dos items por segurança
    const valorBruto = items.reduce((sum, it) => {
      const unit = parseFloat(it.valorUnitario) || 0;
      const qty = parseInt(it.quantidade, 10) || 1;
      return sum + unit * qty;
    }, 0);

    const desconto = parseFloat(valorDesconto) || 0;
    const valorFinal = parseFloat(valorFinalFromClient) || valorBruto - desconto;

    // Validação/normalização da forma de pagamento
    const formasValidas = Object.values(FormaPagamento);
    let forma = formaPagamento;
    if (!forma || !formasValidas.includes(forma)) {
      forma = formasValidas[0];
    }

    // Obter ou criar consulta vinculada ao paciente
    const consulta = await obterOuCriarConsulta(parseInt(pacienteId), consultorioId);

    await prisma.lancamentoFinanceiro.create({
      data: {
        valorBruto: valorBruto,
        valorDesconto: desconto,
        valorFinal: valorFinal,
        formaPagamento: forma,
        statusPagamento: forma === FormaPagamento.Convenio ? StatusPagamento.Pendente : StatusPagamento.Pago,
        ...(dataPagamento && { dataPagamento: new Date(dataPagamento) }),
        observacao: observacao || null,
        paciente: { connect: { idPaciente: parseInt(pacienteId) } },
        consultorio: { connect: { idConsultorio: consultorioId } },
        ...(parceiroId && { parceiro: { connect: { idParceiro: parseInt(parceiroId) } } }),
        items: {
          create: items.map((it) => ({
            quantidade: parseInt(it.quantidade || 1, 10),
            valorUnitario: parseFloat(it.valorUnitario),
            ...(it.produtoId && { produto: { connect: { idProduto: parseInt(it.produtoId) } } }),
            ...(it.servicoId && { servico: { connect: { idServico: parseInt(it.servicoId) } } }),
            consultorio: { connect: { idConsultorio: consultorioId } },
            consulta: { connect: { idConsulta: consulta.idConsulta } },
          })),
        },
      },
    });

    req.flash('success', 'Cobrança registrada com sucesso!');
    res.redirect(`/financeiro/confirmar-fila/${pacienteId}`);
  } catch (error) {
    console.error('Erro ao processar cobrança:', error);
    req.flash('error', 'Erro ao registrar cobrança.');
    res.redirect(`/financeiro/cobrar/${pacienteId}`);
  }
};

// GET para renderizar a página de confirmação para adicionar à fila
export const renderizarConfirmacaoFila = async (req, res) => {
  const { pacienteId } = req.params;
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { idPaciente: parseInt(pacienteId) },
    });

    if (!paciente) {
      req.flash('error', 'Paciente não encontrado.');
      return res.redirect('/');
    }

    res.render('financeiro/confirmar-fila', {
      pageTitle: 'Confirmar Fila de Espera',
      pageIcon: 'bi-question-circle',
      paciente,
    });
  } catch (error) {
    console.error('Erro ao renderizar página de confirmação:', error);
    req.flash('error', 'Ocorreu um erro.');
    res.redirect('/');
  }
};

// GET para exibir a página com opções de relatórios financeiros
export const renderizarRelatorios = async (req, res) => {
  try {
    res.render('financeiro/relatorios', {
      pageTitle: 'Relatórios Financeiros',
      pageIcon: 'bi-graph-up',
    });
  } catch (error) {
    console.error('Erro ao renderizar página de relatórios:', error);
    req.flash('error', 'Erro ao carregar relatórios.');
    res.redirect('/');
  }
};

// GET - Lista parceiros com pagamentos pendentes no período selecionado
export const listarParceirosPendentes = async (req, res) => {
  const consultorioId = req.session.consultorio.idConsultorio;
  try {
    const { startDate: qStartDate, endDate: qEndDate } = req.query;

    // Parse date strings as UTC boundaries to avoid timezone shifts
    let start = null;
    let end = null;
    const parseUtcStart = (s) => {
      const parts = (s || '').split('-').map(Number);
      if (parts.length !== 3) return null;
      const [y, m, d] = parts;
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    };
    const parseUtcEnd = (s) => {
      const parts = (s || '').split('-').map(Number);
      if (parts.length !== 3) return null;
      const [y, m, d] = parts;
      return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
    };

    if (qStartDate) start = parseUtcStart(qStartDate);
    if (qEndDate) end = parseUtcEnd(qEndDate);

    // Build where clause for consultas: parceiroId not null, pagamentoRealizado = false
    const whereClause = {
      consultorioId,
      parceiroId: { not: null },
      pagamentoRealizado: false,
    };

    if (start && end) {
      whereClause.createdAt = { gte: start, lte: end };
    } else if (start) {
      whereClause.createdAt = { gte: start };
    } else if (end) {
      whereClause.createdAt = { lte: end };
    }

    const consultas = await prisma.consulta.findMany({
      where: whereClause,
      include: { parceiro: true },
      orderBy: { createdAt: 'desc' },
    });

    // Agrupar por parceiro
    const mapa = new Map();
    consultas.forEach((c) => {
      const pid = c.parceiroId;
      const nome = c.parceiro?.nome || '—';
      const valor = parseFloat(c.valorAPagarParceiro || 0);
      if (!mapa.has(pid)) mapa.set(pid, { parceiroId: pid, nome, total: 0, count: 0 });
      const cur = mapa.get(pid);
      cur.total += valor;
      cur.count += 1;
    });

    const parceiros = Array.from(mapa.values());

    res.render('financeiro/relatorios-parceiros-pendentes', {
      pageTitle: 'Parceiros Pendentes',
      pageIcon: 'bi-people',
      parceiros,
      startDate: qStartDate || '',
      endDate: qEndDate || '',
    });
  } catch (error) {
    console.error('Erro ao listar parceiros pendentes:', error);
    req.flash('error', 'Erro ao gerar relatório de parceiros pendentes.');
    res.redirect('/financeiro/relatorios');
  }
};

// GET - Relatório: Vendas do dia
export const vendasDoDia = async (req, res) => {
  const consultorioId = req.session.consultorio.idConsultorio;
  try {
    // Paginação e filtros via query params
    const q = req.query.q || '';
    const formaFilter = req.query.forma || '';
    const page = parseInt(req.query.page || '1', 10) || 1;
    const pageSize = parseInt(req.query.pageSize || '15', 10) || 15;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const whereClause = {
      consultorioId: consultorioId,
      createdAt: { gte: start, lte: end },
    };

    if (formaFilter) whereClause.formaPagamento = formaFilter;

    if (q) {
      whereClause.OR = [
        { paciente: { nome: { contains: q } } },
        { parceiro: { nome: { contains: q } } },
        { observacao: { contains: q } },
      ];
    }

    const totalCount = await prisma.lancamentoFinanceiro.count({ where: whereClause });

    const totalAgg = await prisma.lancamentoFinanceiro.aggregate({
      where: whereClause,
      _sum: { valorFinal: true },
    });

    const vendas = await prisma.lancamentoFinanceiro.findMany({
      where: whereClause,
      include: {
        paciente: { select: { nome: true } },
        parceiro: { select: { nome: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = (totalAgg._sum.valorFinal || 0).toFixed(2);

    const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

    res.render('financeiro/vendas-do-dia', {
      pageTitle: 'Vendas do Dia',
      pageIcon: 'bi-calendar-day',
      vendas,
      total,
      q,
      formaFilter,
      page,
      pageCount,
      pageSize,
      formasPagamento: Object.values(FormaPagamento),
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas do dia:', error);
    req.flash('error', 'Erro ao gerar relatório de vendas do dia.');
    res.redirect('/financeiro/relatorios');
  }
};

// GET - Permite ao profissional selecionar um paciente para cobrar
export const renderizarSelecionarPaciente = async (req, res) => {
  try {
    const consultorioId = req.session.consultorio.idConsultorio;
    const searchQuery = req.query.search;

    let whereClause = { consultorioId: consultorioId };

    if (searchQuery) {
      whereClause.nome = {
        contains: searchQuery,
      };
    }

    const pacientes = await prisma.paciente.findMany({
      where: whereClause,
      select: { idPaciente: true, nome: true, naFila: true },
      orderBy: { nome: 'asc' },
    });

    res.render('financeiro/selecionar-paciente', {
      pageTitle: 'Selecionar Paciente para Cobrança',
      pageIcon: 'bi-person-check',
      pacientes,
      query: searchQuery, // Passa o termo de busca para a view
    });
  } catch (error) {
    console.error('Erro ao renderizar seleção de paciente:', error);
    req.flash('error', 'Erro ao carregar lista de pacientes.');
    res.redirect('/profissionais/dashboard');
  }
};

// GET para exibir o extrato de lançamentos financeiros
export const listarLancamentos = async (req, res) => {
  const consultorioId = req.session.consultorio.idConsultorio;

  try {
    // Filtragem por período (opcional)
    const { startDate: qStartDate, endDate: qEndDate } = req.query;
    const whereClause = { consultorioId: consultorioId };

    // Parse date strings as UTC boundaries to avoid timezone shifts
    let start = null;
    let end = null;

    const parseUtcStart = (s) => {
      const parts = (s || '').split('-').map(Number);
      if (parts.length !== 3) return null;
      const [y, m, d] = parts;
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    };

    const parseUtcEnd = (s) => {
      const parts = (s || '').split('-').map(Number);
      if (parts.length !== 3) return null;
      const [y, m, d] = parts;
      return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
    };

    if (qStartDate) start = parseUtcStart(qStartDate);
    if (qEndDate) end = parseUtcEnd(qEndDate);

    // Quando o usuário filtra por período, o filtro deve ser aplicado sobre `dataPagamento`
    let orderByClause = { createdAt: 'desc' };
    if (start && end) {
      whereClause.dataPagamento = { gte: start, lte: end };
      orderByClause = { dataPagamento: 'desc' };
    } else if (start) {
      whereClause.dataPagamento = { gte: start };
      orderByClause = { dataPagamento: 'desc' };
    } else if (end) {
      whereClause.dataPagamento = { lte: end };
      orderByClause = { dataPagamento: 'desc' };
    }

    const lancamentos = await prisma.lancamentoFinanceiro.findMany({
      where: whereClause,
      include: {
        paciente: { select: { nome: true } },
        parceiro: { select: { nome: true } },
      },
      orderBy: orderByClause,
    });

    res.render('financeiro/extrato', {
      pageTitle: 'Extrato Financeiro',
      pageIcon: 'bi-cash-stack',
      lancamentos,
      startDate: qStartDate || '',
      endDate: qEndDate || '',
    });
  } catch (error) {
    console.error('Erro ao listar lançamentos financeiros:', error);
    req.flash('error', 'Erro ao carregar extrato financeiro.');
    res.redirect('/'); // Ou para onde for apropriado
  }
};

// GET para o Dashboard Financeiro
export const renderizarDashboard = async (req, res) => {
  const consultorioId = req.session.consultorio.idConsultorio;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  try {
    // 1. Lançamentos a Receber (Pendente)
    const aReceber = await prisma.lancamentoFinanceiro.aggregate({
      where: {
        consultorioId,
        statusPagamento: StatusPagamento.Pendente,
      },
      _sum: { valorFinal: true },
    });

    // 2. Lançamentos a Pagar (Consultas com parceiro pendente)
    const aPagar = await prisma.consulta.aggregate({
      where: {
        consultorioId,
        parceiroId: { not: null },
        pagamentoRealizado: false,
      },
      _sum: { valorAPagarParceiro: true },
    });
    // 3. Saldo Mensal (Ganhos pagos no mês)
    const saldoMensal = await prisma.lancamentoFinanceiro.aggregate({
      where: {
        consultorioId,
        statusPagamento: StatusPagamento.Pago,
        dataPagamento: { gte: startOfMonth },
      },
      _sum: { valorFinal: true },
    });
    // 4. Atrasados (Pendente com data vencida)
    const atrasados = await prisma.lancamentoFinanceiro.aggregate({
      where: {
        consultorioId,
        statusPagamento: StatusPagamento.Pendente,
        dataPagamento: { lt: now },
      },
      _sum: { valorFinal: true },
    });
    // Lista de lançamentos recentes para a tabela
    const lancamentosRecentes = await prisma.lancamentoFinanceiro.findMany({
      where: { consultorioId },
      include: {
        paciente: { select: { nome: true } },
        items: { include: { produto: true, servico: true } },
      },
      orderBy: { dataPagamento: 'desc' },
      take: 10,
    });

    res.render('financeiro/dashboard', {
      pageTitle: 'Gestão Financeira',
      pageIcon: 'bi-speedometer2',
      stats: {
        totalAReceber: (aReceber._sum.valorFinal | 0).toFixed(2),
        totalAPagar: (aPagar._sum.valorAPagarParceiro || 0).toFixed(2),
        saldoMensal: (saldoMensal._sum.valorFinal || 0).toFixed(2),
        atrasado: (atrasados._sum.valorFinal || 0).toFixed(2),
      },
      lancamentos: lancamentosRecentes,
    });
  } catch (error) {
    console.error('Erro ao renderizar dashboard financeiro:', error);
    req.flash('error', 'Erro ao carregar dashboard financeiro.');
    res.redirect('/');
  }
};
