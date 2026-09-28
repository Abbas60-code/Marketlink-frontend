import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Trash2, ArrowLeft, Leaf, Store,
  Sparkles, LogIn, ExternalLink, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import favoriteService from '../services/favoriteService.js';
import { useToast, EmptyState, formatCurrency } from '../components/shared/index.jsx';
import './Favorites.css';

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'product' | 'farmer'

  const loadFavorites = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const res = await favoriteService.getMyFavorites();
        const serverFavs = res?.data || [];
        // Also check any local favs and merge
        const localFavs = favoriteService.getLocalFavorites();
        const combined = [...serverFavs];
        localFavs.forEach((lf) => {
          if (!combined.some((cf) => cf.product?._id === lf.itemId || cf.farmer?._id === lf.itemId)) {
            combined.push(lf);
          }
        });
        setFavorites(combined);
      } else {
        const localFavs = favoriteService.getLocalFavorites();
        setFavorites(localFavs);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
      // Fallback to local
      setFavorites(favoriteService.getLocalFavorites());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

  const handleRemoveFavorite = async (fav) => {
    try {
      if (fav._id && !fav._id.startsWith('guest_') && isAuthenticated) {
        await favoriteService.removeFavorite(fav._id);
      }
      // Also remove from local storage if present
      const itemId = fav.product?._id || fav.farmer?._id || fav.itemId || fav._id;
      favoriteService.removeLocalFavorite(itemId);

      setFavorites((prev) => prev.filter((f) => f._id !== fav._id));
      toast('Item removed from your favorites', 'info');
    } catch (err) {
      toast('Failed to remove item', 'error');
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product || product.stock <= 0) {
      toast('This item is currently sold out', 'error');
      return;
    }
    addToCart(product, 1);
    toast(`Added "${product.name}" to your basket!`, 'success');
  };

  const filteredFavorites = favorites.filter((fav) => {
    if (filterType === 'all') return true;
    return fav.itemType === filterType;
  });

  const productCount = favorites.filter((f) => f.itemType === 'product' && f.product).length;
  const farmerCount = favorites.filter((f) => f.itemType === 'farmer' && f.farmer).length;

  return (
    <div className="favorites-page">
      {/* Hero Header */}
      <div className="favorites-hero page-hero-banner">
        <img src="/reba-spike-elcVuEs24Bc-unsplash.jpg" alt="Favorites Banner" className="page-hero-bg" />
        <div className="page-hero-overlay" />
        <div className="container favorites-hero__content page-hero-content">
          <div className="favorites-hero__badge">
            <Heart size={14} fill="currentColor" /> Quick-Access Favorites
          </div>
          <h1 className="favorites-hero__title">Your Saved Harvest & Stalls</h1>
          <p className="favorites-hero__subtitle">
            Easily re-order your favorite organic produce, track local farm harvests, and prepare your weekly pickup basket.
          </p>
        </div>
      </div>

      <div className="container favorites-container">
        {/* Guest Sync Banner if not logged in */}
        {!isAuthenticated && (
          <div className="guest-sync-banner">
            <div className="guest-sync-icon">
              <Sparkles size={20} />
            </div>
            <div className="guest-sync-text">
              <strong>Save your favorites across devices</strong>
              <p>You're viewing locally saved items. Sign in to sync your wishlist across phone, tablet, and desktop.</p>
            </div>
            <Link to="/login" className="guest-signin-btn">
              <LogIn size={15} /> Sign In
            </Link>
          </div>
        )}

        {/* Filter bar & count */}
        {favorites.length > 0 && (
          <div className="favorites-toolbar">
            <div className="favorites-tabs">
              <button
                type="button"
                className={`fav-tab ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All Items ({favorites.length})
              </button>
              {productCount > 0 && (
                <button
                  type="button"
                  className={`fav-tab ${filterType === 'product' ? 'active' : ''}`}
                  onClick={() => setFilterType('product')}
                >
                  <Leaf size={14} /> Produce ({productCount})
                </button>
              )}
              {farmerCount > 0 && (
                <button
                  type="button"
                  className={`fav-tab ${filterType === 'farmer' ? 'active' : ''}`}
                  onClick={() => setFilterType('farmer')}
                >
                  <Store size={14} /> Farm Stalls ({farmerCount})
                </button>
              )}
            </div>

            <span className="fav-total-text">
              Showing <strong>{filteredFavorites.length}</strong> saved {filteredFavorites.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        )}

        {/* Loading / Content */}
        {loading ? (
          <div className="favorites-loading">
            <div className="spinner" />
            <p>Loading your saved favorites...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="favorites-empty-box">
            <EmptyState
              icon={Heart}
              title="Your Favorites List is Empty"
              description="Explore our seasonal organic farm produce and tap the heart icon on any item to save it here for quick pre-orders."
              actionText="Browse Organic Produce"
              actionLink="/products"
            />
          </div>
        ) : (
          <div className="favorites-grid">
            {filteredFavorites.map((fav) => {
              if (fav.itemType === 'product' && fav.product) {
                const p = fav.product;
                const image = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
                const isSoldOut = p.stock <= 0;

                return (
                  <div key={fav._id} className="fav-product-card">
                    <div className="fav-card-image-wrap">
                      <Link to={`/products/${p._id}`}>
                        <img src={image} alt={p.name} loading="lazy" />
                      </Link>

                      <div className="fav-card-badges">
                        {p.isOrganic && <span className="badge-organic">Organic</span>}
                        {isSoldOut && <span className="badge-sold-out">Sold Out</span>}
                      </div>

                      <button
                        type="button"
                        className="fav-remove-btn"
                        onClick={() => handleRemoveFavorite(fav)}
                        title="Remove from favorites"
                      >
                        <Heart size={16} fill="#ef4444" color="#ef4444" />
                      </button>
                    </div>

                    <div className="fav-card-body">
                      <div className="fav-card-meta">
                        {p.farmer?.farmName ? (
                          <span className="fav-farmer-name">
                            <Store size={12} /> {p.farmer.farmName}
                          </span>
                        ) : (
                          <span className="fav-farmer-name">
                            <Leaf size={12} /> Local Organic Farm
                          </span>
                        )}
                      </div>

                      <h3 className="fav-card-title">
                        <Link to={`/products/${p._id}`}>{p.name}</Link>
                      </h3>

                      <p className="fav-card-desc">
                        {p.description || 'Farm-fresh organic produce harvested at peak nutritional ripeness.'}
                      </p>

                      <div className="fav-card-footer">
                        <div className="fav-price-box">
                          <span className="fav-price">{formatCurrency(p.price)}</span>
                          <span className="fav-unit">/ {p.unit || 'kg'}</span>
                        </div>

                        <div className="fav-actions-group">
                          <button
                            type="button"
                            className={`fav-add-cart-btn ${isSoldOut ? 'disabled' : ''}`}
                            disabled={isSoldOut}
                            onClick={(e) => handleAddToCart(e, p)}
                            title={isSoldOut ? 'Sold out' : 'Add to basket'}
                          >
                            <ShoppingCart size={15} />
                            <span>{isSoldOut ? 'Sold Out' : 'Pre-Order'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (fav.itemType === 'farmer' && fav.farmer) {
                const f = fav.farmer;
                return (
                  <div key={fav._id} className="fav-farmer-card">
                    <div className="fav-farmer-header">
                      <div className="fav-farmer-icon">
                        <Store size={24} />
                      </div>
                      <button
                        type="button"
                        className="fav-remove-btn static"
                        onClick={() => handleRemoveFavorite(fav)}
                        title="Remove from favorites"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="fav-farmer-body">
                      <span className="fav-tag">Certified Grower Stall</span>
                      <h3 className="fav-farmer-name-title">{f.farmName || f.user?.name}</h3>
                      <p className="fav-farmer-loc">
                        {f.market?.name || 'Local Farmers Market Ground'}
                      </p>

                      <Link to={`/products?farmer=${f._id}`} className="fav-view-stall-btn">
                        Explore Farm Stall Produce <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
