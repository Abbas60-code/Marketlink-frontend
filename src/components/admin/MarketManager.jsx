import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Calendar, Clock, Check, X, Search, Store, RefreshCw, Sparkles, Navigation } from 'lucide-react';
import marketService from '../../services/marketService.js';
import { useToast, SkeletonCard, EmptyState } from '../shared/index.jsx';

export default function MarketManager() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    marketDays: ['Saturday', 'Sunday'],
    openTime: '08:00 AM',
    closeTime: '02:00 PM',
    pickupStartTime: '09:00 AM',
    pickupEndTime: '01:00 PM',
    isActive: true,
    isFeatured: false,
  });

  const toast = useToast();

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const res = await marketService.getMarkets();
      setMarkets(res?.data || []);
    } catch (err) {
      toast('Failed to load markets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      address: '',
      city: '',
      marketDays: ['Saturday', 'Sunday'],
      openTime: '08:00 AM',
      closeTime: '02:00 PM',
      pickupStartTime: '09:00 AM',
      pickupEndTime: '01:00 PM',
      isActive: true,
      isFeatured: false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        location: {
          address: form.address,
          city: form.city,
        },
        marketDays: form.marketDays,
        openTime: form.openTime,
        closeTime: form.closeTime,
        pickupStartTime: form.pickupStartTime,
        pickupEndTime: form.pickupEndTime,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
      };

      if (editingId) {
        await marketService.updateMarket(editingId, payload);
        toast('Farmers market hub updated successfully!', 'success');
      } else {
        await marketService.createMarket(payload);
        toast('New farmers market hub created successfully!', 'success');
      }
      setShowModal(false);
      fetchMarkets();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save market hub', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this market hub'}"?`)) return;
    try {
      await marketService.deleteMarket(id);
      toast('Market location deleted successfully', 'info');
      setMarkets(markets.filter((m) => m._id !== id));
    } catch (err) {
      toast('Failed to delete market', 'error');
    }
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      marketDays: prev.marketDays.includes(day)
        ? prev.marketDays.filter((d) => d !== day)
        : [...prev.marketDays, day],
    }));
  };

  const filtered = markets.filter((m) => {
    if (!m) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q) ||
      (m.location?.city || m.city || '').toLowerCase().includes(q) ||
      (m.location?.address || m.address || '').toLowerCase().includes(q) ||
      (m.location?.state || '').toLowerCase().includes(q) ||
      (m.marketDays || []).some((d) => (typeof d === 'string' ? d : d?.day || '').toLowerCase().includes(q))
    );
  });

  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="admin-section-container">
      {/* Page Header */}
      <div className="admin-page-hero">
        <div className="admin-page-hero__text">
          <div className="admin-badge-pill amber">
            <Store size={14} /> Community Market Stations
          </div>
          <h1 className="admin-page-title">Farmers Market Hubs &amp; Pickup Points</h1>
          <p className="admin-page-subtitle">
            Manage regional weekend market grounds, set consumer pickup windows, and organize vendor stalls.
          </p>
        </div>

        <div className="admin-hero-actions">
          <button className="admin-primary-btn" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Market Hub
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search market name, area or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-field"
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch('')}></button>
          )}
        </div>

        <div className="admin-filter-group">
          <span className="count-pill">{filtered.length} Hubs Found</span>
          <button className="admin-refresh-btn" onClick={fetchMarkets} title="Refresh hubs list">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Hubs Grid Content */}
      {loading ? (
        <div className="admin-hubs-grid">
          {[1, 2, 3].map((n) => <SkeletonCard key={n} height={260} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-card">
          <EmptyState
            icon={MapPin}
            title="No Farmers Markets Found"
            description="Create your first regional pickup station for local consumers."
            action={
              <button className="admin-primary-btn" onClick={handleOpenAdd}>
                <Plus size={16} /> Create First Market Hub
              </button>
            }
          />
        </div>
      ) : (
        <div className="admin-hubs-grid">
          {filtered.map((m) => (
            <div key={m._id} className="admin-hub-card">
              <div className="admin-hub-card__top">
                <div className="hub-icon-circle">
                  <Store size={22} />
                </div>
                <div className="hub-title-wrap">
                  <h3 className="hub-name">{m.name}</h3>
                  <span className="hub-city-tag">
                    <MapPin size={12} /> {m.location?.city || m.city || 'Community Ground'}
                  </span>
                </div>
                {m.isFeatured && (
                  <span className="badge-featured-gold">
                    <Sparkles size={11} /> Featured
                  </span>
                )}
              </div>

              <div className="admin-hub-card__body">
                <div className="hub-info-row">
                  <span className="info-key"> Address:</span>
                  <span className="info-val">{m.location?.address || m.address || 'Local Market Area'}</span>
                </div>

                <div className="hub-info-row">
                  <span className="info-key">️ Market Days:</span>
                  <div className="hub-days-wrap">
                    {m.marketDays && m.marketDays.length > 0 ? (
                      m.marketDays.map((d, dIdx) => (
                        <span key={dIdx} className="hub-day-chip">{d.substring(0, 3)}</span>
                      ))
                    ) : (
                      <span className="hub-day-chip">Sat, Sun</span>
                    )}
                  </div>
                </div>

                <div className="hub-info-row">
                  <span className="info-key">⏰ Stall Hours:</span>
                  <span className="info-val font-semibold">{m.openTime || '08:00 AM'} – {m.closeTime || '02:00 PM'}</span>
                </div>

                <div className="hub-info-row">
                  <span className="info-key">️ Pickup Window:</span>
                  <span className="info-val text-emerald font-semibold">{m.pickupStartTime || '09:00 AM'} – {m.pickupEndTime || '01:00 PM'}</span>
                </div>
              </div>

              <div className="admin-hub-card__footer">
                <span className={`status-badge-glow ${m.isActive !== false ? 'active' : 'suspended'}`}>
                  <span className="status-dot" />
                  {m.isActive !== false ? 'Active Hub' : 'Inactive'}
                </span>

                <div className="hub-card-actions">
                  <button
                    type="button"
                    className="admin-icon-action-btn edit"
                    title="Edit market hub"
                    onClick={() => {
                      setEditingId(m._id);
                      setForm({
                        name: m.name,
                        description: m.description || '',
                        address: m.location?.address || m.address || '',
                        city: m.location?.city || m.city || '',
                        marketDays: m.marketDays || ['Saturday', 'Sunday'],
                        openTime: m.openTime || '08:00 AM',
                        closeTime: m.closeTime || '02:00 PM',
                        pickupStartTime: m.pickupStartTime || '09:00 AM',
                        pickupEndTime: m.pickupEndTime || '01:00 PM',
                        isActive: m.isActive !== false,
                        isFeatured: Boolean(m.isFeatured),
                      });
                      setShowModal(true);
                    }}
                  >
                    <Edit size={14} /> Edit
                  </button>

                  <button
                    type="button"
                    className="admin-icon-action-btn delete"
                    title="Delete market location"
                    onClick={() => handleDelete(m._id, m.name)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  {editingId ? 'Edit Farmers Market Hub' : 'Create New Farmers Market Hub'}
                </h3>
                <p className="admin-modal-subtitle">
                  Configure location details, operating schedule, and pickup hours.
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Market Hub Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Hill Park Weekend Farmers Market"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Address / Landmark *</label>
                  <input
                    type="text"
                    placeholder="e.g. Block 6, PECHS Main Grounds"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="admin-form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Karachi, Lahore, Islamabad"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="admin-form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Active Market Days</label>
                <div className="days-selection-grid">
                  {ALL_DAYS.map((day) => {
                    const isSelected = form.marketDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        className={`day-toggle-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleDay(day)}
                      >
                        {isSelected && <Check size={12} />}
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Stall Open Time</label>
                  <input
                    type="text"
                    placeholder="08:00 AM"
                    value={form.openTime}
                    onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                    className="admin-form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stall Close Time</label>
                  <input
                    type="text"
                    placeholder="02:00 PM"
                    value={form.closeTime}
                    onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Pickup Start Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={form.pickupStartTime}
                    onChange={(e) => setForm({ ...form, pickupStartTime: e.target.value })}
                    className="admin-form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pickup End Time</label>
                  <input
                    type="text"
                    placeholder="01:00 PM"
                    value={form.pickupEndTime}
                    onChange={(e) => setForm({ ...form, pickupEndTime: e.target.value })}
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  <span> Feature this Market Station on Homepage</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span> Active (accepting pre-orders)</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-primary-btn"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Hub Details' : 'Create Market Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
