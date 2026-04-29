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

  async dashboard(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      // Carregar profissional (quando a sessão indica que é um profissional logado)
      let profissional = null;
      if (req.session?.idProfissional) {
        profissional = await findProfissionalDoConsultorio(req.session.idProfissional, idConsultorio);
      }

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      // Buscar agendamentos de hoje
      const agendamentosHoje = await prisma.agendamento.findMany({
        where: {
          consultorioId: idConsultorio,
          dataHora: {
            gte: hoje,
            lt: amanha,
          },
        },
        include: {
          paciente: true,
        },
        orderBy: {
          dataHora: 'asc',
        },
      });

      // Buscar atendimentos realizados hoje (Consultas finalizadas)
      const atendimentosHoje = await prisma.consulta.count({
        where: {
          consultorioId: idConsultorio,
          createdAt: {
            gte: hoje,
            lt: amanha,
          },
          statusConsulta: 'Finalizada',
        },
      });

      // Buscar consultas na fila diretamente para garantir consistência
      const consultasNaFila = await prisma.consulta.findMany({
        where: { consultorioId: idConsultorio, naFila: true },
        include: { 
            paciente: true,
            anamnese: true
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mapear consultas para o formato esperado pela view
      const pacientesNaFila = consultasNaFila.map(c => ({
          ...c.paciente,
          anamneses: [c.anamnese],
          idConsulta: c.idConsulta,
          createdAt: c.createdAt
      }));

      // pacientesReservados ainda pode vir do res.locals ou buscar se necessário
      const pacientesReservados = res.locals.pacientesReservados || [];

      // Estatísticas para o Dashboard
      const totalPacientes = await prisma.paciente.count({
        where: { consultorioId: idConsultorio },
      });

      const diagnosticos = await prisma.diagnostico.findMany({
        where: { consultorioId: idConsultorio },
        select: { esfOD: true, esfOE: true },
      });

      let totalMiopia = 0;
      let totalHipermetropia = 0;
      const totalDiagnosticos = diagnosticos.length;

      diagnosticos.forEach((diag) => {
        const esfOD = parseFloat(diag.esfOD.replace(',', '.'));
        const esfOE = parseFloat(diag.esfOE.replace(',', '.'));

        let isMiopia = false;
        let isHipermetropia = false;

        if (esfOD < 0 || esfOE < 0) isMiopia = true;
        if (esfOD > 0 || esfOE > 0) isHipermetropia = true;

        if (isMiopia) totalMiopia++;
        if (isHipermetropia) totalHipermetropia++;
      });

      const percMiopia = totalDiagnosticos > 0 ? ((totalMiopia / totalDiagnosticos) * 100).toFixed(1) : 0;
      const percHipermetropia = totalDiagnosticos > 0 ? ((totalHipermetropia / totalDiagnosticos) * 100).toFixed(1) : 0;

      return res.render('profissionais/dashboard', {
        pageTitle: 'Painel do Profissional',
        pageIcon: 'material-symbols-outlined',
        iconName: 'health_and_safety',
        pacientesNaFila,
        pacientesReservados,
        agendamentosHoje,
        atendimentosHoje,
        profissional,
        usuario: req.session.usuario,
        stats: {
          totalPacientes,
          percMiopia,
          percHipermetropia,
        },
      });
    } catch (error) {
      console.error('Erro ao abrir dashboard do profissional:', error);
      req.flash('error', 'Erro ao abrir dashboard.');
      return res.redirect('/');
    }
  },
};
