// src/controllers/pacienteController.js
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import prisma from '../lib/prisma.js';
import { calcularIdadeFromDate } from '../utils/dateUtils.js';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

// prisma centralizado
// para garantir que os dados estão vinculados com a tabela Consultorio
async function findPacienteDoConsultorio(idPaciente, consultorioId) {
  const paciente = await prisma.paciente.findFirst({
    where: {
      consultorioId: consultorioId,
      idPaciente: {
        equals: parseInt(idPaciente),
      },
    },
  });

  return paciente;
}

export const pacienteController = {
  // Formulário para adicionar um novo paciente
  async newPacienteForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const parceiros = await prisma.parceiro.findMany({
        where: { consultorioId: idConsultorio },
      });

      res.render('pacientes/new', {
        pageTitle: 'Novo Paciente',
        pageIcon: 'ri-folder-user-line',
        formData: {},
        parceiros,
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de paciente:', error);
      if (error instanceof Prisma.PrismaClientInitializationError) {
        req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
      } else {
        req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      }
      return res.status(500).json({ error: 'Erro ao exibir le formulário', details: error.message });
    }
  },

  // Criar um novo paciente

  async createPaciente(req, res) {
    try {
      const {
        nome,
        responsavel,
        dataNasc,
        idade,
        celular,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        cpf,
        profissao,
        dataAtend,
      } = req.body;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!nome || !dataNasc || !idade || !celular || !endereco || !numero || !bairro || !cidade || !profissao) {
        req.flash('error', 'Todos os campos são obrigatórios.');
        return res.redirect('/pacientes');
      }
      // CORREÇÃO IMPORTANTE: interpretar dataNasc no formato brasileiro
      const dataNascimentoCorrigida = dayjs(dataNasc, 'DD/MM/YYYY').toDate();

      // Verifica se o consultório existe (evita violação de FK quando o DB foi recriado)
      const consultorioExists = await prisma.consultorio.findUnique({ where: { idConsultorio: idConsultorio } });
      if (!consultorioExists) {
        console.error(`Consultório com id ${idConsultorio} não encontrado no banco.`);
        req.flash(
          'error',
          'Consultório selecionado não existe no banco. Se necessário, recrie ou selecione outro consultório.'
        );
        return res.redirect('/consultorios');
      }

      const novoPaciente = await prisma.paciente.create({
        data: {
          nome,
          responsavel: responsavel || null,
          dataNasc: dataNascimentoCorrigida,
          idade: dayjs().diff(dataNascimentoCorrigida, 'year'),
          celular,
          cep: cep || null,
          endereco,
          numero: parseInt(numero),
          bairro,
          cidade,
          cpf: cpf || null,
          dataAtend,
          profissao,
          consultorioId: idConsultorio,
        },
      });
      // >>>> Guardar o idPaciente na sessão <<<<
      req.session.idPaciente = novoPaciente.idPaciente;

      req.flash('success', 'Paciente registrado com sucesso! Preencha a anamnese.');
      return res.redirect('/anamneses/new');
    } catch (error) {
      console.error('Erro ao registrar paciente:', error);
      req.flash('error', 'Erro ao registrar paciente. Verifique os dados e tente novamente.');
      return res.redirect('/pacientes');
    }
  },
  // Buscar paciente pelo ID
  async getPacienteById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const idPaciente = parseInt(req.params.idPaciente);
      if (isNaN(idPaciente)) {
        req.flash('error', 'ID do paciente inválido.');
        return res.redirect('/pacientes');
      }

      const paciente = await findPacienteDoConsultorio(idPaciente, idConsultorio);

      if (!paciente) {
        req.flash('error', 'Paciente não encontrado.');
        return res.redirect('/pacientes');
      }
      // calcula idade no servidor
      const idadePaciente = paciente ? calcularIdadeFromDate(paciente.dataNasc || paciente.dataNascFormatada) : null;

      paciente.dataNascFormatada = dayjs.utc(paciente.dataNasc).format('DD/MM/YYYY');

      res.render('pacientes/show', {
        pageTitle: 'Detalhes do Paciente',
        pageIcon: 'ri-folder-user-line',
        paciente,
        idadePaciente,
      });
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      req.flash('error', 'Erro ao buscar paciente. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },

  // Listar todos os pacientes
  async getAllPacientes(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const pacientes = await prisma.paciente.findMany({
        where: {
          consultorioId: idConsultorio,
        },
        include: {
          anamneses: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // recebe um array, mas só com a anamnese mais recente
          },
        },
        orderBy: {
          nome: 'asc',
        },
      });

      res.render('pacientes/index', {
        pageTitle: 'Lista de Pacientes',
        pageIcon: 'ri-folder-user-line',
        pacientes,
      });
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      req.flash('error', 'Erro ao buscar pacientes. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },

  async searchPacientes(req, res) {
    try {
      const { query } = req.query;
      const idConsultorio = parseInt(req.session.idConsultorio);

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      // Se a busca estiver vazia, redireciona para a listagem geral
      if (!query || query.trim() === '') {
        return res.redirect('/pacientes');
      }

      const q = query.trim();
      // 1. Criamos uma versão apenas com números para CPF e Ficha
      const cleanQ = q.replace(/\D/g, '');

      // 2. Iniciamos as condições de busca com o Nome
      const orConditions = [{ nome: { contains: q } }];

      // 3. Adicionamos busca por CPF se houver números na query
      if (cleanQ !== '') {
        //(cleanQ.length > 4) alternativa
        orConditions.push({ cpf: { contains: cleanQ } });
      }

      // 4. Busca por nFicha (Campo Inteiro) na tabela Anamnese
      const nFichaNum = parseInt(cleanQ);
      if (!isNaN(nFichaNum) && nFichaNum <= 2147483647) {
        orConditions.push({
          anamneses: {
            some: {
              nFicha: nFichaNum,
              consultorioId: idConsultorio,
            },
          },
        });
      }

      const pacientes = await prisma.paciente.findMany({
        where: {
          consultorioId: idConsultorio,
          OR: orConditions,
        },
        include: {
          anamneses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: {
          nome: 'asc',
        },
      });

      if (pacientes.length === 0) {
        req.flash('warning', 'Nenhum paciente encontrado.');
        return res.redirect('/pacientes');
      }

      res.render('pacientes/index', {
        pageTitle: `Resultados para "${q}"`,
        pageIcon: 'ri-search-line',
        pacientes,
      });
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      req.flash('error', 'Erro ao buscar pacientes. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },

  async checkFicha(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const nFicha = parseInt(req.params.nFicha);
      const excludePacienteId = req.query.excludeId ? parseInt(req.query.excludeId) : null;

      if (!idConsultorio || isNaN(nFicha)) {
        return res.json({ available: true });
      }

      const whereClause = {
        consultorioId: idConsultorio,
        nFicha: parseInt(nFicha),
      };

      // Se houver excludePacienteId, adicionamos a condição para ignorar as anamneses deste paciente
      if (excludePacienteId && excludePacienteId !== 'null') {
        whereClause.pacienteId = {
          not: parseInt(excludePacienteId),
        };
      }

      const anamneseExistente = await prisma.anamnese.findFirst({
        where: whereClause,
        include: { paciente: { select: { nome: true } } },
      });

      if (anamneseExistente) {
        return res.json({ available: false, nome: anamneseExistente.paciente.nome });
      }

      return res.json({ available: true });
    } catch (error) {
      console.error('Erro ao validar ficha:', error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  },
  // Atualizar paciente
  async updatePaciente(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idPaciente } = req.params;
      const { addToQueue } = req.body;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const paciente = await findPacienteDoConsultorio(idPaciente, idConsultorio);
      if (!paciente) {
        req.flash('error', 'Paciente não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/pacientes');
      }

      const { nome, responsavel, dataNasc, celular, cep, endereco, numero, bairro, cidade, cpf, profissao, dataAtend } =
        req.body;
      // CORREÇÃO IMPORTANTE: interpretar dataNasc no formato brasileiro
      const dataNascimentoCorrigida = dayjs(dataNasc, 'DD/MM/YYYY').toDate();

      await prisma.paciente.update({
        where: { idPaciente: parseInt(idPaciente) },
        data: {
          nome,
          responsavel: responsavel || null,
          dataNasc: dataNascimentoCorrigida,
          idade: dayjs().diff(dataNascimentoCorrigida, 'year'),
          celular,
          cep: cep || null,
          endereco,
          numero: parseInt(numero),
          bairro,
          cidade,
          cpf: cpf || null,
          dataAtend,
          profissao,
        },
      });

      if (addToQueue === 'true') {
        req.flash('success', 'Dados atualizados! Agora, preencha a anamnese para entrar na fila.');
        return res.redirect(`/anamneses/new?idPaciente=${idPaciente}&addToQueue=true`);
      }

      req.flash('success', 'Paciente atualizado com sucesso!');
      return res.redirect('/pacientes');
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      req.flash('error', 'Erro ao atualizar paciente. Tente novamente.');
      return res.redirect(`/pacientes/${req.params.idPaciente}/edit`);
    }
  },
  // Formulário para editar paciente
  async editPacienteForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idPaciente } = req.params;
      const { addToQueue } = req.query;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const paciente = await findPacienteDoConsultorio(idPaciente, idConsultorio);
      if (!paciente) {
        req.flash('error', 'Paciente não encontrado.');
        return res.redirect('/pacientes');
      }
      // calcula idade no servidor
      const idadePaciente = paciente ? calcularIdadeFromDate(paciente.dataNasc || paciente.dataNascFormatada) : null;

      paciente.dataNascFormatada = dayjs.utc(paciente.dataNasc).format('DD/MM/YYYY');

      res.render('pacientes/edit', {
        pageTitle: 'Editar Paciente',
        pageIcon: 'ri-edit-line',
        paciente,
        idadePaciente,
        formData: {},
        addToQueue: addToQueue === 'true',
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },
  // Deletar paciente
  async deletePaciente(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idPaciente } = req.params;
      const idPacienteInt = parseInt(idPaciente);

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const paciente = await findPacienteDoConsultorio(idPacienteInt, idConsultorio);
      if (!paciente) {
        req.flash('error', 'Paciente não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/pacientes');
      }

      // Usar uma transação para garantir que todas as exclusões ocorram ou nenhuma delas.
      await prisma.$transaction(async (tx) => {
        // Encontrar todas as consultas do paciente para lidar com dependências aninhadas
        const consultas = await tx.consulta.findMany({
          where: { pacienteId: idPacienteInt },
          select: { idConsulta: true },
        });
        const consultaIds = consultas.map((c) => c.idConsulta);

        // Encontrar todos os lançamentos financeiros do paciente
        const lancamentos = await tx.lancamentoFinanceiro.findMany({
          where: { pacienteId: idPacienteInt },
          select: { idLancamento: true },
        });
        const lancamentoIds = lancamentos.map((l) => l.idLancamento);

        if (lancamentoIds.length > 0) {
          // Deletar pagamentos e itens de lançamento associados aos lançamentos
          await tx.pagamento.deleteMany({
            where: { lancamentoId: { in: lancamentoIds } },
          });
          await tx.lancamentoItem.deleteMany({
            where: { lancamentoId: { in: lancamentoIds } },
          });
        }

        // Deletar registros que dependem diretamente do paciente
        await tx.consulta.deleteMany({ where: { pacienteId: idPacienteInt } });
        await tx.lancamentoFinanceiro.deleteMany({ where: { pacienteId: idPacienteInt } });
        await tx.anamnese.deleteMany({ where: { pacienteId: idPacienteInt } });
        await tx.diagnostico.deleteMany({ where: { pacienteId: idPacienteInt } });

        // Finalmente, deletar o paciente
        await tx.paciente.delete({
          where: { idPaciente: idPacienteInt },
        });
      });

      req.flash('success', 'Paciente e todos os seus registros foram deletados com sucesso!');
      return res.redirect('/pacientes');
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      req.flash(
        'error',
        'Erro ao deletar paciente. O paciente pode tel registros associados que não puderam ser removidos.'
      );
      return res.redirect('/pacientes');
    }
  },

  // Marcar paciente como atendido (retirar da fila)
  async marcarAtendido(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idPaciente } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const paciente = await findPacienteDoConsultorio(idPaciente, idConsultorio);
      if (!paciente) {
        req.flash('error', 'Paciente não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/');
      }

      // Atualiza a fila na tabela Consulta
      await prisma.consulta.updateMany({
        where: { pacienteId: parseInt(idPaciente), consultorioId, naFila: true },
        data: { naFila: false },
      });

      req.flash('success', 'Paciente marcado como atendido e removido da fila.');
      return res.redirect('/');
    } catch (error) {
      console.error('Erro ao marcar paciente como atendido:', error);
      req.flash('error', 'Erro ao marcar paciente como atendido. Tente novamente.');
      return res.redirect('/');
    }
  },

  // Adicionar paciente à fila de espera - NOVA LÓGICA: Redirecionar para conferência de dados
  async adicionarFila(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio || req.session.consultorio?.idConsultorio;
      const { idPaciente } = req.params;

      if (!idConsultorio) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
          return res.status(400).json({ success: false, message: 'Nenhum consultório selecionado.' });
        }
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const paciente = await findPacienteDoConsultorio(idPaciente, idConsultorio);
      if (!paciente) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
          return res.status(404).json({ success: false, message: 'Paciente não encontrado.' });
        }
        req.flash('error', 'Paciente não encontrado.');
        return res.redirect('/pacientes');
      }

      // 1. Identificar o tipo de fluxo
      const isDirect = req.query.direct === 'true';

      // 2. Detectar se é uma navegação de navegador (HTML) e NÃO é AJAX (XHR)
      const isHtmlRequest = req.accepts('html') && !req.xhr;

      // 3. Se for navegador e não for fluxo direto (ex: Financeiro), FORÇA o redirecionamento
      if (isHtmlRequest && !isDirect) {
        console.log(`[Queue] Redirecionando paciente ${idPaciente} para conferência de dados.`);
        return res.redirect(`/pacientes/${idPaciente}/edit?addToQueue=true`);
      }

      // 4. Somente se for AJAX ou parâmetro 'direct=true', o código abaixo é executado
      // Encontrar a consulta mais recente para este paciente
      const consulta = await prisma.consulta.findFirst({
        where: { pacienteId: parseInt(idPaciente), consultorioId },
        orderBy: { createdAt: 'desc' }
      });

      if (consulta) {
        await prisma.consulta.update({
          where: { idConsulta: consulta.idConsulta },
          data: { naFila: true },
        });
      } else {
        // Se não houver consulta, talvez devêssemos criar uma, mas a lógica atual
        // sugere que deve haver uma anamnese antes.
        // Por simplificação, se não houver consulta, não adicionamos à fila aqui.
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(400).json({ success: false, message: 'Nenhuma consulta encontrada para este paciente. Crie uma anamnese primeiro.' });
        }
        req.flash('error', 'Nenhuma consulta encontrada. Preencha a anamnese primeiro.');
        return res.redirect(`/anamneses/new?idPaciente=${idPaciente}`);
      }

      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ success: true, message: 'Paciente adicionado à fila.' });
      }

      req.flash('success', 'Paciente adicionado à fila de espera.');
      return res.redirect('/');
    } catch (error) {
      console.error('Erro ao iniciar processo de adicionar à fila:', error);
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(500).json({ success: false, message: 'Erro ao processar solicitação.' });
      }
      req.flash('error', 'Erro ao processar solicitação. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },
  // Selecionar paciente para anamnese
  async selecionarPaciente(req, res) {
    const idConsultorio = req.session.idConsultorio;
    const idPaciente = parseInt(req.params.idPaciente);

    if (!idConsultorio) {
      req.flash('error', 'Nenhum consultório selecionado.');
      return res.redirect('/consultorios/new');
    }

    // Verifica se o paciente pertence ao consultório
    const paciente = await prisma.paciente.findFirst({
      where: {
        idPaciente,
        consultorioId: idConsultorio,
      },
    });

    if (!paciente) {
      req.flash('error', 'Paciente não encontrado ou não pertence ao seu consultório.');
      return res.redirect('/pacientes');
    }

    req.session.idPaciente = idPaciente; // salva o paciente selecionado
    return res.redirect('/anamneses'); // redireciona para o formulário de anamnese
  },

  async PacienteFicha(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const idPaciente = parseInt(req.params.idPaciente);

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (isNaN(idPaciente)) {
        req.flash('error', 'ID do paciente inválido.');
        return res.redirect('/pacientes');
      }

      const paciente = await prisma.paciente.findUnique({
        where: { idPaciente: idPaciente },
        include: {
          anamneses: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!paciente || paciente.consultorioId !== idConsultorio) {
        req.flash('error', 'Paciente não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/pacientes');
      }

      const idadePaciente = paciente.dataNasc ? calcularIdadeFromDate(paciente.dataNasc) : null;

      // Formatar a data de nascimento para exibição, se existir
      paciente.dataNascFormatada = paciente.dataNasc ? dayjs.utc(paciente.dataNasc).format('DD/MM/YYYY') : null;

      // Busca TODOS os serviços cobrados para este paciente através de seus lançamentos financeiros
      let servicosCobrados = [];
      let servicoDestaque = null;
      try {
        const lancamentos = await prisma.lancamentoFinanceiro.findMany({
          where: { pacienteId: idPaciente },
          include: {
            items: {
              include: {
                servico: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        // Achata todos os itens de todos os lançamentos que contêm serviços
        lancamentos.forEach((lanc) => {
          if (lanc.items) {
            lanc.items.forEach((it) => {
              if (it.servico) {
                servicosCobrados.push({
                  descricao: it.servico.descricao,
                  valorUnitario: it.valorUnitario,
                  quantidade: it.quantidade || 1,
                  data: lanc.createdAt, // Para saber quando foi realizado
                });
              }
            });
          }
        });

        if (servicosCobrados.length > 0) {
          servicoDestaque = servicosCobrados[0]; // O mais recente
        }
      } catch (e) {
        console.warn('Não foi possível obter serviços cobrados para ficha:', e.message || e);
      }

      res.render('pacientes/ficha_a5', {
        pageTitle: `Ficha de ${paciente.nome}`,
        pageIcon: 'ri-file-text-line', // Ícone para relatórios
        paciente,
        anamneses: paciente.anamneses,
        idadePaciente,
        servicosCobrados,
        servicoDestaque,
      });
    } catch (error) {
      console.error('Erro ao gerar ficha do paciente:', error);
      req.flash('error', 'Erro ao gerar ficha do paciente. Tente novamente.');
      return res.redirect(`/pacientes/${req.params.idPaciente}`);
    }
  },
  async imprimirFicha(req, res) {
    try {
      // Validação da sessão do consultório
      const idConsultorio = req.session.idConsultorio || req.session.consultorio?.idConsultorio;
      const idPaciente = parseInt(req.params.idPaciente);

      if (!idConsultorio) {
        req.flash('error', 'Sessão expirada ou consultório não selecionado.');
        return res.redirect('/login');
      }

      const paciente = await prisma.paciente.findUnique({
        where: { idPaciente: idPaciente },
        include: {
          anamneses: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!paciente || paciente.consultorioId !== idConsultorio) {
        req.flash('error', 'Paciente não encontrado neste consultório.');
        return res.redirect('/pacientes');
      }

      // Formatação de datas
      paciente.dataNascFormatada = paciente.dataNasc ? dayjs.utc(paciente.dataNasc).format('DD/MM/YYYY') : 'N/D';
      const idadePaciente = paciente.dataNasc ? dayjs().diff(dayjs(paciente.dataNasc), 'year') : 'N/D';

      // 1. Busca Financeira
      const lancamentos = await prisma.lancamentoFinanceiro.findMany({
        where: {
          pacienteId: idPaciente,
          consultorioId: idConsultorio,
        },
        include: {
          items: {
            include: {
              servico: true,
              produto: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      let servicosCobrados = [];

      // 2. Mapeamento dos itens buscando estritamente o campo 'descricao'
      lancamentos.forEach((lanc) => {
        const itensLancamento = lanc.items || [];

        itensLancamento.forEach((it) => {
          servicosCobrados.push({
            data: lanc.createdAt,
            // CORREÇÃO: Lendo 'descricao' da tabela Servico/Produto conforme seu schema.prisma
            descricao: it.servico?.descricao || it.produto?.descricao || 'Item não identificado',
            // Convertendo Decimal do Prisma para Number para o EJS renderizar sem erros
            valorUnitario: Number(it.valorUnitario),
            quantidade: it.quantidade || 1,
          });
        });
      });

      // 3. Define o destaque (itens do lançamento mais recente para aparecer no topo da ficha)
      let servicoDestaque = null;
      if (lancamentos.length > 0) {
        const itensUltimo = lancamentos[0].items || [];
        const listaNomes = itensUltimo.map(it => it.servico?.descricao || it.produto?.descricao || 'Item').filter(Boolean).join(', ');
        servicoDestaque = { descricao: listaNomes };
      }

      // 4. Renderização
      res.render('reports/imprimir_ficha_basica', {
        layout: 'layouts/report',
        reportTitle: 'Ficha de Atendimento',
        paciente,
        anamneses: paciente.anamneses,
        idadePaciente,
        servicoDestaque,
        servicosCobrados,
        metaInfo: {
          // Mantendo o nFicha vindo da anamnese para preservar o rastreio do ciclo
          Ficha: paciente.anamneses.length > 0 ? paciente.anamneses[0].nFicha : 'N/D',
        },
      });
    } catch (error) {
      console.error('Erro ao gerar a ficha:', error);
      res.status(500).send('Erro interno ao gerar a ficha de impressão.');
    }
  },
};
