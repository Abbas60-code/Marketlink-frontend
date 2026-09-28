import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight,
  MapPin, Store, Calendar, Clock, ShieldCheck, CheckCircle2, AlertCircle, Info, HandCoins
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import marketService from '../services/marketService.js';
import orderService from '../services/orderService.js';
import { useToast, EmptyState, formatCurrency } from '../components/shared/index.jsx';
import MarketMap from '../components/shared/MarketMap.jsx';
import StripeCheckout from '../components/shared/StripeCheckout.jsx';
import './Cart.css';

const DEFAULT_TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
];

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState(DEFAULT_TIME_SLOTS[0]);
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pickup'); // 'pickup' or 'stripe'
  const [showStripe, setShowStripe] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await marketService.getMarkets({ isActive: true });
        if (res?.data?.length) {
          setMarkets(res.data);
          // Set default to first market or cart item's market
          const firstItemMarket = cartItems[0]?.market?._id || cartItems[0]?.market;
          const matchedMarket = res.data.find(m => m._id === firstItemMarket);
          setSelectedMarketId(matchedMarket?._id || res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch pickup markets:', err);
      }
    };
    fetchMarkets();
  }, [cartItems]);

  // Set default pickup date to next available market day (e.g. tomorrow)
  useEffect(() => {
    if (!pickupDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPickupDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [pickupDate]);

  const selectedMarket = markets.find((m) => m._id === selectedMarketId);
  const totalQuantity = cartItems.reduce((sum, item) => sum + (Number(item.quantity || item.cartQty) || 1), 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please login or register to place your pre-order', 'info');
      navigate('/login?redirect=/cart');
      return;
    }

    if (cartItems.length === 0) {
      toast('Your basket is empty. Please add fresh produce first.', 'error');
      return;
    }

    if (!selectedMarketId) {
      toast('Please select a Farmers Market for pickup', 'error');
      return;
    }

    if (!pickupDate) {
      toast('Please select a pickup date', 'error');
      return;
    }

    if (!pickupTimeSlot) {
      toast('Please select a pickup time window', 'error');
      return;
    }

    // Stock verification
    for (const item of cartItems) {
      if (item.stock !== undefined && item.quantity > item.stock) {
        toast(`Only ${item.stock} ${item.unit || 'kg'} available for ${item.name}`, 'error');
        return;
      }
    }

    if (paymentMethod === 'stripe' && !showStripe) {
      setShowStripe(true);
      return;
    }

    submitOrder(e, { paymentStatus: paymentMethod === 'stripe' ? 'paid' : 'pending' });
  };

  const submitOrder = async (e, extraData = {}) => {
    if (e?.preventDefault) e.preventDefault();
    setPlacingOrder(true);
    try {
      const orderPayload = {
        market: selectedMarketId,
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: Number(item.quantity) || 1,
        })),
        pickupDate,
        pickupTimeSlot,
        customerNote,
        paymentMethod,
        ...extraData
      };

      const res = await orderService.placeOrder(orderPayload);
      if (res?.success && res?.data) {
        setOrderSuccess(res.data);
        clearCart();
        toast('Pre-order confirmed! See you at the market.', 'success');
      } else {
        toast(res?.message || 'Failed to place pre-order', 'error');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Error placing pre-order. Please try again.', 'error');
    } finally {
      setPlacingOrder(false);
      setShowStripe(false);
    }
  };

  const handleStripeSuccess = (paymentIntent) => {
    toast(`Payment successful! ID: ${paymentIntent.paymentId}`, 'success');
    submitOrder(null, { paymentStatus: 'paid', paymentId: paymentIntent.paymentId });
  };

  if (orderSuccess) {
    return (
      <div className="cart-page">
        <div className="container py-12">
        <div className="order-success-card">
          <div className="success-icon-circle">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <span className="order-success-badge">Pre-Order Confirmed</span>
          <h1 className="order-success-title">Thank You, {user?.name || 'Customer'}!</h1>
          <p className="order-success-lead">
            Your produce reservation <strong>#{orderSuccess.orderNumber}</strong> has been sent to our local growers.
          </p>

          <div className="order-pickup-summary-box">
            <div className="pickup-summary-row">
              <span className="pickup-summary-label"><Store size={16} /> Pickup Market:</span>
              <span className="pickup-summary-val">{orderSuccess.market?.name || selectedMarket?.name || 'Farmers Market Ground'}</span>
            </div>
            <div className="pickup-summary-row">
              <span className="pickup-summary-label"><Calendar size={16} /> Pickup Date:</span>
              <span className="pickup-summary-val">
                {new Date(orderSuccess.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="pickup-summary-row">
              <span className="pickup-summary-label"><Clock size={16} /> Time Window:</span>
              <span className="pickup-summary-val">{orderSuccess.pickupTimeSlot}</span>
            </div>
            <div className="pickup-summary-row">
              <span className="pickup-summary-label"><HandCoins size={16} /> Payment Method:</span>
              <span className="pickup-summary-val text-emerald-600 font-semibold">
                {orderSuccess.paymentMethod === 'stripe' ? 'Paid Online via Stripe' : 'Pay in Person at Pickup (Cash / Card)'}
              </span>
            </div>
            <div className="pickup-summary-row total-row">
              <span className="pickup-summary-label">Total Amount to Pay:</span>
              <span className="pickup-summary-val total-price">{formatCurrency(orderSuccess.totalAmount)}</span>
            </div>
          </div>

          <div className="pickup-reminder-alert">
            <Info size={18} />
            <span>
              <strong>Note:</strong> Payment is settled directly with the farmers when you collect your basket. Please arrive during your selected pickup window.
            </span>
          </div>

          <div className="order-success-actions">
            <Link to="/profile?tab=orders" className="btn btn-primary">
              View My Pre-Orders
            </Link>
            <Link to="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container py-8">
        <div className="cart-header">
          <h1 className="cart-title">Your Produce Basket</h1>
          <p className="cart-subtitle">
            Review your fresh farm selections and select your pickup point at the local weekend market.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your Basket is Empty"
            description="Explore our fresh harvest of organic vegetables, seasonal fruits, and dairy from verified local growers."
            actionText="Browse Fresh Produce"
            actionLink="/products"
          />
        ) : (
          <div className="cart-layout">
            {/* Left: Cart Items List */}
            <div className="cart-items-column">
              <div className="cart-card">
                <div className="cart-card-header">
                  <span className="cart-item-count">
                    {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in basket
                  </span>
                  <button onClick={clearCart} className="clear-cart-btn" title="Empty basket">
                    <Trash2 size={15} /> Clear All
                  </button>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const image = item.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80';
                    const maxStock = (item.stock !== undefined && item.stock !== null && !isNaN(item.stock)) ? Number(item.stock) : 99;
                    const itemQty = Number(item.quantity || item.cartQty) || 1;

                    return (
                      <div key={item._id} className="cart-item-row">
                        <img src={image} alt={item.name} className="cart-item-image" />

                        <div className="cart-item-details">
                          <div className="cart-item-top">
                            <Link to={`/products/${item._id}`} className="cart-item-name">
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="cart-item-remove-btn"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="cart-item-meta">
                            {item.farmer?.farmName && (
                              <span className="cart-item-farmer">
                                <Store size={13} /> {item.farmer.farmName}
                              </span>
                            )}
                            <span className="cart-item-unit-price">
                              {formatCurrency(item.price)} / {item.unit || 'kg'}
                            </span>
                            {item.stock !== undefined && (
                              <span className={`cart-item-stock-tag ${item.stock < 5 ? 'low' : ''}`}>
                                {item.stock > 0 ? `${item.stock} ${item.unit || 'kg'} left` : 'Out of stock'}
                              </span>
                            )}
                          </div>

                          <div className="cart-item-bottom">
                            <div className="quantity-stepper">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item._id, Math.max(1, itemQty - 1))}
                                disabled={itemQty <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="qty-number">{itemQty}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (itemQty >= maxStock) {
                                    toast(`Maximum available stock is ${maxStock} ${item.unit || 'kg'}`, 'info');
                                  } else {
                                    updateQuantity(item._id, itemQty + 1);
                                  }
                                }}
                                disabled={itemQty >= maxStock}
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="cart-item-subtotal">
                              <span className="subtotal-label">Subtotal:</span>
                              <span className="subtotal-amount">
                                {formatCurrency(item.price * itemQty)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-back-link-wrap">
                  <Link to="/products" className="cart-back-link">
                    <ArrowLeft size={16} /> Add more fresh harvest
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Market Pickup & Checkout Card */}
            <div className="cart-summary-column">
              <form onSubmit={handlePlaceOrder} className="checkout-card">
                <h2 className="checkout-card-title">Pre-Order & Pickup Details</h2>

                {/* Farmers Market Selection */}
                <div className="form-group">
                  <label htmlFor="market-select" className="form-label">
                    <Store size={15} /> Select Farmers Market:
                  </label>
                  <select
                    id="market-select"
                    value={selectedMarketId}
                    onChange={(e) => setSelectedMarketId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {markets.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.location?.city || m.location?.address || 'Market Ground'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Market Details Preview */}
                {selectedMarket && (
                  <div className="market-preview-box">
                    <p className="market-preview-address">
                      <MapPin size={14} /> {selectedMarket.location?.address || 'Community Market Area'}{selectedMarket.location?.city ? `, ${selectedMarket.location.city}` : ''}
                    </p>
                    <p className="market-preview-days">
                      <Calendar size={14} /> <strong>Operating Days:</strong> {selectedMarket.marketDays?.join(', ') || 'Saturday & Sunday'}
                    </p>

                    <div className="market-preview-map-wrap">
                      <MarketMap
                        locations={[selectedMarket]}
                        selectedLocation={selectedMarket}
                        height="200px"
                        title="Pickup Point Location & GPS Directions"
                        compact={true}
                      />
                    </div>
                  </div>
                )}

                {/* Pickup Date Picker */}
                <div className="form-group">
                  <label htmlFor="pickup-date" className="form-label">
                    <Calendar size={15} /> Select Pickup Date:
                  </label>
                  <input
                    type="date"
                    id="pickup-date"
                    value={pickupDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                {/* Pickup Time Slot */}
                <div className="form-group">
                  <label htmlFor="time-slot" className="form-label">
                    <Clock size={15} /> Select Pickup Window:
                  </label>
                  <select
                    id="time-slot"
                    value={pickupTimeSlot}
                    onChange={(e) => setPickupTimeSlot(e.target.value)}
                    className="form-select"
                    required
                  >
                    {DEFAULT_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Notes */}
                <div className="form-group">
                  <label htmlFor="order-note" className="form-label">
                    Special Instructions (Optional):
                  </label>
                  <textarea
                    id="order-note"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="e.g. Please select ripe avocados / packing instructions..."
                    rows={2}
                    className="form-textarea"
                  />
                </div>

                {/* Cost Breakdown */}
                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span>Produce Subtotal:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery / Shipping:</span>
                    <span className="free-badge">Rs 0 (Market Pickup)</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total Payment at Pickup:</span>
                    <span className="grand-total">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label"><HandCoins size={15} /> Payment Method:</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="pickup" 
                        checked={paymentMethod === 'pickup'} 
                        onChange={() => { setPaymentMethod('pickup'); setShowStripe(false); }} 
                      />
                      Pay at Pickup (Cash)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="stripe" 
                        checked={paymentMethod === 'stripe'} 
                        onChange={() => setPaymentMethod('stripe')} 
                      />
                      Pay Online (Stripe)
                    </label>
                  </div>
                </div>

                {/* Payment Notice */}
                {paymentMethod === 'pickup' && !showStripe && (
                  <div className="payment-notice-box" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <HandCoins size={18} className="text-emerald-600" style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>No Online Payment Required:</strong>
                      <p style={{ margin: 0, color: '#475569' }}>Pay cash or card in person at the farmer's stall when picking up your fresh produce.</p>
                    </div>
                  </div>
                )}

                {/* Stripe Checkout Form */}
                {showStripe && paymentMethod === 'stripe' ? (
                  <StripeCheckout 
                    amount={cartTotal} 
                    onSuccess={handleStripeSuccess} 
                    onCancel={() => setShowStripe(false)} 
                  />
                ) : (
                  <button
                    type="submit"
                    disabled={placingOrder || cartItems.length === 0}
                    className="btn btn-primary w-full checkout-submit-btn"
                  >
                    {placingOrder ? (
                      'Processing...'
                    ) : (
                      <>
                        {paymentMethod === 'stripe' ? 'Proceed to Secure Payment' : 'Confirm Pre-Order'} <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
