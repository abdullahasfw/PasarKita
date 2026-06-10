import { verifyAccessToken } from '../config/jwt.js';
import prisma from '../config/database.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, avatar: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token kadaluarsa', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke resource ini' });
    }
    next();
  };
}

export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch {
    // Token invalid, continue without auth
  }
  next();
}
