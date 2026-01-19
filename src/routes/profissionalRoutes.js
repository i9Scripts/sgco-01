import { Router } from 'express';
import { profissionalController } from '../controllers/profissionalController.js';
import { requireRole, verificarProfissionalAutenticado } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas para Profissional
router.get(
  '/dashboard',
  verificarProfissionalAutenticado,
  requireRole('profissional'),
  profissionalController.dashboard
); // Dashboard para profissionais
router.get('/', profissionalController.getAllProfissionais); // Listar todos os profissionais
router.get('/new', profissionalController.newProfissionalForm); // Formulário para criar novo profissional
router.post('/', profissionalController.createProfissional); // Criar novo profissional
// Rota dinâmica depois
router.get('/:idProfissional', profissionalController.getProfissionalById); // Detalhes de um profissional
router.get('/:idProfissional/edit', profissionalController.editProfissionalForm); // Formulário para editar profissional
router.put('/:idProfissional', profissionalController.updateProfissional); // Atualizar profissional
router.delete('/:idProfissional', profissionalController.deleteProfissional); // Deletar profissional

router.post('/atender/:idPaciente', verificarProfissionalAutenticado, profissionalController.atenderPaciente); // Atender paciente (remover da fila)

export default router;
