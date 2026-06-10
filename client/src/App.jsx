import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages - Public
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductListPage from './pages/products/ProductListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import AuctionListPage from './pages/auctions/AuctionListPage';
import AuctionDetailPage from './pages/auctions/AuctionDetailPage';
import MapExplorerPage from './pages/map/MapExplorerPage';

// Pages - Dashboard
import SellerDashboard from './pages/seller/SellerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="auctions" element={<AuctionListPage />} />
                <Route path="auctions/:id" element={<AuctionDetailPage />} />
                <Route path="map" element={<MapExplorerPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>

              {/* Seller Routes */}
              <Route path="/seller" element={<DashboardLayout allowedRoles={['SELLER']} />}>
                <Route index element={<SellerDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN']} />}>
                <Route index element={<AdminDashboard />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
