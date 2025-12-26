import bcrypt from 'bcrypt';
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
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        req.flash('error', 'Credenciais inválidas');
        return res.redirect('/login');
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        req.flash('error', 'Credenciais inválidas');
        return res.redirect('/login');
      }

      // Sessão base
      req.session.idUser = user.idUser;
      req.session.idConsultorio = user.consultorioId;
      req.session.userRole = 'user';

      // 1) Tenta vínculo explícito via userId
      let profissional = await prisma.profissional.findFirst({
        where: { userId: user.idUser },
      });

      // 2) Se não houver vínculo explícito, tenta heurística (celular/nome) no mesmo consultório
      if (!profissional) {
        const candidates = await prisma.profissional.findMany({
          where: {
            consultorioId: user.consultorioId,
            OR: [...(user.celular ? [{ celular: user.celular }] : []), ...(user.nome ? [{ nome: user.nome }] : [])],
          },
        });

        if (candidates.length === 1) {
          profissional = candidates[0];
        } else if (candidates.length > 1) {
          // salvar candidatos na sessão e pedir confirmação do usuário
          req.session.profissionalCandidates = candidates.map((p) => p.idProfissional);
          req.flash('info', 'Escolha qual profissional vincular à sua conta.');
          return res.redirect('/auth/link-profissional');
        }
      }

      // Se encontrou profissional (explícito ou heurístico), marca sessão como profissional
      if (profissional) {
        req.session.idProfissional = profissional.idProfissional;
        req.session.userRole = 'profissional';
      }

      req.flash('success', 'Bem vindo');

      // Redireciona para dashboard do profissional se for profissional
      const redirectTo = profissional ? '/profissionais/dashboard' : '/';
      return res.redirect(redirectTo);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Erro no login');
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
