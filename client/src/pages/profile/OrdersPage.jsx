import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShoppingCart, Eye, Package, Search, Filter, Clock } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

const statusLabels = {
  PENDING: 'Menunggu',
  PAID: 'Dibayar',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  REFUNDED: 'Direfund',
};

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [page, statusFilter, isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/transactions', { params });
      setTransactions(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (tx) => {
    if (tx.product?.images && tx.product.images.length > 0) {
      return tx.product.images[0].url;
    }
    return null;
  };

  const formatPrice = (price) => {
    return `Rp ${parseFloat(price || 0).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
        <p className="text-gray-500 text-sm mt-1">Riwayat dan status pesanan Anda</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Dibayar</option>
            <option value="SHIPPED">Dikirim</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </Card>

      {/* Orders List */}
      {transactions.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={ShoppingCart}
            title="Belum ada pesanan"
            description="Anda belum memiliki pesanan. Mulai belanja di marketplace kami!"
            actionLabel="Jelajahi Produk"
            onAction={() => window.location.href = '/products'}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="p-0 overflow-hidden hover-lift">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="sm:w-36 h-28 sm:h-auto bg-gray-100 flex-shrink-0">
                  {getImageUrl(tx) ? (
                    <img
                      src={getImageUrl(tx)}
                      alt={tx.product?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 min-h-[112px]">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {tx.product?.name || 'Produk Tidak Diketahui'}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant={tx.status?.toLowerCase() || 'pending'}>
                          {statusLabels[tx.status] || tx.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                    {tx.product?.slug && (
                      <Link to={`/products/${tx.product.slug}`}>
                        <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors" title="Lihat Produk">
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Total</span>
                      <p className="font-semibold text-[var(--color-primary)]">
                        {formatPrice(tx.amount)}
                      </p>
                    </div>
                    {tx.seller && tx.seller.id !== user?.id && (
                      <div>
                        <span className="text-gray-500">Penjual</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {tx.seller.avatar ? (
                            <img src={tx.seller.avatar} alt={tx.seller.name} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-medium">
                              {tx.seller.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-gray-700 text-sm">{tx.seller.name}</span>
                        </div>
                      </div>
                    )}
                    {tx.buyer && tx.buyer.id !== user?.id && (
                      <div>
                        <span className="text-gray-500">Pembeli</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {tx.buyer.avatar ? (
                            <img src={tx.buyer.avatar} alt={tx.buyer.name} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-medium">
                              {tx.buyer.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-gray-700 text-sm">{tx.buyer.name}</span>
                        </div>
                      </div>
                    )}
                    {tx.type && (
                      <div>
                        <span className="text-gray-500">Tipe</span>
                        <p className="text-gray-700 capitalize">{tx.type}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
