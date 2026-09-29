'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';

// Leaflet's default marker icons reference bundled image paths that don't
// resolve under Next.js's bundler — point them at the CDN copies instead.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationMapPicker({ lat, lon, onChange }: Props) {
  const [position, setPosition] = useState<[number, number]>([lat, lon]);

  function handleChange(newLat: number, newLon: number) {
    setPosition([newLat, newLon]);
    onChange(newLat, newLon);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700">
      <MapContainer center={position} zoom={12} style={{ height: '320px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target.getLatLng();
              handleChange(m.lat, m.lng);
            },
          }}
        />
        <ClickHandler onChange={handleChange} />
      </MapContainer>
    </div>
  );
}
