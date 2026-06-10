import cron from 'node-cron';
import prisma from '../config/database.js';

export function startAuctionScheduler(io) {
  // Check every 10 seconds for auctions that need to be started or ended
  cron.schedule('*/10 * * * * *', async () => {
    const now = new Date();

    try {
      // Activate scheduled auctions
      const toActivate = await prisma.auction.findMany({
        where: {
          status: 'SCHEDULED',
          startTime: { lte: now },
        },
      });

      for (const auction of toActivate) {
        await prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'ACTIVE' },
        });
        console.log(`Auction ${auction.id} activated`);
      }

      // End expired auctions
      const toEnd = await prisma.auction.findMany({
        where: {
          status: 'ACTIVE',
          endTime: { lte: now },
        },
        include: {
          product: { select: { id: true, name: true, sellerId: true } },
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: { bidder: { select: { id: true, name: true } } },
          },
        },
      });

      for (const auction of toEnd) {
        const winner = auction.bids[0];

        await prisma.auction.update({
          where: { id: auction.id },
          data: {
            status: 'ENDED',
            winnerId: winner?.bidderId || null,
          },
        });

        // Broadcast auction ended
        io.to(`auction:${auction.id}`).emit('auction:ended', {
          auctionId: auction.id,
          winnerId: winner?.bidderId || null,
          winnerName: winner?.bidder?.name || null,
          finalPrice: winner?.amount || auction.startPrice,
          productName: auction.product.name,
        });

        if (winner) {
          // Create transaction for winner
          await prisma.transaction.create({
            data: {
              amount: winner.amount,
              type: 'auction',
              status: 'PENDING',
              buyerId: winner.bidderId,
              sellerId: auction.product.sellerId,
              productId: auction.product.id,
            },
          });

          // Update product status
          await prisma.product.update({
            where: { id: auction.product.id },
            data: { status: 'SOLD' },
          });

          // Notify winner
          await prisma.notification.create({
            data: {
              type: 'auction_won',
              title: 'Selamat! Anda Memenangkan Lelang! 🎉',
              message: `Anda memenangkan lelang "${auction.product.name}" dengan harga Rp ${parseFloat(winner.amount).toLocaleString('id-ID')}`,
              data: { auctionId: auction.id, productId: auction.product.id },
              userId: winner.bidderId,
            },
          });

          io.to(`user:${winner.bidderId}`).emit('notification:new', {
            type: 'auction_won',
            title: 'Selamat! Anda Memenangkan Lelang! 🎉',
            message: `Anda memenangkan lelang "${auction.product.name}"`,
          });

          // Notify seller
          await prisma.notification.create({
            data: {
              type: 'auction_ended',
              title: 'Lelang Berakhir',
              message: `Lelang "${auction.product.name}" berakhir. Pemenang: ${winner.bidder.name}`,
              data: { auctionId: auction.id, winnerId: winner.bidderId },
              userId: auction.product.sellerId,
            },
          });

          io.to(`user:${auction.product.sellerId}`).emit('notification:new', {
            type: 'auction_ended',
            title: 'Lelang Berakhir',
            message: `Lelang "${auction.product.name}" berakhir. Pemenang: ${winner.bidder.name}`,
          });
        }

        console.log(`Auction ${auction.id} ended. Winner: ${winner?.bidder?.name || 'none'}`);
      }
    } catch (error) {
      console.error('Auction scheduler error:', error);
    }
  });

  console.log('Auction scheduler started');
}
