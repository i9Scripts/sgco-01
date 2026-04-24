// src/controllers/anamneseController.js
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import prisma from '../lib/prisma.js';
import { calcularIdadeFromDate, formatarData } from '../utils/dateUtils.js';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

// prisma centralizado
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
      const idPaciente = req.query.idPaciente || req.session.idPaciente;
      if (idPaciente) req.session.idPaciente = idPaciente;
      const { idConsultorio } = req.session;
      const { addToQueue } = req.query;

      if (!idPaciente || !idConsultorio) {
        req.flash('error', 'Paciente ou consultório não encontrado.');
        return res.redirect('/pacientes');
      }

      const paciente = await prisma.paciente.findFirst({
        where: { idPaciente: parseInt(idPaciente), consultorioId: parseInt(idConsultorio) },
        include: {
          anamneses: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!paciente) {
        req.flash('error', 'Paciente inválido.');
        return res.redirect('/pacientes');
      }

      // Buscar o maior nFicha atual do consultório para sugerir o próximo
      const maxAnamnese = await prisma.anamnese.findFirst({
        where: { consultorioId: parseInt(idConsultorio) },
        orderBy: { nFicha: 'desc' },
        select: { nFicha: true },
      });

      const proximaFicha = (maxAnamnese && maxAnamnese.nFicha ? maxAnamnese.nFicha : 0) + 1;

      res.render('anamneses/new', {
        pageTitle: 'Nova Anamnese',
        pageIcon: 'ri-file-text-line',
        idPaciente,
        idConsultorio,
        paciente,
        formData: { nFicha: proximaFicha },
        addToQueue: addToQueue === 'true',
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de anamnese:', error);
      if (error instanceof Prisma.PrismaClientInitializationError) {
        req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
      } else {
        req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
      }
      return res.status(500).json({ error: 'Erro ao exibir o formulário', details: error.message });
    }
  },

  async createAnamnese(req, res) {
    try {
      const { idPaciente, idConsultorio } = req.session;
      const {
        nFicha,
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
        cefaleia,
        antecedentesPessoais,
        obsGerais,
        adicao,
        cilOD,
        esfOD,
        eixoOD,
        avSCOD,
        cilOE,
        esfOE,
        eixoOE,
        avSCOE,
        addToQueue,
      } = req.body;

      if (!idPaciente || !idConsultorio) {
        req.flash('error', 'Paciente ou consultório não encontrado.');
        return res.redirect('/pacientes');
      }
      
      // Validação de nFicha único por consultório
      if (nFicha) {
        const fichaExistente = await prisma.anamnese.findFirst({
          where: {
            consultorioId: parseInt(idConsultorio),
            nFicha: parseInt(nFicha),
            pacienteId: { not: parseInt(idPaciente) } // Permite o mesmo nFicha para o mesmo paciente (histórico)
          },
          include: { paciente: { select: { nome: true } } }
        });

        if (fichaExistente) {
          req.flash('error', `O número de ficha ${nFicha} já está em uso pelo paciente ${fichaExistente.paciente.nome}.`);
          // Aqui poderíamos renderizar novamente com os erros, mas para simplificar vamos redirecionar
          return res.redirect(`/anamneses/new?idPaciente=${idPaciente}`);
        }
      }

      if (!motivo || !ultimoExame || !usuarioOculos || !usuarioLC || !dm || !has || !glauc) {
        req.flash('error', 'Existem campos obrigatórios não preenchidos.');
      }

      const nova = await prisma.anamnese.create({
        data: {
          pacienteId: parseInt(idPaciente),
          consultorioId: parseInt(idConsultorio),
          nFicha: nFicha ? parseInt(nFicha) : null,
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
          cefaleia: Array.isArray(cefaleia) ? cefaleia.join(', ') : (cefaleia || null),
          antecedentesPessoais: Array.isArray(antecedentesPessoais) ? antecedentesPessoais.join(', ') : (antecedentesPessoais || null),
          obsGerais: obsGerais || null,
          adicao: adicao || null,
          cilOD: cilOD || null,
          esfOD: esfOD || null,
          eixoOD: eixoOD || null,
          avSCOD: avSCOD || null,
          cilOE: cilOE || null,
          esfOE: esfOE || null,
          eixoOE: eixoOE || null,
          avSCOE: avSCOE || null,
        },
      });

      // Se a flag addToQueue estiver presente, adiciona o paciente à fila
      if (addToQueue === 'true') {
        await prisma.paciente.update({
          where: { idPaciente: parseInt(idPaciente) },
          data: { naFila: true },
        });
        req.flash('success', 'Anamnese salva e paciente adicionado à fila de espera!');
        return res.redirect('/');
      }

      // Resposta para AJAX
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.json({ success: true, anamnese: nova, pacienteId: idPaciente });
      }

      req.flash('success', 'Anamnese salva com sucesso! Prossiga para a cobrança.');
      return res.redirect(`/financeiro/cobrar/${idPaciente}`);
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(500).json({ success: false, error: 'Erro ao salvar anamnese.' });
      }
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
      // calcula idade no servidor
      const idadePaciente = paciente ? calcularIdadeFromDate(paciente.dataNasc || paciente.dataNascFormatada) : null;
      // 1. Criar o objeto Date (se ainda não for um objeto Date)
      const dataObjeto = new Date(anamnese.createdAt);
      // 3. Formatar a data para DD/MM/YYYY (usando a nova função)
      const dataCreatedAt = formatarData(dataObjeto);
      // formatar a data de nascimento e anexar ao objeto paciente antes de renderizar
      paciente.dataNascFormatada = dayjs.utc(paciente.dataNasc).format('DD/MM/YYYY');

      res.render('anamneses/show', {
        pageTitle: 'Ficha da Anamnese',
        pageIcon: 'ri-file-list-line',
        anamnese,
        paciente, // Passa os dados do paciente para a view
        dataCreatedAt,
        idadePaciente,
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
        // 💡 PARA ORDENAR POR DATA MAIS RECENTE
        orderBy: [{ paciente: { nome: 'asc' } }, { createdAt: 'desc' }],
      });
      // Mapeie a lista para formatar a data de criação
      const anamnesesFormatadas = anamneses.map((anamnese) => ({
        ...anamnese,
        // Formata o createdAt e anexa como dataCreatedAt ao objeto
        dataCreatedAt: formatarData(new Date(anamnese.createdAt)),
      }));
      res.render('anamneses/index', {
        pageTitle: 'Lista de Anamneses',
        pageIcon: 'ri-file-list-line',
        anamneses: anamnesesFormatadas,
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
      const idProfissional = req.session.idProfissional;
      if (!idProfissional) {
        req.flash('error', 'Acesso negado. Faça login como profissional para editar anamneses.');
        return res.redirect('/login');
      }
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
        nFicha,
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
        avSCOD,
        cilOE,
        esfOE,
        eixoOE,
        avSCOE,
      } = req.body;

      // Validação de nFicha único por consultório (opcional para update se permitirmos histórico)
      if (nFicha) {
        const fichaExistente = await prisma.anamnese.findFirst({
          where: {
            consultorioId: parseInt(idConsultorio),
            nFicha: parseInt(nFicha),
            pacienteId: { not: anamnese.pacienteId }
          },
          include: { paciente: { select: { nome: true } } }
        });

        if (fichaExistente) {
          req.flash('error', `O número de ficha ${nFicha} já está em uso pelo paciente ${fichaExistente.paciente.nome}.`);
          return res.redirect(`/anamneses/${idAnam}/edit`);
        }
      }

      await prisma.anamnese.update({
        where: { idAnam: parseInt(idAnam) },
        data: {
          nFicha: nFicha ? parseInt(nFicha) : null,
          pacienteId: anamnese.pacienteId,
          consultorioId: parseInt(idConsultorio),
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
          avSCOD: avSCOD || null,
          cilOE: cilOE || null,
          esfOE: esfOE || null,
          eixoOE: eixoOE || null,
          avSCOE: avSCOE || null,
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
      const idAnamInt = parseInt(idAnam);

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      const anamnese = await findAnamneseDoConsultorio(idAnamInt, idConsultorio);
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

  async searchAnamneses(req, res) {
    try {
      const { query } = req.query;
      const idConsultorio = req.session.idConsultorio;

      if (!idConsultorio) {
        req.flash('error', 'Nenhum consultório selecionado.');
        return res.redirect('/consultorios/new');
      }

      if (!query || query.trim() === '') {
        return res.redirect('/anamneses');
      }

      const q = query.trim();
      const cleanQ = q.replace(/\D/g, '');

      const orConditions = [
        { paciente: { nome: { contains: q } } }
      ];

      const nFichaNum = parseInt(cleanQ);
      if (!isNaN(nFichaNum) && nFichaNum <= 2147483647) {
        orConditions.push({ nFicha: nFichaNum });
      }

      const anamneses = await prisma.anamnese.findMany({
        where: {
          consultorioId: idConsultorio,
          OR: orConditions
        },
        include: {
          paciente: true,
        },
        orderBy: [{ paciente: { nome: 'asc' } }, { createdAt: 'desc' }],
      });

      const anamnesesFormatadas = anamneses.map((anamnese) => ({
        ...anamnese,
        dataCreatedAt: formatarData(new Date(anamnese.createdAt)),
      }));

      if (anamneses.length === 0) {
        req.flash('warning', `Nenhuma anamnese encontrada para "${q}".`);
      }

      res.render('anamneses/index', {
        pageTitle: `Resultados da busca por "${q}"`,
        pageIcon: 'ri-search-line',
        anamneses: anamnesesFormatadas,
      });
    } catch (error) {
      console.error('Erro ao buscar anamneses:', error);
      req.flash('error', 'Erro ao buscar anamneses. Tente novamente.');
      return res.redirect('/anamneses');
    }
  },

  // Formulário para editar anamnese
  async editAnamneseForm(req, res) {
    try {
      const idProfissional = req.session.idProfissional;
      if (!idProfissional) {
        req.flash('error', 'Acesso negado. Faça login como profissional para editar anamneses.');
        return res.redirect('/login');
      }
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

      // calcula idade no servidor
      const idadePaciente = paciente ? calcularIdadeFromDate(paciente.dataNasc || paciente.dataNascFormatada) : null;

      // Renderizar a view de edição
      // formatar a data de nascimento e anexar ao objeto paciente antes de renderizar
      paciente.dataNascFormatada = dayjs.utc(paciente.dataNasc).format('DD/MM/YYYY');
      res.render('anamneses/edit', {
        pageTitle: 'Editar Anamnese',
        pageIcon: 'ri-edit-line',
        anamnese,
        paciente, // Passa os dados do paciente para a view
        idadePaciente, // passa para a view
      });
    } catch (error) {
      console.error('Erro ao exibir formulário de edição:', error);
      req.flash('error', 'Erro ao exibir formulário de edição. Tente novamente.');
      return res.redirect('/anamneses');
    }
  },
};
