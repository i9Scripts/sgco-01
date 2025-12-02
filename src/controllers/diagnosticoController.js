import prisma from '../lib/prisma.js';

// prisma centralizado

// Função auxiliar para garantir que o diagnóstico pertence ao consultório
async function findDiagnosticoDoConsultorio(idDiagnostico, idConsultorio) {
  return await prisma.diagnostico.findFirst({
    where: {
      idDiagnostico: parseInt(idDiagnostico),
      consultorioId: idConsultorio,
    },
  });
}

export const diagnosticoController = {
  // Criar novo diagnóstico
  async createDiagnostico(req, res) {
    try {
      const { esfOD, cilOD, eixoOD, esfOE, cilOE, eixoOE, adicao, descricao, pacienteId, profissionalId } = req.body;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      await prisma.diagnostico.create({
        data: {
          esfOD,
          cilOD,
          eixoOD,
          esfOE,
          cilOE,
          eixoOE,
          adicao,
          descricao,
          pacienteId: parseInt(pacienteId),
          profissionalId: parseInt(profissionalId),
          consultorioId: idConsultorio,
        },
      });

      req.flash('success', 'Diagnóstico criado com sucesso!');
      return res.redirect('/diagnosticos');
    } catch (error) {
      console.error('Erro ao criar diagnóstico:', error);
      req.flash('error', 'Erro ao criar diagnóstico. Tente novamente.');
      return res.redirect('/diagnosticos/new');
    }
  },

  // Formulário para criar novo diagnóstico
  async newDiagnosticoForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const idProfissional = req.session.idProfissional; // ID do profissional autenticado

      // Verificar se o consultório está selecionado
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      // Verificar se o profissional está autenticado
      if (!idProfissional) {
        req.flash('error', 'Acesso negado. Apenas profissionais autenticados podem acessar esta página.');
        return res.redirect('/login');
      }

      // Buscar pacientes vinculados ao consultório
      const pacientes = await prisma.paciente.findMany({
        where: { consultorioId: idConsultorio },
      });

      // Verificar se há pacientes cadastrados no consultório
      if (pacientes.length === 0) {
        req.flash('error', 'Nenhum paciente cadastrado neste consultório.');
        return res.redirect('/pacientes/new');
      }

      // Renderizar o formulário de criação de diagnóstico
      res.render('diagnosticos/new', {
        pageTitle: 'Novo Diagnóstico',
        pageIcon: 'ri-file-add-line',
        pacientes,
        idConsultorio,
        messages: req.flash(''),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de diagnóstico:', error);
      req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      return res.redirect('/diagnosticos');
    }
  },

  // Detalhes de um diagnóstico
  async getDiagnosticoById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idDiagnostico } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const diagnostico = await prisma.diagnostico.findFirst({
        where: {
          idDiagnostico: parseInt(idDiagnostico),
          consultorioId: idConsultorio,
        },
        include: {
          paciente: true,
          profissional: true,
        },
      });

      if (!diagnostico) {
        req.flash('error', 'Diagnóstico não encontrado.');
        return res.redirect('/diagnosticos');
      }

      res.render('diagnosticos/show', {
        pageTitle: 'Detalhes do Diagnóstico',
        pageIcon: 'ri-file-list-line',
        diagnostico,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar diagnóstico:', error);
      req.flash('error', 'Erro ao buscar diagnóstico. Tente novamente.');
      return res.redirect('/diagnosticos');
    }
  },
  // Listar todos os diagnósticos
  async getAllDiagnosticos(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const diagnosticos = await prisma.diagnostico.findMany({
        where: { consultorioId: idConsultorio },
        include: {
          paciente: true,
          profissional: true,
        },
      });

      res.render('diagnosticos/index', {
        pageTitle: 'Lista de Diagnósticos',
        pageIcon: 'ri-file-list-line',
        diagnosticos,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar diagnósticos:', error);
      req.flash('error', 'Erro ao buscar diagnósticos. Tente novamente.');
      return res.redirect('/');
    }
  },
  // Formulário para editar diagnóstico
  async editDiagnosticoForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idDiagnostico } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const diagnostico = await findDiagnosticoDoConsultorio(idDiagnostico, idConsultorio);
      if (!diagnostico) {
        req.flash('error', 'Diagnóstico não encontrado.');
        return res.redirect('/diagnosticos');
      }

      const pacientes = await prisma.paciente.findMany({ where: { consultorioId: idConsultorio } });
      const profissionais = await prisma.profissional.findMany({ where: { consultorioId: idConsultorio } });

      res.render('diagnosticos/edit', {
        pageTitle: 'Editar Diagnóstico',
        pageIcon: 'ri-edit-line',
        diagnostico,
        pacientes,
        profissionais,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/diagnosticos');
    }
  },

  // Atualizar diagnóstico
  async updateDiagnostico(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idDiagnostico } = req.params;
      const { esfOD, cilOD, eixoOD, esfOE, cilOE, eixoOE, adicao, descricao, pacienteId, profissionalId } = req.body;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const diagnostico = await findDiagnosticoDoConsultorio(idDiagnostico, idConsultorio);
      if (!diagnostico) {
        req.flash('error', 'Diagnóstico não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/diagnosticos');
      }

      await prisma.diagnostico.update({
        where: { idDiagnostico: parseInt(idDiagnostico) },
        data: {
          esfOD,
          cilOD,
          eixoOD,
          esfOE,
          cilOE,
          eixoOE,
          adicao,
          descricao,
          pacienteId: parseInt(pacienteId),
          profissionalId: parseInt(profissionalId),
        },
      });

      req.flash('success', 'Diagnóstico atualizado com sucesso!');
      return res.redirect('/diagnosticos');
    } catch (error) {
      console.error('Erro ao atualizar diagnóstico:', error);
      req.flash('error', 'Erro ao atualizar diagnóstico. Tente novamente.');
      return res.redirect(`/diagnosticos/${req.params.idDiagnostico}/edit`);
    }
  },

  // Deletar diagnóstico
  async deleteDiagnostico(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idDiagnostico } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const diagnostico = await findDiagnosticoDoConsultorio(idDiagnostico, idConsultorio);
      if (!diagnostico) {
        req.flash('error', 'Diagnóstico não encontrado ou não pertence ao seu consultório.');
        return res.redirect('/diagnosticos');
      }

      await prisma.diagnostico.delete({
        where: { idDiagnostico: parseInt(idDiagnostico) },
      });

      req.flash('success', 'Diagnóstico deletado com sucesso!');
      return res.redirect('/diagnosticos');
    } catch (error) {
      console.error('Erro ao deletar diagnóstico:', error);
      req.flash('error', 'Erro ao deletar diagnóstico. Tente novamente.');
      return res.redirect('/diagnosticos');
    }
  },
};
