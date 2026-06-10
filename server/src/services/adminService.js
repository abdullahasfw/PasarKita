import prisma from '../config/database.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getPlatformStats() {
  const [
    totalUsers,
    totalProducts,
    totalAuctions,
    totalTransactions,
    activeAuctions,
    totalRevenue,
    recentUsers,
    recentTransactions,
    usersByRole,
    productsByStatus,
    monthlyTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.auction.count(),
    prisma.transaction.count(),
    prisma.auction.count({ where: { status: 'ACTIVE' } }),
    prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.transaction.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.product.groupBy({ by: ['status'], _count: true }),
    // Monthly transactions for chart
    prisma.$queryRaw`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(amount) as revenue
      FROM transactions
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `,
  ]);

  return {
    totalUsers,
    totalProducts,
    totalAuctions,
    totalTransactions,
    activeAuctions,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentUsers,
    recentTransactions,
    usersByRole,
    productsByStatus,
    monthlyTransactions,
  };
}

export async function getUsers(query) {
  const { page, limit, skip } = paginate(query);

  const where = {};
  if (query.role) where.role = query.role;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        avatar: true, isActive: true, isVerified: true, createdAt: true,
        _count: { select: { products: true, buyerTx: true, sellerTx: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(users, total, page, limit);
}

export async function updateUserRole(userId, role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function toggleUserStatus(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User tidak ditemukan', 404);

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
}

export async function deleteUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User tidak ditemukan', 404);

  await prisma.user.delete({ where: { id: userId } });

  await prisma.auditLog.create({
    data: {
      action: 'DELETE',
      entity: 'User',
      entityId: userId,
      details: { name: user.name, email: user.email },
    },
  });
}

export async function getModerationProducts(query) {
  const { page, limit, skip } = paginate(query);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'MODERATED' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        images: true,
        category: { select: { name: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.product.count({ where: { status: 'MODERATED' } }),
  ]);

  return paginatedResponse(products, total, page, limit);
}

export async function moderateProduct(productId, action, adminId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Produk tidak ditemukan', 404);

  const status = action === 'approve' ? 'ACTIVE' : 'ARCHIVED';

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      action: `MODERATE_${action.toUpperCase()}`,
      entity: 'Product',
      entityId: productId,
      userId: adminId,
      details: { name: product.name },
    },
  });

  // Notify seller
  await prisma.notification.create({
    data: {
      type: 'product_moderation',
      title: action === 'approve' ? 'Produk Disetujui' : 'Produk Ditolak',
      message: `Produk "${product.name}" telah ${action === 'approve' ? 'disetujui' : 'ditolak'} oleh admin`,
      data: { productId },
      userId: product.sellerId,
    },
  });

  return updated;
}

export async function getAuditLogs(query) {
  const { page, limit, skip } = paginate(query);

  const where = {};
  if (query.entity) where.entity = query.entity;
  if (query.action) where.action = query.action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return paginatedResponse(logs, total, page, limit);
}
