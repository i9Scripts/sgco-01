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

      // Tentar mapear para Profissional: 1) relação explícita (userId), 2) heurísticas (celular/nome)
      try {
        const consultorioId = user.consultorioId;
        // 1) procura por vínculo explícito
        let profissional = await prisma.profissional.findFirst({ where: { userId: user.idUser } });

        if (!profissional) {
          // 2) heurística: procura por possíveis matches (por celular e nome)
          const orClauses = [];
          if (user.celular) orClauses.push({ celular: user.celular });
          if (user.nome) orClauses.push({ nome: user.nome });

          if (orClauses.length > 0) {
            const matches = await prisma.profissional.findMany({ where: { consultorioId, OR: orClauses } });
            if (matches.length === 1) {
              profissional = matches[0];
            } else if (matches.length > 1) {
              // múltiplas correspondências: armazenar candidatos na sessão e redirecionar para confirmação
              req.session.profissionalCandidates = matches.map((m) => ({ id: m.idProfissional, nome: m.nome }));
              req.flash('info', 'Várias correspondências encontradas. Confirme qual profissional é você.');
              return res.redirect('/auth/link-profissional');
            }
          }
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

  // Mostra página para o usuário escolher qual profissional corresponde a sua conta
  showLinkProfissional(req, res) {
    const candidatos = req.session.profissionalCandidates || [];
    if (!candidatos || candidatos.length === 0) {
      req.flash('info', 'Nenhum candidato para vinculação.');
      return res.redirect('/');
    }
    return res.render('auth/link-profissional', { layout: false, candidatos, messages: req.flash() });
  },

  // Recebe seleção do usuário e vincula o profissional ao user
  async linkProfissional(req, res) {
    try {
      const { selectedId } = req.body;
      const idUser = req.session.idUser;
      const candidatos = req.session.profissionalCandidates || [];
      if (!idUser) {
        req.flash('error', 'Sessão inválida. Faça login novamente.');
        return res.redirect('/login');
      }
      if (!candidatos.find((c) => String(c.id) === String(selectedId))) {
        req.flash('error', 'Seleção inválida.');
        return res.redirect('/auth/link-profissional');
      }

      // Atualiza Profissional.userId para vincular
      await prisma.profissional.update({ where: { idProfissional: parseInt(selectedId) }, data: { userId: idUser } });
      // Atualiza sessão
      req.session.idProfissional = parseInt(selectedId);
      req.session.userRole = 'profissional';
      delete req.session.profissionalCandidates;
      req.flash('success', 'Vinculação realizada com sucesso.');
      return res.redirect('/');
    } catch (err) {
      console.error('Erro ao vincular profissional:', err);
      req.flash('error', 'Erro ao vincular profissional. Tente novamente.');
      return res.redirect('/auth/link-profissional');
    }
  },

  // opcional: criar conta de usuário
  async registerUser(req, res) {
    // Delega a criação de usuário para userController.createUser
    return userController.createUser(req, res);
  },
};
