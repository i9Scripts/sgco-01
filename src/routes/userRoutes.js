import { Router } from 'express';
import { userController } from '../controllers/userController.js';

const router = Router();

router.get('/', userController.getAllUsers); // Listar todos os usuários
router.get('/new', userController.newUserForm); // Formulário para novo usuário
router.post('/', userController.createUser); // Criar usuário
router.get('/:idUser', userController.getUserById); // Detalhes do usuário
router.get('/:idUser/edit', userController.editUserForm); // Formulário para editar usuário
router.put('/:idUser', userController.updateUser); // Atualizar usuário
router.delete('/:idUser', userController.deleteUser); // Deletar usuário

export default router;
