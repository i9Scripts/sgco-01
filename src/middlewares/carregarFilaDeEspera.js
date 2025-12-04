// src/middlewares/carregarFilaDeEspera.js
import prisma from '../lib/prisma.js';

export async function carregarFilaDeEspera(req, res, next) {
  try {
    if (req.session.idConsultorio) {
      res.locals.pacientesNaFila = await prisma.paciente.findMany({
        where: {
          consultorioId: req.session.idConsultorio,
          naFila: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } else {
      res.locals.pacientesNaFila = [];
    }
    next();
  } catch (error) {
    console.error('Erro ao carregar a fila de espera:', error);
    res.locals.pacientesNaFila = [];
    next(error);
  }
}
