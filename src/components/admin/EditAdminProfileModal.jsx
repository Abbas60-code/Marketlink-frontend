import React, { useState } from 'react';
import {
  X,
  Camera,
  Check,
  User,
  Mail,
  Shield,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  Lock
} from 'lucide-react';
import { createPortal } from 'react-dom';
import './EditAdminProfileModal.css';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
];

export default function EditAdminProfileModal({
  isOpen,
  onClose,
  profile,
  onSave
}) {
  const [formData, setFormData] = useState({
    name: profile?.name || 'Cyndy Lillibridge',
    role: profile?.role || 'Super Admin',
    email: profile?.email || 'cyndy.admin@emart.com',
    phone: profile?.phone || '+1 (555) 382-9910',
    location: profile?.location || 'San Francisco, CA',
    bio: profile?.bio || 'Lead Operations & Platform Administrator at eMart Enterprise.',
    avatar: profile?.avatar || PRESET_AVATARS[0],
    password: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync form state whenever modal opens or profile changes
  React.useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || 'Cyndy Lillibridge',
        role: profile.role || 'Super Admin',
        email: profile.email || 'cyndy.admin@emart.com',
        phone: profile.phone || '+1 (555) 382-9910',
        location: profile.location || 'San Francisco, CA',
        bio: profile.bio || 'Lead Operations & Platform Administrator at eMart Enterprise.',
        avatar: profile.avatar || PRESET_AVATARS[0],
        password: ''
      });
      setSavedSuccess(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;


  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return createPortal(
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">

          <div className="admin-modal-title-group">
            <div className="modal-title-icon-box">
              <User size={18} />
            </div>
            <div>
              <h3>Edit Admin Profile</h3>
              <p>Manage your account credentials, avatar and details</p>
            </div>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="admin-modal-form">
          {/* Avatar Section */}
          <div className="modal-avatar-section">
            <div className="avatar-preview-container">
              <img
                src={formData.avatar}
                alt="Profile Preview"
                className="avatar-large-preview"
              />
              <div className="avatar-camera-overlay" title="Select from presets below">
                <Camera size={16} />
              </div>
            </div>

            <div className="avatar-picker-column">
              <span className="picker-label">Choose Avatar Preset:</span>
              <div className="preset-avatars-row">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`preset-thumb-btn ${formData.avatar === url ? 'selected' : ''}`}
                    onClick={() => handleChange('avatar', url)}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} />
                    {formData.avatar === url && (
                      <span className="preset-check-icon">
                        <Check size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="modal-fields-grid">
            {/* Full Name */}
            <div className="modal-form-group">
              <label>
                <User size={14} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            {/* Role / Designation */}
            <div className="modal-form-group">
              <label>
                <Shield size={14} />
                <span>Role Designation</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Customer Support Lead">Customer Support Lead</option>
                <option value="Inventory Analyst">Inventory Analyst</option>
              </select>
            </div>

            {/* Email */}
            <div className="modal-form-group">
              <label>
                <Mail size={14} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="admin@domain.com"
              />
            </div>

            {/* Phone */}
            <div className="modal-form-group">
              <label>
                <Phone size={14} />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Location */}
            <div className="modal-form-group">
              <label>
                <MapPin size={14} />
                <span>Office Location</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            {/* Password */}
            <div className="modal-form-group">
              <label>
                <Lock size={14} />
                <span>Update Password (Optional)</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Leave blank to keep unchanged"
              />
            </div>

            {/* Bio Note (Full width) */}
            <div className="modal-form-group full-width">
              <label>
                <FileText size={14} />
                <span>Bio / Administrator Note</span>
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Short bio or responsibility summary..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-modal-footer">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`modal-btn-save ${savedSuccess ? 'success' : ''}`}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
