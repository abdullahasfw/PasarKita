import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { setupSocket } from './src/socket/socketHandler.js';
import { startAuctionScheduler } from './src/socket/auctionScheduler.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store io instance on app for use in controllers
app.set('io', io);

// Setup socket handlers
setupSocket(io);

// Start auction scheduler
startAuctionScheduler(io);

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     🏪 PasarKita Server Running         ║
  ║     Port: ${PORT}                          ║
  ║     Mode: ${process.env.NODE_ENV || 'development'}               ║
  ╚══════════════════════════════════════════╝
  `);
});
