import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const indexController = {
  async index(req, res) {
    try {
      // Exemplo: busca pacientes do consultório da sessão, se existir
      let pacientes = [];
      if (req.session.idConsultorio) {
        pacientes = await prisma.paciente.findMany({
          where: { consultorioId: req.session.idConsultorio },
          orderBy: { nome: 'asc' },
        });
      }

      res.render('index', {
        pageTitle: 'OptoSystem',
        pageIcon: '',
        pacientes, // Passa para o include da fila de espera
        // Adicione outros dados que quiser exibir na central
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
