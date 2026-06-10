import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Gavel, FileText, Settings, Users, ShieldAlert, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const sellerLinks = [
    { name: 'Dashboard', to: '/seller', icon: LayoutDashboard, exact: true },
    { name: 'Produk Saya', to: '/seller/products', icon: Package },
    { name: 'Lelang Saya', to: '/seller/auctions', icon: Gavel },
    { name: 'Pesanan', to: '/seller/transactions', icon: ShoppingCart },
  ];

  const adminLinks = [
    { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Kelola Pengguna', to: '/admin/users', icon: Users },
    { name: 'Moderasi Produk', to: '/admin/products', icon: ShieldAlert },
    { name: 'Audit Log', to: '/admin/logs', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : sellerLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">
          {isAdmin ? 'Panel Admin' : 'Panel Penjual'}
        </h2>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {user?.name}
        </p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {link.name}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              Pengaturan Profil
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
