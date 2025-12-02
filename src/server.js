// server.js
// Configuração do Express
import axios from 'axios';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import { join } from 'path';
dotenv.config();
// Rotas e lógica da aplicação podem ser adicionadas aqui
import methodOverride from 'method-override';
import { indexController } from './controllers/indexController.js';
import { verificarConsultorioRegistrado } from './middlewares/authMiddleware.js';
import { clearFlashMessages } from './middlewares/clearFlashMiddleware.js';
import { loadConsultorioToSession } from './middlewares/loadConsultorio.js';
import anamneseRoutes from './routes/anamneseRoutes.js';
import consultorioProtectedRoutes from './routes/consultorioProtectedRoutes.js';
import consultorioPublicRoutes from './routes/consultorioPublicRoutes.js';
import diagnosticoRoutes from './routes/diagnosticoRoutes.js';
import filaRoutes from './routes/filaRoutes.js';
import indexRoutes from './routes/index.js';
import registerNews from './routes/news.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import parceiroRoutes from './routes/parceiroRoutes.js';
import profissionalRoutes from './routes/profissionalRoutes.js';
import userRoutes from './routes/userRoutes.js';
import registerWeather from './routes/weather.js';

// Configuração da aplicação
const app = express();
const port = process.env.PORT || 3000;

// Habilita o CORS para todas as rotas (apenas uma vez)
app.use(cors());

// Configuração dos middlewares e outras dependências
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(process.cwd(), 'src/public')));
app.use(cookieParser());
app.use(
  session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// Middleware para carregar os dados do consultório na sessão
app.use(loadConsultorioToSession);

// Configuração do mecanismo de visualização EJS
app.set('view engine', 'ejs');
app.set('views', join(process.cwd(), 'src/views'));
app.set('layout', './layouts/main.ejs');

// Middleware para definir mensagens globais
app.use(clearFlashMessages);
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.query.success || null,
    error: req.query.error || null,
    welcome: req.flash('welcome') || null,
  };
  // defaults para título/ícone quando não fornecidos nas rotas
  res.locals.pageTitle = res.locals.pageTitle || 'OptoSystem';
  res.locals.pageIcon = res.locals.pageIcon || 'ri-information-line';
  next();
});

// Configuração do method-override
app.use(methodOverride('_method'));

// Rotas
app.use('/consultorios', consultorioPublicRoutes); // Rotas públicas para consultórios
app.use('/consultorios', verificarConsultorioRegistrado, consultorioProtectedRoutes); // Rotas protegidas

app.use('/', indexRoutes);
app.use('/parceiros', parceiroRoutes); // Rotas para parceiros
app.use('/pacientes', pacienteRoutes); // Rotas para Pacientes
app.use('/anamneses', anamneseRoutes); //Rotas para Anamneses
app.use('/users', userRoutes); // Rotas para usuários
app.use('/profissionais', profissionalRoutes);
app.use('/diagnosticos', diagnosticoRoutes);
// Registro das rotas da fila de espera
app.use('/', filaRoutes);

// Proteger rotas, exceto a rota de registro de consultório
app.use(
  '/consultorios',
  (req, res, next) => {
    const isLiberado = (req.path === '/new' && req.method === 'GET') || (req.path === '/' && req.method === 'POST');

    if (isLiberado) return next();

    return verificarConsultorioRegistrado(req, res, next);
  },
  consultorioProtectedRoutes
);
// Rotas para o frontend
app.get('/', (req, res) => {
  req.flash('welcome', 'Bem-vindo!'); // Adiciona mensagem de boas-vindas
  res.render('index', {
    pageTitle: 'Página Inicial',
    pageIcon: 'bi bi-house-door',
  }); // Passa o pageTitle para o render
});
// Rota para exibir a mensagem de boas-vindas
app.get('/display-message', (req, res) => {
  req.flash('message', 'Bem-vindo!');
  res.send(req.flash('message'));
});
// página Sobre
app.get('/sobre', (req, res) => {
  res.render('sobre', {
    pageTitle: 'Sobre',
    pageIcon: 'ri-information-line',
  });
});

// ***********************************************************//
// Rota para buscar o endereço pelo CEP
app.get('/buscar-endereco/:cep', async (req, res) => {
  const { cep } = req.params;
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) {
      return res.status(400).json({ error: 'CEP não encontrado' });
    }
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o endereço' });
  }
});
// ***********************************************************//
// Rota para a página de espera na TV
app.get('/espera', async (req, res) => {
  try {
    // Remova essa parte, pois a conexão com o Prisma deve ser feita corretamente
    //const pacientesDB = await db.paciente.findMany({
    //  select: {
    //    nome: true,
    //  },
    //});
    res.render('espera/index', {
      layout: false, // Não utiliza o layout principal
      pacientes: [], // Ou uma lista vazia, até que você configure o Prisma corretamente
    });
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).send('Erro ao carregar a página de espera.');
  }
});
// Registrar rota de clima
registerWeather(app);
// Registrar rota de notícias
registerNews(app);
app.get('/_fila-espera', indexController.filaParcial);
app.get('/espera/index', indexController.filaParcial);
// Rota 404 - Página não encontrada
app.use((req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Página Não Encontrada',
    pageIcon: 'ri-error-warning-line', // Ícone opcional
  });
});
// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando http://localhost:${port}/`);
});
