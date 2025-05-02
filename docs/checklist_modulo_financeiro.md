# 📌 Checklist: Módulo Financeiro (Contas a Pagar e Receber)

## 🧱 Estrutura Inicial
- [ ] Criar pasta `modules/financeiro`
- [ ] Criar subpastas: `controllers`, `routes`, `services`, `views/financeiro`, `prisma` (separado do schema global apenas se modular)
- [ ] Adicionar rota `/financeiro` no app principal (`app.js` ou `index.js`)

## 🗃️ Banco de Dados (Prisma)
- [ ] Adicionar o modelo `Lancamento` no `schema.prisma`
- [ ] Rodar `npx prisma migrate dev --name add_lancamentos` para aplicar a migração
- [ ] Rodar `npx prisma generate` se necessário

## 🔧 Lógica de Backend
### Controller (`controllers/financeiro.controller.js`)
- [ ] Função `index`: listar todos os lançamentos do consultório
- [ ] Função `novoForm`: renderizar o formulário de novo lançamento
- [ ] Função `criarLancamento`: salvar lançamento no banco
- [ ] Função `relatorios`: gerar resumo financeiro (receita, despesa, saldo)

### Service (`services/financeiro.service.js`)
- [ ] Função `listarLancamentos(consultorioId)`
- [ ] Função `criarLancamento(data, consultorioId)`
- [ ] Função `gerarRelatorio(consultorioId)` com agregações

### Rotas (`routes/financeiro.routes.js`)
- [ ] GET `/financeiro/` → `index`
- [ ] GET `/financeiro/novo` → `novoForm`
- [ ] POST `/financeiro/novo` → `criarLancamento`
- [ ] GET `/financeiro/relatorios` → `relatorios`

## 🖼️ Views (EJS)
- [ ] `views/financeiro/index.ejs`: tabela com lançamentos
- [ ] `views/financeiro/novo.ejs`: formulário de novo lançamento
- [ ] `views/financeiro/relatorios.ejs`: gráficos e totais (com Chart.js)

## 📊 Gráficos (Chart.js)
- [ ] Adicionar gráfico de pizza com categorias (receitas e despesas)
- [ ] Adicionar gráfico de barras com evolução mensal
- [ ] Comparativo entre receitas vs despesas

## ✅ Funcionalidades Extras (opcional)
- [ ] Filtros por data, categoria e status
- [ ] Suporte a edição e exclusão de lançamentos
- [ ] Suporte a lançamentos parcelados
- [ ] Status automático (pago, pendente, vencido) baseado nas datas

## 🧪 Testes
- [ ] Testar criação de lançamento
- [ ] Testar visualização de relatório
- [ ] Testar fluxo completo: criar → listar → relatório

## 🌐 Integração
- [ ] Proteger rotas com middleware (ex: verificar `req.user` e `consultorioId`)
- [ ] Inserir link para o módulo no layout do sistema (`layout.ejs`)
