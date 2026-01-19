import { PrismaClient, FormaPagamento, StatusPagamento } from '@prisma/client';
const prisma = new PrismaClient();

const FINANCEIRO_BASE_PRICE = 100.00; // Preço base do atendimento em R$

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
        parceiroId // Pode vir do formulário se houver uma seleção manual de parceiro
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

        await prisma.paciente.update({
            where: { idPaciente: parseInt(pacienteId) },
            data: {
                naFila: true, // Adiciona o paciente à fila
            },
        });

        req.flash('success', 'Cobrança registrada e paciente adicionado à fila com sucesso!');
        res.redirect(`/`); // Redireciona para o dashboard da recepção
    } catch (error) {
        console.error('Erro ao processar cobrança:', error);
        req.flash('error', 'Erro ao registrar cobrança.');
        res.redirect(`/financeiro/cobrar/${pacienteId}`); // Mantém na página de cobrança com erro
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
                    select: { nome: true }
                },
                parceiro: {
                    select: { nome: true }
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
