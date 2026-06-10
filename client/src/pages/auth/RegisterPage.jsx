import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, Phone, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().min(10, 'Nomor telepon tidak valid').optional().or(z.literal('')),
  role: z.enum(['BUYER', 'SELLER']),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'BUYER',
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const user = await registerUser(data);
      
      if (user.role === 'SELLER') navigate('/seller');
      else navigate('/');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Gagal melakukan pendaftaran');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Card className="max-w-md w-full p-8 shadow-xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold text-[var(--color-primary)]">Pasar</span>
            <span className="text-3xl font-bold text-[var(--color-accent)]">Kita</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
              Masuk di sini
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
            <label className={`flex-1 flex justify-center py-2 px-4 rounded-md cursor-pointer transition-colors ${selectedRole === 'BUYER' ? 'bg-white shadow text-[var(--color-primary)] font-medium' : 'text-gray-500 hover:text-gray-900'}`}>
              <input type="radio" value="BUYER" {...register('role')} className="sr-only" />
              <User className="w-5 h-5 mr-2" /> Pembeli
            </label>
            <label className={`flex-1 flex justify-center py-2 px-4 rounded-md cursor-pointer transition-colors ${selectedRole === 'SELLER' ? 'bg-white shadow text-[var(--color-primary)] font-medium' : 'text-gray-500 hover:text-gray-900'}`}>
              <input type="radio" value="SELLER" {...register('role')} className="sr-only" />
              <Store className="w-5 h-5 mr-2" /> Penjual
            </label>
          </div>

          <Input
            label={selectedRole === 'SELLER' ? 'Nama Toko / UMKM' : 'Nama Lengkap'}
            type="text"
            icon={selectedRole === 'SELLER' ? Store : User}
            placeholder={selectedRole === 'SELLER' ? 'Masukkan nama toko' : 'Masukkan nama lengkap'}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Alamat Email"
            type="email"
            icon={Mail}
            placeholder="nama@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Nomor Telepon (Opsional)"
            type="tel"
            icon={Phone}
            placeholder="0812xxxxxx"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Min. 6 karakter"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Daftar Sekarang
          </Button>
        </form>
      </Card>
    </div>
  );
}
