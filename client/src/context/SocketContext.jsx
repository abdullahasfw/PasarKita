import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';

const SocketContext = createContext(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      socketInstance = io(process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5000', {
        auth: { token }
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      // Global notification handler
      socketInstance.on('notification:new', (notification) => {
        addToast({
          title: notification.title,
          message: notification.message,
          type: notification.type.includes('won') || notification.type === 'product_moderation' ? 'success' : 'info',
          duration: 8000
        });
      });

      // Global outbid handler
      socketInstance.on('auction:outbid', (data) => {
        // Will also be handled by notification handler if server emits it, 
        // but this specific event can be used for UI updates if needed
      });

      setSocket(socketInstance);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, addToast]);

  const joinAuction = useCallback((auctionId) => {
    if (socket && isConnected) {
      socket.emit('auction:join', auctionId);
    }
  }, [socket, isConnected]);

  const leaveAuction = useCallback((auctionId) => {
    if (socket && isConnected) {
      socket.emit('auction:leave', auctionId);
    }
  }, [socket, isConnected]);

  const placeBid = useCallback((auctionId, amount) => {
    if (socket && isConnected) {
      socket.emit('auction:bid', { auctionId, amount });
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinAuction,
      leaveAuction,
      placeBid
    }}>
      {children}
    </SocketContext.Provider>
  );
}
