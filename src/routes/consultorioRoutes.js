// server/routes/consultorioRoutes.js
import { Router } from 'express';
import { consultorioController } from '../controllers/consultorioController.js';

const router = Router();
router.get('/new', consultorioController.newConsultorioForm); // Rota para exibir o formulário
router.post('/', consultorioController.createConsultorio);
router.get('/:idConsultorio', consultorioController.getConsultorioById);
router.get('/', consultorioController.getAllConsultorios);
router.get('/search', consultorioController.searchConsultorios); // Rota para buscar consultórios
router.put('/:idConsultorio', consultorioController.updateConsultorio);
router.delete('/:idConsultorio', consultorioController.deleteConsultorio);
router.get('/:idConsultorio/edit', consultorioController.editConsultorioForm);
router.get('/index', consultorioController.getAllConsultorios);

export default router;
