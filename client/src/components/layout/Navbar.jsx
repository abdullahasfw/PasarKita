import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, User, LogOut, Package, Gavel } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-[var(--color-primary)]">Pasar</span>
              <span className="text-2xl font-bold text-[var(--color-accent)]">Kita</span>
            </Link>
            
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link to="/products" className="text-gray-600 hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium">Marketplace</Link>
              <Link to="/auctions" className="text-gray-600 hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium">Lelang</Link>
              <Link to="/map" className="text-gray-600 hover:text-[var(--color-primary)] px-3 py-2 rounded-md text-sm font-medium">Peta</Link>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 ml-6 max-w-lg">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-sm"
                  placeholder="Cari produk lokal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Right Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile/notifications" className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </Link>

                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <Avatar src={user.avatar} size="sm" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsProfileMenuOpen(false)}></div>
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-40">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        {user.role === 'ADMIN' && (
                          <Link onClick={() => setIsProfileMenuOpen(false)} to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                            Dashboard Admin
                          </Link>
                        )}
                        {user.role === 'SELLER' && (
                          <Link onClick={() => setIsProfileMenuOpen(false)} to="/seller" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                            Dashboard Toko
                          </Link>
                        )}
                        <Link onClick={() => setIsProfileMenuOpen(false)} to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                          <User className="h-4 w-4 mr-2" /> Profil Saya
                        </Link>
                        {user.role === 'BUYER' && (
                          <Link onClick={() => setIsProfileMenuOpen(false)} to="/profile/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                            <Package className="h-4 w-4 mr-2" /> Pesanan Saya
                          </Link>
                        )}
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center">
                          <LogOut className="h-4 w-4 mr-2" /> Keluar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Daftar</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)]"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm"
                placeholder="Cari produk lokal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Marketplace</Link>
            <Link to="/auctions" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Lelang</Link>
            <Link to="/map" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Peta</Link>
          </div>
          
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar src={user.avatar} size="sm" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                {user.role === 'ADMIN' && (
                   <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard Admin</Link>
                )}
                {user.role === 'SELLER' && (
                   <Link to="/seller" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard Toko</Link>
                )}
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Profil Saya</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Keluar</button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 px-4 flex space-x-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">Masuk</Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button variant="primary" className="w-full">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
