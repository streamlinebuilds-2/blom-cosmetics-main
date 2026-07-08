import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stockists } from '../../data/stockists';

const redPinIcon = L.divIcon({
  className: '',
  html: `
    <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.82 20.18 0 13 0z" fill="#dc2626" stroke="#fff" stroke-width="1.5"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>
  `,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -30]
});

const bounds = L.latLngBounds(stockists.map((s) => [s.lat, s.lng] as [number, number]));

interface StockistMapProps {
  className?: string;
  heightClassName?: string;
}

export const StockistMap: React.FC<StockistMapProps> = ({
  className = '',
  heightClassName = 'h-[420px] md:h-[560px]'
}) => {
  return (
    <div className={`${heightClassName} ${className} rounded-lg border border-gray-200 overflow-hidden`}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [40, 40] }}
        scrollWheelZoom
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stockists.map((stockist) => (
          <Marker key={stockist.id} position={[stockist.lat, stockist.lng]} icon={redPinIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{stockist.name}</p>
                <p className="text-gray-600 mt-1">{stockist.fullAddress}</p>
                {stockist.phone && <p className="text-gray-600 mt-1">{stockist.phone}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
