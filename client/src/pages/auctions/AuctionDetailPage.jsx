import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Gavel, Clock, Trophy, ChevronRight, User } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { AuctionTimer } from '../../components/auction/AuctionTimer';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, joinAuction, leaveAuction, placeBid } = useSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const bidsEndRef = useRef(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/auctions/${id}`);
        setAuction(res.data.data);
        
        // Fetch bid history
        const bidsRes = await api.get(`/auctions/${id}/bids`);
        setBids(bidsRes.data.data);
        
        // Set default bid amount
        const minBid = parseFloat(res.data.data.currentPrice) + parseFloat(res.data.data.minIncrement);
        setBidAmount(minBid.toString());
      } catch (error) {
        addToast({ title: 'Error', message: 'Gagal memuat lelang', type: 'error' });
        navigate('/auctions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuction();
  }, [id, navigate, addToast]);

  useEffect(() => {
    if (socket && isConnected && auction) {
      joinAuction(id);

      const handleUpdate = (data) => {
        if (data.auctionId === id) {
          setAuction(prev => ({ ...prev, currentPrice: data.currentPrice }));
          setBids(prev => [data.bid, ...prev]);
          
          // Update default bid amount input if it's lower than the new min
          const newMin = parseFloat(data.currentPrice) + parseFloat(auction.minIncrement);
          setBidAmount(prev => {
            const current = parseFloat(prev);
            return current < newMin || isNaN(current) ? newMin.toString() : prev;
          });
        }
      };

      const handleEnded = (data) => {
        if (data.auctionId === id) {
          setAuction(prev => ({ 
            ...prev, 
            status: 'ENDED', 
            winnerId: data.winnerId,
            currentPrice: data.finalPrice
          }));
          addToast({
            title: 'Lelang Berakhir',
            message: `Pemenang: ${data.winnerName || 'Tidak ada'}`,
            type: 'info'
          });
        }
      };

      const handleError = (data) => {
        addToast({ title: 'Gagal', message: data.message, type: 'error' });
        setIsPlacingBid(false);
      };

      socket.on('auction:update', handleUpdate);
      socket.on('auction:ended', handleEnded);
      socket.on('auction:error', handleError);

      return () => {
        leaveAuction(id);
        socket.off('auction:update', handleUpdate);
        socket.off('auction:ended', handleEnded);
        socket.off('auction:error', handleError);
      };
    }
  }, [socket, isConnected, id, auction, joinAuction, leaveAuction, addToast]);

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=/auctions/${id}`);
      return;
    }

    if (user.role !== 'BUYER') {
      addToast({ title: 'Akses Ditolak', message: 'Hanya pembeli yang bisa mengikuti lelang', type: 'warning' });
      return;
    }

    const minBid = parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement);
    if (parseFloat(bidAmount) < minBid) {
      addToast({ title: 'Nominal Kurang', message: `Minimal penawaran adalah Rp ${minBid.toLocaleString('id-ID')}`, type: 'warning' });
      return;
    }

    setIsPlacingBid(true);
    placeBid(id, parseFloat(bidAmount));
    
    // Reset loading state after a short delay since socket response is fast
    setTimeout(() => setIsPlacingBid(false), 500);
  };

  const isHighestBidder = bids.length > 0 && bids[0].bidderId === user?.id;
  const isOwner = user?.id === auction?.product?.sellerId;
  const isActive = auction?.status === 'ACTIVE';

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!auction) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[var(--color-primary)]">Beranda</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/auctions" className="hover:text-[var(--color-primary)]">Lelang</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 truncate">{auction.product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Product Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-[16/9] bg-gray-100 relative">
                {auction.product.images && auction.product.images.length > 0 ? (
                  <img 
                    src={`http://localhost:5000${auction.product.images[0].url}`} 
                    alt={auction.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                
                <div className="absolute top-4 left-4">
                  <Badge variant={isActive ? 'active' : auction.status === 'SCHEDULED' ? 'pending' : 'ended'} className="text-sm px-3 py-1 bg-white/90 backdrop-blur">
                    {auction.status === 'ACTIVE' ? 'Sedang Berlangsung' : auction.status === 'SCHEDULED' ? 'Akan Datang' : 'Berakhir'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{auction.product.name}</h1>
                <Link to={`/products/${auction.product.slug}`} className="text-[var(--color-primary)] text-sm font-medium hover:underline flex items-center mb-6">
                  Lihat Detail Produk Lengkap <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
                
                <h2 className="text-lg font-bold text-gray-900 mb-3">Tentang Lelang Ini</h2>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Harga Awal</p>
                    <p className="font-semibold text-gray-900">Rp {parseFloat(auction.startPrice).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kelipatan Bid</p>
                    <p className="font-semibold text-gray-900">Rp {parseFloat(auction.minIncrement).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mulai</p>
                    <p className="font-semibold text-gray-900">{new Date(auction.startTime).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Selesai</p>
                    <p className="font-semibold text-gray-900">{new Date(auction.endTime).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding Panel */}
          <div className="space-y-6">
            <div className={`bg-white rounded-2xl shadow-lg border-2 ${isHighestBidder ? 'border-green-400' : 'border-orange-200'} overflow-hidden sticky top-24`}>
              {/* Header Status */}
              <div className={`p-4 text-center text-white ${isActive ? 'bg-orange-500' : auction.status === 'SCHEDULED' ? 'bg-blue-500' : 'bg-gray-600'}`}>
                {isActive ? (
                  <AuctionTimer endTime={auction.endTime} className="text-white text-lg justify-center" />
                ) : (
                  <div className="font-bold text-lg">
                    {auction.status === 'SCHEDULED' ? 'Belum Dimulai' : 'Lelang Berakhir'}
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-500 mb-1 text-center">Harga Saat Ini</p>
                <p className="text-4xl font-bold text-[var(--color-primary)] text-center mb-6">
                  Rp {parseFloat(auction.currentPrice).toLocaleString('id-ID')}
                </p>

                {/* Bidding Form */}
                {isActive && !isOwner && (
                  <form onSubmit={handleBidSubmit} className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement)}
                        step={auction.minIncrement}
                        className="flex-1"
                        placeholder="Nominal Bid"
                      />
                      <Button type="submit" isLoading={isPlacingBid} className="whitespace-nowrap">
                        Bid
                      </Button>
                    </div>
                    {isHighestBidder ? (
                      <p className="text-green-600 text-xs text-center mt-2 font-medium flex items-center justify-center">
                        <Trophy className="w-3 h-3 mr-1" /> Anda adalah penawar tertinggi saat ini!
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs text-center mt-2">
                        Minimal Rp {(parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement)).toLocaleString('id-ID')}
                      </p>
                    )}
                  </form>
                )}

                {isOwner && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm text-center mb-6 border border-yellow-200">
                    Anda tidak bisa menawar produk sendiri.
                  </div>
                )}

                {auction.status === 'ENDED' && auction.winnerId && (
                  <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center mb-6 border border-green-200">
                    <Trophy className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="font-bold">Lelang Dimenangkan!</p>
                    {auction.winnerId === user?.id ? (
                      <p className="text-sm mt-1">Selamat! Anda memenangkan barang ini.</p>
                    ) : (
                      <p className="text-sm mt-1">Lelang telah berakhir.</p>
                    )}
                  </div>
                )}

                {/* Live Activity (Bid History) */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center border-b border-gray-100 pb-2">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    Aktivitas Lelang ({bids.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {bids.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">Belum ada penawaran.</p>
                    ) : (
                      bids.map((bid, idx) => (
                        <div key={bid.id} className={`flex justify-between items-center p-2 rounded-lg ${idx === 0 ? 'bg-green-50 border border-green-100' : ''}`}>
                          <div className="flex items-center gap-2">
                            <Avatar src={bid.bidder.avatar} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {bid.bidder.id === user?.id ? 'Anda' : bid.bidder.name.split(' ')[0]}
                              </p>
                              <p className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleTimeString('id-ID')}</p>
                            </div>
                          </div>
                          <p className={`font-bold text-sm ${idx === 0 ? 'text-green-700' : 'text-gray-900'}`}>
                            Rp {parseFloat(bid.amount).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))
                    )}
                    <div ref={bidsEndRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
