import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { produtoController } from '../controllers/produtoController.js';

const router = Router();

// Multer storage configuration: ensure dst folder exists
const imgsDir = path.join(process.cwd(), 'src', 'public', 'img', 'produtos');
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

router.get('/', produtoController.getAllProdutos);
router.get('/new', produtoController.newProdutoForm);
router.post('/', upload.single('imagem'), produtoController.createProduto);
router.get('/search', produtoController.searchProdutos);
router.get('/:idProduto', produtoController.getProdutoById);
router.get('/:idProduto/edit', produtoController.editProdutoForm);
router.post('/:idProduto/edit', upload.single('imagem'), produtoController.updateProduto);
router.delete('/:idProduto', produtoController.deleteProduto);

export default router;
