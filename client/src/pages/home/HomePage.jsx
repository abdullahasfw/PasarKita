import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Gavel, MapPin, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProductGrid } from '../../components/product/ProductGrid';
import { MapExplorer } from '../../components/map/MapExplorer';
import api from '../../api/axios';

export default function HomePage() {
  const [recentProducts, setRecentProducts] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [mapProducts, setMapProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, auctionsRes, mapRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/auctions?status=ACTIVE&limit=4'),
          api.get('/products/map?radius=50')
        ]);
        
        setRecentProducts(productsRes.data.data);
        setActiveAuctions(auctionsRes.data.data.map(a => ({
          ...a.product,
          auction: a
        })));
        setMapProducts(mapRes.data.data);
      } catch (error) {
        console.error('Failed to load homepage data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[var(--color-primary)] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Marketplace Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Dukung Produk <span className="text-[var(--color-accent)]">Lokal Daerah</span> Anda
            </h1>
            <p className="mt-4 text-xl sm:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
              Temukan barang berkualitas, ikuti lelang seru, dan dukung pertumbuhan ekonomi daerah melalui PasarKita.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-gray-900 border-none">
                  Mulai Belanja <ShoppingBag className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auctions">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-[var(--color-primary)]">
                  Ikuti Lelang <Gavel className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Features */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-green-100 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Berbasis Lokasi</h3>
              <p className="text-gray-500">Temukan penjual terdekat di sekitar Anda untuk ongkos kirim yang lebih murah.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Gavel className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lelang Real-time</h3>
              <p className="text-gray-500">Ikuti keseruan lelang barang antik atau langka secara langsung tanpa jeda.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aman & Terpercaya</h3>
              <p className="text-gray-500">Transaksi dijamin aman dengan sistem moderasi produk dari admin daerah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Auctions */}
      {activeAuctions.length > 0 && (
        <section className="py-16 bg-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Lelang Berlangsung</h2>
                <p className="text-gray-600">Jangan lewatkan kesempatan mendapatkan barang impian Anda.</p>
              </div>
              <Link to="/auctions" className="hidden sm:flex items-center text-[var(--color-primary)] font-medium hover:underline">
                Lihat Semua <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            <ProductGrid products={activeAuctions} isLoading={isLoading} />
            
            <div className="mt-8 text-center sm:hidden">
              <Link to="/auctions">
                <Button variant="outline" className="w-full">Lihat Semua Lelang</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Produk Terbaru</h2>
              <p className="text-gray-600">Dukung UMKM lokal dengan membeli produk terbaru mereka.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center text-[var(--color-primary)] font-medium hover:underline">
              Eksplorasi <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <ProductGrid products={recentProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* Map Preview */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cari Penjual di Sekitar Anda</h2>
            <p className="text-gray-600 mb-6">
              Gunakan peta interaktif kami untuk menemukan produk yang dijual di dekat lokasi Anda saat ini.
            </p>
            <Link to="/map">
              <Button icon={MapPin}>Buka Peta Interaktif</Button>
            </Link>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 h-[400px]">
             <MapExplorer products={mapProducts.slice(0, 50)} />
          </div>
        </div>
      </section>
    </div>
  );
}
