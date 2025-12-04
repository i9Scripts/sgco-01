import prisma from '../lib/prisma.js';
// prisma centralizado

export const indexController = {
  async index(req, res) {
    try {
      let pacientes = [];
      if (req.session.idConsultorio) {
        pacientes = await prisma.paciente.findMany({
          where: { consultorioId: req.session.idConsultorio },
          orderBy: { nome: 'asc' },
          include: {
            anamneses: {
              orderBy: { createdAt: 'desc' },
              take: 1, // pega a anamnese mais recente
            },
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
};
