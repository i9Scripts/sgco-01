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
      if (!req.session.idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      res.render('pacientes/new', {
        pageTitle: 'Novo Paciente',
        pageIcon: 'ri-folder-user-line',
        formData: {},
        layout: false,
        messages: req.flash(''),
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
          profissao,
          consultorioId: idConsultorio,
        },
      });
      // >>>> Guardar o idPaciente na sessão <<<<
      req.session.idPaciente = novoPaciente.idPaciente;

      req.flash('success', 'Paciente registrado com sucesso!');
      return res.redirect('/pacientes');
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
        layout: false,
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

  // Buscar pacientes por nome ou CPF
  async searchPacientes(req, res) {
    try {
      const { query } = req.query; // Obtém o termo de busca da query string
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!query || query.trim() === '') {
        req.flash('error', 'Digite um termo para buscar.');
        return res.redirect('/pacientes');
      }

      // Realiza a busca no banco de dados
      const q = query.trim();
      const orClauses = [{ nome: { contains: q } }, { cpf: { contains: q } }];
      // Se o termo for numérico, busque por nFicha como número
      if (/^\d+$/.test(q)) {
        orClauses.push({ nFicha: parseInt(q) });
      }

      const pacientes = await prisma.paciente.findMany({
        where: {
          consultorioId: idConsultorio,
          OR: orClauses,
        },
      });

      // Verifica se encontrou pacientes
      if (pacientes.length === 0) {
        req.flash('warning', 'Nenhum paciente encontrado.');
        return res.redirect('/pacientes');
      }
      // Renderiza a página com os resultados
      res.render('pacientes/index', {
        pageTitle: `Resultados para "${query}"`,
        pageIcon: 'ri-search-line',
        pacientes,

        messages: req.flash(''),
      });
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error); // Log detalhado do erro
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

      const { nome, responsavel, dataNasc, celular, cep, endereco, numero, bairro, cidade, cpf, profissao, nFicha } =
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
          nFicha: nFicha ? parseInt(nFicha) : null,
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

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const paciente = await findPacienteDoConsultorio(idPaciente, idConsultorio);
      if (!paciente) {
        req.flash('error', 'Paciente não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/pacientes');
      }

      await prisma.paciente.delete({
        where: { idPaciente: parseInt(idPaciente) },
      });

      req.flash('success', 'Paciente deletado com sucesso!');
      return res.redirect('/pacientes');
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      req.flash('error', 'Erro ao deletar paciente. Tente novamente.');
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
        data: {
          naFila: false,
        },
      });

      req.flash('success', 'Paciente marcado como atendido.');
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

      await prisma.paciente.update({
        where: { idPaciente: parseInt(idPaciente) },
        data: {
          naFila: true,
        },
      });

      req.flash('success', 'Paciente adicionado à fila de espera.');
      return res.redirect('/pacientes');
    } catch (error) {
      console.error('Erro ao adicionar paciente à fila:', error);
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
        layout: false,
        messages: req.flash(''),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },
  async searchPacienteByCpf(req, res) {
    try {
      const { cpf } = req.query;
      const idConsultorio = req.session.idConsultorio;

      const paciente = await prisma.paciente.findFirst({
        where: {
          consultorioId: idConsultorio,
          cpf: cpf.replace(/\D/g, ''), // Remove formatação
        },
      });

      return res.json(paciente || null);
    } catch (error) {
      console.error('Erro na busca por CPF:', error);
      return res.status(500).json({ error: 'Erro na busca' });
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
