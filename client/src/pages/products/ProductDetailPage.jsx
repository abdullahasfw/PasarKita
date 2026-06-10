import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, ShoppingBag, Store, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { StarRating } from '../../components/ui/StarRating';
import { Spinner } from '../../components/ui/Spinner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.data);
      } catch (error) {
        addToast({
          title: 'Error',
          message: error.response?.data?.message || 'Gagal memuat produk',
          type: 'error'
        });
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate, addToast]);

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=/products/${slug}`);
      return;
    }

    try {
      setIsBuying(true);
      await api.post('/transactions', { productId: product.id });
      addToast({
        title: 'Pembelian Berhasil',
        message: 'Silakan cek menu Pesanan Saya untuk instruksi pembayaran.',
        type: 'success'
      });
      navigate('/profile/orders');
    } catch (error) {
      addToast({
        title: 'Pembelian Gagal',
        message: error.response?.data?.message || 'Terjadi kesalahan',
        type: 'error'
      });
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return null;

  const isAuction = !!product.auction;
  const isOwner = user?.id === product.sellerId;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[var(--color-primary)]">Beranda</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/products" className="hover:text-[var(--color-primary)]">Marketplace</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="p-6 border-r border-gray-100">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4 border border-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={`http://localhost:5000${product.images[activeImage].url}`} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${activeImage === idx ? 'border-[var(--color-primary)]' : 'border-transparent'}`}
                    >
                      <img src={`http://localhost:5000${img.url}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant={isAuction ? 'active' : 'primary'} className={isAuction ? 'bg-orange-100 text-orange-800' : ''}>
                  {isAuction ? 'Lelang' : 'Marketplace'}
                </Badge>
                <div className="text-sm text-gray-500">
                  Kondisi: <span className="font-semibold text-gray-900 uppercase">{product.condition.replace('_', ' ')}</span>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 text-gray-700 font-medium">4.8</span>
                  <span className="mx-1 text-gray-400">•</span>
                  <span className="text-gray-500 underline">{product._count?.reviews || 0} Ulasan</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                {isAuction ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bid Saat Ini</p>
                    <p className="text-3xl font-bold text-[var(--color-primary)]">
                      Rp {parseFloat(product.auction.currentPrice).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Selesai pada: {new Date(product.auction.endTime).toLocaleString('id-ID')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Harga</p>
                    <p className="text-3xl font-bold text-[var(--color-primary)]">
                      Rp {parseFloat(product.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                {isOwner ? (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/seller/products')}>
                    Kelola Produk Ini
                  </Button>
                ) : isAuction ? (
                  <Button className="w-full" size="lg" onClick={() => navigate(`/auctions/${product.auction.id}`)}>
                    Ikuti Lelang Sekarang
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={handleBuyNow} isLoading={isBuying} disabled={product.status !== 'ACTIVE'}>
                    <ShoppingBag className="w-5 h-5 mr-2" /> Beli Langsung
                  </Button>
                )}
                
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500 gap-6">
                  <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-green-500" /> Transaksi Aman</span>
                  <span className="flex items-center"><Store className="w-4 h-4 mr-1 text-blue-500" /> Penjual Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info & Seller & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Description & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Produk</h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ulasan Pembeli</h2>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar src={review.author.avatar} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{review.author.name}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <p className="mt-3 text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Belum ada ulasan untuk produk ini.</p>
              )}
            </div>
          </div>

          {/* Right Column: Seller Info & Mini Map */}
          <div className="space-y-8">
            {/* Seller Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Store className="w-5 h-5 mr-2 text-[var(--color-primary)]" /> Informasi Penjual
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <Avatar src={product.seller.avatar} size="lg" />
                <div>
                  <h4 className="font-bold text-gray-900">{product.seller.name}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-red-500" />
                    <span className="truncate">{product.seller.address || 'Lokasi tidak spesifik'}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4 text-center border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500">Total Produk</p>
                  <p className="font-semibold text-gray-900">{product.seller._count?.products || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ulasan</p>
                  <p className="font-semibold text-gray-900">{product.seller._count?.reviewsReceived || 0}</p>
                </div>
              </div>
            </div>

            {/* Mini Map */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[var(--color-primary)]" /> Lokasi Barang
              </h3>
              
              <div className="h-48 rounded-xl overflow-hidden border border-gray-200 z-0 relative">
                <MapContainer 
                  center={[product.latitude, product.longitude]} 
                  zoom={15} 
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[product.latitude, product.longitude]} />
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
