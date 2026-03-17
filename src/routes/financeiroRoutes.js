import express from 'express';
import * as financeiroController from '../controllers/financeiroController.js';

import { loadConsultorioToSession } from '../middlewares/loadConsultorio.js';

const router = express.Router();

// Proteger todas as rotas de financeiro
// router.use(verificarUsuarioAutenticado);
router.use(loadConsultorioToSession);

// GET para exibir o formulário de cobrança para um paciente específico
router.get('/cobrar/:pacienteId', financeiroController.renderizarCobranca);

// POST para registrar um novo lançamento financeiro (pagamento)
router.post('/registrar', financeiroController.processarCobranca);

// GET para o Dashboard Financeiro
router.get('/dashboard', financeiroController.renderizarDashboard);

// GET para exibir o extrato de lançamentos financeiros
router.get('/extrato', financeiroController.listarLancamentos);

// GET para exibir a página de confirmação para adicionar à fila
router.get('/confirmar-fila/:pacienteId', financeiroController.renderizarConfirmacaoFila);

// Página com opções de relatórios financeiros
router.get('/relatorios', financeiroController.renderizarRelatorios);

// Relatório: vendas do dia
router.get('/relatorios/vendas-dia', financeiroController.vendasDoDia);

// Selecionar paciente para cobrança (permite que profissional escolha quem cobrar)
router.get('/selecionar-paciente', financeiroController.renderizarSelecionarPaciente);

export default router;
