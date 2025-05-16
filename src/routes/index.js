import express from 'express';
import { indexController } from '../controllers/indexController.js';

const router = express.Router();

router.get('/', indexController.index);

export default router;
