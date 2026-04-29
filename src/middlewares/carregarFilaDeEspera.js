import prisma from '../lib/prisma.js';

export const carregarFilaDeEspera = async (req, res, next) => {
  try {
    if (req.session.idConsultorio) {
      // Padroniza: pacientes na fila => Consulta.naFila === true
      const consultasNaFila = await prisma.consulta.findMany({
        where: { consultorioId: req.session.idConsultorio, naFila: true },
        include: { 
          paciente: true,
          anamnese: true
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mapear para manter compatibilidade com views que esperam um array de pacientes
      res.locals.pacientesNaFila = consultasNaFila.map(c => ({
        ...c.paciente,
        anamneses: c.anamnese ? [c.anamnese] : [],
        idConsulta: c.idConsulta,
        createdAt: c.createdAt // Data de entrada na fila
      }));

      // Pacientes reservados/fora da fila (apenas os 10 mais recentes para performance)
      res.locals.pacientesReservados = await prisma.paciente.findMany({
        where: { consultorioId: req.session.idConsultorio },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      res.locals.pacientesNaFila = [];
      res.locals.pacientesReservados = [];
    }
    next();
  } catch (error) {
    console.error('Erro ao carregar fila de espera:', error);
    res.locals.pacientesNaFila = [];
    res.locals.pacientesReservados = [];
    next();
  }
};
