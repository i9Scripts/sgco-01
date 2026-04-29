import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

async function findProdutoDoConsultorio(idProduto, consultorioId) {
  const id = parseInt(idProduto);
  if (isNaN(id)) return null;

  return await prisma.produto.findFirst({
    where: {
      consultorioId: consultorioId,
      idProduto: id,
    },
  });
}

export const produtoController = {
  findProdutoDoConsultorio,

  async newProdutoForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      res.render('produtos/new', {
        pageTitle: 'Novo Produto',
        pageIcon: 'ri-add-box-line',
        formData: {},
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de produto:', error);
      if (error instanceof Prisma.PrismaClientInitializationError) {
        req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
      } else {
        req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      }
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
    }
  },

  async createProduto(req, res) {
    try {
      const { descricao, valor, quantidade } = req.body;
      // imagem pode vir do multer como req.file
      const file = req.file;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!descricao || !valor || !quantidade) {
        req.flash('error', 'Descrição, valor e quantidade são campos obrigatórios.');
        return res.redirect('/produtos/new');
      }

      const consultorioExists = await prisma.consultorio.findUnique({ where: { idConsultorio } });
      if (!consultorioExists) {
        req.flash('error', 'Consultório selecionado não existe.');
        return res.redirect('/consultorios');
      }

      const imagemPath = file ? `/img/produtos/${file.filename}` : null;

      await prisma.produto.create({
        data: {
          descricao,
          valor: parseFloat(valor),
          quantidade: parseInt(quantidade),
          imagem: imagemPath,
          consultorioId: idConsultorio,
        },
      });

      req.flash('success', 'Produto registrado com sucesso!');
      return res.redirect('/produtos');
    } catch (error) {
      console.error('Erro ao registrar produto:', error);
      req.flash('error', 'Erro ao registrar produto. Verifique os dados e tente novamente.');
      return res.redirect('/produtos/new');
    }
  },

  async getAllProdutos(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { query } = req.query;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const where = { consultorioId: idConsultorio };
      if (query && query.trim() !== '') {
        where.descricao = { contains: query.trim() };
      }

      const produtos = await prisma.produto.findMany({
        where,
        orderBy: { descricao: 'asc' },
      });

      res.render('produtos/index', {
        pageTitle: 'Lista de Produtos',
        pageIcon: 'ri-archive-line',
        produtos,
        query: query || '',
      });
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      req.flash('error', 'Erro ao buscar produtos. Tente novamente.');
      return res.redirect('/');
    }
  },

  async getProdutoById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const { idProduto } = req.params;
      const produto = await findProdutoDoConsultorio(idProduto, idConsultorio);
      if (!produto) {
        req.flash('error', 'Produto não encontrado.');
        return res.redirect('/produtos');
      }

      res.render('produtos/show', {
        pageTitle: 'Detalhes do Produto',
        pageIcon: 'ri-box-3-line',
        produto,
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      req.flash('error', 'Erro ao buscar produto. Tente novamente.');
      return res.redirect('/produtos');
    }
  },

  async editProdutoForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const { idProduto } = req.params;
      const produto = await findProdutoDoConsultorio(idProduto, idConsultorio);
      if (!produto) {
        req.flash('error', 'Produto não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/produtos');
      }

      res.render('produtos/edit', {
        pageTitle: 'Editar Produto',
        pageIcon: 'ri-edit-box-line',
        produto,
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição de produto:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/produtos');
    }
  },

  async updateProduto(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const { idProduto } = req.params;
      const produto = await findProdutoDoConsultorio(idProduto, idConsultorio);
      if (!produto) {
        req.flash('error', 'Produto não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/produtos');
      }

      const { descricao, valor, quantidade } = req.body;
      const file = req.file;
      if (!descricao || !valor || !quantidade) {
        req.flash('error', 'Descrição, valor e quantidade são campos obrigatórios.');
        return res.redirect(`/produtos/${idProduto}/edit`);
      }

      const updateData = {
        descricao,
        valor: parseFloat(valor),
        quantidade: parseInt(quantidade),
      };
      if (file) {
        updateData.imagem = `/img/produtos/${file.filename}`;
      }

      await prisma.produto.update({
        where: { idProduto: parseInt(idProduto) },
        data: updateData,
      });

      req.flash('success', 'Produto atualizado com sucesso!');
      return res.redirect('/produtos');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      req.flash('error', 'Erro ao atualizar produto. Tente novamente.');
      return res.redirect(`/produtos/${req.params.idProduto}/edit`);
    }
  },

  async deleteProduto(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const { idProduto } = req.params;
      const produto = await findProdutoDoConsultorio(idProduto, idConsultorio);
      if (!produto) {
        req.flash('error', 'Produto não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/produtos');
      }

      await prisma.produto.delete({ where: { idProduto: produto.idProduto } });

      req.flash('success', 'Produto deletado com sucesso!');
      return res.redirect('/produtos');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        req.flash('error', 'Não é possível deletar o produto, pois ele está associado a vendas existentes.');
      } else {
        req.flash('error', 'Erro ao deletar o produto. Tente novamente.');
      }
      return res.redirect('/produtos');
    }
  },
};
