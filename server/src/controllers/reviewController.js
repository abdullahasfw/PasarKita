import * as reviewService from '../services/reviewService.js';
import { successResponse } from '../utils/helpers.js';

export async function getProductReviews(req, res, next) {
  try {
    const result = await reviewService.getProductReviews(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUserReviews(req, res, next) {
  try {
    const result = await reviewService.getUserReviews(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json(successResponse(review, 'Ulasan berhasil ditambahkan'));
  } catch (error) {
    next(error);
  }
}
