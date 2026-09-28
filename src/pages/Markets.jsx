import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, ChevronRight, Store, Users, ShoppingBag, ExternalLink, Map as MapIcon, Grid, Navigation } from 'lucide-react';
import marketService from '../services/marketService.js';
import { SkeletonCard, EmptyState } from '../components/shared/index.jsx';
import MarketMap from '../components/shared/MarketMap.jsx';
import { useLocation } from '../context/LocationContext.jsx';
import './Markets.css';

export default function Markets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedMarketForMap, setSelectedMarketForMap] = useState(null);

  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [radiusKm, setRadiusKm] = useState(30);

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
    const fetchMarkets = async () => {
      setLoading(true);
      try {
        const params = { isActive: true };
        if (nearbyEnabled && userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
          params.radiusKm = radiusKm;
        }
        const res = await marketService.getMarkets(params);
        const list = res?.data || [];
        setMarkets(list);
        if (list.length > 0) setSelectedMarketForMap(list[0]);
      } catch (err) {
        console.error('Failed to load markets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, [nearbyEnabled, radiusKm, userLocation]);

  const filteredMarkets = useMemo(() => markets.filter((m) => {
    if (!m) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q) ||
      (m.location?.address || m.address || '').toLowerCase().includes(q) ||
      (m.location?.city || m.city || '').toLowerCase().includes(q) ||
      (m.location?.state || '').toLowerCase().includes(q) ||
      (m.marketDays || []).some(d => (typeof d === 'string' ? d : d?.day || '').toLowerCase().includes(q))
    );
  }), [markets, search]);

  const mapLocations = useMemo(() => filteredMarkets.map((m) => {
    const ml = m.location || {};
    const lat = ml.coordinates?.lat ?? ml.lat ?? 24.8607;
    const lng = ml.coordinates?.lng ?? ml.lng ?? 67.0011;
    const dist = typeof m.distanceKm === 'number'
      ? m.distanceKm
      : (userLocation ? getDistanceKm(userLocation, { lat, lng }) : null);
    return {
      ...m,
      lat, lng,
      distanceKm: dist,
    };
  }), [filteredMarkets, userLocation, getDistanceKm]);

  const handleEnableNearby = async () => {
    if (!userLocation) {
      await requestLocation();
    } else {
      setNearbyEnabled((v) => !v);
    }
  };

  return (
    <div className="markets-page">
      {/* Hero Header */}
      <div className="markets-hero page-hero-banner">
        <img src="/reba-spike-elcVuEs24Bc-unsplash.jpg" alt="Markets Banner" className="page-hero-bg" />
        <div className="page-hero-overlay" />
        <div className="container markets-hero__content page-hero-content">
          <div className="markets-hero__badge">
            <Store size={15} /> Community Hubs & Pickup Points
          </div>
          <h1 className="markets-hero__title">Local Farmers Markets</h1>
          <p className="markets-hero__subtitle">
            Discover nearby weekend markets, community gardens, and pre-order pickup stations connecting you directly with local growers.
          </p>

          <div className="markets-controls-row">
            <div className="markets-search-bar">
              <Search size={19} className="search-icon" />
              <input
                type="text"
                placeholder="Search markets by name, city, or neighborhood..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  X
                </button>
              )}
            </div>

            <button
              type="button"
              className={`nearby-toggle ${nearbyEnabled ? 'active' : ''}`}
              onClick={handleEnableNearby}
              title={userLocation ? 'Toggle nearby sorting' : 'Request my location to find nearby markets'}
            >
              <Navigation size={15} />
              {userLocation ? (nearbyEnabled ? `Nearby · ${radiusKm} km` : 'Nearby Me') : 'Nearby Me'}
            </button>

            <div className="view-toggle-btns">
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} /> Grid View
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon size={16} /> Interactive Map
              </button>
            </div>
          </div>

          {nearbyEnabled && userLocation && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%', maxWidth: 640, marginTop: 6, flexWrap: 'wrap' }}>
              <div className="radius-slider-wrap" style={{ flex: 1, minWidth: 240 }}>
                <label htmlFor="markets-radius">Search radius</label>
                <input
                  id="markets-radius"
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
        </div>
      </div>

      <div className="container markets-container">
        {loading ? (
          <div className="markets-grid">
            {[1, 2, 3].map((n) => (
              <SkeletonCard key={n} height={420} />
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="markets-empty-wrap">
            <EmptyState
              icon={Store}
              title="No Farmers Markets Found"
              description={search ? `No markets matched your search for "${search}". Try searching for a different city or neighborhood.` : "No active markets listed at the moment."}
            />
          </div>
        ) : viewMode === 'map' ? (
          <div className="markets-map-full-view">
            <MarketMap
              locations={mapLocations}
              userLocation={userLocation}
              selectedLocation={selectedMarketForMap}
              onSelectLocation={(loc) => setSelectedMarketForMap(loc)}
              height="600px"
              title="Interactive Pickup Locations Map"
            />
          </div>
        ) : (
          <>
            {/* Embedded interactive map strip at the top */}
            <div className="market-map-strip">
              <MarketMap
                locations={mapLocations}
                userLocation={userLocation}
                selectedLocation={selectedMarketForMap}
                onSelectLocation={(loc) => setSelectedMarketForMap(loc)}
                height="400px"
                title="Explore Nearby Hubs & Pickup Points"
              />
            </div>

            {/* Section Header */}
            <div className="markets-section-header">
              <div>
                <h2 className="markets-section-title">All Market Locations</h2>
                <p className="markets-section-sub">Choose a market to view operating details or pre-order fresh harvest.</p>
              </div>
              <div className="markets-count-badge">
                <span>{filteredMarkets.length} {filteredMarkets.length === 1 ? 'Location' : 'Locations'} Listed</span>
              </div>
            </div>

            <div className="markets-grid">
              {filteredMarkets.map((market) => {
                const image = market.image?.url || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80';
                const mapAddress = encodeURIComponent(`${market.name}, ${market.location?.address || ''}, ${market.location?.city || ''}`);
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapAddress}`;
                const ml = market.location || {};
                const mlat = ml.coordinates?.lat ?? ml.lat;
                const mlng = ml.coordinates?.lng ?? ml.lng;
                const rawDist = typeof market.distanceKm === 'number'
                  ? market.distanceKm
                  : (userLocation && mlat != null ? getDistanceKm(userLocation, { lat: mlat, lng: mlng }) : null);
                const distKm = rawDist != null ? Math.round(rawDist * 10) / 10 : null;

                return (
                  <div key={market._id} className="market-card">
                    <div className="market-card-image-wrap">
                      <img src={image} alt={market.name} loading="lazy" />
                      <div className="market-card-image-overlay" />
                      <div className="market-card-top-badges">
                        {market.isFeatured && (
                          <span className="market-badge badge-featured">Featured Hub</span>
                        )}
                        {distKm != null && (
                          <span className={`distance-badge ${distKm > 15 ? 'far' : ''}`}>
                            <MapPin size={11} /> {distKm} km
                          </span>
                        )}
                        <span className="market-badge badge-open">Active Hub</span>
                      </div>
                    </div>

                    <div className="market-card-body">
                      <div className="market-card-header-row">
                        <h2 className="market-card-name">{market.name}</h2>
                      </div>

                      <p className="market-card-desc">
                        {market.description || 'Community farmers market featuring certified organic produce, fresh baked goods, and local farm goods.'}
                      </p>

                      <div className="market-info-box">
                        <div className="market-info-item">
                          <div className="info-icon-wrapper">
                            <MapPin size={16} className="info-icon" />
                          </div>
                          <div className="info-text-col">
                            <span className="info-label">Address & Location</span>
                            <span className="info-val" title={`${market.location?.address || 'Community Market Grounds'}${market.location?.city ? `, ${market.location.city}` : ''}`}>
                              {market.location?.address || 'Community Market Grounds'}{market.location?.city ? `, ${market.location.city}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="market-info-item">
                          <div className="info-icon-wrapper">
                            <Calendar size={16} className="info-icon" />
                          </div>
                          <div className="info-text-col">
                            <span className="info-label">Market Days</span>
                            <span className="info-val font-semibold">
                              {market.marketDays?.length > 0 ? market.marketDays.join(', ') : 'Saturday & Sunday'}
                            </span>
                          </div>
                        </div>

                        <div className="market-info-item">
                          <div className="info-icon-wrapper">
                            <Clock size={16} className="info-icon" />
                          </div>
                          <div className="info-text-col">
                            <span className="info-label">Pickup Hours</span>
                            <span className="info-val">
                              {market.pickupStartTime ? `${market.pickupStartTime} – ${market.pickupEndTime}` : `${market.openTime || '8:00 AM'} – ${market.closeTime || '2:00 PM'}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="market-card-actions">
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="market-map-btn"
                          title="Get Directions on Google Maps"
                        >
                          <MapPin size={15} /> Directions <ExternalLink size={12} />
                        </a>

                        <Link to={`/products?market=${market._id}`} className="market-preorder-btn">
                          <ShoppingBag size={15} /> Pre-Order Produce <ChevronRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

