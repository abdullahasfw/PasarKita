import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Eye, Clock, Users, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

const statusLabels = {
  ACTIVE: 'Aktif',
  SCHEDULED: 'Terjadwal',
  ENDED: 'Berakhir',
  CANCELLED: 'Dibatalkan',
};

export default function SellerAuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuctions();
  }, [page, statusFilter]);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/seller/auctions', { params });
      setAuctions(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch seller auctions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAuctions = searchQuery
    ? auctions.filter(a => a.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : auctions;

  const getImageUrl = (auction) => {
    if (auction.product?.images && auction.product.images.length > 0) {
      return auction.product.images[0].url;
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

  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Berakhir';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}h ${hours}j lagi`;
    if (hours > 0) return `${hours}j ${minutes}m lagi`;
    return `${minutes}m lagi`;
  };

  if (isLoading && auctions.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Lelang Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua lelang produk Anda</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari lelang..."
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
              <option value="ACTIVE">Aktif</option>
              <option value="SCHEDULED">Terjadwal</option>
              <option value="ENDED">Berakhir</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Auctions List */}
      {filteredAuctions.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Gavel}
            title="Belum ada lelang"
            description="Anda belum memiliki lelang aktif. Buat lelang dari halaman produk Anda."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAuctions.map((auction) => (
            <Card key={auction.id} className="p-0 overflow-hidden hover-lift">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="sm:w-40 h-32 sm:h-auto bg-gray-100 flex-shrink-0">
                  {getImageUrl(auction) ? (
                    <img
                      src={getImageUrl(auction)}
                      alt={auction.product?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 min-h-[128px]">
                      <Gavel className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {auction.product?.name || 'Produk Tidak Diketahui'}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant={auction.status?.toLowerCase() || 'active'}>
                          {statusLabels[auction.status] || auction.status}
                        </Badge>
                        {auction.status === 'ACTIVE' && auction.endTime && (
                          <span className="flex items-center gap-1 text-xs text-orange-600">
                            <Clock className="w-3.5 h-3.5" />
                            {getTimeRemaining(auction.endTime)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={`/auctions/${auction.id}`}>
                      <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors" title="Lihat Detail">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Harga Saat Ini</span>
                      <p className="font-semibold text-[var(--color-primary)]">
                        {formatPrice(auction.currentPrice)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Harga Awal</span>
                      <p className="font-medium text-gray-700">
                        {formatPrice(auction.startPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{auction._count?.bids || 0} bid</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-gray-500">Berakhir</span>
                      <p className="text-gray-700">{formatDate(auction.endTime)}</p>
                    </div>
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
