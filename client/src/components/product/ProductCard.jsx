import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function ProductCard({ product }) {
  const isAuction = !!product.auction;
  
  return (
    <Card hover className="h-full flex flex-col">
      <Link to={`/products/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        {product.images && product.images[0] ? (
          <img 
            src={`http://localhost:5000${product.images[0].url}`} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isAuction ? (
            <Badge variant="active" className="bg-orange-100 text-orange-800 border-orange-200">
              Lelang
            </Badge>
          ) : (
            <Badge variant="active">Beli Langsung</Badge>
          )}
          {product.distance !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {product.distance < 1 ? '< 1 km' : `${Math.round(product.distance)} km`}
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
          <span>{product.category?.name || 'Kategori'}</span>
          <span>{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true, locale: id })}</span>
        </div>
        
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-[var(--color-primary)] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 mb-3">
          {isAuction ? (
            <div>
              <p className="text-xs text-gray-500">Bid Tertinggi</p>
              <p className="text-lg font-bold text-[var(--color-primary)]">
                Rp {parseFloat(product.auction.currentPrice).toLocaleString('id-ID')}
              </p>
            </div>
          ) : (
            <p className="text-lg font-bold text-[var(--color-primary)]">
              Rp {parseFloat(product.price).toLocaleString('id-ID')}
            </p>
          )}
        </div>
        
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center text-sm text-gray-600 truncate mr-2">
            <span className="truncate">{product.seller?.name}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-yellow-400 mr-1 fill-yellow-400" />
            <span>{(product.seller?.averageRating || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
