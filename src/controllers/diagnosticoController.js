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
      const {
        esfOD,
        cilOD,
        eixoOD,
        avFinalOD,
        esfOE,
        cilOE,
        eixoOE,
        avFinalOE,
        adicao,
        descricao,
        minhasOBS,
        pacienteId,
        profissionalId,
      } = req.body;
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
          avFinalOD,
          esfOE,
          cilOE,
          eixoOE,
          avFinalOE,
          adicao,
          descricao,
          minhasOBS,
          pacienteId: parseInt(pacienteId),
          profissionalId: parseInt(profissionalId),
          consultorioId: idConsultorio,
        },
      });

      // Update patient status to 'atendido' and remove from queue
      await prisma.paciente.update({
        where: { idPaciente: parseInt(pacienteId) },
        data: {
          naFila: false,
          status: 'atendido',
        },
      });

      req.flash('success', 'Diagnóstico criado com sucesso!');
      return res.redirect('/profissionais/dashboard');
    } catch (error) {
      console.error('Erro ao criar diagnóstico:', error);
      req.flash('error', 'Erro ao criar diagnóstico. Tente novamente.');
      return res.redirect('/diagnosticos/new');
    }
  },

  // Formulário para criar novo diagnóstico
  async newDiagnosticoForm(req, res) {
    try {
      // Garanta que o idConsultorio seja um número para o Prisma
      const idConsultorio = parseInt(req.session.idConsultorio);
      const idProfissional = req.session.idProfissional;

      if (isNaN(idConsultorio)) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!idProfissional) {
        req.flash('error', 'Acesso negado. Apenas profissionais autenticados podem acessar esta página.');
        return res.redirect('/login');
      }

      const pacientes = await prisma.paciente.findMany({
        where: { consultorioId: idConsultorio },
        orderBy: {
          nome: 'asc',
        },
      });

      if (pacientes.length === 0) {
        req.flash('error', 'Nenhum paciente cadastrado neste consultório.');
        return res.redirect('/pacientes/new');
      }

      const profissionais = await prisma.profissional.findMany({
        where: { consultorioId: idConsultorio },
      });

      if (profissionais.length === 0) {
        req.flash('error', 'Nenhum profissional cadastrado neste consultório.');
        return res.redirect('/profissionais/new');
      }

      const consultas = await prisma.consulta.findMany({
        where: {
          consultorioId: idConsultorio,
          pagamentoRealizado: true,
        },
        include: {
          paciente: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // ... busca de pacientes e profissionais ...

      const { idPaciente } = req.query;
      let selectedPaciente = null;
      let diagnostico = null;

      if (idPaciente) {
        const pid = parseInt(idPaciente);
        if (!Number.isNaN(pid)) {
          // Busca direta no banco para garantir que temos o objeto completo e pertence ao consultório
          selectedPaciente = await prisma.paciente.findFirst({
            where: {
              idPaciente: pid,
              consultorioId: idConsultorio,
            },
          });

          if (selectedPaciente) {
            diagnostico = { pacienteId: selectedPaciente.idPaciente };
          }
        }
      }

      res.render('diagnosticos/new', {
        pageTitle: 'Novo Diagnóstico',
        pageIcon: 'ri-file-add-line',
        pacientes,
        profissionais,
        consultas, // Passa as consultas para a view
        idConsultorio,
        diagnostico,
        selectedPaciente,
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
          consultorio: true,
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
        layout: false,
        formatarSoma: (v1, v2) => {
          const n1 = parseFloat(String(v1 || '0').replace(',', '.'));
          const n2 = parseFloat(String(v2 || '0').replace(',', '.'));
          const soma = n1 + n2;
          if (Number.isNaN(soma)) return '';
          return (soma > 0 ? '+' : '') + soma.toFixed(2).replace('.', ',');
        },
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
        orderBy: {
          paciente: {
            nome: 'asc',
          },
        },
      });

      res.render('diagnosticos/index', {
        pageTitle: 'Lista de Diagnósticos',
        pageIcon: 'ri-file-list-line',
        diagnosticos,
      });
    } catch (error) {
      console.error('Erro ao buscar diagnósticos:', error);
      req.flash('error', 'Erro ao buscar diagnósticos. Tente novamente.');
      return res.redirect('/');
    }
  },

  async searchDiagnosticos(req, res) {
    try {
      const { query } = req.query;
      //ParseInt para garantir que o ID seja um número
      const idConsultorio = parseInt(req.session.idConsultorio);

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      // Se a busca estiver vazia, redireciona para a listagem
      if (!query || query.trim() === '') {
        return res.redirect('/diagnosticos');
      }

      // Limpar a string de busca
      const q = query.trim();

      const diagnosticos = await prisma.diagnostico.findMany({
        where: {
          consultorioId: idConsultorio,
          // Buscar nome
          OR: [
            {
              paciente: {
                nome: {
                  contains: q,
                },
              },
            },
          ],
        },
        include: {
          paciente: true,
          profissional: true,
        },
        orderBy: {
          paciente: {
            nome: 'asc',
          },
        },
      });

      if (diagnosticos.length === 0) {
        req.flash('warning', `Nenhum resultado para "${q}".`);
      }

      res.render('diagnosticos/index', {
        pageTitle: `Resultados para "${q}"`,
        pageIcon: 'ri-search-line',
        diagnosticos,
      });
    } catch (error) {
      console.error('Erro ao buscar diagnósticos:', error);
      req.flash('error', 'Erro ao processar a busca.');
      return res.redirect('/diagnosticos');
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

      // 1. Buscamos o diagnóstico incluindo os dados do paciente
      const diagnostico = await prisma.diagnostico.findFirst({
        where: {
          idDiagnostico: parseInt(idDiagnostico),
          consultorioId: idConsultorio,
        },
        include: { paciente: true }, // Isso traz o objeto 'paciente' junto com o diagnóstico
      });

      if (!diagnostico) {
        req.flash('error', 'Diagnóstico não encontrado.');
        return res.redirect('/diagnosticos');
      }

      const pacientes = await prisma.paciente.findMany({ where: { consultorioId: idConsultorio } });
      const profissionais = await prisma.profissional.findMany({ where: { consultorioId: idConsultorio } });

      // 2. Definimos a variável selectedPaciente que a sua View edit.ejs agora exige
      const selectedPaciente = diagnostico.paciente;

      res.render('diagnosticos/edit', {
        pageTitle: 'Editar Diagnóstico',
        pageIcon: 'ri-edit-line',
        diagnostico,
        pacientes,
        profissionais,
        idConsultorio,
        selectedPaciente, // <--- Aqui está a correção para o erro de ReferenceError
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
      const {
        esfOD,
        cilOD,
        eixoOD,
        avFinalOD,
        esfOE,
        cilOE,
        eixoOE,
        avFinalOE,
        adicao,
        descricao,
        minhasOBS,
        pacienteId,
        profissionalId,
      } = req.body;

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
          avFinalOD,
          esfOE,
          cilOE,
          eixoOE,
          avFinalOE,
          adicao,
          descricao,
          minhasOBS,
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
