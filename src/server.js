// Configuração do Express
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import { join } from 'path';
dotenv.config();

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

// Configuração do mecanismo de visualização EJS
app.set('view engine', 'ejs');
app.set('views', join(process.cwd(), 'src/views'));
app.set('layout', './layouts/main.ejs');

// Middleware para definir mensagens globais
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.query.success || null,
    error: req.query.error || null,
    welcome: req.flash('welcome') || null, // Adiciona mensagem de boas-vindas
  };
  next();
});

// Rotas e lógica da aplicação podem ser adicionadas aqui

// Rotas para o frontend
app.get('/', (req, res) => {
  req.flash('welcome', 'Bem-vindo!'); // Adiciona mensagem de boas-vindas
  res.render('index', {
    pageTitle: 'Página Inicial',
    pageIcon: 'bi bi-house-door',
  }); // Passa o pageTitle para o render
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

// Página 404
// app.get('*', (req, res) => {
//   res.status(404).render('404.ejs', {
//     pageTitle: 'Página Não Encontrada',
//     pageIcon: 'ri-error-warning-line',
//   });
// });

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando http://localhost:${port}/`);
});
