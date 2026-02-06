import prisma from '../lib/prisma.js';

export const agendamentoController = {
  // Listar todos os agendamentos (pode ser melhorado para filtrar por dia, semana, etc.)
  async listAgendamentos(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/selecionar');
      }

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          consultorioId: idConsultorio,
        },
        include: {
          paciente: true,
          parceiro: true,
        },
        orderBy: {
          dataHora: 'asc',
        },
      });
      res.render('agendamentos/index', {
        pageTitle: 'Agenda de Atendimentos',
        pageIcon: 'bi bi-calendar-event',
        agendamentos,
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao buscar agendamentos.');
      res.redirect('/');
    }
  },

  // Exibir o formulário para criar um novo agendamento (geralmente em um modal)
  async createAgendamentoForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/selecionar');
      }

      const pacientes = await prisma.paciente.findMany({
        where: { consultorioId: idConsultorio },
        orderBy: { nome: 'asc' },
      });
      const parceiros = await prisma.parceiro.findMany({
        where: { consultorioId: idConsultorio },
        orderBy: { nome: 'asc' },
      });
      // Esta rota pode não ser renderizada diretamente se for um modal
      res.render('agendamentos/new', {
        pacientes,
        parceiros,
        formData: {},
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao carregar o formulário de agendamento.');
      res.redirect('/agendamentos');
    }
  },

  // Salvar um novo agendamento
  async createAgendamento(req, res) {
    const { pacienteId, nome, parceiroId, data, hora, observacao } = req.body;
    const idConsultorio = req.session.idConsultorio;

    try {
      if (!pacienteId && !nome) {
        throw new Error('É necessário selecionar um paciente ou informar o nome.');
      }

      // Combina data e hora. O input 'date' fornece YYYY-MM-DD.
      const dataHora = new Date(`${data}T${hora}`);

      const horaAgendamento = dataHora.getHours();
      const minutoAgendamento = dataHora.getMinutes();

      if (horaAgendamento < 8 || horaAgendamento > 17 || (horaAgendamento === 17 && minutoAgendamento > 30)) {
        throw new Error('O horário de agendamento deve ser entre 8:00 e 17:30.');
      }

      if (!idConsultorio) {
        req.flash('error', 'Consultório não selecionado na sessão.');
        return res.redirect('/consultorios/selecionar');
      }

      const agendamentoData = {
        dataHora,
        observacao: observacao || undefined,
        parceiro: parceiroId ? { connect: { idParceiro: parseInt(parceiroId) } } : undefined,
        consultorio: {
          connect: { idConsultorio: idConsultorio },
        },
        status: 'Agendado',
      };

      if (pacienteId) {
        agendamentoData.paciente = {
          connect: { idPaciente: parseInt(pacienteId) },
        };
      } else if (nome) {
        agendamentoData.nome = nome;
      }

      await prisma.agendamento.create({
        data: agendamentoData,
      });
      req.flash('success', 'Agendamento criado com sucesso!');
      res.redirect('/agendamentos');
    } catch (error) {
      console.error(error);
      const pacientes = await prisma.paciente.findMany({
        where: { consultorioId: idConsultorio },
        orderBy: { nome: 'asc' },
      });
      const parceiros = await prisma.parceiro.findMany({
        where: { consultorioId: idConsultorio },
        orderBy: { nome: 'asc' },
      });
      res.render('agendamentos/new', {
        pacientes,
        parceiros,
        formData: req.body,
        errors: { message: error.message },
      });
    }
  },

  async editAgendamentoForm(req, res) {
    const { id } = req.params;
    try {
      const agendamento = await prisma.agendamento.findUnique({
        where: { id: parseInt(id) },
        include: { paciente: true },
      });

      if (!agendamento) {
        req.flash('error', 'Agendamento não encontrado.');
        return res.redirect('/agendamentos');
      }

      const idConsultorio = req.session.idConsultorio;
      const pacientes = await prisma.paciente.findMany({
        where: { consultorioId: idConsultorio },
        orderBy: { nome: 'asc' },
      });
      const parceiros = await prisma.parceiro.findMany({
        where: { consultorioId: idConsultorio },
        orderBy: { nome: 'asc' },
      });

      res.render('agendamentos/edit', {
        agendamento,
        pacientes,
        parceiros,
        formData: agendamento,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao carregar o formulário de edição.');
      res.redirect('/agendamentos');
    }
  },

  async updateAgendamento(req, res) {
    const { id } = req.params;
    const { pacienteId, nome, parceiroId, data, hora, observacao, status } = req.body;

    try {
      const dataHora = new Date(`${data}T${hora}`);

      const agendamentoData = {
        dataHora,
        observacao,
        status,
        parceiro: parceiroId ? { connect: { idParceiro: parseInt(parceiroId) } } : { disconnect: true },
      };

      if (pacienteId) {
        agendamentoData.paciente = {
          connect: { idPaciente: parseInt(pacienteId) },
        };
        agendamentoData.nome = null;
      } else {
        agendamentoData.paciente = {
          disconnect: true,
        };
        agendamentoData.nome = nome;
      }

      await prisma.agendamento.update({
        where: { id: parseInt(id) },
        data: agendamentoData,
      });

      req.flash('success', 'Agendamento atualizado com sucesso!');
      res.redirect('/agendamentos');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao atualizar o agendamento.');
      res.redirect(`/agendamentos/${id}/edit`);
    }
  },

  async deleteAgendamento(req, res) {
    const { id } = req.params;
    try {
      await prisma.agendamento.delete({
        where: { id: parseInt(id) },
      });
      req.flash('success', 'Agendamento excluído com sucesso!');
      res.redirect('/agendamentos');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao excluir o agendamento.');
      res.redirect('/agendamentos');
    }
  },
};
