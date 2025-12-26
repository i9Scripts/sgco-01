import prisma from '../lib/prisma.js';
// prisma centralizado

export const indexController = {
  async index(req, res) {
    try {
      let pacientes = [];
      if (req.session.idConsultorio) {
        pacientes = await prisma.paciente.findMany({
          where: { consultorioId: req.session.idConsultorio, naFila: false },
          orderBy: { nome: 'asc' },
          include: {
            anamneses: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        });
      }

      res.render('index', {
        pageTitle: 'OptoSystem',
        pageIcon: 'ri-information-line',
        pacientes,
      });
    } catch (error) {
      console.error('Erro ao carregar a central:', error);
      res.status(500).render('index', {
        pacientes: [],
        error: 'Erro ao carregar dados da central.',
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
