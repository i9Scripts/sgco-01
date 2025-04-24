// src/controllers/pacienteController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// para garantir que os dados estão vinculados com a tabela Consultorio
async function findPacienteDoConsultorio(idPaciente, idConsultorio) {
  return await prisma.paciente.findFirst({
    where: {
      idPaciente: parseInt(idPaciente),
      consultorioId: idConsultorio,
    },
  });
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
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de paciente:', error);
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
    }
  },

  // Criar um novo paciente
  async createPaciente(req, res) {
    try {
      const { nome, responsavel, dataNasc, celular, cep, endereco, numero, bairro, cidade, cpf, profissao } = req.body;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!nome || !dataNasc || !celular || !endereco || !numero || !bairro || !cidade || !profissao) {
        req.flash('error', 'Todos os campos são obrigatórios.');
        return res.redirect('/pacientes/new');
      }

      await prisma.paciente.create({
        data: {
          nome,
          responsavel: responsavel || null,
          dataNasc: new Date(dataNasc),
          celular,
          cep: cep || null,
          endereco,
          numero: parseInt(numero),
          bairro,
          cidade,
          cpf: cpf || null,
          profissao,
          consultorioId: idConsultorio,
        },
      });

      req.flash('success', 'Paciente registrado com sucesso!');
      return res.redirect('/pacientes');
    } catch (error) {
      console.error('Erro ao registrar paciente:', error);
      req.flash('error', 'Erro ao registrar paciente. Verifique os dados e tente novamente.');
      return res.redirect('/pacientes/new');
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

      const paciente = await findPacienteDoConsultorio(req.params.idPaciente, idConsultorio);
      if (!paciente) {
        req.flash('error', 'Paciente não encontrado.');
        return res.redirect('/pacientes');
      }

      res.render('pacientes/show', {
        pageTitle: 'Detalhes do Paciente',
        pageIcon: 'ri-folder-user-line',
        paciente,
        messages: req.flash(),
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
        where: { consultorioId: idConsultorio },
      });

      res.render('pacientes/index', {
        pageTitle: 'Lista de Pacientes',
        pageIcon: 'ri-folder-user-line',
        pacientes,
        messages: req.flash(),
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
      const { query } = req.query;
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const pacientes = await prisma.paciente.findMany({
        where: {
          consultorioId: idConsultorio,
          OR: [{ nome: { contains: query, mode: 'insensitive' } }, { cpf: { contains: query, mode: 'insensitive' } }],
        },
      });

      res.render('pacientes/index', {
        pageTitle: 'Resultado de busca de Pacientes',
        pageIcon: 'ri-folder-user-line',
        pacientes,
        messages: req.flash(),
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

      const { nome, responsavel, dataNasc, celular, cep, endereco, numero, bairro, cidade, cpf, profissao } = req.body;

      await prisma.paciente.update({
        where: { idPaciente: parseInt(idPaciente) },
        data: {
          nome,
          responsavel: responsavel || null,
          dataNasc: new Date(dataNasc),
          celular,
          cep: cep || null,
          endereco,
          numero: parseInt(numero),
          bairro,
          cidade,
          cpf: cpf || null,
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

      res.render('pacientes/edit', {
        pageTitle: 'Editar Paciente',
        pageIcon: 'ri-edit-line',
        paciente,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/pacientes');
    }
  },
};
