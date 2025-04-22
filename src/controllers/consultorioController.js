// server/controllers/consultorioController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const consultorioController = {
  async newConsultorioForm(req, res) {
    try {
      res.render('consultorios/new', {
        pageTitle: 'Consultório',
        pageIcon: 'ri-home-office-line',
        formData: {}, // Adiciona formData com um objeto vazio
        messages: req.flash(), // Passa as mensagens flash para a view
      });
    } catch (error) {
      console.error('Erro ao exibir o formulário de consultório:', error);
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
    }
  },
  // Criar novo consultorio
  async createConsultorio(req, res) {
    try {
      const { nome, responsavel, celular, cep, endereco, numero, bairro, cidade, cpf, profissao } = req.body;
      console.log('Dados recebidos:', req.body); // Log dos dados recebidos

      if (!nome || !celular || !endereco || !numero || !bairro || !cidade || !profissao) {
        console.log('Erro: Campos obrigatórios não preenchidos'); // Log de erro
        req.flash('error', 'Nome, celular, endereço, número, bairro, cidade e profissão são obrigatórios.');
        return res.redirect('/consultorios/new');
      }

      const novoConsultorio = await prisma.consultorio.create({
        data: {
          nome,
          responsavel: responsavel || null, // Permite valores nulos
          celular,
          cep: cep || null, // Permite valores nulos
          endereco,
          numero: parseInt(numero),
          bairro,
          cidade,
          cpf: cpf || null, // Permite valores nulos
          profissao,
        },
      });

      console.log('Consultório criado com sucesso:', novoConsultorio);
      req.flash('success', 'Consultório criado com sucesso!');
      return res.redirect('/consultorios/index');
    } catch (error) {
      console.error('Erro ao criar consultório:', error);
      req.flash('error', 'Erro ao criar consultório. Verifique os dados e tente novamente.');
      return res.redirect('/consultorios/new');
    }
  },

  // Buscar consultório pelo ID
  async getConsultorioById(req, res) {
    try {
      const { idConsultorio } = req.params; // Pega o parâmetro da URL
      // Verifica se o idConsultorio é válido
      if (!idConsultorio || isNaN(idConsultorio)) {
        req.flash('error', 'ID do consultório inválido.');
        return res.redirect('/consultorios/');
      }
      // Busca o consultório pelo ID no banco de dados
      const consultorio = await prisma.consultorio.findUnique({
        where: {
          idConsultorio: parseInt(idConsultorio), // Certifique-se de que o idConsultorio é um número
        },
      });

      // Verifica se o consultório existe
      if (!consultorio) {
        req.flash('error', 'Consultório não encontrado.');
        return res.redirect('/consultorios');
      }
      // Renderiza a view com os dados do consultório
      res.render('consultorios/detalhes', {
        pageTitle: 'Detalhes do Consultório',
        pageIcon: 'ri-home-office-line',
        consultorio, // Passa os dados do consultório para a view
      });
    } catch (error) {
      console.error('Erro ao buscar consultório por ID:', error);
      req.flash('error', 'Erro ao buscar consultório. Tente novamente.');
      return res.redirect('/consultorios');
    }
  },

  // buscar consultorio por nome ou responsavel
  async searchConsultorios(req, res) {
    try {
      const { termo } = req.query; // Obtém o termo de busca da query string

      if (!termo) {
        req.flash('info', 'Nenhum termo de busca fornecido.');
        return res.redirect('/consultorios'); // Redireciona para a lista completa
      }

      // Realiza a busca no banco de dados com base no nome ou responsável
      const consultorios = await prisma.consultorio.findMany({
        where: {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { responsavel: { contains: termo, mode: 'insensitive' } },
          ],
        },
      });

      if (consultorios.length === 0) {
        req.flash('info', 'Nenhum consultório encontrado com o termo de busca fornecido.');
      }

      res.render('consultorios/index', {
        pageTitle: 'Lista de Consultórios',
        pageIcon: 'ri-home-office-line',
        consultorios: consultorios,
        messages: req.flash(), // Passa as mensagens flash para a view
      });
    } catch (error) {
      console.error('Erro ao buscar consultórios:', error);
      req.flash('error', 'Erro ao buscar consultórios. Tente novamente.');
      return res.redirect('/consultorios/index');
    }
  },

  // Editar um consultório no BD
  async editConsultorioForm(req, res) {
    try {
      const { idConsultorio } = req.params;

      if (!idConsultorio || isNaN(idConsultorio)) {
        req.flash('error', 'ID do consultório inválido.');
        return res.redirect('/consultorios');
      }

      const consultorio = await prisma.consultorio.findUnique({
        where: { idConsultorio: parseInt(idConsultorio) },
      });

      if (!consultorio) {
        req.flash('error', 'Consultório não encontrado.');
        return res.redirect('/consultorios');
      }

      res.render('consultorios/edit', {
        pageTitle: 'Editar Consultório',
        pageIcon: 'ri-home-office-line',
        consultorio,
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir o formulário de edição.');
      return res.redirect('/consultorios');
    }
  },

  async updateConsultorio(req, res) {
    try {
      const { idConsultorio } = req.params;
      const { nome, responsavel, celular, cep, endereco, numero, bairro, cidade, cpf, profissao } = req.body;

      if (!idConsultorio || isNaN(idConsultorio)) {
        req.flash('error', 'ID do consultório inválido.');
        return res.redirect('/consultorios/edit');
      }

      await prisma.consultorio.update({
        where: { idConsultorio: parseInt(idConsultorio) },
        data: {
          nome,
          responsavel,
          celular,
          cep,
          endereco,
          numero: parseInt(numero),
          bairro,
          cidade,
          cpf,
          profissao,
        },
      });

      req.flash('success', 'Consultório atualizado com sucesso!');
      return res.redirect('/consultorios/index');
    } catch (error) {
      console.error('Erro ao atualizar consultório:', error);
      req.flash('error', 'Erro ao atualizar consultório.');
      return res.redirect(`/consultorios/${idConsultorio}/edit`);
    }
  },

  //Buscar todos os consultórios no BD
  async getAllConsultorios(req, res) {
    try {
      const consultorios = await prisma.consultorio.findMany();

      if (consultorios.length === 0) {
        return res.status(404).json({ message: 'Nenhum consultório encontrado.' });
      }

      res.render('consultorios/index', {
        pageTitle: 'Lista de Consultórios',
        pageIcon: 'ri-home-office-line',
        consultorios: consultorios, // A variável correta aqui é 'consultorios'
        messages: req.flash('success', 'Consultório criado com sucesso!'),
      });
    } catch (error) {
      console.error('Erro ao buscar consultórios:', error);
      req.flash('error', 'Erro ao buscar consultórios. Tente novamente.');
      return res.redirect('/consultorios');
    }
  },

  // Deletar consultorio do bd
  async deleteConsultorio(req, res) {
    try {
      const { idConsultorio } = req.params;

      if (!idConsultorio || isNaN(idConsultorio)) {
        return res.status(400).json({ error: 'ID inválido.' });
      }

      const consultorioDeletado = await prisma.consultorio.delete({
        where: {
          idConsultorio: parseInt(idConsultorio),
        },
      });

      if (!consultorioDeletado) {
        return res.status(404).json({ error: 'Consultório não encontrado.' });
      }
      console.log('Consultório deletado com sucesso.');
      req.flash('success', 'Consultório deletado com sucesso!');
      return res.redirect('/consultorios/index');
    } catch (error) {
      console.error('Erro ao deletar consultório:', error);
      req.flash('error', 'Erro ao deletar consultório. Tente novamente.');
      return res.redirect('/consultorios/index');
    }
  },
};
