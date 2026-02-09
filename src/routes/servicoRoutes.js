import express from 'express';
import servicoController from '../controllers/servicoController.js';

const router = express.Router();

router.get('/', servicoController.getAllServicos);
router.get('/new', servicoController.newServicoForm);
router.post('/', servicoController.createServico);
router.get('/:idServico', servicoController.getServicoById);
router.get('/:idServico/edit', servicoController.editServicoForm);
router.post('/:idServico', servicoController.updateServico);
router.post('/:idServico/delete', servicoController.deleteServico);

export default router;
