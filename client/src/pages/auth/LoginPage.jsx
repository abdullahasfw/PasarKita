import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const user = await login(data.email, data.password);
      
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'SELLER') navigate('/seller');
        else navigate('/');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Email atau password salah');
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
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Atau{' '}
            <Link to="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
              daftar akun baru
            </Link>
          </p>
        </div>

        {searchParams.get('expired') && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 text-sm">
            Sesi Anda telah berakhir, silakan login kembali.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Alamat Email"
            type="email"
            icon={Mail}
            placeholder="nama@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ingat saya
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
                Lupa password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Masuk
          </Button>
        </form>
      </Card>
    </div>
  );
}
