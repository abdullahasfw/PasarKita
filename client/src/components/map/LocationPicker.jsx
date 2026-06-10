import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export function LocationPicker({ 
  value, 
  onChange, 
  defaultCenter = { lat: -6.914744, lng: 107.60981 }, // Bandung Default
  height = "300px" 
}) {
  const [position, setPosition] = useState(
    value?.latitude && value?.longitude 
      ? { lat: value.latitude, lng: value.longitude } 
      : null
  );

  const handlePositionChange = (pos) => {
    setPosition(pos);
    if (onChange) {
      onChange({ latitude: pos.lat, longitude: pos.lng });
    }
  };

  return (
    <div className="w-full relative z-0 border border-gray-300 rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer 
        center={position || defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={handlePositionChange} />
      </MapContainer>
      <div className="absolute top-2 right-2 z-[1000] bg-white px-3 py-2 rounded-md shadow text-xs font-medium text-gray-700 pointer-events-none">
        Klik pada peta untuk menentukan lokasi
      </div>
    </div>
  );
}
