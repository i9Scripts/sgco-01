import prisma from '../lib/prisma.js';
// prisma centralizado

export const indexController = {
  async index(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const idUser = req.session.idUser;

      if (!idConsultorio) {
        return res.render('index', {
          pageTitle: 'Recepção',
          pageIcon: 'bi bi-reception-4',
          pacientesNaFila: [],
          pacientesReservados: [],
          agendamentosHoje: [],
          atendimentosHoje: 0,
          usuario: null,
        });
      }

      // Buscar informações do usuário logado
      let usuario = null;
      if (idUser) {
        usuario = await prisma.user.findUnique({
          where: { idUser: idUser },
          select: { nome: true },
        });
      }

      // Definir início e fim do dia de hoje
      const hojeInicio = new Date();
      hojeInicio.setHours(0, 0, 0, 0);
      const hojeFim = new Date();
      hojeFim.setHours(23, 59, 59, 999);

      // Buscar agendamentos de hoje
      const agendamentosHoje = await prisma.agendamento.findMany({
        where: {
          consultorioId: idConsultorio,
          dataHora: {
            gte: hojeInicio,
            lte: hojeFim,
          },
        },
        include: {
          paciente: true,
        },
        orderBy: {
          dataHora: 'asc',
        },
      });

      // Buscar pacientes na fila
      const pacientesNaFila = await prisma.paciente.findMany({
        where: { consultorioId: idConsultorio, naFila: true },
        include: { anamneses: { take: 1, orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'asc' },
      });

      // Buscar pacientes reservados (fora da fila mas ativos hoje?) ou apenas os que não estão na fila
      // Para o dashboard de recepção, talvez interesse quem foi atendido hoje
      const pacientesReservados = await prisma.paciente.findMany({
        where: { consultorioId: idConsultorio, naFila: false },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      });

      // Contagem de atendimentos finalizados hoje
      const atendimentosHoje = await prisma.consulta.count({
        where: {
          consultorioId: idConsultorio,
          createdAt: {
            gte: hojeInicio,
            lte: hojeFim,
          },
          statusConsulta: 'Finalizada',
        },
      });

      res.render('index', {
        pageTitle: 'Recepção',
        pageIcon: 'bi bi-reception-4',
        pacientesNaFila,
        pacientesReservados,
        agendamentosHoje,
        atendimentosHoje,
        usuario,
      });
    } catch (error) {
      console.error('Erro ao carregar o dashboard da recepção:', error);
      res.status(500).render('index', {
        pacientesNaFila: [],
        pacientesReservados: [],
        agendamentosHoje: [],
        atendimentosHoje: 0,
        usuario: null,
        error: 'Erro ao carregar dados da recepção.',
        pageTitle: 'Erro',
        pageIcon: 'bi bi-x-circle',
      });
    }
  },

  // Rota que renderiza apenas o partial da fila (usada pelo cliente via fetch)
  async filaParcial(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const isProfissional = !!req.session.idProfissional;

      // Renderiza o partial passando as variáveis necessárias
      return res.render('fila-espera', {
        idConsultorio,
        pacientes,
        isProfissional,
        layout: false,
      });
    } catch (error) {
      console.error('Erro ao renderizar parcial da fila:', error);
      return res.status(500).send('Erro ao atualizar fila');
    }
  },
};
