import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Camera,
  Save, ShoppingBag, Heart, Package, Settings, AlertTriangle,
  CheckCircle, Calendar, Clock, Store, Star, ArrowRight,
  LogOut, ShieldCheck, RefreshCw, X, Bell, HandCoins, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import authService from '../services/authService.js';
import orderService from '../services/orderService.js';
import favoriteService from '../services/favoriteService.js';
import notificationService from '../services/notificationService.js';
import reviewService from '../services/reviewService.js';
import { useToast, EmptyState, formatCurrency } from '../components/shared/index.jsx';
import MarketMap from '../components/shared/MarketMap.jsx';
import './Profile.css';

export default function Profile() {
  const { user, isAuthenticated, logout, updateProfileImage, updateLocalUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const fileRef = useRef(null);

  const initialTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Personal Info Form
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: 'Karachi',
    state: 'Sindh',
    postalCode: '',
  });

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [selectedProductToReview, setSelectedProductToReview] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeMapOrderId, setActiveMapOrderId] = useState(null);

  // Sync Tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Populate user data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setPersonal({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || 'Karachi',
        state: user.address?.state || 'Sindh',
        postalCode: user.address?.postalCode || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  // Load orders, favorites, notifications
  const loadUserData = async () => {
    try {
      const [orderRes, favRes, notifRes] = await Promise.allSettled([
        orderService.getMyOrders(),
        favoriteService.getMyFavorites(),
        notificationService.getMyNotifications(),
      ]);

      if (orderRes.status === 'fulfilled') setOrders(orderRes.value?.data || []);
      if (favRes.status === 'fulfilled') setFavorites(favRes.value?.data || []);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value?.data || []);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, activeTab]);

  // Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      await updateProfileImage(file);
      toast('Profile photo updated successfully!', 'success');
    } catch (err) {
      toast('Failed to upload profile photo', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Personal Info & Address
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: personal.name.trim(),
        phone: personal.phone.trim(),
        address: {
          street: personal.street.trim(),
          city: personal.city.trim(),
          state: personal.state.trim(),
          postalCode: personal.postalCode.trim(),
        },
      };

      const res = await authService.updateProfile(payload);
      if (res) {
        updateLocalUser(res);
        toast('Profile & address updated successfully!', 'success');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Please provide a reason for cancelling this pre-order:') || 'Customer requested cancellation';
    try {
      await orderService.cancelOrder(orderId, reason);
      toast('Order cancelled and reserved stock restored', 'info');
      loadUserData();
    } catch (err) {
      toast(err.response?.data?.message || 'Cannot cancel this order (cutoff window may have passed)', 'error');
    }
  };

  // Re-Order past order items
  const handleReorder = async (orderId) => {
    try {
      const res = await orderService.reorderOrder(orderId);
      if (res?.data?.items?.length) {
        res.data.items.forEach((item) => {
          addToCart(
            {
              _id: item.productId,
              name: item.name,
              price: item.price,
              unit: item.unit,
              stock: item.stock,
              images: [{ url: item.image }],
            },
            item.quantity
          );
        });
        toast(`Added ${res.data.items.length} items to your basket!`, 'success');
        navigate('/cart');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Could not reorder. Some items may be out of stock.', 'error');
    }
  };

  // Open Review Modal
  const handleOpenReview = (order, item) => {
    setReviewOrder(order);
    setSelectedProductToReview(item);
    setRatingVal(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast('Please write a review comment', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        orderId: reviewOrder._id,
        productId: selectedProductToReview?.product,
        farmerId: selectedProductToReview?.farmer?._id || selectedProductToReview?.farmer,
        rating: ratingVal,
        comment: reviewComment.trim(),
      });
      toast('Thank you! Your verified review has been submitted.', 'success');
      setReviewModalOpen(false);
      loadUserData();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Remove favorite
  const handleRemoveFavorite = async (favId) => {
    try {
      await favoriteService.removeFavorite(favId);
      setFavorites(favorites.filter((f) => f._id !== favId));
      toast('Removed from favorites', 'info');
    } catch {
      toast('Failed to remove favorite', 'error');
    }
  };

  // Mark all notifications read
  const handleMarkAllNotifsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast('All notifications marked as read', 'success');
    } catch {}
  };

  return (
    <div className="profile-page">
      <div className="container py-8">
        <div className="profile-header-card">
          <div className="profile-avatar-wrap">
            <img
              src={user?.profileImage?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="profile-avatar-img"
            />
            <button
              type="button"
              className="avatar-edit-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              title="Change Avatar"
            >
              <Camera size={15} />
            </button>
            <input
              type="file"
              ref={fileRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1 className="profile-user-name">{user?.name}</h1>
              <span className={`role-badge role-${user?.role || 'user'}`}>
                {user?.role === 'farmer' ? 'Certified Grower' : user?.role === 'admin' ? 'Administrator' : 'Verified Customer'}
              </span>
            </div>
            <p className="profile-user-email">
              <Mail size={14} /> {user?.email} {user?.isVerified && <span className="verified-check">Email Verified</span>}
            </p>
            {personal.phone && (
              <p className="profile-user-phone">
                <Phone size={14} /> {personal.phone}
              </p>
            )}
          </div>

          <div className="profile-header-action">
            <button className="btn btn-outline" onClick={logout}>
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="profile-tabs-bar">
          <button
            className={`profile-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => handleTabChange('personal')}
          >
            <User size={16} /> Personal Info & Address
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <ShoppingBag size={16} /> Pre-Orders & History ({orders.length})
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleTabChange('favorites')}
          >
            <Heart size={16} /> Saved Favorites ({favorites.length})
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('notifications')}
          >
            <Bell size={16} /> Notifications ({notifications.filter(n => !n.isRead).length})
          </button>
        </div>

        {/* ── TAB 1: PERSONAL INFO & ADDRESS ── */}
        {activeTab === 'personal' && (
          <div className="profile-tab-content">
            <form onSubmit={handleSaveProfile} className="profile-form-card">
              <h2 className="form-card-title">Customer Contact & Pickup Information</h2>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={personal.name}
                    onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Registered)</label>
                  <input
                    type="email"
                    value={personal.email}
                    disabled
                    className="form-input disabled"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. +92 300 1234567"
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. House #12, Street 4, Block 5"
                    value={personal.street}
                    onChange={(e) => setPersonal({ ...personal, street: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={personal.city}
                    onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal / Zip Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 75300"
                    value={personal.postalCode}
                    onChange={(e) => setPersonal({ ...personal, postalCode: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-submit-row">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 2: PRE-ORDERS & ORDER HISTORY ── */}
        {activeTab === 'orders' && (
          <div className="profile-tab-content">
            {orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No Pre-Orders Placed Yet"
                description="Explore local weekend markets and pre-order fresh harvest produce for convenient pickup."
                actionText="Browse Marketplace"
                actionLink="/products"
              />
            ) : (
              <div className="orders-cards-list">
                {orders.map((ord) => (
                  <div key={ord._id} className="customer-order-card">
                    <div className="customer-order-top">
                      <div>
                        <span className="order-code">Order #{ord.orderNumber}</span>
                        <h3 className="order-market-title">
                          <Store size={16} /> {ord.market?.name || ord.marketName || 'Farmers Market Ground'}
                        </h3>
                      </div>

                      <div className="order-price-status">
                        <span className={`status-pill status-${ord.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {ord.status}
                        </span>
                        <span className="order-grand-total">{formatCurrency(ord.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="customer-order-pickup-grid">
                      <div className="pickup-info-box">
                        <Calendar size={14} className="text-emerald-600" />
                        <div>
                          <small>Pickup Date:</small>
                          <strong>{new Date(ord.pickupDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                        </div>
                      </div>

                      <div className="pickup-info-box">
                        <Clock size={14} className="text-emerald-600" />
                        <div>
                          <small>Pickup Window:</small>
                          <strong>{ord.pickupTimeSlot}</strong>
                        </div>
                      </div>

                      <div className="pickup-info-box">
                        <HandCoins size={14} className="text-emerald-600" />
                        <div>
                          <small>Payment:</small>
                          <strong className="text-emerald-700">In-Person at Stall (Cash/Card)</strong>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="customer-order-items">
                      <span className="items-header">Produce Items:</span>
                      <div className="ordered-items-table">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="ordered-item-row">
                            <div className="item-name-col">
                              <strong>{item.name}</strong>
                              <small>Stall: {item.farmerName || 'Local Farm'}</small>
                            </div>
                            <span className="item-qty-col">{item.quantity} {item.unit || 'kg'}</span>
                            <span className="item-subtotal-col">{formatCurrency(item.subtotal)}</span>

                            {/* Rate button if order is Completed */}
                            {ord.status === 'Completed' && (
                              <button
                                type="button"
                                className="btn-rate-item"
                                onClick={() => handleOpenReview(ord, item)}
                              >
                                <Star size={13} fill="currentColor" /> Review Produce
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="customer-order-actions-row">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setActiveMapOrderId(activeMapOrderId === ord._id ? null : ord._id)}
                      >
                        <MapPin size={14} className="text-emerald-600" />
                        {activeMapOrderId === ord._id ? 'Hide Pickup Map' : 'View Pickup Map & Directions'}
                      </button>

                      {['Placed', 'pending'].includes(ord.status) && (
                        <button
                          type="button"
                          className="btn btn-outline text-red-600 btn-sm"
                          onClick={() => handleCancelOrder(ord._id)}
                        >
                          Cancel Pre-Order
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleReorder(ord._id)}
                      >
                        <RefreshCw size={14} /> Re-Order Produce
                      </button>
                    </div>

                    {/* Toggleable Pickup Point Map */}
                    {activeMapOrderId === ord._id && (
                      <div style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        <MarketMap
                          locations={[{
                            name: ord.market?.name || ord.marketName || 'Farmers Market Pickup Hub',
                            address: ord.market?.location?.address || 'Market Pickup Area',
                            city: ord.market?.location?.city || 'Local City',
                            marketDays: ord.market?.marketDays || ['Saturday', 'Sunday'],
                            pickupHours: ord.pickupTimeSlot,
                            lat: ord.market?.location?.coordinates?.lat || ord.market?.location?.lat || 24.8607,
                            lng: ord.market?.location?.coordinates?.lng || ord.market?.location?.lng || 67.0011,
                          }]}
                          selectedLocation={{
                            name: ord.market?.name || ord.marketName || 'Farmers Market Pickup Hub',
                            address: ord.market?.location?.address || 'Market Pickup Area',
                            city: ord.market?.location?.city || 'Local City',
                            marketDays: ord.market?.marketDays || ['Saturday', 'Sunday'],
                            pickupHours: ord.pickupTimeSlot,
                            lat: ord.market?.location?.coordinates?.lat || ord.market?.location?.lat || 24.8607,
                            lng: ord.market?.location?.coordinates?.lng || ord.market?.location?.lng || 67.0011,
                          }}
                          height="320px"
                          title="Pre-Order Pickup Point Map & Directions"
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SAVED FAVORITES ── */}
        {activeTab === 'favorites' && (
          <div className="profile-tab-content">
            {favorites.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No Favorites Saved"
                description="Click the heart icon on any produce, grower, or market to save it to your quick-access favorites list."
                actionText="Explore Fresh Harvest"
                actionLink="/products"
              />
            ) : (
              <div className="favorites-grid">
                {favorites.map((fav) => {
                  const isProd = fav.itemType === 'product' && fav.product;
                  const isFarmer = fav.itemType === 'farmer' && fav.farmer;
                  const isMarket = fav.itemType === 'market' && fav.market;

                  if (isProd) {
                    const p = fav.product;
                    return (
                      <div key={fav._id} className="fav-card">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80'}
                          alt={p.name}
                          className="fav-img"
                        />
                        <div className="fav-body">
                          <span className="fav-type-badge">Produce</span>
                          <h4 className="fav-name">{p.name}</h4>
                          <span className="fav-price">{formatCurrency(p.price)} / {p.unit || 'kg'}</span>
                          <div className="fav-actions">
                            <Link to={`/products/${p._id}`} className="btn btn-primary btn-sm">
                              View Details
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm text-red-600"
                              onClick={() => handleRemoveFavorite(fav._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isFarmer) {
                    const f = fav.farmer;
                    return (
                      <div key={fav._id} className="fav-card">
                        <div className="fav-body">
                          <span className="fav-type-badge green">Farm Stall</span>
                          <h4 className="fav-name">{f.farmName}</h4>
                          <p className="fav-sub">{f.market?.name || 'Local Market'}</p>
                          <div className="fav-actions">
                            <Link to={`/products?farmer=${f._id}`} className="btn btn-primary btn-sm">
                              View Produce
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm text-red-600"
                              onClick={() => handleRemoveFavorite(fav._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: IN-APP NOTIFICATIONS ── */}
        {activeTab === 'notifications' && (
          <div className="profile-tab-content">
            <div className="notifs-card">
              <div className="notifs-header">
                <h3 className="notifs-title">Notifications & Order Updates</h3>
                {notifications.some(n => !n.isRead) && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleMarkAllNotifsRead}>
                    Mark All as Read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="empty-text">You have no new notifications.</p>
              ) : (
                <div className="notifs-list">
                  {notifications.map((notif) => (
                    <div key={notif._id} className={`notif-item ${notif.isRead ? 'read' : 'unread'}`}>
                      <div className="notif-icon-box">
                        <Bell size={16} />
                      </div>
                      <div className="notif-content">
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <small>{new Date(notif.createdAt).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Modal for Completed Orders */}
      {reviewModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Write Verified Review</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReviewModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-body">
              <p className="review-target-info">
                Reviewing <strong>{selectedProductToReview?.name}</strong> from Order #{reviewOrder?.orderNumber}
              </p>

              <div className="form-group">
                <label className="form-label">Rating:</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      className="star-btn"
                      onClick={() => setRatingVal(s)}
                    >
                      <Star
                        size={24}
                        fill={s <= ratingVal ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    </button>
                  ))}
                  <span className="selected-rating-text">{ratingVal} / 5 Stars</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Feedback & Produce Quality:</label>
                <textarea
                  rows={4}
                  placeholder="How fresh was the produce? Was the pickup smooth?..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="btn btn-primary">
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
