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
      res.render('agendamentos/index', { agendamentos, messages: req.flash('') });
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
      res.render('agendamentos/new', { pacientes, parceiros, messages: req.flash('') });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao carregar o formulário de agendamento.');
      res.redirect('/agendamentos');
    }
  },

  // Salvar um novo agendamento
  async createAgendamento(req, res) {
    const { pacienteId, parceiroId, data, hora } = req.body;
    const idConsultorio = req.session.idConsultorio;

    // Combina data e hora. O input 'date' fornece YYYY-MM-DD.
    const dataHora = new Date(`${data}T${hora}`);

    const horaAgendamento = dataHora.getHours();
    const minutoAgendamento = dataHora.getMinutes();

    if (
      horaAgendamento < 8 ||
      horaAgendamento > 17 ||
      (horaAgendamento === 17 && minutoAgendamento > 30)
    ) {
      req.flash('error', 'O horário de agendamento deve ser entre 8:00 e 17:30.');
      return res.redirect('/agendamentos');
    }

    try {
      if (!idConsultorio) {
        req.flash('error', 'Consultório não selecionado na sessão.');
        return res.redirect('/consultorios/selecionar');
      }

      await prisma.agendamento.create({
        data: {
          dataHora,
          paciente: {
            connect: { idPaciente: parseInt(pacienteId) },
          },
          parceiro: parceiroId ? { connect: { idParceiro: parseInt(parceiroId) } } : undefined,
          consultorio: {
            connect: { idConsultorio: idConsultorio },
          },
          status: 'Agendado',
        },
      });
      req.flash('success', 'Agendamento criado com sucesso!');
      res.redirect('/agendamentos');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao criar agendamento.');
      res.redirect('/agendamentos');
    }
  },
};
