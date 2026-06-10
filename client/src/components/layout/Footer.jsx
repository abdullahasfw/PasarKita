import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Facebook = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-[var(--color-primary)]">Pasar</span>
              <span className="text-2xl font-bold text-[var(--color-accent)]">Kita</span>
            </Link>
            <p className="text-sm text-gray-500 mb-4">
              Platform digital yang menghubungkan penjual dan pembeli dalam satu ekosistem berbasis lokasi untuk mendukung produk lokal daerah.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><Instagram size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Tautan</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">Marketplace</Link></li>
              <li><Link to="/auctions" className="hover:text-[var(--color-primary)] transition-colors">Lelang Real-time</Link></li>
              <li><Link to="/map" className="hover:text-[var(--color-primary)] transition-colors">Peta Penjual</Link></li>
              <li><Link to="/about" className="hover:text-[var(--color-primary)] transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/faq" className="hover:text-[var(--color-primary)] transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-[var(--color-primary)] transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Kebijakan Privasi</Link></li>
              <li><Link to="/guide" className="hover:text-[var(--color-primary)] transition-colors">Panduan Lelang</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Kontak Kami</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 text-[var(--color-primary)] flex-shrink-0" />
                <span>Gedung Sate, Jl. Diponegoro No.22, Bandung, Jawa Barat 40115</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-[var(--color-primary)] flex-shrink-0" />
                <span>+62 811 2233 4455</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-[var(--color-primary)] flex-shrink-0" />
                <span>halo@pasarkita.id</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} PasarKita. Hak Cipta Dilindungi.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4 text-sm text-gray-500">
            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Sistem Normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
