import { Router } from 'express';
import { anamneseController } from '../controllers/anamneseController.js';
import { verificarProfissionalAutenticado } from '../middlewares/authMiddleware.js';

const router = Router();

// Rota para exibir o formulário de nova anamnese
router.get('/new', anamneseController.newAnamneseForm);

// Rota para criação da anamnese
router.post('/', anamneseController.createAnamnese);

// Outras rotas como editar, listar, deletar, etc.
router.get('/', anamneseController.getAllAnamneses);
router.get('/search', anamneseController.searchAnamneses); // Rota de busca
router.get('/:idAnam', anamneseController.getAnamneseById);
router.get('/:idAnam/edit', verificarProfissionalAutenticado, anamneseController.editAnamneseForm);
router.put('/:idAnam', verificarProfissionalAutenticado, anamneseController.updateAnamnese);
router.delete('/:idAnam', verificarProfissionalAutenticado, anamneseController.deleteAnamnese);

export default router;
