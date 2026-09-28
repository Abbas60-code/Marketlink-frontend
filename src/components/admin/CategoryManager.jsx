import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Sparkles,
  RotateCcw,
  Upload,
  AlertCircle,
  Star,
  FolderTree
} from 'lucide-react';
import categoryService from '../../services/categoryService.js';
import './CategoryManager.css';

const PRESET_CAT_IMAGES = [
  { label: ' Fresh Vegetables', name: 'Fresh Vegetables', description: 'Farm fresh organic vegetables, leafy greens, root crops and fresh herbs', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80' },
  { label: ' Organic Fruits', name: 'Organic Fruits', description: 'Seasonal orchard fresh organic fruits, berries, apples and citrus', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' },
  { label: ' Dairy & Farm Eggs', name: 'Dairy & Eggs', description: 'Pasture-raised organic eggs, fresh farm milk, butter and artisan cheese', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80' },
  { label: ' Artisan Goods & Honey', name: 'Artisan Goods & Honey', description: 'Pure raw wildflower honey, artisan jams, preserves, and handcrafted items', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80' },
  { label: ' Bakery & Grains', name: 'Bakery & Grains', description: 'Freshly baked sourdough breads, pastries, grains and organic flours', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80' },
  { label: ' Herbs & Spices', name: 'Herbs & Spices', description: 'Fresh culinary herbs, dried spices, herbal teas and organic seasonings', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' },
  { label: ' Cold-Pressed Juices', name: 'Cold-Pressed Juices', description: 'Raw cold-pressed juices, kombucha and farm-fresh organic beverages', url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pantry & Preserves', name: 'Pantry & Preserves', description: 'Organic canned goods, pickles, sauces and cold-pressed oils', url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop&q=80' },
];

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    parentCategory: '',
    isActive: true,
    isFeatured: false,
    position: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      if (res?.data) {
        setCategories(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setLoading(false);
      showToast('error', err.customMessage || 'Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setImageFile(null);
    setPreviewUrl(PRESET_CAT_IMAGES[0].url);
    setFormData({
      name: '',
      description: '',
      imageUrl: PRESET_CAT_IMAGES[0].url,
      parentCategory: '',
      isActive: true,
      isFeatured: false,
      position: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setImageFile(null);
    setPreviewUrl(category.image?.url || '');
    setFormData({
      name: category.name || '',
      description: category.description || '',
      imageUrl: category.image?.url || '',
      parentCategory: category.parentCategory?._id || category.parentCategory || '',
      isActive: category.isActive !== false,
      isFeatured: category.isFeatured === true,
      position: category.position || 0,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
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

  // Save Category (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name.trim());
      dataToSend.append('description', formData.description.trim());
      dataToSend.append('isActive', formData.isActive);
      dataToSend.append('isFeatured', formData.isFeatured);
      dataToSend.append('position', formData.position);

      if (formData.parentCategory) {
        dataToSend.append('parentCategory', formData.parentCategory);
      }

      if (imageFile) {
        dataToSend.append('image', imageFile);
      } else if (formData.imageUrl) {
        dataToSend.append('imageUrl', formData.imageUrl);
      }

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, dataToSend);
        showToast('success', 'Category updated successfully!');
      } else {
        await categoryService.createCategory(dataToSend);
        showToast('success', 'Category created successfully!');
      }

      setSaving(false);
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      setSaving(false);
      showToast('error', err.customMessage || err.response?.data?.message || 'Error saving category');
    }
  };

  // Delete Category
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        showToast('success', 'Category deleted successfully!');
        setCategories((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        showToast('error', err.customMessage || 'Failed to delete category');
      }
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (id) => {
    try {
      const res = await categoryService.toggleCategoryStatus(id);
      showToast('success', res.message || 'Category status updated');
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      showToast('error', err.customMessage || 'Failed to toggle status');
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (id) => {
    try {
      const res = await categoryService.toggleFeaturedStatus(id);
      showToast('success', res.message || 'Category featured status updated');
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isFeatured: !c.isFeatured } : c))
      );
    } catch (err) {
      showToast('error', err.customMessage || 'Failed to toggle featured');
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' ? cat.isActive : !cat.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="category-manager-container">
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
            <FolderTree size={13} />
            <span>Product Taxonomy & Hierarchy</span>
          </div>
          <h2>Catalog Categories</h2>
          <p>Organize organic harvest produce, artisan goods, and bakery items into customer-facing departments.</p>
        </div>
        <div className="admin-page-hero-actions">
          <button className="admin-btn admin-btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="admin-stats-summary">
        <div className="summary-stat-pill">
          <span className="summary-stat-val">{categories.length}</span>
          <span className="summary-stat-lbl">Total Categories</span>
        </div>
        <div className="summary-stat-pill">
          <span className="summary-stat-val" style={{ color: '#10b981' }}>
            {categories.filter((c) => c.isActive).length}
          </span>
          <span className="summary-stat-lbl">Active & Live</span>
        </div>
        <div className="summary-stat-pill">
          <span className="summary-stat-val" style={{ color: '#f59e0b' }}>
            {categories.filter((c) => c.isFeatured).length}
          </span>
          <span className="summary-stat-lbl">Featured Showcases</span>
        </div>
        <div className="summary-stat-pill">
          <span className="summary-stat-val" style={{ color: '#ef4444' }}>
            {categories.filter((c) => !c.isActive).length}
          </span>
          <span className="summary-stat-lbl">Draft / Hidden</span>
        </div>
      </div>

      {/* Modern Toolbar Card */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search category name, description, or slug..."
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
                  ? categories.length
                  : categories.filter((c) => (status === 'Active' ? c.isActive : !c.isActive)).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <p>Loading categories from backend database...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-banners-box">
          <FolderTree size={44} color="#94a3b8" />
          <h4>No Categories in Database</h4>
          <p>Click "Add New Category" above to create product categories.</p>
        </div>
      ) : (
        <div className="categories-admin-grid">
          {filteredCategories.map((cat) => {
            const imgUrl = cat.image?.url || PRESET_CAT_IMAGES[0].url;
            return (
              <div key={cat._id} className="category-admin-card">
                <div className="category-admin-thumb">
                  <img src={imgUrl} alt={cat.name} />
                  <div className="category-badge-group">
                    <span className={`badge-status ${cat.isActive ? 'active' : 'inactive'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {cat.isFeatured && (
                      <span className="badge-featured">
                        <Star size={10} fill="#fff" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="category-admin-body">
                  <div>
                    <h3 className="category-card-name">{cat.name}</h3>
                    <p className="category-card-desc">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <div className="category-card-meta">
                      <span>Slug: <strong>/{cat.slug}</strong></span>
                      {cat.parentCategory && (
                        <span>Parent: {cat.parentCategory?.name || 'Subcategory'}</span>
                      )}
                    </div>

                    <div className="category-actions-bar">
                      <button
                        className={`cat-toggle-btn ${cat.isActive ? 'is-active' : 'not-active'}`}
                        onClick={() => handleToggleStatus(cat._id)}
                      >
                        {cat.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        className="cat-featured-btn"
                        onClick={() => handleToggleFeatured(cat._id)}
                        title="Toggle featured showcase"
                      >
                        <Star size={13} fill={cat.isFeatured ? '#f59e0b' : 'none'} color="#d97706" />
                        <span>{cat.isFeatured ? 'Featured' : 'Feature'}</span>
                      </button>

                      <div className="icon-btn-group">
                        <button
                          className="action-icon-btn edit"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit category"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="action-icon-btn delete"
                          onClick={() => handleDelete(cat._id)}
                          title="Delete category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create / Edit Category */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Category Dropdown Selection */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FolderTree size={15} color="#10b981" />
                  <span>Select Category from Dropdown</span>
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    const found = PRESET_CAT_IMAGES.find((p) => p.name === selectedVal || p.label === selectedVal);
                    if (found) {
                      setFormData({
                        ...formData,
                        name: found.name,
                        description: found.description || formData.description,
                        imageUrl: found.url,
                      });
                      setPreviewUrl(found.url);
                      setImageFile(null);
                    } else {
                      setFormData({ ...formData, name: selectedVal });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    color: 'var(--text-main, #0f172a)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="" disabled>-- Select a Standard Category --</option>
                  {PRESET_CAT_IMAGES.map((cat, idx) => (
                    <option key={idx} value={cat.name}>
                      {cat.label}
                    </option>
                  ))}
                  <option value="Custom">️ Custom Category (Type manually below)...</option>
                </select>
              </div>

              {/* Category Name Input */}
              <div className="form-group">
                <label>Category Name (or Edit Selected)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Organic Vegetables"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Brief summary of products in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: 70,
                    padding: 10,
                    borderRadius: 8,
                    border: '1.5px solid #e2e8f0',
                    outline: 'none',
                    fontSize: '0.86rem',
                  }}
                />
              </div>

              {/* Parent Category & Status */}
              <div className="form-row">
                <div className="form-group">
                  <label>Parent Category (Optional)</label>
                  <select
                    value={formData.parentCategory}
                    onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  >
                    <option value="">None (Top-Level Category)</option>
                    {categories
                      .filter((c) => !editingCategory || c._id !== editingCategory._id)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
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
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Featured & Position */}
              <div className="form-row">
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({ ...formData, isFeatured: e.target.checked })
                      }
                    />
                    <span>Highlight as Featured Category</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Sort Position</label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Upload Image or URL */}
              <div className="form-group">
                <label>Category Image (Cloudinary or URL)</label>
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
                    <span>{imageFile ? imageFile.name : 'Choose File'}</span>
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
                    placeholder="https://..."
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

              {/* Presets */}
              <div className="preset-images-group">
                <span className="preset-label">Pick a preset image:</span>
                <div className="preset-badges">
                  {PRESET_CAT_IMAGES.map((preset, idx) => (
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

              {/* Image Preview */}
              {previewUrl && (
                <div className="modal-img-preview">
                  <span>Image Preview:</span>
                  <img src={previewUrl} alt="Category Preview" />
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
