import React, { useState, useEffect } from 'react';
import { Package, Gavel, DollarSign, ShoppingCart } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/seller/stats');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch seller stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>;

  const statCards = [
    { title: 'Total Pendapatan', value: `Rp ${parseFloat(stats?.totalRevenue || 0).toLocaleString('id-ID')}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pesanan Aktif', value: stats?.activeOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Produk', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Lelang Aktif', value: stats?.activeAuctions || 0, icon: Gavel, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Toko</h1>
        <p className="text-gray-500">Selamat datang kembali, {user.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-64 text-gray-500">
        Chart/Grafik akan ditampilkan di sini
      </div>
    </div>
  );
}
