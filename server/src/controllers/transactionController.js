import * as transactionService from '../services/transactionService.js';
import { successResponse } from '../utils/helpers.js';

export async function getTransactions(req, res, next) {
  try {
    const result = await transactionService.getTransactions(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const transaction = await transactionService.createTransaction(req.user.id, req.body);
    res.status(201).json(successResponse(transaction, 'Transaksi berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const transaction = await transactionService.updateTransactionStatus(
      req.params.id, req.user.id, req.user.role, req.body.status
    );
    res.json(successResponse(transaction, 'Status transaksi berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}
