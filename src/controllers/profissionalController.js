import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

// prisma centralizado

// Função auxiliar para garantir que o profissional pertence ao consultório
async function findProfissionalDoConsultorio(idProfissional, idConsultorio) {
  return await prisma.profissional.findFirst({
    where: {
      idProfissional: parseInt(idProfissional),
      consultorioId: idConsultorio,
    },
  });
}

export const profissionalController = {
  // Listar todos os profissionais
  async getAllProfissionais(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const profissionais = await prisma.profissional.findMany({
        where: { consultorioId: idConsultorio },
      });

      res.render('profissionais/index', {
        pageTitle: 'Lista de Profissionais',
        pageIcon: 'ri-user-line',
        profissionais,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      req.flash('error', 'Erro ao buscar profissionais. Tente novamente.');
      return res.redirect('/');
    }
  },

  // Formulário para criar novo profissional
  async newProfissionalForm(req, res) {
    try {
      res.render('profissionais/new', {
        pageTitle: 'Novo Profissional',
        pageIcon: 'ri-user-add-line',
        formData: {},
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de profissional:', error);
      if (error instanceof Prisma.PrismaClientInitializationError) {
        req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
      } else {
        req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      }
      req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      return res.redirect('/profissionais');
    }
  },

  // Criar novo profissional
  async createProfissional(req, res) {
    try {
      const { nome, especialidade, celular, cboo } = req.body;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const novoProfissional = await prisma.profissional.create({
        data: {
          nome,
          especialidade,
          celular,
          cboo,
          consultorioId: idConsultorio,
        },
      });

      req.flash('success', 'Profissional criado com sucesso! Cadastre o login para habilitar o profissional.');
      // Redireciona para o formulário de criação de usuário passando o profissionalId
      return res.redirect(`/users/new?profissionalId=${novoProfissional.idProfissional}`);
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      req.flash('error', 'Erro ao criar profissional. Tente novamente.');
      return res.redirect('/profissionais/new');
    }
  },

  // Detalhes de um profissional
  async getProfissionalById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idProfissional } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const profissional = await prisma.profissional.findFirst({
        where: {
          idProfissional: parseInt(idProfissional),
          consultorioId: idConsultorio,
        },
      });

      if (!profissional) {
        req.flash('error', 'Profissional não encontrado.');
        return res.redirect('/profissionais');
      }

      res.render('profissionais/show', {
        pageTitle: 'Detalhes do Profissional',
        pageIcon: 'ri-user-line',
        profissional,
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar profissional:', error);
      req.flash('error', 'Erro ao buscar profissional. Tente novamente.');
      return res.redirect('/profissionais');
    }
  },

  // Formulário para editar profissional
  async editProfissionalForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idProfissional } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const profissional = await prisma.profissional.findFirst({
        where: {
          idProfissional: parseInt(idProfissional),
          consultorioId: idConsultorio,
        },
      });

      if (!profissional) {
        req.flash('error', 'Profissional não encontrado.');
        return res.redirect('/profissionais');
      }

      res.render('profissionais/edit', {
        pageTitle: 'Editar Profissional',
        pageIcon: 'ri-edit-line',
        profissional,
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/profissionais');
    }
  },

  // Atualizar profissional
  async updateProfissional(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idProfissional } = req.params;
      const { nome, especialidade, celular, cboo } = req.body;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      await prisma.profissional.update({
        where: { idProfissional: parseInt(idProfissional) },
        data: {
          nome,
          especialidade,
          celular,
          cboo,
        },
      });

      req.flash('success', 'Profissional atualizado com sucesso!');
      return res.redirect('/profissionais');
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      req.flash('error', 'Erro ao atualizar profissional. Tente novamente.');
      return res.redirect(`/profissionais/${req.params.idProfissional}/edit`);
    }
  },

  // Deletar profissional
  async deleteProfissional(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idProfissional } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }
      const profissional = await findProfissionalDoConsultorio(idProfissional, idConsultorio);
      if (!profissional) {
        req.flash('error', 'Profissional não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/profissionais');
      }

      await prisma.profissional.delete({
        where: { idProfissional: parseInt(idProfissional) },
      });

      req.flash('success', 'Profissional deletado com sucesso!');
      return res.redirect('/profissionais');
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
      req.flash('error', 'Erro ao deletar profissional. Tente novamente.');
      return res.redirect('/profissionais');
    }
  },

  // Dashboard do profissional: acessa CRUD e visualiza fila
  async dashboard(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      // pacientesNaFila e pacientesReservados são carregados pelo middleware `carregarFilaDeEspera`
      const pacientesNaFila = res.locals.pacientesNaFila || [];
      const pacientesReservados = res.locals.pacientesReservados || [];

      return res.render('profissionais/dashboard', {
        pageTitle: 'Dashboard do Profissional',
        pageIcon: 'ri-dashboard-line',
        pacientesNaFila,
        pacientesReservados,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao abrir dashboard do profissional:', error);
      req.flash('error', 'Erro ao abrir dashboard.');
      return res.redirect('/');
    }
  },
};
