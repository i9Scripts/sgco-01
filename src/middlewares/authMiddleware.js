// /middlewares/authMiddleware.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const configPath = path.join(process.cwd(), 'src/config', 'numeroSerie.json');

export const verificarConsultorioRegistrado = async (req, res, next) => {
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.idConsultorio && config.nome && config.numeroSerie) {
        // checa se o ID ainda existe no banco
        const consultorio = await prisma.consultorio.findUnique({
          where: { idConsultorio: config.idConsultorio },
        });

        if (consultorio) {
          res.locals.messages.consultorioNome = config.nome;
          res.locals.messages.consultorioId = config.idConsultorio;
          return next();
        }
      }
    }
    req.flash('error', 'Consultório não registrado. Registre um consultório para continuar.');
    return res.redirect('/consultorios/new');
  } catch (error) {
    console.error('Erro ao verificar consultório registrado:', error);
    req.flash('error', 'Erro ao verificar consultório. Tente novamente.');
    return res.redirect('/consultorios/new');
  }
};
