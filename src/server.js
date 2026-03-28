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
// para a rede de computadores
import { Server } from 'socket.io';
import { createServer } from 'http';

// Rotas e lógica da aplicação podem ser adicionadas aqui
import methodOverride from 'method-override';
import { verificarConsultorioRegistrado } from './middlewares/authMiddleware.js';
import { carregarFilaDeEspera } from './middlewares/carregarFilaDeEspera.js';
import { clearFlashMessages } from './middlewares/clearFlashMiddleware.js';
import { loadConsultorioToSession } from './middlewares/loadConsultorio.js';
import anamneseRoutes from './routes/anamneseRoutes.js';
import authRoutes from './routes/authRoutes.js';
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
import financeiroRoutes from './routes/financeiroRoutes.js'; // New import
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import servicoRoutes from './routes/servicoRoutes.js';
// Configuração da aplicação
const app = express();
const port_in_use = process.env.PORT || 3000;

// Habilita o CORS para todas as rotas (apenas uma vez)
app.use(cors());

// Configuração dos middlewares e outras dependências
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

// Middleware para desabilitar layout em requisições AJAX (Modais)
app.use((req, res, next) => {
  if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
    res.locals.layout = false;
  }
  next();
});

// Configuração do mecanismo de visualização EJS
app.set('view engine', 'ejs');
app.set('views', join(process.cwd(), 'src/views'));

// Configure o layout padrão do express-ejs-layouts
// a configuração deve apontar para o caminho relativo dentro de `views`, sem extensão
app.set('layout', 'layouts/main');

// Middleware para definir mensagens globais
app.use(clearFlashMessages);
app.use(carregarFilaDeEspera);
app.use((req, res, next) => {
  // Não sobrescrever `res.locals.messages` populado pelo middleware de flash;
  // apenas mesclar mensagens vindas de query string (se houver) para compatibilidade.
  res.locals.messages = {
    ...(res.locals.messages || {}),
    success: (res.locals.messages && res.locals.messages.success) || req.query.success || null,
    error: (res.locals.messages && res.locals.messages.error) || req.query.error || null,
  };
  // defaults para título/ícone quando não fornecidos nas rotas
  res.locals.pageTitle = res.locals.pageTitle || 'OptoSystem';
  res.locals.pageIcon = res.locals.pageIcon || 'ri-information-line';
  res.locals.idProfissional = req.session?.idProfissional;
  res.locals.userRole = req.session?.userRole;
  next();
});

// Configuração do method-override
app.use(methodOverride('_method'));

// Rotas
app.use('/consultorios', consultorioPublicRoutes); // Rotas públicas para consultórios
app.use('/consultorios', verificarConsultorioRegistrado, consultorioProtectedRoutes); // Rotas protegidas

app.use('/', indexRoutes);
// rotas de autenticação (login/logout/register)
app.use('/', authRoutes);
app.use('/parceiros', parceiroRoutes); // Rotas para parceiros
app.use('/pacientes', pacienteRoutes); // Rotas para Pacientes
app.use('/anamneses', anamneseRoutes); //Rotas para Anamneses
app.use('/users', userRoutes); // Rotas para usuários
app.use('/profissionais', profissionalRoutes);
app.use('/diagnosticos', diagnosticoRoutes);
app.use('/financeiro', financeiroRoutes); // New route usage
app.use('/', filaRoutes); // Registro das rotas da fila de espera
app.use('/agendamentos', agendamentoRoutes);
app.use('/produtos', produtoRoutes); //Rotas para produtos
app.use('/servicos', servicoRoutes);

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
// rota curta para dashboard — redireciona conforme sessão
app.get('/dashboard', (req, res) => {
  if (req.session?.idProfissional) return res.redirect('/profissionais/dashboard');
  if (req.session?.idUser) return res.redirect('/');
  return res.redirect('/login');
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
    res.render('espera/index', {
      layout: false, // Não utiliza o layout principal
      pacientes: res.locals.pacientesNaFila || [], // Usa a variável global da fila
    });
  } catch (error) {
    console.error('Erro ao carregar a página de espera:', error);
    res.status(500).send('Erro ao carregar a página de espera.');
  }
});
// Endpoint para retornar apenas o fragmento HTML da fila (usado por atualizações via socket)
app.get('/fila/partial', (req, res) => {
  try {
    const pacientes = res.locals.pacientesNaFila || [];
    const fragmentOptions = { pacientes, layout: false };
    // passe flag de profissional com base na sessão
    fragmentOptions.isProfissional = !!req.session?.idProfissional;
    return res.render('partials/_filaEspera', fragmentOptions);
  } catch (err) {
    console.error('Erro ao renderizar fragmento da fila:', err);
    return res.status(500).send('Erro ao renderizar fragmento');
  }
});
// Registrar rota de clima
registerWeather(app);
// Registrar rota de notícias
registerNews(app);

// Rota 404 - Página não encontrada
app.use((req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Página Não Encontrada',
    pageIcon: 'ri-error-warning-line', // Ícone opcional
  });
});

// Criar o servidor HTTP para o Socket.io trabalhar junto com o Express
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Permite conexões de outros computadores da rede
    methods: ['GET', 'POST'],
  },
});

// Lógica do Socket.io
io.on('connection', (socket) => {
  console.log('Um usuário conectou:', socket.id);

  // Exemplo: Quando um paciente for atualizado, avisamos todos
  socket.on('novo_paciente_fila', (data) => {
    io.emit('atualizar_lista', data); // Envia para TODOS os conectados
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

// Iniciar o servidor
httpServer.listen(port_in_use, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port_in_use}`);
});
