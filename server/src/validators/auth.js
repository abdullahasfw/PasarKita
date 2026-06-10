import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role')
    .optional()
    .isIn(['BUYER', 'SELLER']).withMessage('Role harus BUYER atau SELLER'),
  body('phone')
    .optional()
    .isMobilePhone('id-ID').withMessage('Format nomor telepon tidak valid'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi'),
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter'),
  body('phone')
    .optional()
    .isMobilePhone('id-ID').withMessage('Format nomor telepon tidak valid'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Alamat maksimal 500 karakter'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude tidak valid'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude tidak valid'),
];
