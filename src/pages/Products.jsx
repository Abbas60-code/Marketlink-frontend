import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useParams, useLocation } from 'react-router-dom';
import {
  Search, Filter, SlidersHorizontal, ArrowUpDown, Leaf,
  ShoppingCart, Heart, Check, X, ChevronRight, Grid, List,
  Store, Star, AlertCircle, RotateCcw, Sparkles, Tag, ShieldCheck
} from 'lucide-react';
import productService from '../services/productService.js';
import categoryService from '../services/categoryService.js';
import farmerService from '../services/farmerService.js';
import marketService from '../services/marketService.js';
import favoriteService from '../services/favoriteService.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast, SkeletonCard, EmptyState, formatCurrency } from '../components/shared/index.jsx';
import './Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedMarket, setSelectedMarket] = useState(searchParams.get('market') || '');
  const [selectedFarmer, setSelectedFarmer] = useState(searchParams.get('farmer') || '');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  // Sync state when URL search params or path params change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    let urlMarket = searchParams.get('market') || '';
    let urlFarmer = searchParams.get('farmer') || '';

    if (location.pathname.startsWith('/markets/') && id) {
      urlMarket = id;
    }
    if (location.pathname.startsWith('/farmers/') && id) {
      urlFarmer = id;
    }

    setSelectedCategory(urlCategory);
    setSelectedMarket(urlMarket);
    setSelectedFarmer(urlFarmer);
    setSearch(urlSearch);
    setSearchInput(urlSearch);
  }, [searchParams, id, location.pathname]);

  // Debounce search input to avoid spamming backend on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load filter options
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [catRes, farmerRes, marketRes] = await Promise.allSettled([
          categoryService.getActiveCategories(),
          farmerService.getFarmers({ isActive: true }),
          marketService.getMarkets({ isActive: true }),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value?.data || []);
        if (farmerRes.status === 'fulfilled') setFarmers(farmerRes.value?.data || []);
        if (marketRes.status === 'fulfilled') setMarkets(marketRes.value?.data || []);

        if (isAuthenticated) {
          try {
            const favRes = await favoriteService.getMyFavorites();
            if (favRes?.data) {
              const ids = new Set(favRes.data.filter(f => f.itemType === 'product' && f.product).map(f => f.product._id));
              setFavoriteIds(ids);
            }
          } catch {}
        } else {
          const localFavs = favoriteService.getLocalFavorites();
          const ids = new Set(localFavs.filter(f => f.itemType === 'product' && (f.product?._id || f.itemId)).map(f => f.product?._id || f.itemId));
          setFavoriteIds(ids);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadFiltersData();
  }, [isAuthenticated]);

  // Fetch products on filter change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedMarket) params.market = selectedMarket;
        if (selectedFarmer) params.farmer = selectedFarmer;
        if (organicOnly) params.isOrganic = 'true';
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sortBy) params.sortBy = sortBy;

        const res = await productService.getProducts(params);
        setProducts(res?.data || []);
      } catch (err) {
        toast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, selectedCategory, selectedMarket, selectedFarmer, organicOnly, sortBy, minPrice, maxPrice]);

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCategory('');
    setSelectedMarket('');
    setSelectedFarmer('');
    setOrganicOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (selectedCategory) count++;
    if (selectedMarket) count++;
    if (selectedFarmer) count++;
    if (organicOnly) count++;
    if (minPrice || maxPrice) count++;
    return count;
  }, [search, selectedCategory, selectedMarket, selectedFarmer, organicOnly, minPrice, maxPrice]);

  const selectedCategoryObj = categories.find(c => c._id === selectedCategory || c.slug === selectedCategory);
  const selectedMarketObj = markets.find(m => m._id === selectedMarket);
  const selectedFarmerObj = farmers.find(f => f._id === selectedFarmer);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) {
      toast('This item is currently sold out', 'error');
      return;
    }
    addToCart(product, 1);
    toast(`Added "${product.name}" to basket!`, 'success');
  };

  const handleToggleFavorite = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const isFav = favoriteIds.has(product._id);
    if (!isAuthenticated) {
      if (isFav) {
        favoriteService.removeLocalFavorite(product._id);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
        toast('Removed from favorites', 'info');
      } else {
        favoriteService.saveLocalFavorite('product', product);
        setFavoriteIds(prev => new Set(prev).add(product._id));
        toast('Saved to favorites!', 'success');
      }
      return;
    }

    try {
      if (isFav) {
        await favoriteService.removeFavorite(product._id);
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
        toast('Removed from favorites', 'info');
      } else {
        await favoriteService.addFavorite('product', product._id);
        setFavoriteIds(prev => new Set(prev).add(product._id));
        toast('Saved to favorites!', 'success');
      }
    } catch {
      toast('Failed to update favorites', 'error');
    }
  };

  return (
    <div className="products-page">
      {/* Header Banner */}
      <div className="products-hero page-hero-banner">
        <img src="/dan-meyers-IQVFVH0ajag-unsplash.jpg" alt="Products Banner" className="page-hero-bg" />
        <div className="page-hero-overlay" />
        <div className="container products-hero__content page-hero-content">
          <div className="products-hero__badge">
            <Leaf size={15} /> 100% Direct From Local Growers
          </div>
          <h1 className="products-hero__title">Farm Fresh Produce & Pantry</h1>
          <p className="products-hero__subtitle">
            Pre-order hand-harvested vegetables, heirloom fruits, artisanal dairy, and organic goods directly from trusted local farmers.
          </p>

          <div className="products-search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by vegetable, fruit, farm, or pantry item..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              id="products-search-input"
            />
            {searchInput && (
              <button className="clear-search-btn" onClick={handleClearSearch} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container products-container">
        <div className="products-layout">
          {/* Mobile Filter Toggle Drawer Backdrop */}
          {mobileFilterOpen && (
            <div className="mobile-filter-backdrop" onClick={() => setMobileFilterOpen(false)} />
          )}

          {/* Sidebar Filters */}
          <aside className={`products-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="filter-card">
              <div className="filter-header">
                <div className="filter-header-left">
                  <SlidersHorizontal size={18} className="text-emerald-600" />
                  <span className="filter-title">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="filter-active-count">{activeFilterCount}</span>
                  )}
                </div>
                <div className="filter-header-right">
                  {activeFilterCount > 0 && (
                    <button onClick={handleResetFilters} className="filter-reset-btn" title="Reset all filters">
                      <RotateCcw size={13} /> Reset
                    </button>
                  )}
                  <button className="sidebar-close-btn" onClick={() => setMobileFilterOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Organic Only Toggle Switch */}
              <div className="filter-group organic-switch-group">
                <label className="organic-toggle-label">
                  <div className="organic-toggle-info">
                    <span className="organic-toggle-title">Certified Organic</span>
                    <span className="organic-toggle-sub">Strictly pesticide-free produce</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="organic-toggle-checkbox"
                  />
                  <span className="toggle-switch-slider" />
                </label>
              </div>

              {/* Categories */}
              <div className="filter-group">
                <label className="filter-label">
                  <Tag size={14} /> Categories
                </label>
                <div className="filter-chips-wrap">
                  <button
                    type="button"
                    className={`filter-chip ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchParams(prev => {
                        prev.delete('category');
                        return prev;
                      });
                    }}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      className={`filter-chip ${selectedCategory === cat._id || selectedCategory === cat.slug ? 'active' : ''}`}
                      onClick={() => {
                        const newCat = selectedCategory === cat._id ? '' : cat._id;
                        setSelectedCategory(newCat);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farmers Market Hub */}
              <div className="filter-group">
                <label className="filter-label">
                  <Store size={14} /> Market Hub / Pickup Station
                </label>
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Market Hubs</option>
                  {markets.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Farmer Stall */}
              <div className="filter-group">
                <label className="filter-label">
                  <ShieldCheck size={14} /> Local Grower / Farm Stall
                </label>
                <select
                  value={selectedFarmer}
                  onChange={(e) => setSelectedFarmer(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Local Farmers</option>
                  {farmers.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.farmName || f.user?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">Price Range (Rs)</label>
                <div className="price-inputs-row">
                  <div className="price-input-wrap">
                    <span className="price-currency">Rs</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="price-input"
                      min="0"
                    />
                  </div>
                  <span className="price-dash">–</span>
                  <div className="price-input-wrap">
                    <span className="price-currency">Rs</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="price-input"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="products-main">
            {/* Top Toolbar */}
            <div className="products-toolbar">
              <div className="products-toolbar-left">
                <button
                  type="button"
                  className="mobile-filter-btn"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <Filter size={16} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && <span className="badge-count">{activeFilterCount}</span>}
                </button>

                <span className="products-count">
                  Showing <strong>{products.length}</strong> farm fresh {products.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="products-toolbar-right">
                <div className="view-mode-toggle" role="group" aria-label="Product display mode">
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View (2-Column)"
                    aria-label="Grid view"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View (1-Column)"
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>

                <div className="sort-wrap">
                  <span className="sort-label">Sort by:</span>
                  <div className="sort-select-box">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select"
                    >
                      <option value="newest">Latest Harvest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Customer Rated</option>
                      <option value="featured">Featured Picks</option>
                    </select>
                    <ArrowUpDown size={14} className="sort-icon-arrow" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active filter badges row */}
            {activeFilterCount > 0 && (
              <div className="active-filters-bar">
                <span className="active-filters-title">Active Filters:</span>
                <div className="active-tags-list">
                  {search && (
                    <span className="active-tag">
                      Search: "{search}"
                      <button onClick={handleClearSearch}><X size={12} /></button>
                    </span>
                  )}
                  {selectedCategoryObj && (
                    <span className="active-tag">
                      Category: {selectedCategoryObj.name}
                      <button onClick={() => setSelectedCategory('')}><X size={12} /></button>
                    </span>
                  )}
                  {selectedMarketObj && (
                    <span className="active-tag">
                      Market: {selectedMarketObj.name}
                      <button onClick={() => setSelectedMarket('')}><X size={12} /></button>
                    </span>
                  )}
                  {selectedFarmerObj && (
                    <span className="active-tag">
                      Farmer: {selectedFarmerObj.farmName || selectedFarmerObj.user?.name}
                      <button onClick={() => setSelectedFarmer('')}><X size={12} /></button>
                    </span>
                  )}
                  {organicOnly && (
                    <span className="active-tag organic-tag">
                      Organic Only
                      <button onClick={() => setOrganicOnly(false)}><X size={12} /></button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="active-tag">
                      Price: Rs {minPrice || 0} – {maxPrice || '∞'}
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X size={12} /></button>
                    </span>
                  )}
                  <button onClick={handleResetFilters} className="clear-all-tag-btn">
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="products-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SkeletonCard key={n} height={380} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="products-empty-container">
                <EmptyState
                  icon={Leaf}
                  title="No Fresh Produce Found"
                  description={
                    activeFilterCount > 0
                      ? "No produce items matched your current filter criteria. Try adjusting or clearing your filters."
                      : "No farm produce is currently listed in this category."
                  }
                  actionText="Clear All Filters"
                  onAction={handleResetFilters}
                />
              </div>
            ) : (
              <div className={`products-grid ${viewMode === 'list' ? 'products-grid--list' : ''}`}>
                {products.map((product) => {
                  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
                  const isFav = favoriteIds.has(product._id);
                  const isSoldOut = product.stock <= 0 || !product.isAvailable;

                  return (
                    <div key={product._id} className={`product-card ${viewMode === 'list' ? 'product-card--list' : ''}`}>
                      <div className="product-card-image-wrap">
                        <Link to={`/products/${product._id}`} className="product-card-img-link">
                          <img src={image} alt={product.name} loading="lazy" />
                          <div className="product-card-img-overlay" />
                        </Link>

                        {/* Top Badges */}
                        <div className="product-card-badges">
                          {product.isOrganic && (
                            <span className="badge-organic">Organic</span>
                          )}
                          {isSoldOut ? (
                            <span className="badge-sold-out">Sold Out</span>
                          ) : product.stock < 10 ? (
                            <span className="badge-low-stock">Only {product.stock} left</span>
                          ) : null}
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          className={`product-fav-btn ${isFav ? 'active' : ''}`}
                          onClick={(e) => handleToggleFavorite(e, product)}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#1e293b'} />
                        </button>
                      </div>

                      <div className="product-card-body">
                        {/* Stall & Rating Meta */}
                        <div className="product-card-meta">
                          {product.farmer?.farmName ? (
                            <span className="stall-name" title={product.farmer.farmName}>
                              <Store size={13} className="text-emerald-600" />
                              <span>{product.farmer.farmName}</span>
                            </span>
                          ) : (
                            <span className="stall-name">
                              <Leaf size={13} className="text-emerald-600" />
                              <span>Direct Farm Harvest</span>
                            </span>
                          )}

                          {product.rating > 0 && (
                            <span className="rating-badge">
                              <Star size={11} fill="#eab308" color="#eab308" />
                              <span>{product.rating.toFixed(1)}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="product-card-title">
                          <Link to={`/products/${product._id}`}>{product.name}</Link>
                        </h3>

                        <p className="product-card-desc">
                          {product.description || 'Farm-fresh organic produce harvested at peak nutritional ripeness.'}
                        </p>

                        <div className="product-card-footer">
                          <div className="product-price-box">
                            <span className="product-price">{formatCurrency(product.price)}</span>
                            <span className="product-unit">/ {product.unit || 'kg'}</span>
                          </div>

                          <button
                            type="button"
                            className={`product-add-cart-btn ${isSoldOut ? 'disabled' : ''}`}
                            disabled={isSoldOut}
                            onClick={(e) => handleAddToCart(e, product)}
                            title={isSoldOut ? 'Currently Out of Stock' : 'Add to basket'}
                          >
                            <ShoppingCart size={15} />
                            <span>{isSoldOut ? 'Sold Out' : 'Pre-Order'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

