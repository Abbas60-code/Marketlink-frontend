import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Sparkles,
  RotateCcw,
  Upload,
  AlertCircle
} from 'lucide-react';
import bannerService from '../../services/bannerService.js';

const PRESET_IMAGES = [
  { label: 'Electronics', url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Fashion', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Watches', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Super Sale', url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80' }
];

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPlacement, setFilterPlacement] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    placement: 'Main Home Slider',
    category: 'main',
    link: '',
    imageUrl: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Fetch banners from backend
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerService.getAllBanners();
      if (res?.data) {
        setBanners(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load banners:', err);
      setLoading(false);
      showToast('error', err.customMessage || 'Failed to fetch banners from server');
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBanner(null);
    setImageFile(null);
    setPreviewUrl(PRESET_IMAGES[0].url);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      placement: 'Main Home Slider',
      category: 'main',
      link: '',
      imageUrl: PRESET_IMAGES[0].url,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setImageFile(null);
    setPreviewUrl(banner.image?.url || banner.imageUrl || '');
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      placement: banner.category === 'main' ? 'Main Home Slider' : 'Category Banner',
      category: banner.category || 'main',
      link: banner.link || '',
      imageUrl: banner.image?.url || '',
      isActive: banner.isActive !== false,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setImageFile(null);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Save Banner (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Please enter banner title');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title.trim());
      dataToSend.append('subtitle', formData.subtitle.trim());
      dataToSend.append('description', formData.description.trim());
      dataToSend.append('category', formData.category || 'main');
      dataToSend.append('link', formData.link.trim());
      dataToSend.append('isActive', formData.isActive);

      if (imageFile) {
        dataToSend.append('image', imageFile);
      } else if (formData.imageUrl) {
        dataToSend.append('imageUrl', formData.imageUrl);
      }

      if (editingBanner) {
        // Update
        await bannerService.updateBanner(editingBanner._id, dataToSend);
        showToast('success', 'Banner updated successfully!');
      } else {
        // Create
        await bannerService.createBanner(dataToSend);
        showToast('success', 'Banner created and published!');
      }

      setSaving(false);
      handleCloseModal();
      fetchBanners();
    } catch (err) {
      setSaving(false);
      showToast('error', err.customMessage || err.response?.data?.message || 'Error saving banner');
    }
  };

  // Delete Banner
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerService.deleteBanner(id);
        showToast('success', 'Banner deleted successfully!');
        setBanners((prev) => prev.filter((b) => b._id !== id));
      } catch (err) {
        showToast('error', err.customMessage || 'Failed to delete banner');
      }
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id) => {
    try {
      const res = await bannerService.toggleBannerStatus(id);
      showToast('success', res.message || 'Banner status updated');
      setBanners((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch (err) {
      showToast('error', err.customMessage || 'Failed to update status');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterPlacement('All');
    setSortBy('newest');
  };

  const isFiltered =
    searchQuery !== '' || filterStatus !== 'All' || filterPlacement !== 'All' || sortBy !== 'newest';

  // Filter & Search & Sort
  const filteredBanners = banners
    .filter((banner) => {
      const matchesSearch =
        (banner.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (banner.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (banner.link || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Active' ? banner.isActive : !banner.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

  return (
    <div className="banner-manager-container">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: toastMsg.type === 'success' ? '#065f46' : '#991b1b',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Page Hero Header */}
      <div className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-tag">
            <Sparkles size={13} />
            <span>Storefront Visual Marketing</span>
          </div>
          <h2>Hero Banners & Promotions</h2>
          <p>Control dynamic homepage hero slides, campaign promotions, and seasonal market announcements.</p>
        </div>
        <div className="admin-page-hero-actions">
          <button className="admin-btn admin-btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="admin-stats-summary">
        <div className="summary-stat-pill">
          <span className="summary-stat-val">{banners.length}</span>
          <span className="summary-stat-lbl">Total Banners</span>
        </div>
        <div className="summary-stat-pill">
          <span className="summary-stat-val" style={{ color: '#10b981' }}>
            {banners.filter((b) => b.isActive).length}
          </span>
          <span className="summary-stat-lbl">Live on Store</span>
        </div>
        <div className="summary-stat-pill">
          <span className="summary-stat-val" style={{ color: '#0284c7' }}>
            {banners.filter((b) => b.category === 'main').length}
          </span>
          <span className="summary-stat-lbl">Main Hero Slider</span>
        </div>
        <div className="summary-stat-pill">
          <span className="summary-stat-val" style={{ color: '#8b5cf6' }}>
            {banners.filter((b) => b.category !== 'main').length}
          </span>
          <span className="summary-stat-lbl">Category / Promo</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search banner title, subtitle, or link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="admin-filter-pills">
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              className={`filter-pill-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
              <span className="count">
                {status === 'All'
                  ? banners.length
                  : banners.filter((b) => (status === 'Active' ? b.isActive : !b.isActive)).length}
              </span>
            </button>
          ))}
        </div>

        <div className="admin-toolbar-actions">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="banner-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="banner-reset-btn"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <p>Loading banners from backend...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="empty-banners-box">
          <ImageIcon size={44} color="#94a3b8" />
          <h4>No Banners Found in Database</h4>
          <p>Click "Add New Banner" above to create and upload banners to Cloudinary.</p>
        </div>
      ) : (
        <div className="banners-grid">
          {filteredBanners.map((banner) => {
            const imgUrl = banner.image?.url || banner.imageUrl || PRESET_IMAGES[0].url;
            return (
              <div key={banner._id} className="banner-card">
                <div className="banner-img-wrapper">
                  <img src={imgUrl} alt={banner.title} className="banner-img" />
                  <div className="banner-img-overlay">
                    <span
                      className={`banner-status-badge ${
                        banner.isActive ? 'active' : 'inactive'
                      }`}
                    >
                      {banner.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="banner-placement-badge">
                      {banner.category || 'main'}
                    </span>
                  </div>
                </div>

                <div className="banner-body">
                  <h4 className="banner-title">{banner.title}</h4>
                  {banner.subtitle && (
                    <p className="banner-subtitle">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="banner-meta">
                    <div className="banner-link-row">
                      <ExternalLink size={13} />
                      <span>{banner.link || '#'}</span>
                    </div>
                    <span className="banner-date">
                      {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <div className="banner-card-actions">
                    <button
                      className={`status-toggle-btn ${banner.isActive ? 'is-active' : ''}`}
                      onClick={() => handleToggleStatus(banner._id)}
                      title="Toggle active status"
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="icon-btn-group">
                      <button
                        className="action-icon-btn edit"
                        onClick={() => handleOpenEdit(banner)}
                        title="Edit banner"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="action-icon-btn delete"
                        onClick={() => handleDelete(banner._id)}
                        title="Delete banner"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create / Edit Banner */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={handleCloseModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h3>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-body">
              {/* Title */}
              <div className="form-group">
                <label>Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Spring Deals 50% Off"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Subtitle / Tag */}
              <div className="form-group">
                <label>Subtitle / Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive Weekend Drop"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              {/* Category Placement & Status */}
              <div className="form-row">
                <div className="form-group">
                  <label>Category Placement</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="main">Main Hero Slider</option>
                    <option value="promo">Promo Banner</option>
                    <option value="electronics">Electronics Banner</option>
                    <option value="fashion">Fashion Banner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.value === 'true' })
                    }
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Target Link */}
              <div className="form-group">
                <label>Target URL / Route Link</label>
                <input
                  type="text"
                  placeholder="e.g. /#trending or /category/electronics"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              {/* Upload Image File or Enter URL */}
              <div className="form-group">
                <label>Upload Banner Image (Cloudinary) or Enter URL</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 14px',
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={15} />
                    <span>{imageFile ? imageFile.name : 'Choose Image File'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>or</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setPreviewUrl(e.target.value);
                      setImageFile(null);
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Quick Preset Image Selectors */}
              <div className="preset-images-group">
                <span className="preset-label">Or pick a sample preset image:</span>
                <div className="preset-badges">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-btn"
                      onClick={() => {
                        setFormData({ ...formData, imageUrl: preset.url });
                        setPreviewUrl(preset.url);
                        setImageFile(null);
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image live preview */}
              {previewUrl && (
                <div className="modal-img-preview">
                  <span>Image Preview:</span>
                  <img src={previewUrl} alt="Banner Preview" />
                </div>
              )}

              {/* Modal Actions */}
              <div className="admin-modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? 'Saving to Database...' : editingBanner ? 'Update Banner' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
