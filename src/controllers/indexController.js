import prisma from '../lib/prisma.js';
// prisma centralizado

export const indexController = {
  async index(req, res) {
    try {
      let pacientesNaFila = []; // Changed variable name
      const idConsultorio = req.session.idConsultorio;

      if (req.session.idConsultorio) {
        pacientesNaFila = await prisma.paciente.findMany({
          // Fetches patients in queue
          where: { consultorioId: req.session.idConsultorio, naFila: true }, // Filter for 'naFila: true'
          orderBy: { createdAt: 'asc' }, // por ordem de criação dos dados
        });
      }

      res.render('index', {
        pageTitle: 'Recepção',
        pageIcon: 'bi bi-reception-4', // New icon
        pacientesNaFila, // Passa para a view
      });
    } catch (error) {
      console.error('Erro ao carregar o dashboard da recepção:', error);
      res.status(500).render('index', {
        pacientesNaFila: [],
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

      // Se não houver dados em locals, buscamos diretamente para garantir a atualização
      // const pacientes = await prisma.paciente.findMany({
      //   where: { consultorioId: idConsultorio, naFila: true },
      //   include: { anamneses: true },
      //   orderBy: { createdAt: 'asc' },
      // });

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
