import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Bell, BellOff, Check, CheckCheck, Clock, ShoppingCart, Gavel, AlertCircle, Info } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';

const typeIcons = {
  order_new: ShoppingCart,
  order_update: ShoppingCart,
  auction_outbid: Gavel,
  auction_won: Gavel,
  auction_end: Gavel,
  system: Info,
};

const typeColors = {
  order_new: 'bg-blue-100 text-blue-600',
  order_update: 'bg-green-100 text-green-600',
  auction_outbid: 'bg-orange-100 text-orange-600',
  auction_won: 'bg-purple-100 text-purple-600',
  auction_end: 'bg-red-100 text-red-600',
  system: 'bg-gray-100 text-gray-600',
};

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [page, isAuthenticated]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications', { params: { page, limit: 15 } });
      setNotifications(res.data.data || []);
      setPagination(res.data.pagination || null);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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

  if (isLoading && notifications.length === 0) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} isLoading={markingAll}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={BellOff}
            title="Belum ada notifikasi"
            description="Notifikasi akan muncul ketika ada aktivitas terkait akun Anda."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || AlertCircle;
            const colorClass = typeColors[notif.type] || typeColors.system;

            return (
              <Card
                key={notif.id}
                className={`p-4 transition-all cursor-pointer ${
                  !notif.isRead ? 'border-l-4 border-l-[var(--color-primary)] bg-blue-50/30' : ''
                }`}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
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
