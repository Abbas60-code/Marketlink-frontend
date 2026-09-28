import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, CheckCircle, XCircle, Search, RefreshCw, Quote, User, Leaf, Calendar, Eye, EyeOff } from 'lucide-react';
import reviewService from '../../services/reviewService.js';
import { useToast, SkeletonCard, EmptyState } from '../shared/index.jsx';

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterApproved, setFilterApproved] = useState('all'); // 'all', 'approved', 'hidden'
  const toast = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAllReviewsAdmin();
      setReviews(res?.data || []);
    } catch (err) {
      toast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await reviewService.moderateReview(id, newStatus);
      toast(`Review visibility updated to ${newStatus ? 'Publicly Approved' : 'Hidden from Storefront'}`, 'success');
      setReviews(reviews.map((r) => (r._id === id ? { ...r, isApproved: newStatus } : r)));
    } catch (err) {
      toast('Failed to moderate review', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      await reviewService.deleteReview(id);
      toast('Review removed permanently', 'info');
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err) {
      toast('Failed to delete review', 'error');
    }
  };

  const filtered = reviews.filter((r) => {
    if (!r) return false;
    const q = search ? search.toLowerCase().trim() : '';
    const matchesSearch =
      !q ||
      (r.comment || '').toLowerCase().includes(q) ||
      (r.customer?.name || '').toLowerCase().includes(q) ||
      (r.customer?.email || '').toLowerCase().includes(q) ||
      (r.farmer?.farmName || '').toLowerCase().includes(q) ||
      (r.product?.name || '').toLowerCase().includes(q) ||
      (r.rating != null && String(r.rating).includes(q));

    if (filterApproved === 'approved') return matchesSearch && Boolean(r.isApproved);
    if (filterApproved === 'hidden') return matchesSearch && !r.isApproved;
    return matchesSearch;
  });

  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const hiddenCount = reviews.length - approvedCount;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="admin-section-container">
      {/* Page Header */}
      <div className="admin-page-hero">
        <div className="admin-page-hero__text">
          <div className="admin-badge-pill amber">
            <Star size={14} /> Quality &amp; Feedback Moderation
          </div>
          <h1 className="admin-page-title">Review &amp; Rating Moderation</h1>
          <p className="admin-page-subtitle">
            Inspect authentic verified consumer feedback left for local farmers and seasonal organic produce.
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="admin-hero-stats">
          <div className="hero-stat-box">
            <span className="hero-stat-label">Platform Rating</span>
            <span className="hero-stat-val text-amber"> {avgRating}</span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-label">Published</span>
            <span className="hero-stat-val text-emerald">{loading ? '…' : approvedCount}</span>
          </div>
          {hiddenCount > 0 && (
            <div className="hero-stat-box">
              <span className="hero-stat-label">Under Review</span>
              <span className="hero-stat-val text-rose">{loading ? '…' : hiddenCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by feedback comment, customer, farm or product..."
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
              className={`filter-pill-btn ${filterApproved === 'all' ? 'active' : ''}`}
              onClick={() => setFilterApproved('all')}
            >
              All ({reviews.length})
            </button>
            <button
              className={`filter-pill-btn ${filterApproved === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterApproved('approved')}
            >
               Published ({approvedCount})
            </button>
            <button
              className={`filter-pill-btn ${filterApproved === 'hidden' ? 'active' : ''}`}
              onClick={() => setFilterApproved('hidden')}
            >
               Hidden ({hiddenCount})
            </button>
          </div>

          <button className="admin-refresh-btn" onClick={fetchReviews} title="Refresh reviews">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Reviews Grid Content */}
      {loading ? (
        <div className="admin-reviews-grid">
          {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} height={220} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-card">
          <EmptyState
            icon={MessageSquare}
            title="No Reviews Found"
            description={search ? `No customer reviews matched "${search}".` : "No customer feedback submitted yet."}
          />
        </div>
      ) : (
        <div className="admin-reviews-grid">
          {filtered.map((r) => {
            const isApproved = Boolean(r.isApproved);
            return (
              <div key={r._id} className={`admin-review-card ${!isApproved ? 'review-hidden' : ''}`}>
                <div className="review-card-top">
                  <div className="stars-rating-wrap">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        fill={i < (r.rating || 5) ? '#f59e0b' : 'none'}
                        color={i < (r.rating || 5) ? '#f59e0b' : '#cbd5e1'}
                      />
                    ))}
                    <span className="rating-num-tag">{r.rating || 5}.0</span>
                  </div>

                  <span className={`status-badge-glow ${isApproved ? 'active' : 'suspended'}`}>
                    <span className="status-dot" />
                    {isApproved ? 'Published' : 'Hidden'}
                  </span>
                </div>

                <div className="review-quote-body">
                  <Quote size={18} className="quote-icon-watermark" />
                  <p className="review-text-content">"{r.comment || 'Great organic produce quality!'}"</p>
                </div>

                <div className="review-author-row">
                  <div className="author-info-group">
                    <span className="author-name">
                      <User size={13} /> {r.customer?.name || 'Verified Shopper'}
                    </span>
                    <span className="review-target-chip">
                      <Leaf size={11} /> For: {r.farmer?.farmName || r.product?.name || 'Organic Produce'}
                    </span>
                  </div>

                  <span className="review-date-tag">
                    <Calendar size={11} />
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </span>
                </div>

                {r.reply?.comment && (
                  <div className="farmer-reply-box">
                    <strong className="reply-title"> Farmer Response:</strong>
                    <p className="reply-text">"{r.reply.comment}"</p>
                  </div>
                )}

                <div className="review-card-actions">
                  <button
                    type="button"
                    className={`admin-toggle-status-btn ${isApproved ? 'deactivate' : 'activate'}`}
                    onClick={() => handleModerate(r._id, isApproved)}
                    title={isApproved ? 'Hide review from public store' : 'Approve and publish review'}
                  >
                    {isApproved ? (
                      <>
                        <EyeOff size={13} /> Hide
                      </>
                    ) : (
                      <>
                        <Eye size={13} /> Publish
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="admin-icon-action-btn delete"
                    onClick={() => handleDelete(r._id)}
                    title="Delete review permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
