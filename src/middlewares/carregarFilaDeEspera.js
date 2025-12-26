// src/middlewares/carregarFilaDeEspera.js
import prisma from '../lib/prisma.js';

export async function carregarFilaDeEspera(req, res, next) {
  try {
    if (req.session.idConsultorio) {
      // Pacientes que devem aparecer na fila: naFila === false
      res.locals.pacientesNaFila = await prisma.paciente.findMany({
        where: { consultorioId: req.session.idConsultorio, naFila: false },
        orderBy: { createdAt: 'asc' },
        include: {
          anamneses: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });

      // Pacientes reservados/fora da fila: naFila === true (para uso em outras páginas)
      res.locals.pacientesReservados = await prisma.paciente.findMany({
        where: { consultorioId: req.session.idConsultorio, naFila: true },
        orderBy: { updatedAt: 'desc' },
        include: {
          anamneses: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
    } else {
      res.locals.pacientesNaFila = [];
      res.locals.pacientesReservados = [];
    }
    next();
  } catch (error) {
    console.error('Erro ao carregar a fila de espera:', error);
    res.locals.pacientesNaFila = [];
    res.locals.pacientesReservados = [];
    next(error);
  }
}
