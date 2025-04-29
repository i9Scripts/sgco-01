import { Router } from 'express';
import { anamneseController } from '../controllers/anamneseController.js';

const router = Router();

// Rota para exibir o formulário de nova anamnese
router.get('/new', anamneseController.newAnamneseForm);

// Rota para criação da anamnese
router.post('/', anamneseController.createAnamnese);

// Outras rotas como editar, listar, deletar, etc.
router.get('/', anamneseController.getAllAnamneses);
router.get('/:idAnamnese', anamneseController.getAnamneseById);
router.get('/:idAnamnese/edit', anamneseController.editAnamneseForm);
router.put('/:idAnamnese', anamneseController.updateAnamnese);
router.delete('/:idAnamnese', anamneseController.deleteAnamnese);

export default router;
