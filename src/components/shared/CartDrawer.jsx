import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, PackageOpen } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cartItems, cartTotal, cartCount, drawerOpen, closeDrawer, removeFromCart, updateQty } = useCart();

  if (!drawerOpen) return null;

  return createPortal(
    <div className="notranslate" style={{ position: 'relative', zIndex: 999999 }}>
      {/* Backdrop */}
      <div className="cart-drawer-backdrop" onClick={closeDrawer} />

      {/* Drawer Panel */}
      <div className="cart-drawer-panel">
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(22,163,74,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingCart size={20} color="#16a34a" />
            </div>
            <div>
              <div className="cart-drawer-title">Your Produce Basket</div>
              <div className="cart-drawer-sub">{cartCount} item{cartCount !== 1 ? 's' : ''} added</div>
            </div>
          </div>
          <button onClick={closeDrawer} className="cart-drawer-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Items List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 14, padding: 32,
            }}>
              <PackageOpen size={56} color="#cbd5e1" />
              <div style={{ textAlign: 'center' }}>
                <div className="cart-drawer-title" style={{ marginBottom: 4 }}>Basket is empty</div>
                <div className="cart-drawer-sub">Add some fresh produce to get started!</div>
              </div>
              <Link
                to="/products"
                onClick={closeDrawer}
                style={{
                  marginTop: 8, padding: '11px 24px', background: '#16a34a', color: '#fff',
                  borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
                }}
              >
                Browse Products <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cartItems.map((item, idx) => (
                <div
                  key={item._id}
                  className="cart-item-row"
                  style={{
                    borderBottom: idx < cartItems.length - 1 ? undefined : 'none',
                    animation: 'cartItemIn 0.3s ease both',
                    animationDelay: `${idx * 40}ms`,
                  }}
                >
                  {/* Thumbnail */}
                  <div className="cart-item-thumb">
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}></div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price-unit">
                      Rs {item.price} / {item.unit || 'kg'}
                    </div>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => updateQty(item._id, item.cartQty - 1)}
                        className="cart-qty-btn"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="cart-qty-num">
                        {item.cartQty}
                      </span>
                      <button
                        onClick={() => updateQty(item._id, item.cartQty + 1)}
                        className="cart-qty-btn"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Price + Delete */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#16a34a' }}>
                      Rs {(item.price * item.cartQty).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#94a3b8', padding: 2,
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="cart-footer-subtotal-label">Subtotal</span>
              <span className="cart-footer-subtotal-val">
                Rs {cartTotal.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/cart"
                onClick={closeDrawer}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 20px', background: '#16a34a', color: '#fff',
                  borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
                  textDecoration: 'none', transition: 'all 0.18s ease',
                  boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                View Full Cart <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideCartDrawerIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes cartItemIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}


