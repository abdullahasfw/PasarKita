import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewValidator } from '../validators/auction.js';

const router = Router();

router.get('/product/:id', reviewController.getProductReviews);
router.get('/user/:id', reviewController.getUserReviews);
router.post('/', authenticate, createReviewValidator, validate, reviewController.createReview);

export default router;
