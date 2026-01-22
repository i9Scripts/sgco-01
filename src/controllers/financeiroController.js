import { PrismaClient, FormaPagamento, StatusPagamento } from '@prisma/client';
const prisma = new PrismaClient();

const FINANCEIRO_BASE_PRICE = 100.0; // Preço base do atendimento em R$

// GET para exibir o formulário de cobrança para um paciente específico
export const renderizarCobranca = async (req, res) => {
  const { pacienteId } = req.params;
  const { parceiroId: queryParceiroId } = req.query; // Pega parceiroId da query string
  const consultorioId = req.session.consultorio.idConsultorio;

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { idPaciente: parseInt(pacienteId) },
    });

    if (!paciente) {
      req.flash('error', 'Paciente não encontrado.');
      return res.redirect('/pacientes'); // Ou para onde for apropriado
    }

    const parceiros = await prisma.parceiro.findMany({
      where: { consultorioId: consultorioId },
    });

    let parceiro = null;
    let descontoParceiro = 0;

    if (queryParceiroId) {
      parceiro = await prisma.parceiro.findUnique({
        where: { idParceiro: parseInt(queryParceiroId) },
      });
      if (parceiro) {
        descontoParceiro = parceiro.desconto.toNumber();
      }
    }

    const valorBruto = FINANCEIRO_BASE_PRICE;
    const valorDesconto = descontoParceiro;
    const valorFinal = valorBruto - valorDesconto;

    // Renderizar o formulário de cobrança
    res.render('financeiro/cobrar', {
      pageTitle: 'Registrar Cobrança',
      pageIcon: 'bi-cash-coin',
      paciente,
      parceiros,
      parceiro, // Passa o objeto parceiro para a view (pode ser null)
      valorBruto: valorBruto.toFixed(2),
      valorDesconto: valorDesconto.toFixed(2),
      valorFinal: valorFinal.toFixed(2),
      formasPagamento: Object.values(FormaPagamento), // Usar o enum importado
      messages: req.flash(),
    });
  } catch (error) {
    console.error('Erro ao renderizar formulário de cobrança:', error);
    req.flash('error', 'Erro ao carregar dados para cobrança.');
    res.redirect('/pacientes'); // Ou para onde for apropriado
  }
};

// POST para registrar um novo lançamento financeiro (pagamento)
export const processarCobranca = async (req, res) => {
  const {
    pacienteId,
    valorBruto,
    valorDesconto,
    valorFinal,
    formaPagamento,
    observacao,
    parceiroId, // Pode vir do formulário se houver uma seleção manual de parceiro
  } = req.body;
  const consultorioId = req.session.consultorio.idConsultorio;

  try {
    await prisma.lancamentoFinanceiro.create({
      data: {
        descricao: `Atendimento ao Paciente ${pacienteId}`, // Descrição padrão
        valorBruto: parseFloat(valorBruto),
        valorDesconto: parseFloat(valorDesconto),
        valorFinal: parseFloat(valorFinal),
        formaPagamento: formaPagamento, // Enum já formatado
        statusPagamento: 'Pago', // Assumimos que ao registrar, já foi pago
        observacao: observacao || null,
        paciente: { connect: { idPaciente: parseInt(pacienteId) } },
        consultorio: { connect: { idConsultorio: consultorioId } },
        ...(parceiroId && { parceiro: { connect: { idParceiro: parseInt(parceiroId) } } }),
      },
    });

    req.flash('success', 'Cobrança registrada com sucesso!');
    // Instead of adding to the queue, redirect to a confirmation page
    res.redirect(`/financeiro/confirmar-fila/${pacienteId}`);
  } catch (error) {
    console.error('Erro ao processar cobrança:', error);
    req.flash('error', 'Erro ao registrar cobrança.');
    res.redirect(`/financeiro/cobrar/${pacienteId}`); // Mantém na página de cobrança com erro
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
      messages: req.flash(),
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
      messages: req.flash(),
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
      messages: req.flash(),
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

    const pacientes = await prisma.paciente.findMany({
      where: { consultorioId: consultorioId },
      select: { idPaciente: true, nome: true, naFila: true },
      orderBy: { nome: 'asc' },
    });

    res.render('financeiro/selecionar-paciente', {
      pageTitle: 'Selecionar Paciente para Cobrança',
      pageIcon: 'bi-person-check',
      pacientes,
      messages: req.flash(),
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
      messages: req.flash(),
    });
  } catch (error) {
    console.error('Erro ao listar lançamentos financeiros:', error);
    req.flash('error', 'Erro ao carregar extrato financeiro.');
    res.redirect('/'); // Ou para onde for apropriado
  }
};
