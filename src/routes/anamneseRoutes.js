import { Router } from 'express';
import { anamneseController } from '../controllers/anamneseController.js';

const router = Router();

// Rota para exibir o formulário de nova anamnese
router.get('/new', anamneseController.newAnamneseForm);

// Rota para criação da anamnese
router.post('/', anamneseController.createAnamnese);

// Outras rotas como editar, listar, deletar, etc.
router.get('/', anamneseController.getAllAnamneses);
router.get('/:idAnam', anamneseController.getAnamneseById);
router.get('/:idAnam/edit', anamneseController.editAnamneseForm);
router.put('/:idAnam', anamneseController.updateAnamnese);
router.delete('/:idAnam', anamneseController.deleteAnamnese);

export default router;
