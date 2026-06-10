import * as auctionService from '../services/auctionService.js';
import { successResponse } from '../utils/helpers.js';

export async function getAuctions(req, res, next) {
  try {
    const result = await auctionService.getAuctions(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAuctionById(req, res, next) {
  try {
    const auction = await auctionService.getAuctionById(req.params.id);
    res.json(successResponse(auction));
  } catch (error) {
    next(error);
  }
}

export async function createAuction(req, res, next) {
  try {
    const auction = await auctionService.createAuction(req.user.id, req.body);
    res.status(201).json(successResponse(auction, 'Lelang berhasil dibuat'));
  } catch (error) {
    next(error);
  }
}

export async function placeBid(req, res, next) {
  try {
    const result = await auctionService.placeBid(req.params.id, req.user.id, req.body.amount);

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(`auction:${req.params.id}`).emit('auction:update', {
        auctionId: req.params.id,
        currentPrice: result.bid.amount,
        bid: result.bid,
      });

      // Notify outbid user
      const prevBids = result.auction.bids || [];
      if (prevBids.length > 0 && prevBids[0].bidderId !== req.user.id) {
        io.to(`user:${prevBids[0].bidderId}`).emit('auction:outbid', {
          auctionId: req.params.id,
          amount: result.bid.amount,
        });
      }
    }

    res.status(201).json(successResponse(result.bid, 'Bid berhasil'));
  } catch (error) {
    next(error);
  }
}

export async function cancelAuction(req, res, next) {
  try {
    const auction = await auctionService.cancelAuction(req.params.id, req.user.id, req.user.role);
    res.json(successResponse(auction, 'Lelang berhasil dibatalkan'));
  } catch (error) {
    next(error);
  }
}
