import { body, query } from 'express-validator';

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama produk wajib diisi')
    .isLength({ min: 3, max: 200 }).withMessage('Nama produk harus 3-200 karakter'),
  body('description')
    .trim()
    .notEmpty().withMessage('Deskripsi wajib diisi')
    .isLength({ min: 10 }).withMessage('Deskripsi minimal 10 karakter'),
  body('price')
    .notEmpty().withMessage('Harga wajib diisi')
    .isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('categoryId')
    .notEmpty().withMessage('Kategori wajib diisi')
    .isUUID().withMessage('ID kategori tidak valid'),
  body('condition')
    .optional()
    .isIn(['new', 'like_new', 'used', 'refurbished']).withMessage('Kondisi tidak valid'),
  body('latitude')
    .notEmpty().withMessage('Latitude wajib diisi')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude tidak valid'),
  body('longitude')
    .notEmpty().withMessage('Longitude wajib diisi')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude tidak valid'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Alamat maksimal 500 karakter'),
];

export const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Nama produk harus 3-200 karakter'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Deskripsi minimal 10 karakter'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Harga harus angka positif'),
  body('categoryId')
    .optional()
    .isUUID().withMessage('ID kategori tidak valid'),
  body('condition')
    .optional()
    .isIn(['new', 'like_new', 'used', 'refurbished']).withMessage('Kondisi tidak valid'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude tidak valid'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude tidak valid'),
];

export const productQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page harus angka positif'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit harus 1-50'),
  query('category').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('condition').optional().isIn(['new', 'like_new', 'used', 'refurbished']),
  query('latitude').optional().isFloat({ min: -90, max: 90 }),
  query('longitude').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isFloat({ min: 0.1, max: 100 }),
  query('search').optional().isString(),
  query('sort').optional().isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'nearest']),
];
