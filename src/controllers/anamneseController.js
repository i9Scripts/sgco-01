// src/controllers/anamneseController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// para garantir que os dados estão vinculados com a tabela Consultorio
async function findAnamneseDoConsultorio(idAnam, idConsultorio) {
  return await prisma.anamnese.findFirst({
    where: {
      idAnam: parseInt(idAnam), // Certifique-se de que idAnam é um número
      consultorioId: idConsultorio,
    },
  });
}

export const anamneseController = {
  async newAnamneseForm(req, res) {
    try {
      const { idPaciente, idConsultorio } = req.session;

      if (!idPaciente || !idConsultorio) {
        req.flash('error', 'Paciente ou consultório não encontrado.');
        return res.redirect('/pacientes');
      }

      const paciente = await prisma.paciente.findFirst({
        where: { idPaciente, consultorioId: idConsultorio },
      });

      if (!paciente) {
        req.flash('error', 'Paciente inválido.');
        return res.redirect('/pacientes');
      }

      res.render('anamneses/new', {
        pageTitle: 'Nova Anamnese',
        pageIcon: 'ri-file-text-line',
        idPaciente,
        idConsultorio,
        paciente,
        formData: {},
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de anamnese:', error);
      return res.status(500).json({ error: 'Erro ao exibir formulário', details: error.message });
    }
  },

  async createAnamnese(req, res) {
    try {
      const { idPaciente, idConsultorio } = req.session;
      const {
        motivo,
        ultimoExame,
        usuarioOculos,
        usuarioLC,
        trauma,
        dm,
        has,
        glauc,
        dmFam,
        glaucFam,
        sintomas,
        remedio,
        obsGerais,
        adicao,
        cilOD,
        esfOD,
        eixoOD,
        cilOE,
        esfOE,
        eixoOE,
      } = req.body;

      if (!idPaciente || !idConsultorio) {
        req.flash('error', 'Paciente ou consultório não encontrado.');
        return res.redirect('/pacientes');
      }
      if (!motivo || !ultimoExame || !usuarioOculos || !usuarioLC || !dm || !has || !glauc) {
        req.flash('error', 'tem campos obrigatórios.');
        return res.redirect('/pacientes/new');
      }

      await prisma.anamnese.create({
        data: {
          pacienteId: idPaciente,
          consultorioId: idConsultorio,
          motivo,
          ultimoExame,
          usuarioOculos: usuarioOculos === 'true',
          usuarioLC: usuarioLC === 'true',
          trauma: trauma || null,
          dm: dm === 'true',
          has: has === 'true',
          glauc: glauc === 'true',
          dmFam: dmFam || null,
          glaucFam: glaucFam || null,
          sintomas: sintomas || null,
          remedio: remedio || null,
          obsGerais: obsGerais || null,
          adicao: adicao || null,
          cilOD: cilOD || null,
          esfOD: esfOD || null,
          eixoOD: eixoOD || null,
          cilOE: cilOE || null,
          esfOE: esfOE || null,
          eixoOE: eixoOE || null,
        },
      });
      // >>>> Guardar o idPaciente na sessão <<<<
      // req.session.idPaciente = novoPaciente.idPaciente;

      req.flash('success', 'Anamnese salva com sucesso!');
      // Opcional: limpar idPaciente da sessão após cadastrar
      // delete req.session.idPaciente;
      return res.redirect('/pacientes');
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      req.flash('error', 'Erro ao salvar anamnese.');
      return res.redirect('/anamneses/new');
    }
  },

  // Buscar anamnese pelo ID
  async getAnamneseById(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idAnam } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!idAnam) {
        req.flash('error', 'ID da anamnese não fornecido.');
        return res.redirect('/anamneses');
      }

      // Buscar a anamnese vinculada ao consultório
      const anamnese = await findAnamneseDoConsultorio(idAnam, idConsultorio);
      if (!anamnese) {
        req.flash('error', 'Anamnese não encontrada.');
        return res.redirect('/anamneses');
      }

      // Buscar o paciente associado à anamnese
      const paciente = await prisma.paciente.findFirst({
        where: {
          idPaciente: anamnese.pacienteId,
          consultorioId: idConsultorio,
        },
      });

      if (!paciente) {
        req.flash('error', 'Paciente associado à anamnese não encontrado.');
        return res.redirect('/anamneses');
      }

      // Renderizar a view de detalhes
      res.render('anamneses/show', {
        pageTitle: 'Ficha da Anamnese',
        pageIcon: 'ri-file-list-line',
        anamnese,
        paciente, // Passa os dados do paciente para a view
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar anamnese:', error);
      req.flash('error', 'Erro ao buscar anamnese. Tente novamente.');
      return res.redirect('/anamneses');
    }
  },

  // Listar todas as anamneses
  async getAllAnamneses(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const anamneses = await prisma.anamnese.findMany({
        where: { consultorioId: idConsultorio },
        include: {
          paciente: true, // <- isso é necessário para incluir o idpaciente
        },
      });

      res.render('anamneses/index', {
        pageTitle: 'Lista de Anamneses',
        pageIcon: 'ri-file-list-line',
        anamneses,
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao buscar anamneses:', error);
      req.flash('error', 'Erro ao buscar anamneses. Tente novamente.');
      return res.redirect('/anamneses');
    }
  },

  // Atualizar anamnese
  async updateAnamnese(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idAnam } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const anamnese = await findAnamneseDoConsultorio(idAnam, idConsultorio);
      if (!anamnese) {
        req.flash('error', 'Anamnese não encontrada ou não pertence ao seu consultório.');
        return res.redirect('/anamneses');
      }

      const {
        motivo,
        ultimoExame,
        usuarioOculos,
        usuarioLC,
        trauma,
        dm,
        has,
        glauc,
        dmFam,
        hasFam,
        glaucFam,
        sintomas,
        remedio,
        obsGerais,
      } = req.body;

      await prisma.anamnese.update({
        where: { idAnam: parseInt(idAnam) },
        data: {
          motivo,
          ultimoExame: ultimoExame || null,
          usuarioOculos: usuarioOculos === 'true',
          usuarioLC: usuarioLC === 'true',
          trauma: trauma || null,
          dm: dm === 'true',
          has: has === 'true',
          glauc: glauc === 'true',
          dmFam: dmFam || null,
          hasFam: hasFam || null,
          glaucFam: glaucFam || null,
          sintomas: sintomas || null,
          remedio: remedio || null,
          obsGerais: obsGerais || null,
        },
      });

      req.flash('success', 'Anamnese atualizada com sucesso!');
      return res.redirect('/anamneses');
    } catch (error) {
      console.error('Erro ao atualizar anamnese:', error);
      req.flash('error', 'Erro ao atualizar anamnese. Tente novamente.');
      return res.redirect(`/anamneses/${req.params.idAnam}/edit`);
    }
  },

  // Deletar anamnese
  async deleteAnamnese(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idAnam } = req.params;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const anamnese = await findAnamneseDoConsultorio(idAnam, idConsultorio);
      if (!anamnese) {
        req.flash('error', 'Anamnese não encontrada ou não pertence ao seu consultório.');
        return res.redirect('/anamneses');
      }

      await prisma.anamnese.delete({
        where: { idAnam: parseInt(idAnam) },
      });

      req.flash('success', 'Anamnese deletada com sucesso!');
      return res.redirect('/anamneses');
    } catch (error) {
      console.error('Erro ao deletar anamnese:', error);
      req.flash('error', 'Erro ao deletar anamnese. Tente novamente.');
      return res.redirect('/anamneses');
    }
  },

  // Formulário para editar anamnese
  async editAnamneseForm(req, res) {
    try {
      const idConsultorio = req.session.idConsultorio;
      const { idAnam } = req.params; // Certifique-se de usar idAnam

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!idAnam) {
        req.flash('error', 'ID da anamnese não fornecido.');
        return res.redirect('/anamneses');
      }

      // Buscar a anamnese vinculada ao consultório
      const anamnese = await findAnamneseDoConsultorio(idAnam, idConsultorio);
      if (!anamnese) {
        req.flash('error', 'Anamnese não encontrada.');
        return res.redirect('/anamneses');
      }

      // Buscar o paciente associado à anamnese
      const paciente = await prisma.paciente.findFirst({
        where: {
          idPaciente: anamnese.pacienteId,
          consultorioId: idConsultorio,
        },
      });

      if (!paciente) {
        req.flash('error', 'Paciente associado à anamnese não encontrado.');
        return res.redirect('/anamneses');
      }

      // Renderizar a view de edição
      res.render('anamneses/edit', {
        pageTitle: 'Editar Anamnese',
        pageIcon: 'ri-edit-line',
        anamnese,
        paciente, // Passa os dados do paciente para a view
        messages: req.flash(),
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/anamneses');
    }
  },
};
