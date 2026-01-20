import express from 'express';
import * as financeiroController from '../controllers/financeiroController.js';
import { verificarUsuarioAutenticado } from '../middlewares/authMiddleware.js';
import { loadConsultorioToSession } from '../middlewares/loadConsultorio.js';

const router = express.Router();

// Proteger todas as rotas de financeiro
router.use(verificarUsuarioAutenticado);
router.use(loadConsultorioToSession);

// GET para exibir o formulário de cobrança para um paciente específico
router.get('/cobrar/:pacienteId', financeiroController.renderizarCobranca);

// POST para registrar um novo lançamento financeiro (pagamento)
router.post('/registrar', financeiroController.processarCobranca);

// GET para exibir o extrato de lançamentos financeiros
router.get('/extrato', financeiroController.listarLancamentos);

// GET para exibir a página de confirmação para adicionar à fila
router.get('/confirmar-fila/:pacienteId', financeiroController.renderizarConfirmacaoFila);

export default router;
