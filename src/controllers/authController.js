import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { userController } from './userController.js';

export const authController = {
  showLoginForm(req, res) {
    res.render('auth/login', {
      pageTitle: 'Login',
      pageIcon: 'ri-login-box-line',
      layout: false,
      messages: req.flash(),
    });
  },

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('error', 'Email e senha são obrigatórios.');
        return res.redirect('/login');
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        req.flash('error', 'Credenciais inválidas.');
        return res.redirect('/login');
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        req.flash('error', 'Credenciais inválidas.');
        return res.redirect('/login');
      }

      // Sessão: armazene idUser, consultorio e role
      req.session.idUser = user.idUser;
      req.session.idConsultorio = user.consultorioId;
      req.session.userRole = 'user';

      // Tentar mapear para Profissional usando celular primeiro, depois nome
      try {
        const consultorioId = user.consultorioId;
        let profissional = null;
        if (user.celular) {
          profissional = await prisma.profissional.findFirst({
            where: { consultorioId, celular: user.celular },
          });
        }
        if (!profissional && user.nome) {
          // tenta por nome (igualdade simples)
          profissional = await prisma.profissional.findFirst({
            where: { consultorioId, nome: user.nome },
          });
        }

        if (profissional) {
          req.session.idProfissional = profissional.idProfissional;
          req.session.userRole = 'profissional';
        }
      } catch (err) {
        console.warn('Falha ao mapear User para Profissional:', err?.message || err);
      }

      req.flash('success', 'Login efetuado com sucesso.');
      return res.redirect('/');
    } catch (err) {
      console.error('Erro no login:', err);
      req.flash('error', 'Erro ao efetuar login. Tente novamente.');
      return res.redirect('/login');
    }
  },

  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao encerrar sessão:', err);
        req.flash('error', 'Erro ao encerrar sessão.');
        return res.redirect('/');
      }
      res.clearCookie('connect.sid');
      return res.redirect('/login');
    });
  },

  // opcional: criar conta de usuário
  async registerUser(req, res) {
    // Delega a criação de usuário para userController.createUser
    return userController.createUser(req, res);
  },
};
