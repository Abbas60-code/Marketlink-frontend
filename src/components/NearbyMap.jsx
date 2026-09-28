import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLocation } from '../context/LocationContext.jsx';
import marketService from '../services/marketService.js';
import { Link } from 'react-router-dom';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const farmerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function NearbyMap({ markets = [] }) {
  const { userLocation } = useLocation();

  if (!userLocation || typeof userLocation.lat === 'undefined' || typeof userLocation.lng === 'undefined') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '1rem', color: '#334155' }}>Discover Nearby Farmers & Markets</h3>
        <p style={{ color: '#64748b' }}>Please allow location access to see the map.</p>
      </div>
    );
  }

  const position = [Number(userLocation.lat), Number(userLocation.lng)];
  if (isNaN(position[0]) || isNaN(position[1])) return null;

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0, position: 'relative' }}>
      <MapContainer center={position} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        <Marker position={position}>
          <Popup>
            <strong>Your Location</strong>
          </Popup>
        </Marker>
        <Circle center={position} radius={3000} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} />

        {/* Dynamic Markets / Farmers */}
        {markets.map((m) => {
          if (!m.location?.coordinates || m.location.coordinates.length < 2) return null;
          // GeoJSON coordinates are [lng, lat], Leaflet wants [lat, lng]
          const lat = Number(m.location.coordinates[1]);
          const lng = Number(m.location.coordinates[0]);
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker key={m._id} position={[lat, lng]} icon={farmerIcon}>
              <Popup>
                <div style={{ padding: '4px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{m.name || m.farmName || 'Vendor'}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>{m.location?.address || 'Local area'}</p>
                  <Link to={m.isFarmer ? `/farmers/${m._id}` : `/markets/${m._id}`} style={{ display: 'inline-block', background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '12px' }}>
                    View {m.isFarmer ? 'Farmer' : 'Market'}
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
