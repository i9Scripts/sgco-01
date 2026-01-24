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
        messages: req.flash(''),
        parceiros,
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de paciente:', error);
      if (error instanceof Prisma.PrismaClientInitializationError) {
        req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
      } else {
        req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      }
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
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
        nFicha,
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
          nFicha: nFicha ? parseInt(nFicha) : null,
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
        messages: req.flash(''),
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
      });

      res.render('pacientes/index', {
        pageTitle: 'Lista de Pacientes',
        pageIcon: 'ri-folder-user-line',
        pacientes,
        messages: req.flash(''),
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
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
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

      // 4. Busca por nFicha (Campo Inteiro)
      // Só tentamos converter para número se a string não for vazia
      // E verificamos se o número não ultrapassa o limite do INT do MariaDB (2.147.483.647)
      const nFichaNum = parseInt(cleanQ);
      if (!isNaN(nFichaNum) && nFichaNum <= 2147483647) {
        // Para campos numéricos, usamos 'equals' para busca exata
        orConditions.push({ nFicha: { equals: nFichaNum } });
      }

      const pacientes = await prisma.paciente.findMany({
        where: {
          consultorioId: idConsultorio,
          OR: orConditions,
        },
      });

      if (pacientes.length === 0) {
        req.flash('warning', 'Nenhum paciente encontrado.');
        return res.redirect('/pacientes');
      }

      res.render('pacientes/index', {
        pageTitle: `Resultados para "${query}"`,
        pageIcon: 'ri-search-line',
        pacientes,
        messages: req.flash(''),
      });
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      req.flash('error', 'Erro ao buscar pacientes. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },
  // Atualizar paciente
  async updatePaciente(req, res) {
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
        return res.redirect('/pacientes');
      }

      const {
        nome,
        responsavel,
        dataNasc,
        celular,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        cpf,
        profissao,
        nFicha,
        dataAtend,
      } = req.body;
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
          nFicha: nFicha ? parseInt(nFicha) : null,
          dataAtend,
          profissao,
        },
      });

      req.flash('success', 'Paciente atualizado com sucesso!');
      return res.redirect('/pacientes');
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      req.flash('error', 'Erro ao atualizar paciente. Tente novamente.');
      return res.redirect(`/pacientes/${req.params.idPaciente}/edit`);
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

        if (consultaIds.length > 0) {
          // Deletar pagamentos e itens de venda associados às consultas
          await tx.pagamento.deleteMany({
            where: { consultaId: { in: consultaIds } },
          });
          await tx.itensVenda.deleteMany({
            where: { consultaId: { in: consultaIds } },
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
        'Erro ao deletar paciente. O paciente pode ter registros associados que não puderam ser removidos.'
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

      await prisma.paciente.update({
        where: { idPaciente: parseInt(idPaciente) },
        data: { naFila: true },
      });

      req.flash('success', 'Paciente marcado como atendido e removido da fila.');
      return res.redirect('/');
    } catch (error) {
      console.error('Erro ao marcar paciente como atendido:', error);
      req.flash('error', 'Erro ao marcar paciente como atendido. Tente novamente.');
      return res.redirect('/');
    }
  },

  // Adicionar paciente à fila de espera
  async adicionarFila(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio || req.session.consultorio.idConsultorio;
      const { idPaciente } = req.params;

      if (!idConsultorio) {
        if (req.xhr || req.headers.accept.includes('json')) {
          return res.status(400).json({ success: false, message: 'Nenhum consultório selecionado.' });
        }
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const paciente = await findPacienteDoConsultorio(idPaciente, idConsultorio);
      if (!paciente) {
        if (req.xhr || req.headers.accept.includes('json')) {
          return res
            .status(404)
            .json({ success: false, message: 'Paciente não encontrado ou não pertence ao seu consultório.' });
        }
        req.flash('error', 'Paciente não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/pacientes');
      }

      await prisma.paciente.update({
        where: { idPaciente: parseInt(idPaciente) },
        data: {
          naFila: true,
        },
      });

      req.flash('success', 'Paciente adicionado à fila de espera.');

      if (req.xhr || req.headers.accept.includes('json')) {
        return res.status(200).json({ success: true, message: 'Paciente adicionado à fila de espera.' });
      }

      return res.redirect('/');
    } catch (error) {
      console.error('Erro ao adicionar paciente à fila:', error);
      if (req.xhr || req.headers.accept.includes('json')) {
        return res.status(500).json({ success: false, message: 'Erro ao adicionar paciente à fila. Tente novamente.' });
      }
      req.flash('error', 'Erro ao adicionar paciente à fila. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },

  // Formulário para editar paciente
  async editPacienteForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idPaciente } = req.params;

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
        messages: req.flash(''),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
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
};
