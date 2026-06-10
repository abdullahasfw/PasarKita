import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, transactionController.getTransactions);
router.post('/', authenticate, transactionController.createTransaction);
router.put('/:id/status', authenticate, transactionController.updateStatus);

export default router;
