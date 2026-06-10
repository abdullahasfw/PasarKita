import prisma from '../config/database.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';

export async function getSellerStats(sellerId) {
  const [
    totalProducts,
    totalTransactions,
    totalRevenue,
    activeAuctions,
    completedTransactions,
    averageRating,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.transaction.count({ where: { sellerId } }),
    prisma.transaction.aggregate({
      where: { sellerId, status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.auction.count({
      where: { product: { sellerId }, status: 'ACTIVE' },
    }),
    prisma.transaction.count({
      where: { sellerId, status: 'COMPLETED' },
    }),
    prisma.review.aggregate({
      where: { targetId: sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.$queryRaw`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(amount) as revenue
      FROM transactions
      WHERE sellerId = ${sellerId}
        AND status = 'COMPLETED'
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `,
  ]);

  return {
    totalProducts,
    totalTransactions,
    totalRevenue: totalRevenue._sum.amount || 0,
    activeAuctions,
    completedTransactions,
    averageRating: averageRating._avg.rating || 0,
    totalReviews: averageRating._count.rating,
    monthlyRevenue,
  };
}

export async function getSellerProducts(sellerId, query) {
  const { page, limit, skip } = paginate(query);

  const where = { sellerId };
  if (query.status) where.status = query.status;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
        auction: { select: { id: true, status: true, currentPrice: true, endTime: true } },
        _count: { select: { reviews: true, transactions: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return paginatedResponse(products, total, page, limit);
}

export async function getSellerTransactions(sellerId, query) {
  const { page, limit, skip } = paginate(query);

  const where = { sellerId };
  if (query.status) where.status = query.status;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        product: {
          select: {
            id: true, name: true, slug: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return paginatedResponse(transactions, total, page, limit);
}

export async function getSellerAuctions(sellerId, query) {
  const { page, limit, skip } = paginate(query);

  const where = { product: { sellerId } };
  if (query.status) where.status = query.status;

  const [auctions, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        product: {
          select: {
            id: true, name: true, slug: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        _count: { select: { bids: true } },
      },
    }),
    prisma.auction.count({ where }),
  ]);

  return paginatedResponse(auctions, total, page, limit);
}
