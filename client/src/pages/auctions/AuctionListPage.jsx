import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gavel, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AuctionListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [status, setStatus] = useState(searchParams.get('status') || 'ACTIVE');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page);

      setSearchParams(params);

      const res = await api.get(`/auctions?${params.toString()}`);
      
      // Flatten data structure so ProductGrid can render it
      const flattenedAuctions = res.data.data.map(a => ({
        ...a.product,
        auction: a
      }));
      
      setAuctions(flattenedAuctions);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch auctions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]); 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-orange-50 p-6 rounded-xl border border-orange-100">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4">
            <Gavel className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lelang Real-time</h1>
            <p className="text-gray-600 mt-1">Ikuti keseruan menawar barang langka dan unik</p>
          </div>
        </div>

        <div className="w-full md:w-64">
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={[
              { value: 'ACTIVE', label: 'Lelang Berlangsung' },
              { value: 'SCHEDULED', label: 'Akan Datang' },
              { value: 'ENDED', label: 'Lelang Selesai' }
            ]}
          />
        </div>
      </div>

      <div>
        {!isLoading && auctions.length === 0 ? (
          <EmptyState 
            icon={Gavel}
            title="Tidak ada lelang" 
            description={`Saat ini tidak ada lelang dengan status "${status}".`}
          />
        ) : (
          <>
            <ProductGrid products={auctions} isLoading={isLoading} />
            
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
  );
}
