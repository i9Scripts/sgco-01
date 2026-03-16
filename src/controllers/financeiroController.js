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
        descricao: `Venda para o paciente ${pacienteId}`,
        valorBruto: valorBruto,
        valorDesconto: desconto,
        valorFinal: valorFinal,
        formaPagamento: forma,
        statusPagamento: 'Pago',
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

// GET - Relatório: Vendas do dia
export const vendasDoDia = async (req, res) => {
  const consultorioId = req.session.consultorio.idConsultorio;
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const vendas = await prisma.lancamentoFinanceiro.findMany({
      where: {
        consultorioId: consultorioId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        paciente: { select: { nome: true } },
        parceiro: { select: { nome: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = vendas.reduce((sum, v) => sum + (parseFloat(v.valorFinal) || 0), 0);

    res.render('financeiro/vendas-do-dia', {
      pageTitle: 'Vendas do Dia',
      pageIcon: 'bi-calendar-day',
      vendas,
      total: total.toFixed(2),
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
    const lancamentos = await prisma.lancamentoFinanceiro.findMany({
      where: { consultorioId: consultorioId },
      include: {
        paciente: {
          select: { nome: true },
        },
        parceiro: {
          select: { nome: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.render('financeiro/extrato', {
      pageTitle: 'Extrato Financeiro',
      pageIcon: 'bi-cash-stack',
      lancamentos,
    });
  } catch (error) {
    console.error('Erro ao listar lançamentos financeiros:', error);
    req.flash('error', 'Erro ao carregar extrato financeiro.');
    res.redirect('/'); // Ou para onde for apropriado
  }
};
