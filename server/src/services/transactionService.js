import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';

export async function getTransactions(userId, query) {
  const { page, limit, skip } = paginate(query);

  const where = {
    OR: [{ buyerId: userId }, { sellerId: userId }],
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.type) {
    where.type = query.type;
  }

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
        seller: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return paginatedResponse(transactions, total, page, limit);
}

export async function createTransaction(buyerId, data) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    include: { seller: { select: { id: true } } },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  if (product.status !== 'ACTIVE') {
    throw new AppError('Produk tidak tersedia', 400);
  }

  if (product.seller.id === buyerId) {
    throw new AppError('Anda tidak bisa membeli produk sendiri', 400);
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: product.price,
      type: 'marketplace',
      buyerId,
      sellerId: product.seller.id,
      productId: product.id,
      notes: data.notes,
    },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  });

  // Update product status
  await prisma.product.update({
    where: { id: product.id },
    data: { status: 'SOLD' },
  });

  // Notify seller
  await prisma.notification.create({
    data: {
      type: 'order_new',
      title: 'Pesanan Baru!',
      message: `${transaction.buyer.name} membeli produk "${product.name}"`,
      data: { transactionId: transaction.id, productId: product.id },
      userId: product.seller.id,
    },
  });

  return transaction;
}

export async function updateTransactionStatus(transactionId, userId, userRole, status) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      product: { select: { name: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  });

  if (!transaction) {
    throw new AppError('Transaksi tidak ditemukan', 404);
  }

  // Only seller, buyer, or admin can update
  if (transaction.sellerId !== userId && transaction.buyerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Anda tidak memiliki akses', 403);
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: { status },
  });

  // Notify the other party
  const notifyUserId = transaction.sellerId === userId ? transaction.buyerId : transaction.sellerId;
  const statusMessages = {
    PAID: 'telah dibayar',
    SHIPPED: 'telah dikirim',
    COMPLETED: 'telah selesai',
    CANCELLED: 'telah dibatalkan',
    REFUNDED: 'telah direfund',
  };

  await prisma.notification.create({
    data: {
      type: 'order_update',
      title: `Pesanan ${statusMessages[status] || 'diperbarui'}`,
      message: `Pesanan untuk "${transaction.product.name}" ${statusMessages[status] || 'diperbarui'}`,
      data: { transactionId, status },
      userId: notifyUserId,
    },
  });

  return updated;
}
