import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import api from '../../api/axios';
import { MapExplorer } from '../../components/map/MapExplorer';
import { Input } from '../../components/ui/Input';
import { Search, Navigation } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function MapExplorerPage() {
  const { location, error, requestLocation } = useGeolocation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default to Bandung if no geolocation
  const defaultCenter = { lat: -6.914744, lng: 107.60981 };
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setCenter({ lat: location.latitude, lng: location.longitude });
    }
  }, [location]);

  useEffect(() => {
    const fetchMapProducts = async () => {
      try {
        setIsLoading(true);
        // Fetch all products with location for the map
        const res = await api.get('/products/map?radius=100'); // large radius to show many
        setProducts(res.data.data);
      } catch (error) {
        console.error('Failed to load map products', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMapProducts();
  }, []);

  const handleUseMyLocation = () => {
    requestLocation();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Peta Penjual Terdekat</h1>
          <p className="text-sm text-gray-500">Temukan barang di sekitar Anda</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleUseMyLocation}
            icon={Navigation}
          >
            Gunakan Lokasi Saya
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative bg-gray-100">
        {!isLoading && (
          <MapExplorer 
            products={products} 
            center={center}
            zoom={13}
          />
        )}
      </div>
    </div>
  );
}
