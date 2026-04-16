import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Driver } from '../types';

interface DriverMapProps {
  drivers: Driver[];
  merchantLocation: [number, number];
  selectedDriverId?: number;
}

// Custom icons
const merchantIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #9a684a; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"/><path d="M5 21V10h14v11"/><path d="M9 21V11h6v10"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const driverIcon = (status: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${status === 'active' ? '#10b981' : status === 'busy' ? '#f59e0b' : '#6b7280'}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const DriverMap: React.FC<DriverMapProps> = ({ drivers, merchantLocation, selectedDriverId }) => {
  const activeDrivers = drivers.filter(d => d.latitude && d.longitude);
  
  return (
    <div className="h-[400px] w-full relative z-0 rounded-2xl overflow-hidden">
      <MapContainer 
        center={merchantLocation} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Merchant Location */}
        <Marker position={merchantLocation} icon={merchantIcon}>
          <Popup>
            <div className="font-bold">Lokasi Toko</div>
          </Popup>
        </Marker>

        {/* Drivers */}
        {activeDrivers.map(driver => (
          <Marker 
            key={driver.id} 
            position={[driver.latitude!, driver.longitude!]} 
            icon={driverIcon(driver.status)}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-coffee-900">{driver.full_name}</p>
                <p className="text-xs text-gray-500">{driver.vehicle_info || 'No vehicle info'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    driver.status === 'active' ? 'bg-green-500' : 
                    driver.status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-xs font-medium uppercase">{driver.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DriverMap;
