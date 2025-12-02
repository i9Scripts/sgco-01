// src/controllers/parceiroController.js
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
// prisma centralizado
// para garantir que os dados estão vinculados com a tabela Consultorio
async function findParceiroDoConsultorio(idParceiro, idConsultorio) {
  return await prisma.parceiro.findFirst({
    where: {
      idParceiro: parseInt(idParceiro),
      consultorioId: idConsultorio,
    },
  });
}

export const parceiroController = {
  async newParceiroForm(req, res) {
    try {
      if (!req.session.idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      res.render('parceiros/new', {
        pageTitle: 'Novo Parceiro',
        pageIcon: 'ri-handshake-line',
        formData: {},
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de parceiro:', error);
      if (error instanceof Prisma.PrismaClientInitializationError) {
        req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
      } else {
        req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      }
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
    }
  },
  // Criar um novo Parceiro
  async createParceiro(req, res) {
    try {
      const { nome, endereco, telefone, contato, credito } = req.body;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!nome || !telefone) {
        req.flash('error', 'Nome e telefone são obrigatórios.');
        // return res.redirect('/parceiros/new');
      }

      await prisma.parceiro.create({
        data: {
          nome,
          endereco: endereco || null,
          telefone,
          contato: contato || null,
          credito: credito ? parseFloat(credito) : null,
          consultorioId: idConsultorio,
        },
      });

      req.flash('success', 'Parceiro registrado com sucesso!');
      return res.redirect('/parceiros');
    } catch (error) {
      console.error('Erro ao registrar parceiro:', error);
      req.flash('error', 'Erro ao registrar parceiro. Verifique os dados e tente novamente.');
      // return res.redirect('/parceiros/new');
    }
  },
  // Buscar Parceiro por ID
  async getParceiroById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const parceiro = await findParceiroDoConsultorio(req.params.idParceiro, idConsultorio);
      if (!parceiro) {
        req.flash('error', 'Parceiro não encontrado.');
        return res.redirect('/parceiros');
      }

      res.render('parceiros/show', {
        pageTitle: 'Detalhes do Parceiro',
        pageIcon: 'ri-handshake-line',
        parceiro,
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar parceiro:', error);
      req.flash('error', 'Erro ao buscar parceiro. Tente novamente.');
      return res.redirect('/parceiros');
    }
  },
  // Lista dos Parceiros
  async getAllParceiros(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const parceiros = await prisma.parceiro.findMany({
        where: { consultorioId: idConsultorio },
      });

      res.render('parceiros/index', {
        pageTitle: 'Lista de Parceiros',
        pageIcon: 'ri-handshake-line',
        parceiros,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      req.flash('error', 'Erro ao buscar parceiros. Tente novamente.');
      return res.redirect('/parceiros');
    }
  },
  // Buscar Parceiros por nome ou contato
  async searchParceiros(req, res) {
    try {
      const { query } = req.query;
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const parceiros = await prisma.parceiro.findMany({
        where: {
          consultorioId: idConsultorio,
          OR: [
            { nome: { contains: query, mode: 'insensitive' } },
            { contato: { contains: query, mode: 'insensitive' } },
          ],
        },
      });

      res.render('parceiros/index', {
        pageTitle: 'Resultados da Busca',
        pageIcon: 'ri-search-line',
        parceiros,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      req.flash('error', 'Erro ao buscar parceiros. Tente novamente.');
      return res.redirect('/parceiros');
    }
  },
  // Atualizar Parceiros
  async updateParceiro(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idParceiro } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const parceiro = await findParceiroDoConsultorio(idParceiro, idConsultorio);
      if (!parceiro) {
        req.flash('error', 'Parceiro não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/parceiros');
      }

      const { nome, endereco, telefone, contato, credito } = req.body;

      await prisma.parceiro.update({
        where: { idParceiro: parseInt(idParceiro) },
        data: {
          nome,
          endereco: endereco || null,
          telefone,
          contato: contato || null,
          credito: credito ? parseFloat(credito) : null,
        },
      });

      req.flash('success', 'Parceiro atualizado com sucesso!');
      return res.redirect('/parceiros');
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      req.flash('error', 'Erro ao atualizar parceiro. Tente novamente.');
      return res.redirect(`/parceiros/${req.params.idParceiro}/edit`);
    }
  },
  // Deletar Parceiros
  async deleteParceiro(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idParceiro } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const parceiro = await findParceiroDoConsultorio(idParceiro, idConsultorio);
      if (!parceiro) {
        req.flash('error', 'Parceiro não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/parceiros');
      }

      await prisma.parceiro.delete({
        where: { idParceiro: parseInt(idParceiro) },
      });

      req.flash('success', 'Parceiro deletado com sucesso!');
      return res.redirect('/parceiros');
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error);
      req.flash('error', 'Erro ao deletar parceiro. Tente novamente.');
      return res.redirect('/parceiros');
    }
  },
  // para editar Parceiro
  async editParceiroForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idParceiro } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const parceiro = await findParceiroDoConsultorio(idParceiro, idConsultorio);
      if (!parceiro) {
        req.flash('error', 'Parceiro não encontrado.');
        return res.redirect('/parceiros');
      }

      res.render('parceiros/edit', {
        pageTitle: 'Editar Parceiro',
        pageIcon: 'ri-edit-line',
        parceiro,
        layout: false,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/parceiros');
    }
  },
};
