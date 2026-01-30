import { Router } from 'express';
import { agendamentoController } from '../controllers/agendamentoController.js';
import { verificarUsuarioAutenticado } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas aqui são protegidas e relativas a /agendamentos
// router.use(verificarUsuarioAutenticado);

router.get('/', agendamentoController.listAgendamentos);
router.get('/new', agendamentoController.createAgendamentoForm); // Rota para o formulário (pode ser em modal)
router.post('/', agendamentoController.createAgendamento);

export default router;
