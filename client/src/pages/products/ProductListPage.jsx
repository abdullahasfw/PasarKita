import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import api from '../../api/axios';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Load Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data.data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);
      params.append('page', page);

      setSearchParams(params);

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Only trigger auto-fetch on page change, others trigger by form submit

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset page on new filter
    fetchProducts();
    setIsFilterOpen(false); // Close mobile filter
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    
    setTimeout(() => {
      document.getElementById('filter-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Temukan produk unggulan dari daerah Anda</p>
        </div>

        <form id="filter-form" onSubmit={handleFilterSubmit} className="w-full md:w-auto flex gap-2">
          <Input 
            icon={Search}
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80"
          />
          <Button type="button" variant="outline" className="md:hidden" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="w-5 h-5" />
          </Button>
          <Button type="submit" className="hidden md:flex">Cari</Button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter */}
        <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[var(--color-primary)]" /> Filter
              </h3>
              <button 
                type="button" 
                onClick={handleResetFilters}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleFilterSubmit} className="space-y-5">
              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cat-all"
                      name="category"
                      value=""
                      checked={category === ''}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <label htmlFor="cat-all" className="ml-2 text-sm text-gray-700">Semua Kategori</label>
                  </div>
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`cat-${c.slug}`}
                        name="category"
                        value={c.slug}
                        checked={category === c.slug}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <label htmlFor={`cat-${c.slug}`} className="ml-2 text-sm text-gray-700">
                        {c.name} <span className="text-gray-400 text-xs">({c._count.products})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harga */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga (Rp)</label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Urutkan */}
              <div>
                <Select
                  label="Urutkan Berdasarkan"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  options={[
                    { value: 'newest', label: 'Terbaru' },
                    { value: 'oldest', label: 'Terlama' },
                    { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
                    { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' }
                  ]}
                />
              </div>

              <Button type="submit" className="w-full">Terapkan Filter</Button>
            </form>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:w-3/4">
          {!isLoading && products.length === 0 ? (
            <EmptyState 
              title="Produk tidak ditemukan" 
              description="Coba ubah kata kunci pencarian atau sesuaikan filter Anda."
              actionLabel="Hapus Filter"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <ProductGrid products={products} isLoading={isLoading} />
              
              {!isLoading && pagination && (
                <Pagination 
                  pagination={pagination} 
                  onPageChange={(p) => setPage(p)} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
