// src/controllers/userController.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function findUserDoConsultorio(idUser, consultorioId) {
  return await prisma.user.findFirst({
    where: {
      idUser: parseInt(idUser),
      consultorioId: consultorioId,
    },
  });
}

export const userController = {
  // Formulário para adicionar um novo usuário
  async newUserForm(req, res) {
    try {
      if (!req.session.idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      res.render('users/new', {
        pageTitle: 'Novo Usuário',
        pageIcon: 'ri-user-add-line',
        formData: {},
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de usuário:', error);
      if (error instanceof prisma.PrismaClientInitializationError) {
        req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
      } else {
        req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      }
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
    }
  },

  // Criar um novo usuário
  async createUser(req, res) {
    try {
      const { nome, email, celular, password } = req.body;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!nome || !email || !celular || !password) {
        req.flash('error', 'Todos os campos são obrigatórios.');
        return res.redirect('/users/new');
      }

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(password, 10);

      const novoUsuario = await prisma.user.create({
        data: {
          nome,
          email,
          celular,
          password: hashedPassword, // Armazena o hash da senha
          consultorioId: idConsultorio,
        },
      });

      req.flash('success', 'Usuário registrado com sucesso!');
      return res.redirect('/users');
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      req.flash('error', 'Erro ao registrar usuário. Verifique os dados e tente novamente.');
      return res.redirect('/users/new');
    }
  },

  // Buscar usuário pelo ID
  async getUserById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idUser } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      // Buscar o usuário vinculado ao consultório
      const user = await prisma.user.findFirst({
        where: {
          idUser: parseInt(idUser),
          consultorioId: idConsultorio,
        },
      });

      if (!user) {
        req.flash('error', 'Usuário não encontrado.');
        return res.redirect('/users');
      }

      res.render('users/show', {
        pageTitle: 'Detalhes do Usuário',
        pageIcon: 'ri-user-line',
        user, // Passa os dados do usuário para a view
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      req.flash('error', 'Erro ao buscar usuário. Tente novamente.');
      return res.redirect('/users');
    }
  },

  // Listar todos os usuários
  async getAllUsers(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const users = await prisma.user.findMany({
        where: { consultorioId: idConsultorio },
      });

      res.render('users/index', {
        pageTitle: 'Lista de Usuários',
        pageIcon: 'ri-user-line',
        users,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      req.flash('error', 'Erro ao buscar usuários. Tente novamente.');
      return res.redirect('/users');
    }
  },

  // Formulário para editar um usuário
  async editUserForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idUser } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const user = await findUserDoConsultorio(idUser, idConsultorio);

      if (!user) {
        req.flash('error', 'Usuário não encontrado.');
        return res.redirect('/users');
      }

      res.render('users/edit', {
        pageTitle: 'Editar Usuário',
        pageIcon: 'ri-user-edit-line',
        user, // Passa os dados do usuário para a view
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição de usuário:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/users');
    }
  },

  // Atualizar usuário
  async updateUser(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idUser } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const { nome, email, celular, password, isActive } = req.body;

      // Buscar o usuário atual para obter a senha existente
      const user = await prisma.user.findFirst({
        where: {
          idUser: parseInt(idUser),
          consultorioId: idConsultorio,
        },
      });

      if (!user) {
        req.flash('error', 'Usuário não encontrado.');
        return res.redirect('/users');
      }

      // Criptografar a nova senha, se fornecida
      const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

      // Atualizar o usuário no banco de dados
      await prisma.user.update({
        where: { idUser: parseInt(idUser) },
        data: {
          nome,
          email,
          celular,
          password: hashedPassword, // Atualiza a senha apenas se fornecida
          isActive: isActive === 'true', // Converte para booleano
        },
      });

      req.flash('success', 'Usuário atualizado com sucesso!');
      return res.redirect('/users');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      req.flash('error', 'Erro ao atualizar usuário. Tente novamente.');
      return res.redirect(`/users/${req.params.idUser}/edit`);
    }
  },

  // Deletar usuário
  async deleteUser(req, res) {
    try {
      const { idUser } = req.params;

      await prisma.user.delete({
        where: { idUser: parseInt(idUser) },
      });

      req.flash('success', 'Usuário deletado com sucesso!');
      return res.redirect('/users');
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      req.flash('error', 'Erro ao deletar usuário. Tente novamente.');
      return res.redirect('/users');
    }
  },
};
