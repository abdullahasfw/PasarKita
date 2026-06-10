import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

export async function registerUser({ name, email, password, role = 'BUYER', phone }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email sudah terdaftar', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  const tokens = generateTokenPair(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, ...tokens };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  if (!user.isActive) {
    throw new AppError('Akun Anda telah dinonaktifkan', 403);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('Email atau password salah', 401);
  }

  const tokens = generateTokenPair(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  const { password: _, refreshToken: __, ...userData } = user;

  return { user: userData, ...tokens };
}

export async function refreshToken(token) {
  if (!token) {
    throw new AppError('Refresh token diperlukan', 400);
  }

  const decoded = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token tidak valid', 401);
  }

  const tokens = generateTokenPair(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
}

export async function logoutUser(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      address: true,
      latitude: true,
      longitude: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          products: true,
          reviewsReceived: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  return user;
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatar: true,
      address: true,
      latitude: true,
      longitude: true,
      isVerified: true,
      createdAt: true,
    },
  });

  return user;
}
