import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

/* ── Toast Context ──────────────────────────────────────────────── */
import { createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' && <CheckCircle2 size={18} color="var(--green-600)" />}
              {t.type === 'error' && <XCircle size={18} color="var(--red-500)" />}
              {t.type === 'info' && <Info size={18} color="var(--blue-500)" />}
            </span>
            <span className="toast-msg">{t.msg}</span>
            <button className="toast-close" onClick={() => remove(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

/* ── Skeleton Loading ────────────────────────────────────────────── */
export function SkeletonCard({ height = 300 }) {
  return (
    <div className="skeleton" style={{ height, borderRadius: 'var(--radius-lg)' }} />
  );
}

/* ── Empty State ─────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {Icon && <Icon size={36} />}
      </div>
      <div className="empty-state__title">{title}</div>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

/* ── Page Loader ─────────────────────────────────────────────────── */
export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );
}

/* ── Star Rating ─────────────────────────────────────────────────── */
export function StarRating({ rating = 0, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(rating) ? 'var(--gold-500)' : 'var(--gray-200)'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ── Status Badge ────────────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const map = {
    pending:   'status-pending',
    confirmed: 'status-confirmed',
    ready:     'status-ready',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  };
  return (
    <span className={`status-pill ${map[status] || 'status-pending'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

/* ── Availability Badge ─────────────────────────────────────────── */
export function AvailabilityBadge({ available, stock }) {
  if (!available || stock === 0) {
    return <span className="badge badge-red">Out of Stock</span>;
  }
  if (stock <= 5) {
    return <span className="badge badge-gold">Low Stock ({stock} left)</span>;
  }
  return <span className="badge badge-green">In Stock</span>;
}

/* ── Section Header ─────────────────────────────────────────────── */
export function SectionHeader({ title, subtitle, link, linkText = 'View All' }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {link && (
        <a href={link} className="view-all-link">
          {linkText}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      )}
    </div>
  );
}

/* ── Format Currency (PKR) ──────────────────────────────────────── */
export function formatCurrency(amount) {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
}

/* ── Format Date ─────────────────────────────────────────────────── */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ── Re-export composite widgets ─────────────────────────────────── */
export { default as MarketMap } from './MarketMap.jsx';
export { default as CartDrawer } from './CartDrawer.jsx';
export { default as LocationPermissionModal } from './LocationPermissionModal.jsx';
