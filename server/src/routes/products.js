import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProductValidator, updateProductValidator, productQueryValidator } from '../validators/product.js';
import { uploadProduct } from '../config/multer.js';

const router = Router();

router.get('/', productQueryValidator, validate, productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/map', productController.getMapProducts);
router.get('/:slug', productController.getProductBySlug);

router.post('/',
  authenticate, requireRole('SELLER', 'ADMIN'),
  uploadProduct.array('images', 5),
  createProductValidator, validate,
  productController.createProduct
);

router.put('/:id',
  authenticate, requireRole('SELLER', 'ADMIN'),
  updateProductValidator, validate,
  productController.updateProduct
);

router.delete('/:id',
  authenticate, requireRole('SELLER', 'ADMIN'),
  productController.deleteProduct
);

router.post('/:id/images',
  authenticate, requireRole('SELLER', 'ADMIN'),
  uploadProduct.array('images', 5),
  productController.uploadImages
);

export default router;
