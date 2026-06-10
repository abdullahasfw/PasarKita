import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate, paginatedResponse } from '../utils/helpers.js';

export async function getAuctions(query) {
  const { page, limit, skip } = paginate(query);

  const where = {};

  if (query.status) {
    where.status = query.status;
  } else {
    where.status = { in: ['ACTIVE', 'SCHEDULED'] };
  }

  const [auctions, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      orderBy: { endTime: 'asc' },
      skip,
      take: limit,
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
            seller: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: { select: { bids: true } },
      },
    }),
    prisma.auction.count({ where }),
  ]);

  return paginatedResponse(auctions, total, page, limit);
}

export async function getAuctionById(id) {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          images: true,
          category: true,
          seller: {
            select: {
              id: true, name: true, avatar: true, phone: true,
              _count: { select: { products: true, reviewsReceived: true } },
            },
          },
        },
      },
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          bidder: { select: { id: true, name: true, avatar: true } },
        },
      },
      _count: { select: { bids: true } },
    },
  });

  if (!auction) {
    throw new AppError('Lelang tidak ditemukan', 404);
  }

  return auction;
}

export async function createAuction(sellerId, data) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    include: { auction: true },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  if (product.sellerId !== sellerId) {
    throw new AppError('Anda hanya bisa membuat lelang untuk produk Anda sendiri', 403);
  }

  if (product.auction) {
    throw new AppError('Produk ini sudah memiliki lelang', 409);
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (endTime <= startTime) {
    throw new AppError('Waktu selesai harus setelah waktu mulai', 400);
  }

  if (endTime - startTime < 60 * 60 * 1000) {
    throw new AppError('Durasi lelang minimal 1 jam', 400);
  }

  const now = new Date();
  const status = startTime <= now ? 'ACTIVE' : 'SCHEDULED';

  const auction = await prisma.auction.create({
    data: {
      startPrice: parseFloat(data.startPrice),
      currentPrice: parseFloat(data.startPrice),
      minIncrement: parseFloat(data.minIncrement) || 10000,
      startTime,
      endTime,
      status,
      productId: data.productId,
    },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          seller: { select: { id: true, name: true } },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Auction',
      entityId: auction.id,
      userId: sellerId,
      details: { productName: product.name, startPrice: data.startPrice },
    },
  });

  return auction;
}

export async function placeBid(auctionId, bidderId, amount) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      product: { select: { sellerId: true, name: true } },
      bids: { orderBy: { amount: 'desc' }, take: 1 },
    },
  });

  if (!auction) {
    throw new AppError('Lelang tidak ditemukan', 404);
  }

  if (auction.status !== 'ACTIVE') {
    throw new AppError('Lelang belum aktif atau sudah berakhir', 400);
  }

  if (new Date() > auction.endTime) {
    throw new AppError('Lelang sudah berakhir', 400);
  }

  if (auction.product.sellerId === bidderId) {
    throw new AppError('Anda tidak bisa bid pada produk sendiri', 400);
  }

  const bidAmount = parseFloat(amount);
  const minBid = parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement);

  if (bidAmount < minBid) {
    throw new AppError(`Bid minimal Rp ${minBid.toLocaleString('id-ID')}`, 400);
  }

  // Optimistic concurrency control
  const updated = await prisma.auction.updateMany({
    where: {
      id: auctionId,
      version: auction.version,
      status: 'ACTIVE',
    },
    data: {
      currentPrice: bidAmount,
      version: { increment: 1 },
    },
  });

  if (updated.count === 0) {
    throw new AppError('Bid gagal, coba lagi (ada bid lain yang lebih cepat)', 409);
  }

  const bid = await prisma.bid.create({
    data: {
      amount: bidAmount,
      bidderId,
      auctionId,
    },
    include: {
      bidder: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Notify previous highest bidder if different
  const prevHighBidder = auction.bids[0];
  if (prevHighBidder && prevHighBidder.bidderId !== bidderId) {
    await prisma.notification.create({
      data: {
        type: 'bid_outbid',
        title: 'Bid Anda telah terlampaui!',
        message: `Seseorang telah mengajukan bid lebih tinggi untuk "${auction.product.name}"`,
        data: { auctionId, amount: bidAmount },
        userId: prevHighBidder.bidderId,
      },
    });
  }

  return { bid, auction: { ...auction, currentPrice: bidAmount } };
}

export async function cancelAuction(auctionId, userId, userRole) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { product: { select: { sellerId: true } } },
  });

  if (!auction) {
    throw new AppError('Lelang tidak ditemukan', 404);
  }

  if (auction.product.sellerId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Anda tidak memiliki akses', 403);
  }

  if (auction.status === 'ENDED') {
    throw new AppError('Lelang sudah berakhir, tidak bisa dibatalkan', 400);
  }

  const updated = await prisma.auction.update({
    where: { id: auctionId },
    data: { status: 'CANCELLED' },
  });

  return updated;
}
