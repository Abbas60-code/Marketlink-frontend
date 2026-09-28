import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Bell, Moon, Sun, Menu, Store, LogOut, ChevronDown, ShieldCheck,
  Sparkles, ExternalLink, X, Package, Leaf, Users, FolderTree, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import EditAdminProfileModal from './EditAdminProfileModal.jsx';
import productService from '../../services/productService.js';
import farmerService from '../../services/farmerService.js';
import marketService from '../../services/marketService.js';
import adminService from '../../services/adminService.js';
import categoryService from '../../services/categoryService.js';

export default function AdminHeader({ theme, toggleTheme, onMenuToggle, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Global Admin Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: [],
    farmers: [],
    markets: [],
    customers: [],
    categories: []
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query across real DB
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], farmers: [], markets: [], customers: [], categories: [] });
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const q = searchQuery.trim();
        const [prodRes, farmerRes, marketRes, custRes, catRes] = await Promise.allSettled([
          productService.getProducts({ search: q, limit: 4 }),
          farmerService.getFarmers({ search: q }),
          marketService.getMarkets({ search: q }),
          adminService.getCustomers({ search: q, limit: 4 }),
          categoryService.getAllCategories(),
        ]);

        const products = prodRes.status === 'fulfilled' ? (prodRes.value?.data || []).slice(0, 3) : [];
        const farmers = farmerRes.status === 'fulfilled' ? (farmerRes.value?.data || []).slice(0, 3) : [];
        const markets = marketRes.status === 'fulfilled' ? (marketRes.value?.data || []).slice(0, 3) : [];
        const customers = custRes.status === 'fulfilled' ? (custRes.value?.data || []).slice(0, 3) : [];
        
        let categories = [];
        if (catRes.status === 'fulfilled' && catRes.value?.data) {
          categories = catRes.value.data
            .filter(c => (c.name || '').toLowerCase().includes(q.toLowerCase()))
            .slice(0, 3);
        }

        setSearchResults({ products, farmers, markets, customers, categories });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    setSearchOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setActiveTab) {
      if (searchResults.products.length > 0) setActiveTab('Products');
      else if (searchResults.farmers.length > 0) setActiveTab('Farmers');
      else if (searchResults.markets.length > 0) setActiveTab('Markets');
      else if (searchResults.customers.length > 0) setActiveTab('Customers');
      else if (searchResults.categories.length > 0) setActiveTab('Categories');
      else setActiveTab('Products');
    }
    setSearchOpen(false);
  };

  const totalResultsCount =
    searchResults.products.length +
    searchResults.farmers.length +
    searchResults.markets.length +
    searchResults.customers.length +
    searchResults.categories.length;

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('emart_admin_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: user?.name || 'Administrator',
      role: 'Super Administrator',
      email: user?.email || 'admin@marketlink.org',
      phone: '+92 300 1234567',
      location: 'Karachi, Pakistan',
      bio: 'Lead Operations & Platform Administrator at MarketLink eGreen Basket.',
      avatar:
        user?.profileImage?.url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };
  });

  const handleSaveProfile = (updatedData) => {
    const newProfile = { ...profile, ...updatedData };
    setProfile(newProfile);
    localStorage.setItem('emart_admin_profile', JSON.stringify(newProfile));
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/login');
  };

  const currentAvatar =
    user?.profileImage?.url ||
    profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=10b981&color=fff&size=100`;

  return (
    <>
      <header className="admin-header">
        {/* Mobile Menu Button & Search Input */}
        <div className="header-left">
          <button
            className="mobile-menu-toggle-btn"
            onClick={onMenuToggle}
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation"
          >
            <Menu size={22} />
          </button>

          {/* Interactive Global Admin Search Bar */}
          <div className="header-search-container" ref={searchContainerRef} style={{ position: 'relative' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
              {searchLoading ? (
                <Loader2 size={16} className="animate-spin text-emerald-600" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Search size={16} className="search-icon-muted" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search produce, farmers, markets, customers..."
                className="header-search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setSearchOpen(true);
                }}
                style={{ width: '100%' }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex' }}
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="search-kbd-shortcut">⌘K</span>
              )}
            </form>

            {/* Live Search Results Popup Dropdown */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '380px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  background: theme === 'dark' ? '#1e293b' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: 14,
                  boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
                  zIndex: 1000,
                  padding: '10px 0',
                }}
              >
                {searchLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    Searching database across platform...
                  </div>
                ) : totalResultsCount === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No results found matching "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {/* Products */}
                    {searchResults.products.length > 0 && (
                      <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Package size={12} /> Produce Listings ({searchResults.products.length})
                        </div>
                        {searchResults.products.map(p => (
                          <div
                            key={p._id}
                            onClick={() => handleSelectResult('Products')}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              transition: 'background 0.15s',
                              color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                              fontSize: '0.84rem',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1rem' }}></span>
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{p.farmer?.farmName || 'Farm'} • Rs {p.price}/{p.unit || 'kg'}</small>
                              </div>
                            </div>
                            <ChevronRight size={14} color="#94a3b8" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Farmers */}
                    {searchResults.farmers.length > 0 && (
                      <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Leaf size={12} /> Organic Farmers ({searchResults.farmers.length})
                        </div>
                        {searchResults.farmers.map(f => (
                          <div
                            key={f._id}
                            onClick={() => handleSelectResult('Farmers')}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                              fontSize: '0.84rem',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1rem' }}></span>
                              <div>
                                <div style={{ fontWeight: 600 }}>{f.farmName}</div>
                                <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{f.user?.name || f.contactPerson || 'Farmer'} • {f.market?.name || 'Market'}</small>
                              </div>
                            </div>
                            <ChevronRight size={14} color="#94a3b8" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Markets */}
                    {searchResults.markets.length > 0 && (
                      <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#d97706', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Store size={12} /> Market Stations ({searchResults.markets.length})
                        </div>
                        {searchResults.markets.map(m => (
                          <div
                            key={m._id}
                            onClick={() => handleSelectResult('Markets')}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                              fontSize: '0.84rem',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1rem' }}></span>
                              <div>
                                <div style={{ fontWeight: 600 }}>{m.name}</div>
                                <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{m.location?.city || m.location?.address || 'Pickup Station'}</small>
                              </div>
                            </div>
                            <ChevronRight size={14} color="#94a3b8" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {searchResults.customers.length > 0 && (
                      <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Users size={12} /> Shoppers ({searchResults.customers.length})
                        </div>
                        {searchResults.customers.map(c => (
                          <div
                            key={c._id}
                            onClick={() => handleSelectResult('Customers')}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                              fontSize: '0.84rem',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1rem' }}></span>
                              <div>
                                <div style={{ fontWeight: 600 }}>{c.name}</div>
                                <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{c.email}</small>
                              </div>
                            </div>
                            <ChevronRight size={14} color="#94a3b8" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Categories */}
                    {searchResults.categories.length > 0 && (
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FolderTree size={12} /> Categories ({searchResults.categories.length})
                        </div>
                        {searchResults.categories.map(cat => (
                          <div
                            key={cat._id}
                            onClick={() => handleSelectResult('Categories')}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                              fontSize: '0.84rem',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme === 'dark' ? '#334155' : '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1rem' }}>️</span>
                              <div>
                                <div style={{ fontWeight: 600 }}>{cat.name}</div>
                                <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Catalog Category</small>
                              </div>
                            </div>
                            <ChevronRight size={14} color="#94a3b8" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="header-actions">
          {/* Quick link to public store */}
          <Link
            to="/"
            className="header-live-store-btn"
            title="Open Live Public Storefront"
          >
            <Store size={15} />
            <span>Storefront</span>
            <ExternalLink size={12} className="opacity-70" />
          </Link>

          {/* Dark / Light Mode Toggle Button */}
          <button
            className="header-action-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={17} color="#f59e0b" />
            ) : (
              <Moon size={17} color="#64748b" />
            )}
          </button>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="header-action-btn"
              title="System Alerts"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={17} />
              <span className="notification-badge" />
            </button>

            {notificationsOpen && (
              <div className="admin-notifications-dropdown">
                <div className="dropdown-header">
                  <strong>System Alerts</strong>
                  <span className="badge-pill-xs">Live</span>
                </div>
                <div className="dropdown-items">
                  <div className="dropdown-item">
                    <span className="dot-green" />
                    <div>
                      <p className="item-title">Database Connected</p>
                      <small>All regional farmers market syncs operational</small>
                    </div>
                  </div>
                  <div className="dropdown-item">
                    <span className="dot-blue" />
                    <div>
                      <p className="item-title">New Weekend Stalls</p>
                      <small>Verified growers active for Saturday pickup</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip - Opens Edit Profile Modal */}
          <div
            className="user-profile-btn"
            onClick={() => setIsEditModalOpen(true)}
            title="Click to edit admin profile"
          >
            <div className="avatar-wrapper">
              <img
                src={currentAvatar}
                alt={user?.name || profile.name}
                className="avatar-img"
              />
              <span className="avatar-status" />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || profile.name}</span>
              <span className="user-role">
                <ShieldCheck size={11} style={{ display: 'inline', marginRight: 2 }} />
                Super Admin
              </span>
            </div>
            <ChevronDown size={14} className="user-chevron" />
          </div>

          {/* Sign Out Button */}
          <button
            className="header-logout-btn"
            onClick={handleAdminLogout}
            title="Sign Out of Admin Console"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Edit Admin Profile Modal in Center */}
      <EditAdminProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </>
  );
}
