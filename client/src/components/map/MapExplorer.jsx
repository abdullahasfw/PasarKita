import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix Leaflet's default icon path issues with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icon for products
const productIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center map when selected location changes
function MapCenterer({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

export function MapExplorer({ products = [], center = { lat: -6.914744, lng: 107.60981 }, zoom = 12 }) {
  return (
    <div className="w-full h-full min-h-[500px] z-0 relative">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="w-full h-full min-h-[500px] rounded-lg shadow-sm"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterer center={center} />
        
        {products.map(product => (
          <Marker 
            key={product.id} 
            position={[product.latitude, product.longitude]}
            icon={productIcon}
          >
            <Popup className="product-popup">
              <div className="w-48">
                {product.images && product.images[0] && (
                  <img 
                    src={`http://localhost:5000${product.images[0].url}`} 
                    alt={product.name}
                    className="w-full h-24 object-cover rounded-t-md mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{product.seller?.name}</p>
                <p className="font-bold text-[var(--color-primary)] text-sm mb-2">
                  Rp {parseFloat(product.price).toLocaleString('id-ID')}
                </p>
                <Link 
                  to={`/products/${product.slug}`}
                  className="block w-full text-center bg-[var(--color-primary)] text-white py-1 px-2 rounded text-xs hover:bg-[var(--color-primary-light)] transition-colors"
                >
                  Lihat Detail
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
