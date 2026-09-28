import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Leaf, MapPin, Award, Phone, Mail, CheckCircle, ChevronRight,
  Search, Store, Calendar, Clock, Star, ShoppingBag, X, Grid, Map as MapIcon, Navigation
} from 'lucide-react';
import farmerService from '../services/farmerService.js';
import { SkeletonCard, EmptyState } from '../components/shared/index.jsx';
import MarketMap from '../components/shared/MarketMap.jsx';
import { useLocation } from '../context/LocationContext.jsx';
import './Farmers.css';

export default function Farmers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedDay, setSelectedDay] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedFarmerForMap, setSelectedFarmerForMap] = useState(null);

  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(25);

  const { userLocation, permissionStatus, requestLocation, getDistanceKm } = useLocation();

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearch(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    if (userLocation && permissionStatus === 'granted' && nearbyEnabled === false) {
      setNearbyEnabled(true);
    }
  }, [userLocation, permissionStatus]);

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const params = { isActive: true };
        if (selectedDay) params.day = selectedDay;
        if (nearbyEnabled && userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
          params.radiusKm = radiusKm;
        }
        const res = await farmerService.getFarmers(params);
        const list = res?.data || [];
        setFarmers(list);
        if (list.length > 0) setSelectedFarmerForMap(list[0]);
      } catch (err) {
        console.error('Failed to load farmers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, [selectedDay, nearbyEnabled, radiusKm, userLocation]);

  const filteredFarmers = useMemo(() => farmers.filter((f) => {
    if (!f) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (f.farmName || '').toLowerCase().includes(q) ||
      (f.user?.name || '').toLowerCase().includes(q) ||
      (f.user?.email || '').toLowerCase().includes(q) ||
      (f.contactPerson || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.phone || '').toLowerCase().includes(q) ||
      (f.stallNumber || '').toLowerCase().includes(q) ||
      (f.address || '').toLowerCase().includes(q) ||
      (f.location?.city || f.city || '').toLowerCase().includes(q) ||
      (f.market?.name || '').toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q) ||
      (f.specialties || []).some((s) => (s || '').toLowerCase().includes(q))
    );
  }), [farmers, search]);

  const mapLocations = useMemo(() => filteredFarmers.map((f) => {
    const fl = f.location || {};
    const lat = fl.coordinates?.lat ?? fl.lat ?? 24.8607;
    const lng = fl.coordinates?.lng ?? fl.lng ?? 67.0011;
    const dist = typeof f.distanceKm === 'number'
      ? f.distanceKm
      : (userLocation ? getDistanceKm(userLocation, { lat, lng }) : null);
    return {
      ...f,
      name: f.farmName || f.user?.name,
      address: fl.address || f.address || f.market?.name || 'Local Farm Grounds',
      city: fl.city || f.city,
      marketDays: f.operatingDays || ['Saturday', 'Sunday'],
      pickupHours: '8:00 AM – 2:00 PM',
      lat, lng,
      distanceKm: dist,
    };
  }), [filteredFarmers, userLocation, getDistanceKm]);

  const handleEnableNearby = async () => {
    if (!userLocation) {
      await requestLocation();
    } else {
      setNearbyEnabled((v) => !v);
    }
  };

  const DAYS = ['All Days', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Wednesday'];

  return (
    <div className="farmers-page">
      {/* Hero Header */}
      <div className="farmers-hero page-hero-banner">
        <img src="/land-o-lakes-inc-DdcWKBbJeEI-unsplash.jpg" alt="Farmers Banner" className="page-hero-bg" />
        <div className="page-hero-overlay" />
        <div className="container farmers-hero__content page-hero-content">
          <div className="farmers-hero__badge">
            <Leaf size={14} /> Our Organic Growers Directory
          </div>
          <h1 className="farmers-hero__title">Meet Local Farmers &amp; Producers</h1>
          <p className="farmers-hero__subtitle">
            Support local agriculture! Know exactly who grows your food, their market stall locations, operating days, and farm-fresh offerings.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', maxWidth: 720, alignItems: 'center' }}>
            <div className="farmers-search-bar" style={{ flex: 1, minWidth: 220 }}>
              <Search size={18} color="var(--gray-400)" />
              <input
                type="text"
                placeholder="Search farmers by name, stall, market, city, or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gray-400)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`nearby-toggle ${nearbyEnabled ? 'active' : ''}`}
              onClick={handleEnableNearby}
              title={userLocation ? 'Toggle nearby sorting' : 'Request my location to find nearby farmers'}
            >
              <Navigation size={14} />
              {userLocation ? (nearbyEnabled ? `Nearby · ${radiusKm} km` : 'Nearby Me') : 'Nearby Me'}
            </button>

            <div className="view-toggle-btns" style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                style={{ padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem' }}
              >
                <Grid size={15} /> Grid
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
                style={{ padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem' }}
              >
                <MapIcon size={15} /> Map View
              </button>
            </div>
          </div>

          {nearbyEnabled && userLocation && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%', maxWidth: 720, marginTop: 4, flexWrap: 'wrap' }}>
              <div className="radius-slider-wrap" style={{ flex: 1, minWidth: 240 }}>
                <label htmlFor="farmers-radius">Search radius</label>
                <input
                  id="farmers-radius"
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                />
                <span className="radius-value">{radiusKm} km</span>
              </div>
            </div>
          )}

          {/* Day Filter Pills */}
          <div className="farmers-day-pills">
            {DAYS.map((day) => {
              const val = day === 'All Days' ? '' : day;
              const isSelected = selectedDay === val;
              return (
                <button
                  key={day}
                  type="button"
                  className={`day-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedDay(val)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-10">
        {loading ? (
          <div className="farmers-grid">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} height={360} />
            ))}
          </div>
        ) : filteredFarmers.length === 0 ? (
          <EmptyState
            icon={Leaf}
            title="No Local Farmers Found"
            description={search ? `No growers matched "${search}".` : "No farmer profiles listed yet."}
          />
        ) : viewMode === 'map' ? (
          <div className="farmers-map-full-view">
            <MarketMap
              locations={mapLocations}
              userLocation={userLocation}
              selectedLocation={selectedFarmerForMap}
              onSelectLocation={(loc) => setSelectedFarmerForMap(loc)}
              height="620px"
              title="Grower Farm Stalls & Location Map"
            />
          </div>
        ) : (
          <div className="farmers-grid">
            {filteredFarmers.map((farmer) => {
              const coverImage = farmer.coverImage?.url || farmer.profileImage?.url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80';
              const farmerName = farmer.farmName || farmer.user?.name || 'Organic Family Farm';
              const ownerName = farmer.contactPerson || farmer.user?.name || 'Local Grower';
              const fl = farmer.location || {};
              const flat = fl.coordinates?.lat ?? fl.lat;
              const flng = fl.coordinates?.lng ?? fl.lng;
              const rawDist = typeof farmer.distanceKm === 'number'
                ? farmer.distanceKm
                : (userLocation && flat != null ? getDistanceKm(userLocation, { lat: flat, lng: flng }) : null);
              const distKm = rawDist != null ? Math.round(rawDist * 10) / 10 : null;

              return (
                <div key={farmer._id} className="farmer-card">
                  <div className="farmer-card-cover">
                    <img src={coverImage} alt={farmerName} loading="lazy" />
                    <div className="farmer-card-tags">
                      {farmer.isVerifiedFarmer && (
                        <span className="farmer-verified-tag"><CheckCircle size={12} /> Verified Grower</span>
                      )}
                      {distKm != null && (
                        <span className={`distance-badge ${distKm > 15 ? 'far' : ''}`}>
                          <MapPin size={11} /> {distKm} km
                        </span>
                      )}
                      {farmer.rating > 0 && (
                        <span className="farmer-rating-tag"><Star size={12} fill="currentColor" /> {farmer.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>

                  <div className="farmer-card-body">
                    <div className="farmer-avatar-badge">
                      <Leaf size={22} className="text-emerald-700" />
                    </div>

                    <h2 className="farmer-name">{farmerName}</h2>
                    <span className="farmer-owner">Managed by <strong>{ownerName}</strong></span>

                    <p className="farmer-bio">
                      {farmer.description || 'Dedicated to sustainable, eco-friendly farming practices producing clean, nutrient-dense organic harvests.'}
                    </p>

                    <div className="farmer-meta-list">
                      {farmer.market?.name && (
                        <div className="farmer-meta-item">
                          <Store size={14} className="text-emerald-600" />
                          <span><strong>{farmer.market.name}</strong> {farmer.stallNumber ? `(Stall ${farmer.stallNumber})` : ''}</span>
                        </div>
                      )}

                      {farmer.operatingDays?.length > 0 && (
                        <div className="farmer-meta-item">
                          <Calendar size={14} className="text-emerald-600" />
                          <span>{farmer.operatingDays.join(', ')}</span>
                        </div>
                      )}

                      {farmer.location?.address && (
                        <div className="farmer-meta-item">
                          <MapPin size={14} className="text-emerald-600" />
                          <span>{farmer.location.address}{farmer.location.city ? `, ${farmer.location.city}` : ''}</span>
                        </div>
                      )}

                      {farmer.specialties?.length > 0 && (
                        <div className="farmer-specialties-wrap">
                          {farmer.specialties.map((spec, i) => (
                            <span key={i} className="specialty-badge">{spec}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="farmer-card-footer">
                      <Link to={`/products?farmer=${farmer._id}`} className="btn btn-primary btn-full">
                        <ShoppingBag size={15} /> Pre-Order Produce <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
