import express from 'express';
import { parceiroController } from '../controllers/parceiroController.js';

const router = express.Router();

// Rotas para parceiros
router.get('/', parceiroController.getAllParceiros); // Listar parceiros
router.get('/new', parceiroController.newParceiroForm); // Formulário para novo parceiro
router.post('/', parceiroController.createParceiro); // Criar parceiro
router.post('/delete/:idParceiro', parceiroController.deleteParceiro); // Deletar parceiro

export default router;
