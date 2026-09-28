import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Leaf, Package, ShoppingBag, DollarSign, Plus, Edit, Trash2,
  CheckCircle, Clock, X, Upload, Store, User, ArrowUpRight,
  Calendar, MapPin, Star, MessageSquare, Send, AlertCircle,
  TrendingUp, Check, XCircle, Phone, Mail, Save, RefreshCw, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import productService from '../services/productService.js';
import farmerService from '../services/farmerService.js';
import orderService from '../services/orderService.js';
import categoryService from '../services/categoryService.js';
import marketService from '../services/marketService.js';
import reviewService from '../services/reviewService.js';
import { useToast, SkeletonCard, EmptyState, formatCurrency } from '../components/shared/index.jsx';
import MarketMap from '../components/shared/MarketMap.jsx';
import './FarmerDashboard.css';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function FarmerDashboard() {
  const { user, isFarmer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Search and filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [reviewSearch, setReviewSearch] = useState('');

  // Weekly stock bulk editing state
  const [weeklyStockItems, setWeeklyStockItems] = useState([]);
  const [savingWeeklyStock, setSavingWeeklyStock] = useState(false);

  // Modal State for Add/Edit Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    market: '',
    unit: 'kg',
    stock: 25,
    weeklyStock: 25,
    isOrganic: true,
    isAvailable: true,
    imageFile: null,
    imageUrl: '',
  });
  const [savingProduct, setSavingProduct] = useState(false);

  // Farmer Profile Form state
  const [profileForm, setProfileForm] = useState({
    farmName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    stallNumber: '',
    market: '',
    operatingDays: ['Saturday', 'Sunday'],
    lat: 24.8607,
    lng: 67.0011,
    cutoffHours: 2,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Review reply state
  const [replyTextMap, setReplyTextMap] = useState({});
  const [sendingReply, setSendingReply] = useState(false);

  // Sync tab with URL / Route pathname
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/farmer/profile')) {
      setActiveTab('profile');
    } else if (path.includes('/farmer/products/create')) {
      setActiveTab('products');
      setShowProductModal(true);
    } else if (path.includes('/farmer/products')) {
      setActiveTab('products');
    } else if (path.includes('/farmer/orders')) {
      setActiveTab('orders');
    } else if (path.includes('/farmer/reviews')) {
      setActiveTab('reviews');
    } else if (path.includes('/farmer/weekly-stock')) {
      setActiveTab('weekly_stock');
    } else {
      const tab = searchParams.get('tab');
      if (tab) setActiveTab(tab);
    }
  }, [location.pathname, searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadAllFarmerData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, orderRes, catRes, mktRes, profRes] = await Promise.allSettled([
        orderService.getFarmerStats(),
        productService.getMyProducts(),
        orderService.getFarmerOrders(),
        categoryService.getActiveCategories(),
        marketService.getMarkets({ isActive: true }),
        farmerService.getMyFarmerProfile(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }

      if (prodRes.status === 'fulfilled') {
        const prodList = prodRes.value?.data || [];
        setProducts(prodList);
        setWeeklyStockItems(
          prodList.map((p) => ({
            productId: p._id,
            name: p.name,
            unit: p.unit || 'kg',
            price: p.price,
            stock: p.stock,
            weeklyStock: p.weeklyStock || p.stock,
            isAvailable: p.isAvailable,
          }))
        );
      }

      if (orderRes.status === 'fulfilled') {
        setOrders(orderRes.value?.data || []);
      }

      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value?.data || []);
      }

      if (mktRes.status === 'fulfilled') {
        setMarkets(mktRes.value?.data || []);
      }

      if (profRes.status === 'fulfilled' && profRes.value?.data) {
        const p = profRes.value.data;
        setFarmerProfile(p);
        setProfileForm({
          farmName: p.farmName || '',
          contactPerson: p.contactPerson || user?.name || '',
          phone: p.phone || user?.phone || '',
          email: p.email || user?.email || '',
          address: p.address || '',
          description: p.description || '',
          stallNumber: p.stallNumber || '',
          market: p.market?._id || p.market || '',
          operatingDays: p.operatingDays?.length > 0 ? p.operatingDays : ['Saturday', 'Sunday'],
          lat: p.location?.lat || 24.8607,
          lng: p.location?.lng || 67.0011,
          cutoffHours: p.pickupWindows?.[0]?.cutoffHours || 2,
        });

        // Load reviews for this farmer
        if (p._id) {
          try {
            const revRes = await reviewService.getFarmerReviews(p._id);
            setReviews(revRes?.data || []);
          } catch {}
        }
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFarmer && !isAdmin) {
      toast('Farmer access required. Please log in as a farmer.', 'info');
      navigate('/login');
      return;
    }
    loadAllFarmerData();
  }, [isFarmer, isAdmin]);

  // Handle Product Add/Edit Modal
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: categories[0]?._id || '',
      market: farmerProfile?.market?._id || farmerProfile?.market || markets[0]?._id || '',
      unit: 'kg',
      stock: 25,
      weeklyStock: 25,
      isOrganic: true,
      isAvailable: true,
      imageFile: null,
      imageUrl: '',
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p) => {
    setEditingProductId(p._id);
    setProductForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category?._id || p.category || '',
      market: p.market?._id || p.market || '',
      unit: p.unit || 'kg',
      stock: p.stock,
      weeklyStock: p.weeklyStock || p.stock,
      isOrganic: Boolean(p.isOrganic),
      isAvailable: Boolean(p.isAvailable),
      imageFile: null,
      imageUrl: p.images?.[0]?.url || '',
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      toast('Please enter produce name and price', 'error');
      return;
    }

    setSavingProduct(true);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('unit', productForm.unit);
      formData.append('stock', productForm.stock);
      formData.append('weeklyStock', productForm.weeklyStock);
      formData.append('isOrganic', productForm.isOrganic);
      formData.append('isAvailable', productForm.isAvailable);
      if (productForm.category) formData.append('category', productForm.category);
      if (productForm.market) formData.append('market', productForm.market);

      if (productForm.imageFile) {
        formData.append('image', productForm.imageFile);
      } else if (productForm.imageUrl) {
        formData.append('imageUrl', productForm.imageUrl);
      }

      if (editingProductId) {
        await productService.updateProduct(editingProductId, formData);
        toast('Produce item updated successfully!', 'success');
      } else {
        await productService.createProduct(formData);
        toast('New harvest produce listed for pre-orders!', 'success');
      }

      setShowProductModal(false);
      loadAllFarmerData();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save produce', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this produce listing?')) return;
    try {
      await productService.deleteProduct(id);
      toast('Produce listing removed', 'info');
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      toast('Failed to delete produce', 'error');
    }
  };

  // Weekly Stock Bulk Save
  const handleSaveWeeklyStock = async () => {
    setSavingWeeklyStock(true);
    try {
      await farmerService.updateWeeklyStock(weeklyStockItems);
      toast('Weekly stock & availability updated successfully!', 'success');
      loadAllFarmerData();
    } catch (err) {
      toast('Failed to update weekly stock', 'error');
    } finally {
      setSavingWeeklyStock(false);
    }
  };

  // Handle Order Status Update (Accept, Decline, Ready, Complete)
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    let cancelReason = '';
    if (newStatus === 'Declined') {
      cancelReason = window.prompt('Please provide a reason for declining this pre-order (e.g. out of fresh stock):') || 'Stall stock exhausted';
    }

    try {
      await orderService.updateOrderStatus(orderId, newStatus, cancelReason);
      toast(`Order status updated to "${newStatus}"`, 'success');
      loadAllFarmerData();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  // Farmer Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        farmName: profileForm.farmName,
        contactPerson: profileForm.contactPerson,
        phone: profileForm.phone,
        email: profileForm.email,
        address: profileForm.address,
        description: profileForm.description,
        stallNumber: profileForm.stallNumber,
        market: profileForm.market || undefined,
        operatingDays: profileForm.operatingDays,
        location: {
          address: profileForm.address,
          city: 'Karachi',
          lat: Number(profileForm.lat),
          lng: Number(profileForm.lng),
        },
        pickupWindows: profileForm.operatingDays.map((d) => ({
          day: d,
          startTime: '08:00 AM',
          endTime: '02:00 PM',
          cutoffHours: Number(profileForm.cutoffHours) || 2,
        })),
      };

      await farmerService.createOrUpdateProfile(payload);
      toast('Farmer stall profile & schedule updated!', 'success');
      loadAllFarmerData();
    } catch (err) {
      toast('Failed to update farmer profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Review Reply Submit
  const handleReplyReview = async (reviewId) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text) {
      toast('Please enter your response to the customer', 'error');
      return;
    }

    setSendingReply(true);
    try {
      await reviewService.replyToReview(reviewId, text);
      toast('Reply posted successfully!', 'success');
      setReplyTextMap({ ...replyTextMap, [reviewId]: '' });
      loadAllFarmerData();
    } catch (err) {
      toast('Failed to post reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="farmer-dashboard-page">
      <div className="container">
        {/* Dashboard Header */}
        <div className="farmer-db-header">
          <div>
            <div className="farmer-db-badge">
              <Leaf size={14} className="text-emerald-600" /> Verified Producer Panel
            </div>
            <h1 className="farmer-db-title">
              {farmerProfile?.farmName || `${user?.name}'s Organic Farm`}
            </h1>
            <p className="farmer-db-subtitle">
              Manage weekly stock, review incoming pre-orders, configure pickup slots, and respond to customer feedback.
            </p>
          </div>

          <div className="farmer-header-actions">
            <button className="btn btn-outline" onClick={loadAllFarmerData} title="Refresh live data">
              <RefreshCw size={15} /> Refresh Data
            </button>
            <button className="btn btn-primary" onClick={handleOpenAddProduct}>
              <Plus size={16} /> List New Produce
            </button>
          </div>
        </div>

        {/* Top KPI Statistics Row (Real DB Info) */}
        <div className="farmer-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box green">
              <Package size={22} />
            </div>
            <div>
              <span className="stat-label">Total Listings</span>
              <h3 className="stat-val">{products.length} Products</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box yellow">
              <Clock size={22} />
            </div>
            <div>
              <span className="stat-label">Pending / Placed</span>
              <h3 className="stat-val">{stats?.pendingOrders || 0} Orders</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box blue">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span className="stat-label">Accepted & Ready</span>
              <h3 className="stat-val">{(stats?.acceptedOrders || 0) + (stats?.readyOrders || 0)} Orders</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box gold">
              <DollarSign size={22} />
            </div>
            <div>
              <span className="stat-label">Completed Revenue</span>
              <h3 className="stat-val">{formatCurrency(stats?.totalRevenue || 0)}</h3>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="farmer-tabs-bar">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <TrendingUp size={16} /> Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabChange('products')}
          >
            <Package size={16} /> Produce Listings ({products.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'weekly_stock' ? 'active' : ''}`}
            onClick={() => handleTabChange('weekly_stock')}
          >
            <Calendar size={16} /> Weekly Stock
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <ShoppingBag size={16} /> Pre-Orders ({orders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <Store size={16} /> Stall & Pickup Slots
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            <Star size={16} /> Reviews ({reviews.length})
          </button>
        </div>

        {/* ── TAB 1: OVERVIEW & REAL ANALYTICS ── */}
        {activeTab === 'overview' && (
          <div className="farmer-tab-content">
            <div className="overview-layout">
              {/* Best Selling Products */}
              <div className="overview-card">
                <h3 className="overview-card-title">
                  <TrendingUp size={18} className="text-emerald-600" /> Best-Selling Produce (Real DB)
                </h3>
                {stats?.bestSellers?.length === 0 ? (
                  <p className="empty-text">No order sales recorded yet. Incoming orders will generate product rankings.</p>
                ) : (
                  <div className="best-sellers-list">
                    {stats?.bestSellers?.map((item, idx) => (
                      <div key={idx} className="best-seller-row">
                        <span className="rank-badge">#{idx + 1}</span>
                        <div className="best-seller-info">
                          <strong>{item.name}</strong>
                          <small>{item.quantity} units sold</small>
                        </div>
                        <span className="best-seller-revenue">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders Overview */}
              <div className="overview-card">
                <h3 className="overview-card-title">
                  <Clock size={18} className="text-blue-600" /> Recent Incoming Pre-Orders
                </h3>
                {orders.length === 0 ? (
                  <p className="empty-text">No pre-orders received yet. They will appear here in real-time.</p>
                ) : (
                  <div className="recent-orders-mini-list">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord._id} className="mini-order-row">
                        <div>
                          <strong>#{ord.orderNumber}</strong> — {ord.customer?.name || 'Customer'}
                          <small>{new Date(ord.pickupDate).toLocaleDateString()} ({ord.pickupTimeSlot})</small>
                        </div>
                        <span className={`status-tag status-${ord.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {ord.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PRODUCE LISTINGS (CRUD) ── */}
        {activeTab === 'products' && (
          <div className="farmer-tab-content">
            {/* Search and Action Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', width: '320px', maxWidth: '100%', gap: 8 }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search produce by name, category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.88rem' }}
                />
                {productSearch && (
                  <button type="button" onClick={() => setProductSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <button className="btn btn-primary" onClick={handleOpenAddProduct}>
                <Plus size={16} /> List New Produce
              </button>
            </div>

            {products.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Produce Listed Yet"
                description="List your fresh harvest of organic vegetables, fruits, or dairy to start receiving pre-orders."
                actionText="List First Produce"
                onAction={handleOpenAddProduct}
              />
            ) : (
              <div className="farmer-products-table-card">
                <div className="table-responsive">
                  <table className="farmer-table">
                    <thead>
                      <tr>
                        <th>Produce</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Current Stock</th>
                        <th>Weekly Target</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => {
                          if (!p) return false;
                          if (!productSearch.trim()) return true;
                          const q = productSearch.toLowerCase().trim();
                          return (
                            (p.name || '').toLowerCase().includes(q) ||
                            (p.description || '').toLowerCase().includes(q) ||
                            (p.category?.name || '').toLowerCase().includes(q) ||
                            (p.unit || '').toLowerCase().includes(q)
                          );
                        })
                        .map((p) => {
                          const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&auto=format&fit=crop&q=80';
                          return (
                            <tr key={p._id}>
                              <td>
                                <div className="prod-cell">
                                  <img src={img} alt={p.name} className="prod-thumb" />
                                  <div>
                                    <strong>{p.name}</strong>
                                    <span className="prod-unit">{p.unit || 'kg'} {p.isOrganic ? '• Organic' : ''}</span>
                                  </div>
                                </div>
                              </td>
                              <td>{p.category?.name || 'Produce'}</td>
                              <td><strong>{formatCurrency(p.price)}</strong></td>
                              <td>
                                <span className={`stock-badge ${p.stock <= 5 ? 'low' : ''}`}>
                                  {p.stock} {p.unit || 'kg'}
                                </span>
                              </td>
                              <td>{p.weeklyStock || p.stock} {p.unit || 'kg'}</td>
                              <td>
                                {p.isAvailable && p.stock > 0 ? (
                                  <span className="status-badge active">Available</span>
                                ) : (
                                  <span className="status-badge inactive">Sold Out / Hidden</span>
                                )}
                              </td>
                              <td>
                                <div className="action-btns">
                                  <button
                                    type="button"
                                    className="icon-btn edit"
                                    onClick={() => handleOpenEditProduct(p)}
                                    title="Edit produce"
                                  >
                                    <Edit size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="icon-btn delete"
                                    onClick={() => handleDeleteProduct(p._id)}
                                    title="Delete listing"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: WEEKLY STOCK MANAGEMENT ── */}
        {activeTab === 'weekly_stock' && (
          <div className="farmer-tab-content">
            <div className="weekly-stock-card">
              <div className="weekly-stock-header">
                <div>
                  <h3 className="weekly-stock-title">Weekly Harvest Stock & Price Control</h3>
                  <p className="weekly-stock-subtitle">
                    Quickly update harvest quantities and prices for the upcoming weekend market pickup.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveWeeklyStock}
                  disabled={savingWeeklyStock}
                >
                  <Save size={16} /> {savingWeeklyStock ? 'Saving Changes...' : 'Save Weekly Stock'}
                </button>
              </div>

              {weeklyStockItems.length === 0 ? (
                <p className="empty-text">No produce items found. Please list products first.</p>
              ) : (
                <div className="table-responsive">
                  <table className="farmer-table">
                    <thead>
                      <tr>
                        <th>Produce Item</th>
                        <th>Price (Rs)</th>
                        <th>Available Stock</th>
                        <th>Weekly Batch Target</th>
                        <th>Available for Pre-Order?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyStockItems.map((item, idx) => (
                        <tr key={item.productId}>
                          <td><strong>{item.name}</strong> <span className="text-gray-400">({item.unit})</span></td>
                          <td>
                            <input
                              type="number"
                              value={item.price}
                              min="0"
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setWeeklyStockItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, price: val } : it))
                                );
                              }}
                              className="stock-table-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.stock}
                              min="0"
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setWeeklyStockItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, stock: val } : it))
                                );
                              }}
                              className="stock-table-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.weeklyStock}
                              min="0"
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setWeeklyStockItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, weeklyStock: val } : it))
                                );
                              }}
                              className="stock-table-input"
                            />
                          </td>
                          <td>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={item.isAvailable}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setWeeklyStockItems((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, isAvailable: val } : it))
                                  );
                                }}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: INCOMING PRE-ORDERS ── */}
        {activeTab === 'orders' && (
          <div className="farmer-tab-content">
            {/* Orders Search & Status Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', width: '320px', maxWidth: '100%', gap: 8 }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search order #, customer, item..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.88rem' }}
                />
                {orderSearch && (
                  <button type="button" onClick={() => setOrderSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', 'Placed', 'Accepted', 'Ready for Pickup', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatusFilter(st)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: orderStatusFilter === st ? '#16a34a' : '#ffffff',
                      color: orderStatusFilter === st ? '#ffffff' : '#475569',
                      borderColor: orderStatusFilter === st ? '#16a34a' : '#e2e8f0',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {st === 'all' ? 'All Statuses' : st}
                  </button>
                ))}
              </div>
            </div>

            {orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No Incoming Pre-Orders"
                description="When customers place pickup reservations for your farm produce, they will appear here."
              />
            ) : (
              <div className="farmer-orders-list">
                {orders
                  .filter((ord) => {
                    if (!ord) return false;
                    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
                    if (!matchesStatus) return false;
                    if (!orderSearch.trim()) return true;
                    const q = orderSearch.toLowerCase().trim();
                    return (
                      (String(ord.orderNumber) || '').toLowerCase().includes(q) ||
                      (ord.customer?.name || '').toLowerCase().includes(q) ||
                      (ord.customer?.phone || '').toLowerCase().includes(q) ||
                      (ord.customer?.email || '').toLowerCase().includes(q) ||
                      (ord.marketName || '').toLowerCase().includes(q) ||
                      (ord.items || []).some((item) => (item.name || '').toLowerCase().includes(q))
                    );
                  })
                  .map((ord) => (
                    <div key={ord._id} className="farmer-order-card">
                      <div className="farmer-order-top">
                      <div>
                        <span className="order-num-tag">#{ord.orderNumber}</span>
                        <h4 className="customer-name-heading">
                          <User size={16} /> {ord.customer?.name || 'Customer'}
                        </h4>
                        <div className="order-contact-info">
                          {ord.customer?.phone && (
                            <span><Phone size={13} /> {ord.customer.phone}</span>
                          )}
                          {ord.customer?.email && (
                            <span><Mail size={13} /> {ord.customer.email}</span>
                          )}
                        </div>
                      </div>

                      <div className="order-status-and-price">
                        <span className={`status-pill status-${ord.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {ord.status}
                        </span>
                        <span className="farmer-order-total">{formatCurrency(ord.farmerSubtotal || ord.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="farmer-order-meta-grid">
                      <div className="meta-box">
                        <Calendar size={14} />
                        <div>
                          <small>Pickup Date:</small>
                          <strong>{new Date(ord.pickupDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                        </div>
                      </div>
                      <div className="meta-box">
                        <Clock size={14} />
                        <div>
                          <small>Time Window:</small>
                          <strong>{ord.pickupTimeSlot}</strong>
                        </div>
                      </div>
                      <div className="meta-box">
                        <Store size={14} />
                        <div>
                          <small>Market Hub:</small>
                          <strong>{ord.marketName || 'Local Farmers Market'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Produce Items */}
                    <div className="ordered-items-box">
                      <span className="items-title">Ordered Produce:</span>
                      <div className="items-chip-list">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="item-chip">
                            <span>{item.name}</span>
                            <strong>x {item.quantity} {item.unit || 'kg'}</strong>
                            <small>({formatCurrency(item.subtotal)})</small>
                          </div>
                        ))}
                      </div>
                    </div>

                    {ord.customerNote && (
                      <div className="order-note-alert">
                        <strong>Customer Note:</strong> {ord.customerNote}
                      </div>
                    )}

                    {/* Status Action Buttons */}
                    <div className="farmer-order-actions">
                      {ord.status === 'Placed' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => handleOrderStatusUpdate(ord._id, 'Accepted')}
                          >
                            <Check size={16} /> Accept Order
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleOrderStatusUpdate(ord._id, 'Declined')}
                          >
                            <XCircle size={16} /> Decline
                          </button>
                        </>
                      )}

                      {ord.status === 'Accepted' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleOrderStatusUpdate(ord._id, 'Ready for Pickup')}
                        >
                          <CheckCircle size={16} /> Mark Ready for Pickup
                        </button>
                      )}

                      {ord.status === 'Ready for Pickup' && (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleOrderStatusUpdate(ord._id, 'Completed')}
                        >
                          <CheckCircle size={16} /> Complete Pickup (Paid)
                        </button>
                      )}

                      {ord.status === 'Completed' && (
                        <span className="completed-badge">Completed & Settled In-Person</span>
                      )}

                      {ord.status === 'Cancelled' && (
                        <span className="cancelled-badge">Cancelled by Customer</span>
                      )}

                      {ord.status === 'Declined' && (
                        <span className="declined-badge">Declined by Farmer</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: FARMER PROFILE & PICKUP SLOTS ── */}
        {activeTab === 'profile' && (
          <div className="farmer-tab-content">
            <form onSubmit={handleSaveProfile} className="farmer-profile-card">
              <h3 className="profile-card-title">Manage Farm Stall & Pickup Windows</h3>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Farm / Stall Name *</label>
                  <input
                    type="text"
                    value={profileForm.farmName}
                    onChange={(e) => setProfileForm({ ...profileForm, farmName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    value={profileForm.contactPerson}
                    onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Market Stall Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Stall #14"
                    value={profileForm.stallNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, stallNumber: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Farmers Market Hub</label>
                  <select
                    value={profileForm.market}
                    onChange={(e) => setProfileForm({ ...profileForm, market: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select Primary Market</option>
                    {markets.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pre-Order Cutoff Window (Hours before pickup)</label>
                  <input
                    type="number"
                    value={profileForm.cutoffHours}
                    min="1"
                    onChange={(e) => setProfileForm({ ...profileForm, cutoffHours: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Operating Days Checkboxes */}
              <div className="form-group mt-4">
                <label className="form-label">Operating Days (When customers can pick up)</label>
                <div className="operating-days-grid">
                  {ALL_DAYS.map((day) => {
                    const checked = profileForm.operatingDays.includes(day);
                    return (
                      <label key={day} className={`day-check-chip ${checked ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...profileForm.operatingDays, day]
                              : profileForm.operatingDays.filter((d) => d !== day);
                            setProfileForm({ ...profileForm, operatingDays: next });
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Farm Description & Story</label>
                <textarea
                  rows={3}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Share details about your organic farming practices..."
                />
              </div>

              {/* Stall Location Map Preview & GPS Directions */}
              <div className="form-group mt-4">
                <label className="form-label">
                  <MapPin size={15} className="text-emerald-600" /> Farm Stall Location &amp; Directions Map
                </label>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <MarketMap
                    locations={[{
                      name: profileForm.farmName || 'Your Farm Stall',
                      address: profileForm.address || 'Market Stall Ground',
                      city: profileForm.city || 'Local Area',
                      marketDays: profileForm.operatingDays.length > 0 ? profileForm.operatingDays : ['Saturday', 'Sunday'],
                      pickupHours: `${profileForm.pickupStartTime} - ${profileForm.pickupEndTime}`,
                      lat: profileForm.lat || 24.8607,
                      lng: profileForm.lng || 67.0011,
                    }]}
                    selectedLocation={{
                      name: profileForm.farmName || 'Your Farm Stall',
                      address: profileForm.address || 'Market Stall Ground',
                      city: profileForm.city || 'Local Area',
                      marketDays: profileForm.operatingDays.length > 0 ? profileForm.operatingDays : ['Saturday', 'Sunday'],
                      pickupHours: `${profileForm.pickupStartTime} - ${profileForm.pickupEndTime}`,
                      lat: profileForm.lat || 24.8607,
                      lng: profileForm.lng || 67.0011,
                    }}
                    height="300px"
                    title="Farm Stall Map & GPS Directions"
                    compact={true}
                  />
                </div>
              </div>

              <button type="submit" disabled={savingProfile} className="btn btn-primary mt-4">
                {savingProfile ? 'Saving Stall Profile...' : 'Save Stall Settings & Pickup Slots'}
              </button>
            </form>
          </div>
        )}

        {/* ── TAB 6: CUSTOMER REVIEWS & REPLIES ── */}
        {activeTab === 'reviews' && (
          <div className="farmer-tab-content">
            {/* Reviews Search Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', width: '320px', maxWidth: '100%', gap: 8 }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search feedback comment, customer..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.88rem' }}
                />
                {reviewSearch && (
                  <button type="button" onClick={() => setReviewSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="No Customer Reviews Yet"
                description="Verified reviews submitted by customers after order completion will appear here."
              />
            ) : (
              <div className="farmer-reviews-grid">
                {reviews
                  .filter((rev) => {
                    if (!rev) return false;
                    if (!reviewSearch.trim()) return true;
                    const q = reviewSearch.toLowerCase().trim();
                    return (
                      (rev.comment || '').toLowerCase().includes(q) ||
                      (rev.customer?.name || '').toLowerCase().includes(q) ||
                      (rev.product?.name || '').toLowerCase().includes(q)
                    );
                  })
                  .map((rev) => (
                    <div key={rev._id} className="farmer-review-card">
                    <div className="review-card-top">
                      <div>
                        <strong>{rev.customer?.name || 'Customer'}</strong>
                        {rev.product?.name && (
                          <small>Reviewed: {rev.product.name}</small>
                        )}
                      </div>
                      <div className="stars-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#f59e0b' : 'none'}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="review-body-text">{rev.comment}</p>

                    {rev.reply?.comment ? (
                      <div className="farmer-existing-reply">
                        <strong>Your Response:</strong>
                        <p>{rev.reply.comment}</p>
                      </div>
                    ) : (
                      <div className="farmer-reply-form">
                        <input
                          type="text"
                          placeholder="Write a response to this review..."
                          value={replyTextMap[rev._id] || ''}
                          onChange={(e) =>
                            setReplyTextMap({ ...replyTextMap, [rev._id]: e.target.value })
                          }
                          className="reply-input"
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={sendingReply}
                          onClick={() => handleReplyReview(rev._id)}
                        >
                          <Send size={14} /> Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProductId ? 'Edit Produce Listing' : 'List New Fresh Produce'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowProductModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-body">
              <div className="form-group">
                <label className="form-label">Produce Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Roma Tomatoes"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Price (Rs) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit of Measure</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="form-select"
                  >
                    <option value="kg">per Kilogram (kg)</option>
                    <option value="500g">per 500g Pack</option>
                    <option value="bunch">per Fresh Bunch</option>
                    <option value="piece">per Piece / Item</option>
                    <option value="dozen">per Dozen</option>
                    <option value="box">per Harvest Box</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Available Stock *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Produce Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductForm({ ...productForm, imageFile: e.target.files[0] })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description & Ripeness</label>
                <textarea
                  rows={3}
                  placeholder="Describe taste, harvest time, certified organic practices..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={productForm.isOrganic}
                    onChange={(e) => setProductForm({ ...productForm, isOrganic: e.target.checked })}
                  />
                  <span>Certified Organic</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                  />
                  <span>Available for Pre-Order</span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingProduct} className="btn btn-primary">
                  {savingProduct ? 'Saving...' : editingProductId ? 'Update Listing' : 'Publish Produce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
