import { Router } from 'express';
import { agendamentoController } from '../controllers/agendamentoController.js';
import { verificarUsuarioAutenticado } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas aqui são protegidas e relativas a /agendamentos
// router.use(verificarUsuarioAutenticado);

router.get('/', agendamentoController.listAgendamentos);
router.get('/calendario', agendamentoController.listCalendario);
router.get('/semanal', agendamentoController.listCalendarioSemanal);
router.get('/new', agendamentoController.createAgendamentoForm);
router.post('/', agendamentoController.createAgendamento);
router.get('/:id/edit', agendamentoController.editAgendamentoForm);
router.put('/:id', agendamentoController.updateAgendamento);
router.delete('/:id', agendamentoController.deleteAgendamento);


export default router;
