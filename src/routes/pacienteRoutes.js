import { Router } from 'express';
import { pacienteController } from '../controllers/pacienteController.js';

const router = Router();
router.get('/new', pacienteController.newPacienteForm); // Formulário para novo paciente
router.post('/', pacienteController.createPaciente); // Criar paciente

// Essas rotas precisam de consultório registrado
router.get('/:idPaciente', pacienteController.getPacienteById); // Buscar paciente pelo ID
router.get('/', pacienteController.getAllPacientes); // Listar todos os pacientes
router.get('/search', pacienteController.searchPacientes); // Buscar pacientes por nome ou contato
router.put('/:idPaciente', pacienteController.updatePaciente); // Atualizar paciente
router.delete('/:idPaciente', pacienteController.deletePaciente); // Deletar paciente
router.get('/:idPaciente/edit', pacienteController.editPacienteForm); // Formulário para editar paciente
router.get('/index', pacienteController.getAllPacientes); // Página de listagem de pacientes

export default router;
