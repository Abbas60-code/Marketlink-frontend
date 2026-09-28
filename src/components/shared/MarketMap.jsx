import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, ExternalLink, Store, Clock, Calendar, Layers, Map as MapIcon, User } from 'lucide-react';
import './MarketMap.css';

export default function MarketMap({
  locations = [],
  selectedLocation = null,
  onSelectLocation = null,
  userLocation = null,
  height = '420px',
  title = 'Farmers Markets & Pickup Points',
  compact = false,
}) {
  const sortedLocations = useMemo(() => {
    const arr = [...locations];
    if (userLocation) {
      arr.sort((a, b) => {
        const da = typeof a?.distanceKm === 'number' ? a.distanceKm : Infinity;
        const db = typeof b?.distanceKm === 'number' ? b.distanceKm : Infinity;
        return da - db;
      });
    }
    return arr;
  }, [locations, userLocation]);

  const [activeLoc, setActiveLoc] = useState(selectedLocation || sortedLocations[0] || null);
  const [mapProvider, setMapProvider] = useState('google'); // 'google' | 'openstreetmap'

  // Default coordinate center: user's location > active > selected > first > Karachi defaults
  const centerOnUser = userLocation && !activeLoc;
  const currentLoc = (centerOnUser ? { lat: userLocation.lat, lng: userLocation.lng, name: 'Your Current Location', address: 'You are here', isUserPin: true } : null)
    || activeLoc
    || selectedLocation
    || sortedLocations[0]
    || userLocation && { lat: userLocation.lat, lng: userLocation.lng, name: 'Your Current Location', address: 'You are here', isUserPin: true }
    || {
        name: 'Main Organic Market Hub',
        lat: 24.8607,
        lng: 67.0011,
        address: 'City Center Market Grounds',
        marketDays: ['Saturday', 'Sunday'],
        pickupHours: '8:00 AM – 2:00 PM',
      };

  const lat = currentLoc.lat || currentLoc.location?.coordinates?.lat || currentLoc.location?.lat || 24.8607;
  const lng = currentLoc.lng || currentLoc.location?.coordinates?.lng || currentLoc.location?.lng || 67.0011;
  const locName = currentLoc.name || currentLoc.farmName || 'Farmers Market Hub';
  const locAddress = currentLoc.location?.address || currentLoc.address || 'Local Market Area';
  const locCity = currentLoc.location?.city || currentLoc.city || 'Karachi';

  // Map Provider URLs
  const googleMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const osmMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  const mapUrl = mapProvider === 'google' ? googleMapUrl : osmMapUrl;

  // Live GPS Directions URLs
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${lat}%2C${lng}`;
  const directionsUrl = mapProvider === 'google' ? googleDirectionsUrl : osmDirectionsUrl;

  return (
    <div className={`market-map-widget ${compact ? 'compact-mode' : ''}`} style={{ height }}>
      {!compact && (
        <div className="market-map-sidebar">
          <div className="market-map-header">
            <Store size={18} className="text-emerald-500" />
            <h3 className="market-map-title">{title}</h3>
          </div>

          <div className="market-map-list">
            {sortedLocations.length === 0 && !userLocation ? (
              <div className="market-map-empty">No locations listed</div>
            ) : (
              <>
                {userLocation && (
                  <div className="you-are-here-item">
                    <div className="yah-pin" />
                    <div className="yah-info">
                      <span className="yah-name">
                        <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Aap yahaan hain
                      </span>
                      <span className="yah-desc">
                        {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}
                      </span>
                    </div>
                  </div>
                )}

                {sortedLocations.map((loc, idx) => {
                  const isSelected = (activeLoc?._id && loc._id === activeLoc._id) || (!activeLoc?._id && idx === 0);
                  const name = loc.name || loc.farmName || `Market Hub #${idx + 1}`;
                  const addr = loc.location?.address || loc.address || loc.location?.city || 'Local Grounds';
                  const days = loc.marketDays?.join(', ') || loc.operatingDays?.join(', ') || 'Sat, Sun';
                  const d = loc.distanceKm;
                  const dLabel = typeof d === 'number' ? `${Math.round(d * 10) / 10} km` : null;

                  return (
                    <div
                      key={loc._id || idx}
                      className={`market-map-item ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        setActiveLoc(loc);
                        if (onSelectLocation) onSelectLocation(loc);
                      }}
                    >
                      <div className="market-map-item-pin">
                        <MapPin size={16} />
                      </div>
                      <div className="market-map-item-info">
                        <span className="market-map-item-name">{name}</span>
                        <span className="market-map-item-address">{addr}</span>
                        <span className="market-map-item-days">
                          <Calendar size={11} /> {days}
                        </span>
                      </div>
                      {dLabel && (
                        <span className={`distance-badge item-distance ${d > 15 ? 'far' : ''}`}>{dLabel}</span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      <div className="market-map-frame-wrap">
        <iframe
          title="Market Location Map"
          className="market-map-iframe"
          src={mapUrl}
          loading="lazy"
        />

        {/* Map Provider Selector Pills + Recenter */}
        <div className="market-map-provider-bar">
          {userLocation && (
            <button
              type="button"
              className="map-provider-btn recenter-btn"
              onClick={() => setActiveLoc(null)}
              title="Recenter map on my location"
            >
              <Navigation size={12} /> My Location
            </button>
          )}
          <button
            type="button"
            className={`map-provider-btn ${mapProvider === 'google' ? 'active' : ''}`}
            onClick={() => setMapProvider('google')}
          >
            <MapIcon size={12} /> Google Maps
          </button>
          <button
            type="button"
            className={`map-provider-btn ${mapProvider === 'openstreetmap' ? 'active' : ''}`}
            onClick={() => setMapProvider('openstreetmap')}
          >
            <Layers size={12} /> OpenStreetMap
          </button>
        </div>

        {/* User's live location pin (shown when map is centered on user coords) */}
        {userLocation &&
          ((currentLoc.isUserPin) ||
            (Math.abs(Number(lat) - userLocation.lat) < 0.0001 &&
              Math.abs(Number(lng) - userLocation.lng) < 0.0001)) && (
            <div className="user-location-overlay" aria-hidden="true">
              <div className="user-pin-pulse" />
              <div className="user-pin-dot" />
              <span className="user-pin-label">
                <User size={10} /> Aap yahaan hain
              </span>
            </div>
          )}

        {/* Selected Location Floating Info Card */}
        <div className="market-map-overlay-card">
          <div className="market-map-overlay-top">
            <span className="market-badge-pulse"> Active Pickup Point</span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="market-directions-link"
              title="Get GPS Directions"
            >
              <Navigation size={13} /> Get Directions <ExternalLink size={11} />
            </a>
          </div>

          <h4 className="market-overlay-name">{locName}</h4>
          <p className="market-overlay-address">
            <MapPin size={13} /> {locAddress}{locCity ? `, ${locCity}` : ''}
          </p>

          <div className="market-overlay-meta">
            {currentLoc.marketDays?.length > 0 && (
              <span>
                <Calendar size={12} /> {currentLoc.marketDays.join(', ')}
              </span>
            )}
            {(currentLoc.openTime || currentLoc.pickupStartTime) && (
              <span>
                <Clock size={12} /> {currentLoc.pickupStartTime ? `${currentLoc.pickupStartTime} - ${currentLoc.pickupEndTime}` : `${currentLoc.openTime} - ${currentLoc.closeTime}`}
              </span>
            )}
            {typeof currentLoc.distanceKm === 'number' && (
              <span>
                <MapPin size={12} /> {Math.round(currentLoc.distanceKm * 10) / 10} km away
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
