import * as sellerService from '../services/sellerService.js';
import { successResponse } from '../utils/helpers.js';

export async function getStats(req, res, next) {
  try {
    const stats = await sellerService.getSellerStats(req.user.id);
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

export async function getProducts(req, res, next) {
  try {
    const result = await sellerService.getSellerProducts(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTransactions(req, res, next) {
  try {
    const result = await sellerService.getSellerTransactions(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAuctions(req, res, next) {
  try {
    const result = await sellerService.getSellerAuctions(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
