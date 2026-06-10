import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bidLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: 'Terlalu banyak bid, coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});
