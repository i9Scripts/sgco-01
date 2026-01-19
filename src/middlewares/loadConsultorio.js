import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'src/config', 'numeroSerie.json');

export const loadConsultorioToSession = (req, res, next) => {
  try {
    // Verifica se o arquivo numeroSerie.json existe
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      // Carrega os dados na sessão, se ainda não estiverem
      if (!req.session.idConsultorio && !req.session.consultorio) {
        req.session.idConsultorio = configData.idConsultorio;
        req.session.nomeConsultorio = configData.nome;
        req.session.numeroSerie = configData.numeroSerie;
        // Mantém compatibilidade e adiciona objeto `consultorio` esperado pelos controllers
        req.session.consultorio = {
          idConsultorio: configData.idConsultorio,
          nomeConsultorio: configData.nome,
          numeroSerie: configData.numeroSerie,
        };
      } else if (!req.session.consultorio) {
        // Se já existirem campos soltos, mas não o objeto, crie-o a partir dos valores existentes
        req.session.consultorio = {
          idConsultorio: req.session.idConsultorio || configData.idConsultorio,
          nomeConsultorio: req.session.nomeConsultorio || configData.nome,
          numeroSerie: req.session.numeroSerie || configData.numeroSerie,
        };
      }

      // Adiciona os dados ao res.locals para uso nas views
      res.locals.consultorio = {
        idConsultorio: req.session.consultorio.idConsultorio,
        nomeConsultorio: req.session.consultorio.nomeConsultorio,
        numeroSerie: req.session.consultorio.numeroSerie,
      };
    } else {
      console.warn('Arquivo numeroSerie.json não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao carregar os dados do consultório:', error);
  }
  next();
};
