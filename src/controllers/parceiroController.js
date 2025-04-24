// src/controllers/parceiroController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const parceiroController = {
  // Exibir formulário para criar um novo parceiro
  async newParceiroForm(req, res) {
    try {
      res.render('parceiros/new', {
        pageTitle: 'Novo Parceiro',
        pageIcon: 'ri-handshake-line',
        formData: {}, // Dados do formulário
        messages: req.flash(), // Mensagens flash
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de parceiro:', error);
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
    }
  },

  // Criar um novo parceiro
  async createParceiro(req, res) {
    try {
      const { nome, endereco, telefone, contato, credito } = req.body;

      console.log('Dados recebidos:', req.body); // Log dos dados recebidos

      if (!nome || !telefone) {
        console.log('Erro: Campos obrigatórios não preenchidos'); // Log de erro
        req.flash('error', 'Nome e telefone são obrigatórios.');
        return res.redirect('/parceiros/new');
      }

      // Criar o parceiro no banco de dados
      const novoParceiro = await prisma.parceiro.create({
        data: {
          nome,
          endereco: endereco || null,
          telefone,
          contato: contato || null,
          credito: credito ? parseFloat(credito) : null,
          consultorioId: req.session.idConsultorio, // Relaciona ao consultório atual
        },
      });

      console.log('Parceiro criado com sucesso:', novoParceiro);

      req.flash('success', 'Parceiro registrado com sucesso!');
      return res.redirect('/parceiros');
    } catch (error) {
      console.error('Erro ao registrar parceiro:', error);
      req.flash('error', 'Erro ao registrar parceiro. Verifique os dados e tente novamente.');
      return res.redirect('/parceiros/new');
    }
  },

  // Listar todos os parceiros
  async getAllParceiros(req, res) {
    try {
      const parceiros = await prisma.parceiro.findMany({
        where: { consultorioId: req.session.idConsultorio }, // Filtra pelo consultório atual
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

  // Deletar um parceiro
  async deleteParceiro(req, res) {
    try {
      const { idParceiro } = req.params;

      if (!idParceiro || isNaN(idParceiro)) {
        req.flash('error', 'ID do parceiro inválido.');
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
};
