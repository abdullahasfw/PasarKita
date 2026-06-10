import { Router } from 'express';
import * as auctionController from '../controllers/auctionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAuctionValidator, placeBidValidator } from '../validators/auction.js';
import { bidLimiter } from '../config/rateLimit.js';

const router = Router();

router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

router.post('/',
  authenticate, requireRole('SELLER', 'ADMIN'),
  createAuctionValidator, validate,
  auctionController.createAuction
);

router.post('/:id/bid',
  authenticate, requireRole('BUYER'),
  bidLimiter,
  placeBidValidator, validate,
  auctionController.placeBid
);

router.put('/:id/cancel',
  authenticate, requireRole('SELLER', 'ADMIN'),
  auctionController.cancelAuction
);

export default router;
