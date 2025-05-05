import { Router } from 'express';
import { diagnosticoController } from '../controllers/diagnosticoController.js';

const router = Router();

// Rotas para Diagnostico
router.get('/', diagnosticoController.getAllDiagnosticos); // Listar todos os diagnósticos
router.get('/new', diagnosticoController.newDiagnosticoForm); // Formulário para criar novo diagnóstico
router.post('/', diagnosticoController.createDiagnostico); // Criar novo diagnóstico
router.get('/:idDiagnostico', diagnosticoController.getDiagnosticoById); // Detalhes de um diagnóstico
router.get('/:idDiagnostico/edit', diagnosticoController.editDiagnosticoForm); // Formulário para editar diagnóstico
router.put('/:idDiagnostico', diagnosticoController.updateDiagnostico); // Atualizar diagnóstico
router.delete('/:idDiagnostico', diagnosticoController.deleteDiagnostico); // Deletar diagnóstico

export default router;
