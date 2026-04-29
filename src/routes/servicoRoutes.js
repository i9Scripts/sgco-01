import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import servicoController from '../controllers/servicoController.js';

const router = express.Router();

// Multer storage configuration: ensure dst folder exists
const imgsDir = path.join(process.cwd(), 'src', 'public', 'img', 'servicos');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(imgsDir, { recursive: true });
      cb(null, imgsDir);
    } catch (err) {
      cb(err, imgsDir);
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', servicoController.getAllServicos);
router.get('/new', servicoController.newServicoForm);
router.post('/', upload.single('imagem'), servicoController.createServico);
router.get('/:idServico', servicoController.getServicoById);
router.get('/:idServico/edit', servicoController.editServicoForm);
router.post('/:idServico', upload.single('imagem'), servicoController.updateServico);
router.post('/:idServico/delete', servicoController.deleteServico);

export default router;
