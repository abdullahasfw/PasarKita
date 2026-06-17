import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Package, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
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
};

export default function SellerTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/seller/transactions', { params });
      setTransactions(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch seller transactions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = searchQuery
    ? transactions.filter(t =>
        t.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  const getImageUrl = (transaction) => {
    if (transaction.product?.images && transaction.product.images.length > 0) {
      return transaction.product.images[0].url;
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

  if (isLoading && transactions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pesanan masuk dari pembeli</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={ShoppingCart}
            title="Belum ada pesanan"
            description="Belum ada pesanan masuk. Pesanan akan muncul ketika pembeli melakukan pembelian."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {getImageUrl(tx) ? (
                            <img src={getImageUrl(tx)} alt={tx.product?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">
                            {tx.product?.name || 'Produk Tidak Diketahui'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.buyer?.avatar ? (
                          <img src={tx.buyer.avatar} alt={tx.buyer.name} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-medium">
                            {tx.buyer?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{tx.buyer?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={tx.status?.toLowerCase() || 'pending'}>
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.product?.slug && (
                        <Link to={`/products/${tx.product.slug}`}>
                          <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors" title="Lihat Produk">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {getImageUrl(tx) ? (
                      <img src={getImageUrl(tx)} alt={tx.product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{tx.product?.name || '-'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-[var(--color-primary)]">{formatPrice(tx.amount)}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <Badge variant={tx.status?.toLowerCase() || 'pending'}>
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>Pembeli: {tx.buyer?.name || '-'}</span>
                      <span className="text-gray-300">|</span>
                      <span>{formatDate(tx.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
