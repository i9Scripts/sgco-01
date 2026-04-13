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

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

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

      const totalAgendamentos = await prisma.agendamento.count({
        where: { consultorioId: idConsultorio }
      });

      const consultasRealizadas = await prisma.consulta.count({
        where: {
          consultorioId: idConsultorio,
          statusConsulta: 'Finalizada'
        }
      });

      const profissionais = await prisma.profissional.findMany({
        where: { consultorioId: idConsultorio },
        take: 5
      });

      res.render('agendamentos/index', {
        pageTitle: 'Gestão de Consultas',
        pageIcon: 'material-symbols-outlined',
        iconName: 'calendar_month',
        agendamentos,
        totalAgendamentos,
        consultasRealizadas,
        profissionais,
        hoje: new Date()
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao buscar agendamentos.');
      res.redirect('/');
    }
  },

  async listCalendario(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/selecionar');
      }

      const queryYear = parseInt(req.query.year) || new Date().getFullYear();
      const queryMonth = parseInt(req.query.month) || new Date().getMonth(); // 0-indexed

      const hoje = new Date();
      const currentViewDate = new Date(queryYear, queryMonth, 1);
      
      const firstDayOfMonth = new Date(queryYear, queryMonth, 1).getDay();
      const lastDateOfMonth = new Date(queryYear, queryMonth + 1, 0).getDate();
      
      const prevMonthLastDate = new Date(queryYear, queryMonth, 0).getDate();
      
      // Fetch appointments for this month
      const startOfMonth = new Date(queryYear, queryMonth, 1);
      const endOfMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          consultorioId: idConsultorio,
          dataHora: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        include: {
          paciente: true,
          parceiro: true,
        },
        orderBy: {
          dataHora: 'asc',
        },
      });

      // Group appointments by day
      const agendamentosPorDia = {};
      agendamentos.forEach(a => {
        const day = new Date(a.dataHora).getDate();
        if (!agendamentosPorDia[day]) agendamentosPorDia[day] = [];
        agendamentosPorDia[day].push(a);
      });

      const profissionais = await prisma.profissional.findMany({
        where: { consultorioId: idConsultorio },
      });

      res.render('agendamentos/calendario', {
        pageTitle: 'Calendário de Consultas',
        pageIcon: 'material-symbols-outlined',
        iconName: 'calendar_month',
        agendamentosPorDia,
        currentViewDate,
        hoje,
        profissionais,
        queryYear,
        queryMonth,
        firstDayOfMonth,
        lastDateOfMonth,
        prevMonthLastDate
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao carregar o calendário.');
      res.redirect('/agendamentos');
    }
  },

  async listCalendarioSemanal(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/selecionar');
      }

      const hoje = new Date();
      // Parse data YYYY-MM-DD manualmente para evitar problemas de fuso horário
      let referenceDate;
      if (req.query.date) {
        const [year, month, day] = req.query.date.split('-').map(Number);
        referenceDate = new Date(year, month - 1, day);
      } else {
        referenceDate = new Date();
      }
      
      if (isNaN(referenceDate.getTime())) referenceDate = new Date();

      // Ajustar para o início da semana (Domingo)
      const startOfWeek = new Date(referenceDate);
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          consultorioId: idConsultorio,
          dataHora: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        },
        include: {
          paciente: true,
          parceiro: true,
        },
        orderBy: {
          dataHora: 'asc',
        },
      });

      // Agrupar por dia da semana (0-6)
      const agendamentosPorDia = [[], [], [], [], [], [], []];
      agendamentos.forEach(a => {
        const d = new Date(a.dataHora).getDay();
        agendamentosPorDia[d].push(a);
      });

      const profissionais = await prisma.profissional.findMany({
        where: { consultorioId: idConsultorio },
      });

      // Gerar os dias da semana para o header
      const diasSemana = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        diasSemana.push(d);
      }

      res.render('agendamentos/semanal', {
        pageTitle: 'Agenda Semanal',
        pageIcon: 'material-symbols-outlined',
        iconName: 'calendar_view_week',
        agendamentosPorDia,
        startOfWeek,
        endOfWeek,
        hoje,
        profissionais,
        diasSemana,
        referenceDate
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao carregar o calendário semanal.');
      res.redirect('/agendamentos');
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

      const dateParam = req.query.date || '';

      res.render('agendamentos/new', {
        pacientes,
        parceiros,
        formData: { data: dateParam },
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
