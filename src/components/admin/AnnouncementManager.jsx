import React, { useState } from 'react';
import { Bell, Send, Megaphone, CheckCircle, Users, Radio, Sparkles, Smartphone, ShieldCheck, Leaf, Store } from 'lucide-react';
import notificationService from '../../services/notificationService.js';
import { useToast } from '../shared/index.jsx';

export default function AnnouncementManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState(''); // '' = all, 'user' = customers, 'farmer' = farmers
  const [priority, setPriority] = useState('normal'); // 'normal', 'urgent'
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast('Please enter announcement title and message', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await notificationService.createAnnouncement(title.trim(), message.trim(), targetRole);
      toast(res?.message || 'In-App Announcement broadcasted successfully!', 'success');
      setTitle('');
      setMessage('');
      setTargetRole('');
    } catch (err) {
      toast('Failed to broadcast announcement', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-section-container">
      {/* Page Header */}
      <div className="admin-page-hero">
        <div className="admin-page-hero__text">
          <div className="admin-badge-pill rose">
            <Radio size={14} /> Live Broadcast Center
          </div>
          <h1 className="admin-page-title">Platform Announcements &amp; In-App Alerts</h1>
          <p className="admin-page-subtitle">
            Push instantaneous notifications to mobile devices and customer desktops regarding weather updates, market schedules, or discounts.
          </p>
        </div>
      </div>

      {/* 2-Column Split: Form + Live Preview */}
      <div className="announcement-split-layout">
        {/* Left Column: Broadcast Composer */}
        <div className="announcement-composer-card">
          <div className="card-header-simple">
            <div className="composer-icon-badge">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="composer-title">Compose New Broadcast</h3>
              <p className="composer-sub">Dispatched to in-app notification centers immediately</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="announcement-form">
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <div className="audience-pill-grid">
                <button
                  type="button"
                  className={`audience-pill ${targetRole === '' ? 'active' : ''}`}
                  onClick={() => setTargetRole('')}
                >
                  <Users size={15} /> All Users
                </button>
                <button
                  type="button"
                  className={`audience-pill ${targetRole === 'user' ? 'active' : ''}`}
                  onClick={() => setTargetRole('user')}
                >
                  <Store size={15} /> Consumers Only
                </button>
                <button
                  type="button"
                  className={`audience-pill ${targetRole === 'farmer' ? 'active' : ''}`}
                  onClick={() => setTargetRole('farmer')}
                >
                  <Leaf size={15} /> Farmers Only
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Title *</label>
              <input
                type="text"
                placeholder="e.g. Weather Advisory: Weekend Stalls Relocated to Covered Pavilion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="admin-form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Content *</label>
              <textarea
                rows={5}
                placeholder="Write the detailed message that will appear in user notification popups and banners..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="admin-form-textarea"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="admin-primary-btn w-full"
              style={{ justifyContent: 'center', padding: '13px 24px', fontSize: '0.95rem' }}
            >
              <Send size={16} /> {sending ? 'Broadcasting to Users...' : 'Publish Announcement Now'}
            </button>
          </form>
        </div>

        {/* Right Column: Mobile & Desktop Live Preview */}
        <div className="announcement-preview-card">
          <div className="preview-card-header">
            <Smartphone size={16} /> Live In-App Notification Preview
          </div>

          <div className="preview-phone-mockup">
            <div className="phone-screen">
              <div className="phone-notch" />
              <div className="phone-app-header">
                <span>9:41</span>
                <span>MarketLink App</span>
                <span>100%</span>
              </div>

              {/* Notification Banner Preview */}
              <div className="phone-notification-bubble">
                <div className="notif-bubble-top">
                  <div className="notif-app-badge">
                    <Leaf size={12} /> MarketLink Alert
                  </div>
                  <span className="notif-time">Just now</span>
                </div>
                <strong className="notif-title">
                  {title || 'Announcement Title Preview'}
                </strong>
                <p className="notif-body">
                  {message || 'Your announcement message will render cleanly like this inside customer mobile alerts and desktop notification drawers.'}
                </p>
                <div className="notif-target-tag">
                  Target: {targetRole === 'user' ? ' Customers' : targetRole === 'farmer' ? ' Farmers' : ' All Platform Users'}
                </div>
              </div>

              <div className="phone-dummy-content">
                <div className="dummy-card" />
                <div className="dummy-card small" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
