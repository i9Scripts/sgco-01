import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

async function findServicoDoConsultorio(idServico, consultorioId) {
  const id = parseInt(idServico);
  if (isNaN(id)) return null;
  return await prisma.servico.findFirst({ where: { idServico: id, consultorioId } });
}

export const servicoController = {
  findServicoDoConsultorio,

  async newServicoForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      res.render('servicos/new', {
        pageTitle: 'Novo Serviço',
        pageIcon: 'ri-add-box-line',
        formData: {},
        idConsultorio,
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de serviço:', error);
      req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      return res.redirect('/servicos');
    }
  },

  async createServico(req, res) {
    try {
      const { descricao, valor } = req.body;
      const file = req.file;
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }
      if (!descricao || !valor) {
        req.flash('error', 'Descrição e valor são obrigatórios.');
        return res.redirect('/servicos/new');
      }

      const imagemPath = file ? `/img/servicos/${file.filename}` : null;

      await prisma.servico.create({
        data: {
          descricao,
          valor: parseFloat(valor),
          imagem: imagemPath,
          consultorioId: idConsultorio,
        },
      });

      req.flash('success', 'Serviço criado com sucesso!');
      return res.redirect('/servicos');
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        req.flash('error', 'Erro no banco de dados ao criar serviço.');
      } else {
        req.flash('error', 'Erro ao criar serviço. Tente novamente.');
      }
      return res.redirect('/servicos/new');
    }
  },

  async getAllServicos(req, res) {
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

      const servicos = await prisma.servico.findMany({
        where,
        orderBy: { descricao: 'asc' },
      });

      res.render('servicos/index', {
        pageTitle: 'Serviços',
        pageIcon: 'ri-list-check',
        servicos,
        query: query || '',
      });
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      req.flash('error', 'Erro ao buscar serviços. Tente novamente.');
      return res.redirect('/');
    }
  },

  async getServicoById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idServico } = req.params;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const servico = await findServicoDoConsultorio(idServico, idConsultorio);
      if (!servico) {
        req.flash('error', 'Serviço não encontrado.');
        return res.redirect('/servicos');
      }

      res.render('servicos/show', {
        pageTitle: 'Detalhes do Serviço',
        pageIcon: 'ri-file-list-line',
        servico,
      });
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      req.flash('error', 'Erro ao buscar serviço.');
      return res.redirect('/servicos');
    }
  },

  async editServicoForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idServico } = req.params;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const servico = await findServicoDoConsultorio(idServico, idConsultorio);
      if (!servico) {
        req.flash('error', 'Serviço não encontrado.');
        return res.redirect('/servicos');
      }

      res.render('servicos/edit', {
        pageTitle: 'Editar Serviço',
        pageIcon: 'ri-edit-line',
        servico,
        idConsultorio,
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário.');
      return res.redirect('/servicos');
    }
  },

  async updateServico(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idServico } = req.params;
      const { descricao, valor } = req.body;
      const file = req.file;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const servico = await findServicoDoConsultorio(idServico, idConsultorio);
      if (!servico) {
        req.flash('error', 'Serviço não encontrado.');
        return res.redirect('/servicos');
      }

      if (!descricao || !valor) {
        req.flash('error', 'Descrição e valor são obrigatórios.');
        return res.redirect(`/servicos/${idServico}/edit`);
      }

      const updateData = {
        descricao,
        valor: parseFloat(valor),
      };
      if (file) {
        updateData.imagem = `/img/servicos/${file.filename}`;
      }

      await prisma.servico.update({
        where: { idServico: parseInt(idServico) },
        data: updateData,
      });

      req.flash('success', 'Serviço atualizado com sucesso!');
      return res.redirect('/servicos');
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      req.flash('error', 'Erro ao atualizar serviço.');
      return res.redirect(`/servicos/${req.params.idServico}/edit`);
    }
  },

  async deleteServico(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idServico } = req.params;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const servico = await findServicoDoConsultorio(idServico, idConsultorio);
      if (!servico) {
        req.flash('error', 'Serviço não encontrado.');
        return res.redirect('/servicos');
      }

      await prisma.servico.delete({ where: { idServico: servico.idServico } });
      req.flash('success', 'Serviço deletado com sucesso!');
      return res.redirect('/servicos');
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      req.flash('error', 'Erro ao deletar serviço.');
      return res.redirect('/servicos');
    }
  },
};

export default servicoController;
