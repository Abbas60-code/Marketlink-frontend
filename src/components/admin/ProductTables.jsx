import React, { useState, useEffect, useCallback } from 'react';
import { Star, Leaf, Award, Trash2, Eye, RefreshCw, ShoppingBag, PackageX, CheckCircle2, XCircle, Search, X, MapPin, Store, Sparkles, Filter } from 'lucide-react';
import productService from '../../services/productService.js';
import farmerService from '../../services/farmerService.js';
import { formatCurrency } from '../shared/index.jsx';

export default function ProductTables() {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all'); // 'all', 'organic', 'active', 'low_stock'
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.getProducts({ limit: 50 });
      setProducts(res?.data || []);
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchFarmers = useCallback(async () => {
    setLoadingFarmers(true);
    try {
      const res = await farmerService.getFarmers();
      setFarmers(res?.data || []);
    } catch (err) {
      showToast('Failed to load farmers', 'error');
    } finally {
      setLoadingFarmers(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchFarmers();
  }, [fetchProducts, fetchFarmers]);

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this produce'}"? This action cannot be undone.`)) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast(`"${name}" deleted successfully`, 'success');
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    const q = search ? search.toLowerCase().trim() : '';
    const matchesSearch =
      !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category?.name || '').toLowerCase().includes(q) ||
      (p.farmer?.farmName || '').toLowerCase().includes(q) ||
      (p.farmer?.user?.name || '').toLowerCase().includes(q) ||
      (p.market?.name || '').toLowerCase().includes(q) ||
      (p.unit || '').toLowerCase().includes(q) ||
      (p.tags || []).some((t) => (t || '').toLowerCase().includes(q));

    if (productFilter === 'organic') return matchesSearch && Boolean(p.isOrganic);
    if (productFilter === 'active') return matchesSearch && p.isAvailable !== false;
    if (productFilter === 'low_stock') return matchesSearch && (p.stock != null && p.stock <= 5);
    return matchesSearch;
  });

  const filteredFarmers = farmers.filter((f) => {
    if (!f) return false;
    const q = search ? search.toLowerCase().trim() : '';
    return (
      !q ||
      (f.farmName || '').toLowerCase().includes(q) ||
      (f.user?.name || '').toLowerCase().includes(q) ||
      (f.contactPerson || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.market?.name || '').toLowerCase().includes(q) ||
      (f.stallNumber || '').toLowerCase().includes(q) ||
      (f.specialties || []).some((s) => (s || '').toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#991b1b' : '#065f46',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: '0.88rem',
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.text}
        </div>
      )}

      {/* Modern Filter Toolbar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search produce, farmer, category or stall..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-field"
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch('')}></button>
          )}
        </div>

        <div className="admin-filter-group">
          <div className="filter-pill-toggle">
            <button
              className={`filter-pill-btn ${productFilter === 'all' ? 'active' : ''}`}
              onClick={() => setProductFilter('all')}
            >
              All Items ({products.length})
            </button>
            <button
              className={`filter-pill-btn ${productFilter === 'organic' ? 'active' : ''}`}
              onClick={() => setProductFilter('organic')}
            >
               Organic ({products.filter((p) => p.isOrganic).length})
            </button>
            <button
              className={`filter-pill-btn ${productFilter === 'active' ? 'active' : ''}`}
              onClick={() => setProductFilter('active')}
            >
               In Stock
            </button>
          </div>

          <button className="admin-refresh-btn" onClick={() => { fetchProducts(); fetchFarmers(); }} title="Refresh items">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Grid of Two Tables: Produce + Farmers */}
      <div className="tables-grid">
        {/* Products Table */}
        <div className="admin-modern-table-card">
          <div className="table-card-header-styled">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="table-header-icon emerald">
                <Leaf size={16} />
              </div>
              <div>
                <h3 className="table-title">Listed Produce &amp; Harvest</h3>
                <span className="table-subtitle">Moderated organic items for pre-order</span>
              </div>
            </div>
            <span className="count-pill">{loadingProducts ? '…' : `${filteredProducts.length} items`}</span>
          </div>

          {loadingProducts ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading produce database...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <PackageX size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No produce listings found</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Harvest added by farmers will appear here</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-modern-table">
                <thead>
                  <tr>
                    <th>Produce Item</th>
                    <th>Category</th>
                    <th>Grower</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item) => {
                    const imgSrc = item.images?.[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&auto=format&fit=crop&q=60';
                    const farmerName = item.farmer?.farmName || item.farmer?.user?.name || 'Local Farm';
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="user-profile-cell">
                            <img
                              src={imgSrc}
                              alt={item.name}
                              className="produce-thumb-img"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&auto=format&fit=crop&q=60'; }}
                            />
                            <div className="user-profile-text">
                              <strong className="user-name-title">{item.name}</strong>
                              {item.isOrganic && (
                                <span className="organic-pill-tag"> 100% Organic</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="category-pill-tag">{item.category?.name || 'Produce'}</span>
                        </td>

                        <td>
                          <span className="farmer-credit-tag">
                            <Store size={12} /> {farmerName}
                          </span>
                        </td>

                        <td>
                          <strong className="text-price-value">{formatCurrency(item.price)}</strong>
                          <span className="price-unit-sub">/{item.unit || 'kg'}</span>
                        </td>

                        <td>
                          <span className={`stock-level-pill ${item.stock > 10 ? 'high' : item.stock > 0 ? 'low' : 'empty'}`}>
                            {item.stock ?? 0} left
                          </span>
                        </td>

                        <td>
                          <span className={`status-badge-glow ${item.isAvailable ? 'active' : 'suspended'}`}>
                            <span className="status-dot" />
                            {item.isAvailable ? 'Active' : 'Unavailable'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <a
                              href={`/products/${item._id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View on storefront"
                              className="admin-icon-action-btn view"
                            >
                              <Eye size={14} />
                            </a>
                            <button
                              onClick={() => handleDeleteProduct(item._id, item.name)}
                              title="Delete product"
                              className="admin-icon-action-btn delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Farmers Table */}
        <div className="admin-modern-table-card">
          <div className="table-card-header-styled">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="table-header-icon amber">
                <Award size={16} />
              </div>
              <div>
                <h3 className="table-title">Registered Farmers &amp; Growers</h3>
                <span className="table-subtitle">Local producers providing fresh supply</span>
              </div>
            </div>
            <span className="count-pill">{loadingFarmers ? '…' : `${filteredFarmers.length} growers`}</span>
          </div>

          {loadingFarmers ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Loading growers directory...</p>
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Leaf size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No growers registered yet</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Farmers who create profiles will appear here</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-modern-table">
                <thead>
                  <tr>
                    <th>Farm Stall</th>
                    <th>Manager</th>
                    <th>Location Hub</th>
                    <th>Stall Rating</th>
                    <th>Harvest Items</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((item) => {
                    const farmerProductCount = products.filter(
                      (p) => p.farmer?._id === item._id || p.farmer === item._id
                    ).length;
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="user-profile-cell">
                            <div className="avatar-gradient-circle green">
                              <Award size={16} />
                            </div>
                            <strong className="user-name-title">{item.farmName || 'Organic Farm'}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="farmer-manager-name">
                            {item.user?.name || 'Local Grower'}
                          </span>
                        </td>

                        <td>
                          <span className="location-chip">
                            <MapPin size={11} />
                            {item.location?.city
                              ? `${item.location.city}${item.location.state ? `, ${item.location.state}` : ''}`
                              : item.location?.address || (typeof item.location === 'string' ? item.location : 'Local Hub')}
                          </span>
                        </td>

                        <td>
                          <div className="rating-badge-styled">
                            <Star size={13} fill="#f59e0b" color="#f59e0b" />
                            <span>{item.rating ? Number(item.rating).toFixed(1) : '5.0'}</span>
                          </div>
                        </td>

                        <td>
                          <span className="produce-count-badge">
                            {farmerProductCount} items
                          </span>
                        </td>

                        <td>
                          <span className={`status-badge-glow ${item.isVerified ? 'active' : 'suspended'}`}>
                            <span className="status-dot" />
                            {item.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
