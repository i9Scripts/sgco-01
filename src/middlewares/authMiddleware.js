// /middlewares/authMiddleware.js
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma.js';

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

export const verificarProfissionalAutenticado = (req, res, next) => {
  try {
    const idProfissional = req.session?.idProfissional;
    if (!idProfissional) {
      req.flash('error', 'Acesso negado. Faça login como profissional para acessar esta funcionalidade.');
      return res.redirect('/login');
    }
    return next();
  } catch (error) {
    console.error('Erro na verificação de profissional autenticado:', error);
    req.flash('error', 'Erro de autenticação. Faça login novamente.');
    return res.redirect('/login');
  }
};

export const verificarUsuarioAutenticado = (req, res, next) => {
  try {
    if (req.session?.idUser) return next();
    req.flash('error', 'Faça login para continuar.');
    return res.redirect('/login');
  } catch (err) {
    console.error('Erro na verificação de usuário autenticado:', err);
    req.flash('error', 'Erro de autenticação. Faça login novamente.');
    return res.redirect('/login');
  }
};

export const requireRole = (role) => (req, res, next) => {
  try {
    const userRole = req.session?.userRole;
    if (userRole === role) return next();
    req.flash('error', 'Acesso negado.');
    return res.redirect('/login');
  } catch (err) {
    console.error('Erro na verificação de role:', err);
    req.flash('error', 'Erro de autorização. Faça login novamente.');
    return res.redirect('/login');
  }
};
