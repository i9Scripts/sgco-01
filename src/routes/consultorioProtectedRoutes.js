// /routes/consultorioRoutes.js
import { Router } from 'express';
import { consultorioController } from '../controllers/consultorioController.js';

const router = Router();

// Essas rotas precisam de consultório registrado
router.get('/:idConsultorio', consultorioController.getConsultorioById);
router.get('/', consultorioController.getAllConsultorios);
router.get('/search', consultorioController.searchConsultorios);
router.put('/:idConsultorio', consultorioController.updateConsultorio);
router.delete('/:idConsultorio', consultorioController.deleteConsultorio);
router.get('/:idConsultorio/edit', consultorioController.editConsultorioForm);
router.get('/index', consultorioController.getAllConsultorios);

export default router;
