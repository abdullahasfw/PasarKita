import { verifyAccessToken } from '../config/jwt.js';
import prisma from '../config/database.js';

export function setupSocket(io) {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, role: true, avatar: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

    // Join user-specific room for notifications
    socket.join(`user:${socket.user.id}`);

    // Join auction room
    socket.on('auction:join', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`${socket.user.name} joined auction:${auctionId}`);
    });

    // Leave auction room
    socket.on('auction:leave', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      console.log(`${socket.user.name} left auction:${auctionId}`);
    });

    // Place bid via socket (alternative to REST)
    socket.on('auction:bid', async (data) => {
      try {
        const { auctionId, amount } = data;

        if (socket.user.role !== 'BUYER') {
          socket.emit('auction:error', { message: 'Hanya buyer yang bisa melakukan bid' });
          return;
        }

        const auction = await prisma.auction.findUnique({
          where: { id: auctionId },
          include: {
            product: { select: { sellerId: true, name: true } },
            bids: { orderBy: { amount: 'desc' }, take: 1 },
          },
        });

        if (!auction || auction.status !== 'ACTIVE') {
          socket.emit('auction:error', { message: 'Lelang tidak aktif' });
          return;
        }

        if (new Date() > auction.endTime) {
          socket.emit('auction:error', { message: 'Lelang sudah berakhir' });
          return;
        }

        if (auction.product.sellerId === socket.user.id) {
          socket.emit('auction:error', { message: 'Tidak bisa bid produk sendiri' });
          return;
        }

        const bidAmount = parseFloat(amount);
        const minBid = parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement);

        if (bidAmount < minBid) {
          socket.emit('auction:error', { message: `Bid minimal Rp ${minBid.toLocaleString('id-ID')}` });
          return;
        }

        // Optimistic concurrency
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
          socket.emit('auction:error', { message: 'Bid gagal, coba lagi' });
          return;
        }

        const bid = await prisma.bid.create({
          data: {
            amount: bidAmount,
            bidderId: socket.user.id,
            auctionId,
          },
          include: {
            bidder: { select: { id: true, name: true, avatar: true } },
          },
        });

        // Broadcast to auction room
        io.to(`auction:${auctionId}`).emit('auction:update', {
          auctionId,
          currentPrice: bidAmount,
          bid,
          totalBids: auction.bids.length + 1,
        });

        // Notify outbid user
        const prevHighBidder = auction.bids[0];
        if (prevHighBidder && prevHighBidder.bidderId !== socket.user.id) {
          await prisma.notification.create({
            data: {
              type: 'bid_outbid',
              title: 'Bid Anda telah terlampaui!',
              message: `Seseorang telah mengajukan bid lebih tinggi untuk "${auction.product.name}"`,
              data: { auctionId, amount: bidAmount },
              userId: prevHighBidder.bidderId,
            },
          });

          io.to(`user:${prevHighBidder.bidderId}`).emit('auction:outbid', {
            auctionId,
            amount: bidAmount,
            productName: auction.product.name,
          });

          io.to(`user:${prevHighBidder.bidderId}`).emit('notification:new', {
            type: 'bid_outbid',
            title: 'Bid Anda telah terlampaui!',
            message: `Bid lebih tinggi Rp ${bidAmount.toLocaleString('id-ID')} untuk "${auction.product.name}"`,
          });
        }

      } catch (error) {
        console.error('Bid error:', error);
        socket.emit('auction:error', { message: 'Terjadi kesalahan saat memproses bid' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
}
