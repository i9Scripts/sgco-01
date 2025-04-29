// src/routes/pacientesRoutes.js

import { Router } from 'express';
import { pacienteController } from '../controllers/pacienteController.js';

const router = Router();

// Agora todas as rotas são relativas a /pacientes (definido no app.use)

router.get('/', pacienteController.getAllPacientes); // GET /pacientes
router.get('/new', pacienteController.newPacienteForm); // GET /pacientes/new
router.post('/', pacienteController.createPaciente); // POST /pacientes

// Busca antes da rota dinâmica
router.get('/search', pacienteController.searchPacientes); // GET /pacientes/search
// Rota específica para busca por CPF
router.get('/search/cpf', pacienteController.searchPacienteByCpf); // GET /pacientes/search/cpf/12345678900
router.get('/:idPaciente/selecionar', pacienteController.selecionarPaciente);

// Rota dinâmica depois
router.get('/:idPaciente', pacienteController.getPacienteById); // GET /pacientes/2
router.get('/:idPaciente/edit', pacienteController.editPacienteForm); // GET /pacientes/2/edit
router.put('/:idPaciente', pacienteController.updatePaciente); // PUT /pacientes/2
router.delete('/:idPaciente', pacienteController.deletePaciente); // DELETE /pacientes/2

export default router;
