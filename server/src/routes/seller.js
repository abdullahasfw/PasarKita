import { Router } from 'express';
import * as sellerController from '../controllers/sellerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// All seller routes require SELLER role
router.use(authenticate, requireRole('SELLER'));

router.get('/stats', sellerController.getStats);
router.get('/products', sellerController.getProducts);
router.get('/transactions', sellerController.getTransactions);
router.get('/auctions', sellerController.getAuctions);

export default router;
