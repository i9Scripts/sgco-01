import prisma from '../lib/prisma.js';
// prisma centralizado

export const indexController = {
  async index(req, res) {
    try {
      let pacientesNaFila = []; // Changed variable name
      if (req.session.idConsultorio) {
        pacientesNaFila = await prisma.paciente.findMany({ // Fetches patients in queue
          where: { consultorioId: req.session.idConsultorio, naFila: true }, // Filter for 'naFila: true'
          orderBy: { createdAt: 'asc' }, // Order by entry time into queue
        });
      }

      res.render('index', {
        pageTitle: 'Dashboard da Recepção', // More appropriate title
        pageIcon: 'bi bi-reception-4', // New icon
        pacientesNaFila, // Pass this to the view
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao carregar o dashboard da recepção:', error);
      res.status(500).render('index', {
        pacientesNaFila: [],
        error: 'Erro ao carregar dados do dashboard da recepção.',
        pageTitle: 'Erro',
        pageIcon: 'bi bi-x-circle',
      });
    }
  },

  // Rota que renderiza apenas o partial da fila (usada pelo cliente via fetch)
  async filaParcial(req, res) {
    try {
      const pacientes = res.locals.pacientesNaFila || [];
      // renderiza apenas o partial (sem layout)
      return res.render('fila-espera', { pacientes, layout: false });
    } catch (error) {
      console.error('Erro ao renderizar partial da fila:', error);
      return res.status(500).send('Erro ao atualizar fila');
    }
  },
};
