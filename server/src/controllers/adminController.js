import * as adminService from '../services/adminService.js';
import { successResponse } from '../utils/helpers.js';

export async function getStats(req, res, next) {
  try {
    const stats = await adminService.getPlatformStats();
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const result = await adminService.getUsers(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const user = await adminService.updateUserRole(req.params.id, req.body.role);
    res.json(successResponse(user, 'Role berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    res.json(successResponse(user, 'Status user berhasil diperbarui'));
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.params.id);
    res.json(successResponse(null, 'User berhasil dihapus'));
  } catch (error) {
    next(error);
  }
}

export async function getModerationProducts(req, res, next) {
  try {
    const result = await adminService.getModerationProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function moderateProduct(req, res, next) {
  try {
    const product = await adminService.moderateProduct(req.params.id, req.body.action, req.user.id);
    res.json(successResponse(product, 'Produk berhasil dimoderasi'));
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const result = await adminService.getAuditLogs(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
