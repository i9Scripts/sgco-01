Prompt:

Crie um sistema completo de gerenciamento financeiro pessoal ou empresarial (contas a pagar e receber), com as seguintes funcionalidades:

Cadastro de Lançamentos:

Lançamentos de contas a pagar e a receber, com campos como: descrição, valor, data de vencimento, data de pagamento, tipo (receita ou despesa), categoria (como alimentação, salário, aluguel, etc.), e status (pendente, pago, vencido).

Suporte a lançamentos parcelados.

Gerenciamento de Categorias:

Cadastro, edição e exclusão de categorias personalizadas.

Relatórios:

Relatório mensal com totais de receitas, despesas e saldo.

Relatório por categoria com somatório de valores em determinado período.

Relatório de lançamentos pendentes e vencidos.

Gráficos Dinâmicos:

Gráficos de pizza para proporção de categorias de despesas e receitas.

Gráficos de barras ou linha para evolução mensal de receitas, despesas e saldo.

Comparativo entre meses.

Filtros e Buscas:

Filtro por período, tipo (receita/despesa), status e categoria.

Interface Responsiva:

Interface limpa e acessível, com adaptação para desktop e mobile.

Armazenamento de Dados:

Mariadb

Tecnologias sugeridas:

(Frontend): HTML, CSS, JavaScript puro e ejs.

(Backend): uso atualmente Node.js, prisma, expressjs, express-ejs-layout, mariadb (ESM).

(Gráficos): Chart.js, ApexCharts ou similar.

Gere o projeto com base nessas especificações, com foco na organização do código, manutenibilidade e extensibilidade.

***

Ótimo! Como você já tem uma base com Express.js, Prisma e EJS com layouts, posso te ajudar a criar esse módulo financeiro como uma estrutura plugável no seu projeto. Abaixo está o esqueleto inicial do módulo de **Contas a Pagar e Receber**, já preparado para funcionar com Prisma, EJS, e MariaDB (ESM).

---

### 📁 Estrutura sugerida do módulo `financeiro`:

```
/src
├── modules
│   └── financeiro
│       ├── controllers
│       │   └── financeiro.controller.js
│       ├── routes
│       │   └── financeiro.routes.js
│       ├── services
│       │   └── financeiro.service.js
│       ├── views
│       │   └── financeiro
│       │       ├── index.ejs
│       │       ├── novo.ejs
│       │       └── relatorios.ejs
│       └── prisma
│           └── financeiro.schema.prisma
```

---

### 📘 Modelo Prisma (`schema.prisma`)

Adicione no seu `schema.prisma`:

```prisma
model Lancamento {
  id           Int       @id @default(autoincrement())
  tipo         String    // 'receita' ou 'despesa'
  descricao    String
  valor        Decimal
  vencimento   DateTime
  pagamento    DateTime? 
  status       String    // 'pendente', 'pago', 'vencido'
  categoria    String
  parcelas     Int?      // opcional
  criadoEm     DateTime  @default(now())
  consultorioId Int
  consultorio  Consultorio @relation(fields: [consultorioId], references: [id])

  @@index([consultorioId])
}
```

---

### 🚀 `financeiro.routes.js`

```js
import { Router } from 'express'
import * as controller from '../controllers/financeiro.controller.js'

const router = Router()

router.get('/', controller.index)
router.get('/novo', controller.novoForm)
router.post('/novo', controller.criarLancamento)
router.get('/relatorios', controller.relatorios)

export default router
```

---

### 🧠 `financeiro.controller.js`

```js
import * as service from '../services/financeiro.service.js'

export async function index(req, res) {
  const lancamentos = await service.listarLancamentos(req.user.consultorioId)
  res.render('financeiro/index', { lancamentos })
}

export function novoForm(req, res) {
  res.render('financeiro/novo')
}

export async function criarLancamento(req, res) {
  await service.criarLancamento(req.body, req.user.consultorioId)
  res.redirect('/financeiro')
}

export async function relatorios(req, res) {
  const relatorio = await service.gerarRelatorio(req.user.consultorioId)
  res.render('financeiro/relatorios', { relatorio })
}
```

---

### 🛠️ `financeiro.service.js`

```js
import { prisma } from '../../lib/prisma.js'

export async function listarLancamentos(consultorioId) {
  return await prisma.lancamento.findMany({
    where: { consultorioId },
    orderBy: { vencimento: 'desc' },
  })
}

export async function criarLancamento(data, consultorioId) {
  return await prisma.lancamento.create({
    data: {
      ...data,
      valor: parseFloat(data.valor),
      vencimento: new Date(data.vencimento),
      pagamento: data.pagamento ? new Date(data.pagamento) : null,
      consultorioId,
    }
  })
}

export async function gerarRelatorio(consultorioId) {
  const receitas = await prisma.lancamento.aggregate({
    where: { consultorioId, tipo: 'receita' },
    _sum: { valor: true }
  })

  const despesas = await prisma.lancamento.aggregate({
    where: { consultorioId, tipo: 'despesa' },
    _sum: { valor: true }
  })

  return {
    totalReceitas: receitas._sum.valor || 0,
    totalDespesas: despesas._sum.valor || 0,
    saldo: (receitas._sum.valor || 0) - (despesas._sum.valor || 0),
  }
}
```

---

### 🧾 Views (`EJS`)

Você pode começar com `financeiro/index.ejs`, mostrando uma tabela com os lançamentos e ações como "Editar", "Excluir", "Ver Relatório".

---

### 📦 Como integrar ao seu app principal

No seu `app.js`:

```js
import financeiroRoutes from './modules/financeiro/routes/financeiro.routes.js'
app.use('/financeiro', financeiroRoutes)
```

---

Se quiser, posso preparar os arquivos EJS básicos e sugestões de gráfico com Chart.js também. Quer que eu siga com isso?

