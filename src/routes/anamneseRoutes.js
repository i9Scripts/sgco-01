// src/routes/anamneseRoutes.js
import { Router } from 'express';
import { anamneseController } from '../controllers/anamneseController.js';

const router = Router();

router.get('/new', anamneseController.newAnamneseForm);
router.post('/create', anamneseController.createAnamnese);

export default router;
