import * as authService from '../services/authService.js';
import { successResponse } from '../utils/helpers.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(successResponse(result, 'Registrasi berhasil'));
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    res.json(successResponse(result, 'Login berhasil'));
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.json(successResponse(tokens, 'Token berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logoutUser(req.user.id);
    res.json(successResponse(null, 'Logout berhasil'));
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json(successResponse(user, 'Profil berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}
