// /routes/consultorioPublicRoutes.js
import { Router } from 'express';
import { consultorioController } from '../controllers/consultorioController.js';

const router = Router();

// Essas rotas não precisam de consultório registrado
router.get('/new', consultorioController.newConsultorioForm);
router.post('/', consultorioController.createConsultorio);

export default router;
