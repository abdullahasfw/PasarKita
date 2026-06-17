import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Avatar } from '../../components/ui/Avatar';
import { User, Mail, Phone, MapPin, ShieldCheck, Calendar, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleLabels = {
    BUYER: 'Pembeli',
    SELLER: 'Penjual',
    ADMIN: 'Administrator',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi profil Anda</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar src={user?.avatar} size="xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary)] text-white">
                {roleLabels[user?.role] || user?.role}
              </span>
              {user?.isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Terverifikasi
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Bergabung sejak {new Date(user?.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profil
            </Button>
          )}
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nama Lengkap"
              icon={User}
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Masukkan nama lengkap"
            />
            <Input
              label="Email"
              icon={Mail}
              value={user?.email || ''}
              disabled
              placeholder="Email tidak dapat diubah"
            />
            <Input
              label="Nomor Telepon"
              icon={Phone}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Masukkan nomor telepon"
            />
            <Input
              label="Alamat"
              icon={MapPin}
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button type="submit" isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                Batal
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
