import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

router.get('/login', authController.showLoginForm);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logout);

// opções de registro (opcional)
router.get('/register', (req, res) => res.render('auth/register', { layout: false, messages: req.flash() }));
router.post('/register', authController.registerUser);

// Rotas para vinculação de User -> Profissional quando houver múltiplos candidatos
router.get('/link-profissional', authController.showLinkProfissional);
router.post('/link-profissional', authController.linkProfissional);

export default router;
