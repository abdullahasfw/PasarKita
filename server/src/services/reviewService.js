import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';

export async function getProductReviews(productId, query) {
  const { page, limit, skip } = paginate(query);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  // Calculate average rating
  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    ...paginatedResponse(reviews, total, page, limit),
    stats: {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.rating,
    },
  };
}

export async function getUserReviews(targetId, query) {
  const { page, limit, skip } = paginate(query);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { targetId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.review.count({ where: { targetId } }),
  ]);

  const stats = await prisma.review.aggregate({
    where: { targetId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    ...paginatedResponse(reviews, total, page, limit),
    stats: {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.rating,
    },
  };
}

export async function createReview(authorId, data) {
  // Check if already reviewed
  const existing = await prisma.review.findUnique({
    where: { authorId_productId: { authorId, productId: data.productId } },
  });

  if (existing) {
    throw new AppError('Anda sudah memberikan ulasan untuk produk ini', 409);
  }

  // Check if buyer has a completed transaction for this product
  const transaction = await prisma.transaction.findFirst({
    where: {
      buyerId: authorId,
      productId: data.productId,
      status: 'COMPLETED',
    },
  });

  if (!transaction) {
    throw new AppError('Anda hanya bisa mengulas produk yang sudah dibeli dan selesai', 403);
  }

  const review = await prisma.review.create({
    data: {
      rating: parseInt(data.rating),
      comment: data.comment,
      authorId,
      targetId: data.targetId,
      productId: data.productId,
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      product: { select: { id: true, name: true } },
    },
  });

  // Notify seller
  await prisma.notification.create({
    data: {
      type: 'review',
      title: 'Ulasan Baru!',
      message: `${review.author.name} memberikan ulasan ${review.rating} bintang untuk "${review.product.name}"`,
      data: { reviewId: review.id, rating: review.rating },
      userId: data.targetId,
    },
  });

  return review;
}
