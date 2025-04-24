import { Router } from 'express';
import { parceiroController } from '../controllers/parceiroController.js';

const router = Router();
router.get('/new', parceiroController.newParceiroForm); // Formulário para novo parceiro
router.post('/', parceiroController.createParceiro); // Criar parceiro

// Essas rotas precisam de consultório registrado
router.get('/:idParceiro', parceiroController.getParceiroById); // Buscar parceiro pelo ID
router.get('/', parceiroController.getAllParceiros); // Listar todos os parceiros
router.get('/search', parceiroController.searchParceiros); // Buscar parceiros por nome ou contato
router.put('/:idParceiro', parceiroController.updateParceiro); // Atualizar parceiro
router.delete('/:idParceiro', parceiroController.deleteParceiro); // Deletar parceiro
router.get('/:idParceiro/edit', parceiroController.editParceiroForm); // Formulário para editar parceiro
router.get('/index', parceiroController.getAllParceiros); // Página de listagem de parceiros

export default router;
