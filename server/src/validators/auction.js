import { body } from 'express-validator';

export const createAuctionValidator = [
  body('productId')
    .notEmpty().withMessage('ID produk wajib diisi')
    .isUUID().withMessage('ID produk tidak valid'),
  body('startPrice')
    .notEmpty().withMessage('Harga awal wajib diisi')
    .isFloat({ min: 1000 }).withMessage('Harga awal minimal Rp 1.000'),
  body('minIncrement')
    .optional()
    .isFloat({ min: 1000 }).withMessage('Kenaikan minimal Rp 1.000'),
  body('startTime')
    .notEmpty().withMessage('Waktu mulai wajib diisi')
    .isISO8601().withMessage('Format waktu tidak valid'),
  body('endTime')
    .notEmpty().withMessage('Waktu selesai wajib diisi')
    .isISO8601().withMessage('Format waktu tidak valid'),
];

export const placeBidValidator = [
  body('amount')
    .notEmpty().withMessage('Jumlah bid wajib diisi')
    .isFloat({ min: 1000 }).withMessage('Jumlah bid minimal Rp 1.000'),
];

export const createReviewValidator = [
  body('productId')
    .notEmpty().withMessage('ID produk wajib diisi')
    .isUUID().withMessage('ID produk tidak valid'),
  body('targetId')
    .notEmpty().withMessage('ID seller wajib diisi')
    .isUUID().withMessage('ID seller tidak valid'),
  body('rating')
    .notEmpty().withMessage('Rating wajib diisi')
    .isInt({ min: 1, max: 5 }).withMessage('Rating harus 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Komentar maksimal 1000 karakter'),
];
