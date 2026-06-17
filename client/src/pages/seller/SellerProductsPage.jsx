import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Eye, Edit, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

const statusLabels = {
  ACTIVE: 'Aktif',
  SOLD: 'Terjual',
  ARCHIVED: 'Diarsipkan',
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/seller/products', { params });
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      console.error('Failed to fetch seller products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return null;
  };

  const formatPrice = (price) => {
    return `Rp ${parseFloat(price || 0).toLocaleString('id-ID')}`;
  };

  if (isLoading && products.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua produk yang Anda jual</p>
        </div>
        <Link to="/products">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
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
              <option value="SOLD">Terjual</option>
              <option value="ARCHIVED">Diarsipkan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table/List */}
      {filteredProducts.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Package}
            title="Belum ada produk"
            description="Anda belum memiliki produk. Mulai tambahkan produk pertama Anda!"
            actionLabel="Tambah Produk"
            onAction={() => window.location.href = '/products'}
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lelang</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {getImageUrl(product) ? (
                            <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(product.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.stock ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={product.status?.toLowerCase() || 'active'}>
                        {statusLabels[product.status] || product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {product.auction ? (
                        <Badge variant={product.auction.status?.toLowerCase() || 'active'}>
                          {product.auction.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/${product.slug}`}>
                          <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors" title="Lihat">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {getImageUrl(product) ? (
                      <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm font-semibold text-[var(--color-primary)] mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={product.status?.toLowerCase() || 'active'}>
                        {statusLabels[product.status] || product.status}
                      </Badge>
                      {product.auction && (
                        <Badge variant={product.auction.status?.toLowerCase() || 'active'}>
                          Lelang {product.auction.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link to={`/products/${product.slug}`}>
                    <button className="p-2 text-gray-400 hover:text-[var(--color-primary)]">
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
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
