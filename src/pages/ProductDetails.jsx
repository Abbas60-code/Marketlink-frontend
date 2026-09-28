import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Leaf, ShoppingCart, Heart, ShieldCheck, MapPin, Calendar,
  Clock, ArrowLeft, Star, Plus, Minus, CheckCircle, Store, Award,
  MessageSquare, User, Send, AlertCircle, Info, HandCoins
} from 'lucide-react';
import productService from '../services/productService.js';
import reviewService from '../services/reviewService.js';
import favoriteService from '../services/favoriteService.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast, PageLoader, EmptyState, formatCurrency } from '../components/shared/index.jsx';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [favorited, setFavorited] = useState(false);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.allSettled([
          productService.getProduct(id),
          reviewService.getProductReviews(id),
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
          const prodData = prodRes.value.data;
          setProduct(prodData);

          // Check favorite
          if (isAuthenticated) {
            try {
              const favRes = await favoriteService.getMyFavorites();
              if (favRes?.data) {
                const isFav = favRes.data.some(
                  (f) => f.itemType === 'product' && f.product && f.product._id === prodData._id
                );
                setFavorited(isFav);
              }
            } catch {}
          } else {
            const localFavs = favoriteService.getLocalFavorites();
            const isFav = localFavs.some(
              (f) => f.itemType === 'product' && (f.product?._id === prodData._id || f.itemId === prodData._id)
            );
            setFavorited(isFav);
          }
        }

        if (revRes.status === 'fulfilled' && revRes.value?.data) {
          setReviews(revRes.value.data);
        }
      } catch (err) {
        toast('Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id, isAuthenticated]);

  if (loading) return <PageLoader message="Loading fresh farm produce details..." />;

  if (!product) {
    return (
      <div className="container py-12">
        <EmptyState
          icon={Leaf}
          title="Produce Item Not Found"
          description="The harvest you are looking for is currently unavailable or has been unlisted."
          actionText="Return to Marketplace"
          actionLink="/products"
        />
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'];

  const farmer = product.farmer;
  const farmerName = farmer?.farmName || farmer?.user?.name || 'Local Organic Farm Stall';
  const market = product.market || farmer?.market;
  const maxStock = product.stock > 0 ? product.stock : 0;
  const isSoldOut = product.stock <= 0 || !product.isAvailable;

  const handleAddToCart = () => {
    if (isSoldOut) {
      toast('Item is sold out', 'error');
      return;
    }
    addToCart(product, quantity);
    toast(`Added ${quantity} ${product.unit || 'kg'} of "${product.name}" to your basket!`, 'success');
  };

  const handlePreOrderNow = () => {
    if (isSoldOut) {
      toast('Item is sold out', 'error');
      return;
    }
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      if (favorited) {
        favoriteService.removeLocalFavorite(product._id);
        setFavorited(false);
        toast('Removed from favorites', 'info');
      } else {
        favoriteService.saveLocalFavorite('product', product);
        setFavorited(true);
        toast('Saved to your favorites!', 'success');
      }
      return;
    }

    try {
      if (favorited) {
        await favoriteService.removeFavorite(product._id);
        setFavorited(false);
        toast('Removed from favorites', 'info');
      } else {
        await favoriteService.addFavorite('product', product._id);
        setFavorited(true);
        toast('Saved to your favorites!', 'success');
      }
    } catch {
      toast('Failed to update favorites', 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please login to write a review', 'info');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast('Please enter your review feedback', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewService.createReview({
        productId: product._id,
        farmerId: farmer?._id,
        rating: newRating,
        comment: newComment.trim(),
      });

      if (res?.success) {
        toast('Thank you! Your verified review has been submitted.', 'success');
        setReviews([res.data, ...reviews]);
        setNewComment('');
      }
    } catch (err) {
      toast(
        err.response?.data?.message || 'Reviews can only be submitted after receiving and completing an order for this produce.',
        'error'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="product-details-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="product-breadcrumb">
          <Link to="/"><ArrowLeft size={14} /> Home</Link>
          <span>/</span>
          <Link to="/products">Marketplace</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </div>

        {/* Main Product Details Layout */}
        <div className="product-details-grid">
          {/* Left: Images Gallery */}
          <div className="product-gallery">
            <div className="gallery-main-frame">
              <img src={images[selectedImage]} alt={product.name} />
              <div className="gallery-badges">
                {product.isOrganic && <span className="badge badge-green">Organic Certified</span>}
                {isSoldOut ? (
                  <span className="badge badge-red">Sold Out</span>
                ) : (
                  <span className="badge badge-blue">Market Pre-Order</span>
                )}
              </div>
              <button
                className={`fav-btn-floating ${favorited ? 'active' : ''}`}
                onClick={handleFavoriteToggle}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={20} fill={favorited ? 'currentColor' : 'none'} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="gallery-thumbs-row">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={imgUrl} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Ordering */}
          <div className="product-info-panel">
            <div className="product-meta-header">
              <span className="product-cat-label">{product.category?.name || 'Fresh Produce'}</span>
              {!isSoldOut ? (
                <span className="status-pill status-in-stock">
                  <CheckCircle size={14} /> In Stock ({product.stock} {product.unit || 'kg'} available)
                </span>
              ) : (
                <span className="status-pill status-out-of-stock">Sold Out</span>
              )}
            </div>

            <h1 className="product-main-title">{product.name}</h1>

            {/* Farmer Credit */}
            <div className="farmer-credit-box">
              <div className="farmer-avatar">
                <Leaf size={18} className="text-emerald-700" />
              </div>
              <div className="farmer-text">
                <span className="label">Grown by Local Family Farm</span>
                <span className="name">{farmerName}</span>
              </div>
              {farmer?._id && (
                <Link to={`/products?farmer=${farmer._id}`} className="view-farm-link">
                  View Stall Produce
                </Link>
              )}
            </div>

            {/* Price Box */}
            <div className="product-price-section">
              <div className="price-main">
                <span className="price-val">{formatCurrency(product.price)}</span>
                <span className="price-unit">per {product.unit || 'kg'}</span>
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="stock-hint low">
                  Hurry! Only <strong>{product.stock} {product.unit || 'kg'}</strong> remaining for next pickup.
                </span>
              )}
            </div>

            {/* Description */}
            <p className="product-full-desc">
              {product.description ||
                'Organically grown with zero synthetic pesticides. Harvested fresh from local farm beds for maximum flavor, crunch, and vitality.'}
            </p>

            {/* Pickup & Market Location Information */}
            {market && (
              <div className="product-pickup-info-card">
                <div className="pickup-info-row">
                  <Store size={16} className="text-emerald-600" />
                  <div>
                    <strong>Pickup Hub:</strong> {market.name}
                  </div>
                </div>
                {market.location?.address && (
                  <div className="pickup-info-row">
                    <MapPin size={16} className="text-emerald-600" />
                    <div>
                      <strong>Location:</strong> {market.location.address}{market.location.city ? `, ${market.location.city}` : ''}
                    </div>
                  </div>
                )}
                {market.marketDays?.length > 0 && (
                  <div className="pickup-info-row">
                    <Calendar size={16} className="text-emerald-600" />
                    <div>
                      <strong>Market Days:</strong> {market.marketDays.join(', ')}
                    </div>
                  </div>
                )}
                <div className="pickup-info-row">
                  <HandCoins size={16} className="text-emerald-600" />
                  <div>
                    <strong>Payment:</strong> In-person at stall upon pickup (Cash / Card)
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="ordering-actions-box">
              <div className="quantity-controls">
                <span className="qty-label">Quantity ({product.unit || 'kg'}):</span>
                <div className="qty-picker">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isSoldOut}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => {
                      if (quantity >= maxStock) {
                        toast(`Cannot add more. Available stock is ${maxStock}`, 'info');
                      } else {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={quantity >= maxStock || isSoldOut}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="buttons-group">
                <button
                  className="btn btn-secondary btn-lg flex-1"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                >
                  <ShoppingCart size={18} /> Add to Basket
                </button>
                <button
                  className="btn btn-primary btn-lg flex-1"
                  onClick={handlePreOrderNow}
                  disabled={isSoldOut}
                >
                  Pre-Order ({formatCurrency(product.price * quantity)})
                </button>
              </div>
            </div>

            {/* Trust Features Checklist */}
            <div className="trust-features-list">
              <div className="trust-feature-item">
                <Store size={18} className="text-emerald-600" />
                <div>
                  <strong>Farmers Market Pickup</strong>
                  <p>Collect directly from the grower at the local weekend market.</p>
                </div>
              </div>
              <div className="trust-feature-item">
                <Award size={18} className="text-emerald-600" />
                <div>
                  <strong>100% Quality & Freshness Guarantee</strong>
                  <p>Non-GMO and harvested on the morning of market day.</p>
                </div>
              </div>
              <div className="trust-feature-item">
                <ShieldCheck size={18} className="text-emerald-600" />
                <div>
                  <strong>Direct Farm Support</strong>
                  <p>100% of purchase goes directly to verified local farmers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Customer Reviews Section */}
        <div className="product-reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">
              <Star size={20} className="text-amber-500" /> Verified Customer Reviews ({reviews.length})
            </h2>
            {product.rating > 0 && (
              <div className="reviews-avg-box">
                <span className="avg-num">{product.rating.toFixed(1)}</span>
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= Math.round(product.rating) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span className="total-reviews">Based on {reviews.length} ratings</span>
              </div>
            )}
          </div>

          <div className="reviews-layout">
            {/* Reviews List */}
            <div className="reviews-list-column">
              {reviews.length === 0 ? (
                <div className="empty-reviews-card">
                  <MessageSquare size={32} className="text-gray-300" />
                  <p>No customer reviews yet. Be the first to review after picking up your order!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="review-card">
                    <div className="review-card-top">
                      <div className="review-customer-info">
                        <div className="review-avatar">
                          <User size={16} />
                        </div>
                        <div>
                          <span className="customer-name">{rev.customer?.name || 'Verified Buyer'}</span>
                          <span className="verified-buyer-tag">Verified Pickup</span>
                        </div>
                      </div>
                      <div className="review-rating-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#f59e0b' : 'none'}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="review-comment">{rev.comment}</p>

                    {/* Farmer Reply */}
                    {rev.reply?.comment && (
                      <div className="farmer-reply-box">
                        <span className="farmer-reply-author">Response from {farmerName}:</span>
                        <p className="farmer-reply-text">{rev.reply.comment}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Write Review Form */}
            <div className="review-form-column">
              <form onSubmit={handleSubmitReview} className="write-review-card">
                <h3 className="write-review-title">Rate & Review Produce</h3>
                <p className="write-review-notice">
                  <Info size={14} /> Note: Reviews are only accepted after you have received and completed an order for this produce.
                </p>

                <div className="form-group">
                  <label className="form-label">Your Rating:</label>
                  <div className="star-rating-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className="star-btn"
                        onClick={() => setNewRating(star)}
                      >
                        <Star
                          size={24}
                          fill={star <= newRating ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                        />
                      </button>
                    ))}
                    <span className="selected-rating-text">{newRating} / 5 Stars</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="review-comment">
                    Your Review & Experience:
                  </label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    placeholder="Describe freshness, taste, ripeness, or pickup experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="form-textarea"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary w-full"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
