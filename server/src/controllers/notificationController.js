import * as notificationService from '../services/notificationService.js';
import { successResponse } from '../utils/helpers.js';

export async function getNotifications(req, res, next) {
  try {
    const result = await notificationService.getNotifications(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json(successResponse(null, 'Notifikasi ditandai sudah dibaca'));
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json(successResponse(null, 'Semua notifikasi ditandai sudah dibaca'));
  } catch (error) {
    next(error);
  }
}
