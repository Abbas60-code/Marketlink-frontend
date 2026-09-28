import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ShoppingBag, Leaf, ArrowRight,
  Clock, Calendar, Star, ShoppingCart, Heart, ChevronRight, ChevronLeft, Truck, ShieldCheck, Users, CheckCircle2, Award
} from 'lucide-react';
import categoryService from '../services/categoryService.js';
import productService from '../services/productService.js';
import marketService from '../services/marketService.js';
import farmerService from '../services/farmerService.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastProvider, useToast, SectionHeader, PageLoader, EmptyState, formatCurrency, SkeletonCard } from '../components/shared/index.jsx';
import NearbyMap from '../components/NearbyMap.jsx';
import './Home.css';

/* ── Hero Banner Slides (Using Public Images) ────────────────── */
const HERO_SLIDES = [
  {
    image: '/dan-meyers-IQVFVH0ajag-unsplash.jpg',
    tag: 'MarketLink — eGreen Basket Platform',
    title: <>Farm-Fresh Produce<br /><span>Direct From Local Growers</span></>,
    desc: 'Pre-order 100% certified organic fruits, fresh harvest vegetables, and artisanal goods from nearby local farms. Collect at your local weekend farmers market or get home delivery!',
  },
  {
    image: '/land-o-lakes-inc-DdcWKBbJeEI-unsplash.jpg',
    tag: 'Sustainable Family Agriculture',
    title: <>Direct From Fields<br /><span>Straight To Your Kitchen</span></>,
    desc: 'Empowering local smallholder farmers. Enjoy transparent, non-GMO organic produce grown with care for your health and earth.',
  },
  {
    image: '/reba-spike-elcVuEs24Bc-unsplash.jpg',
    tag: 'Weekend Farmers Market Hubs',
    title: <>Pre-Order Online &<br /><span>Collect At Nearby Hubs</span></>,
    desc: 'Skip the long morning crowds. Reserve your fresh fruit and vegetable baskets online for fast weekend pickup.',
  },
  {
    image: '/zoe-richardson-D_VjFp1ds1Y-unsplash.jpg',
    tag: '100% Certified Organic Harvest',
    title: <>Nourish Your Family With<br /><span>Clean Organic Harvest</span></>,
    desc: 'Freshly plucked berries, heirloom tomatoes, cold-pressed juices, and pasture-raised dairy items available daily.',
  },
];

/* ── Category Icons mapping (emoji fallback) ─────────────────── */
const CATEGORY_ICONS = {
  vegetables: '', fruits: '', dairy: '', grains: '',
  herbs: '', meat: '', eggs: '', honey: '',
  default: '',
};

function getCatIcon(name = '') {
  const key = name.toLowerCase().replace(/\s+/g, '');
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return CATEGORY_ICONS.default;
}

/* ── Product Card ─────────────────────────────────────────────── */
function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [favorited, setFavorited] = useState(() => {
    const favs = JSON.parse(localStorage.getItem('ml_favorites') || '[]');
    return favs.includes(product._id);
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast(`${product.name} added to cart!`, 'success');
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('ml_favorites') || '[]');
    const updated = favorited ? favs.filter((id) => id !== product._id) : [...favs, product._id];
    localStorage.setItem('ml_favorites', JSON.stringify(updated));
    setFavorited(!favorited);
    toast(favorited ? 'Removed from favorites' : 'Added to favorites!', favorited ? 'info' : 'success');
  };

  const image = product.images?.[0]?.url || `https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=80`;
  const farmerName = product.farmer?.farmName || product.farmer?.user?.name || 'Local Organic Farm';

  return (
    <Link to={`/products/${product._id}`} className="product-card" style={{ textDecoration: 'none' }}>
      <div className="product-card__image">
        <img src={image} alt={product.name} loading="lazy" onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=80`; }} />
        <div className="product-card__actions">
          <button className={`product-card__action-btn ${favorited ? 'active' : ''}`} onClick={handleFavorite} title="Favorite">
            <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
          </button>
        </div>
        {product.isOrganic && (
          <div className="product-card__badge">
            <span className="badge badge-green">Organic</span>
          </div>
        )}
      </div>
      <div className="product-card__body">
        <div className="product-card__category">
          {product.category?.name || 'Fresh Produce'}
        </div>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__farmer">
          <Leaf size={12} color="var(--green-600)" />
          {farmerName}
        </div>
        <div className="product-card__price-row">
          <div>
            <span className="product-card__price">{formatCurrency(product.price)}</span>
            <span className="product-card__unit"> / {product.unit || 'kg'}</span>
          </div>
          <button className="product-card__add-btn" onClick={handleAddToCart}>
            <ShoppingCart size={13} /> Add
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ── Market Card ──────────────────────────────────────────────── */
function MarketCard({ market }) {
  const image = market.image?.url || `https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=80`;
  return (
    <div className="market-card">
      <div className="market-card__image">
        <img src={image} alt={market.name} loading="lazy" onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=80`; }} />
      </div>
      <div className="market-card__body">
        <h3 className="market-card__name">{market.name}</h3>
        <div className="market-card__info">
          {market.location?.address && (
            <div className="market-card__info-row">
              <MapPin size={14} color="var(--green-600)" />
              {market.location.address}{market.location.city ? `, ${market.location.city}` : ''}
            </div>
          )}
          {market.marketDays?.length > 0 && (
            <div className="market-card__info-row">
              <Calendar size={14} color="var(--green-600)" />
              {market.marketDays.join(', ')}
            </div>
          )}
          {(market.openTime || market.pickupStartTime) && (
            <div className="market-card__info-row">
              <Clock size={14} color="var(--green-600)" />
              {market.pickupStartTime ? `Pickup: ${market.pickupStartTime} – ${market.pickupEndTime}` : `${market.openTime} – ${market.closeTime}`}
            </div>
          )}
        </div>
        <Link to={`/markets/${market._id}`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
          Explore Hub & Vendors
        </Link>
      </div>
    </div>
  );
}

/* ── Main Home Page ───────────────────────────────────────────── */
export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [allMarkets, setAllMarkets] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [allFarmers, setAllFarmers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes, marketRes, farmerRes] = await Promise.allSettled([
          categoryService.getActiveCategories(),
          productService.getProducts({ limit: 12 }),
          marketService.getMarkets({ isActive: true }),
          farmerService.getFarmers(),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value?.data || []);
        if (prodRes.status === 'fulfilled') setProducts(prodRes.value?.data || []);
        if (marketRes.status === 'fulfilled') {
          const allM = marketRes.value?.data || [];
          setAllMarkets(allM);
          setMarkets(allM.slice(0, 6));
        }
        if (farmerRes.status === 'fulfilled') {
          const allF = farmerRes.value?.data || [];
          setAllFarmers(allF);
          setFarmers(allF.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <div className="home">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__slides-bg">
          {HERO_SLIDES.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt="Hero Banner"
              className={`hero__slide-bg ${idx === currentSlide ? 'active' : ''}`}
              loading="eager"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&auto=format&fit=crop&q=80';
              }}
            />
          ))}
        </div>
        <div className="hero__overlay" />

        <button className="hero__nav-btn hero__nav-btn--prev" onClick={prevSlide} aria-label="Previous Slide">
          <ChevronLeft size={24} />
        </button>
        <button className="hero__nav-btn hero__nav-btn--next" onClick={nextSlide} aria-label="Next Slide">
          <ChevronRight size={24} />
        </button>

        <div className="hero__dots">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`hero__dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="container">
          <div className="hero__content animate-fade-in-up" key={currentSlide}>
            <div className="hero__tag">
              <Leaf size={14} /> {activeSlide.tag}
            </div>
            <h1 className="hero__title">
              {activeSlide.title}
            </h1>
            <p className="hero__desc">
              {activeSlide.desc}
            </p>

            <form className="hero__search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search organic produce, fresh berries, heirloom tomatoes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="hero-search-input"
              />
              <button type="submit" className="hero__search-btn">
                <Search size={18} /> Search
              </button>
            </form>

            <div className="hero__stats-row">
              <span className="hero-stat-pill">100% Farm Direct</span>
              <span className="hero-stat-pill">Morning Harvest Pickup</span>
              <span className="hero-stat-pill">4.9/5 Freshness Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Feature Cards Bar ─────────────────────────────── */}
      <section className="section-sm home__section">
        <div className="container">
          <div className="feature-grid">
            <Link to="/markets" className="feature-card" style={{ textDecoration: 'none' }}>
              <div className="feature-card__icon"><MapPin size={28} /></div>
              <div className="feature-card__title">Explore Market Hubs</div>
              <div className="feature-card__desc">Find weekend farmers markets near you with live vendor schedules and pickup locations.</div>
            </Link>
            <Link to="/products" className="feature-card" style={{ textDecoration: 'none' }}>
              <div className="feature-card__icon feature-card__icon--amber"><ShoppingBag size={28} /></div>
              <div className="feature-card__title">Organic Produce Catalog</div>
              <div className="feature-card__desc">Browse seasonal fruits, daily harvested greens, artisan dairy, and farm produce.</div>
            </Link>
            <Link to="/farmer-dashboard" className="feature-card" style={{ textDecoration: 'none' }}>
              <div className="feature-card__icon feature-card__icon--blue"><Users size={28} /></div>
              <div className="feature-card__title">Farmer Vendor Portal</div>
              <div className="feature-card__desc">Are you a grower? Register your farm stall, list fresh pre-orders, and manage stock.</div>
            </Link>
            <Link to="/products?filter=organic" className="feature-card" style={{ textDecoration: 'none' }}>
              <div className="feature-card__icon feature-card__icon--pink"><Leaf size={28} /></div>
              <div className="feature-card__title">Certified Organic</div>
              <div className="feature-card__desc">Non-GMO, chemical-free food grown sustainably with care for your health and earth.</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. How It Works Section ──────────────────────────────── */}
      <section className="section-sm home__how-it-works">
        <div className="container">
          <div className="section-header-row" style={{ textAlign: 'center', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            <h2>How MarketLink Works</h2>
            <p style={{ fontSize: '1.05rem', marginTop: 6 }}>4 easy steps from farm field to your kitchen table</p>
          </div>

          <div className="how-grid">
            <div className="how-step">
              <div className="how-step__num">1</div>
              <div className="how-step__icon"><Search size={26} /></div>
              <h3 className="how-step__title">Explore & Pick</h3>
              <p className="how-step__desc">Discover local farms & weekend markets operating in your neighborhood.</p>
            </div>
            <div className="how-step__arrow"><ArrowRight size={22} color="var(--gray-300)" /></div>

            <div className="how-step">
              <div className="how-step__num">2</div>
              <div className="how-step__icon how-step__icon--amber"><ShoppingCart size={26} /></div>
              <h3 className="how-step__title">Reserve Basket</h3>
              <p className="how-step__desc">Add fresh organic fruits, vegetables & dairy items to your pre-order basket.</p>
            </div>
            <div className="how-step__arrow"><ArrowRight size={22} color="var(--gray-300)" /></div>

            <div className="how-step">
              <div className="how-step__num">3</div>
              <div className="how-step__icon how-step__icon--blue"><Calendar size={26} /></div>
              <h3 className="how-step__title">Select Pickup</h3>
              <p className="how-step__desc">Choose your market pickup date or opt for home delivery options.</p>
            </div>
            <div className="how-step__arrow"><ArrowRight size={22} color="var(--gray-300)" /></div>

            <div className="how-step">
              <div className="how-step__num">4</div>
              <div className="how-step__icon how-step__icon--green"><Truck size={26} /></div>
              <h3 className="how-step__title">Fresh Harvest Arrival</h3>
              <p className="how-step__desc">Collect your basket picked fresh on market morning and enjoy!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Popular Categories ─────────────────────────── */}
      {categories.length > 0 && (
        <section className="section-sm home__section">
          <div className="container">
            <div className="section-header-row">
              <div className="section-title-group">
                <h2>Explore Popular Produce Categories</h2>
                <p>Curated farm goods and seasonal harvest selections</p>
              </div>
              <Link to="/products" className="section-view-all">
                All Produce <ChevronRight size={16} />
              </Link>
            </div>

            <div className="category-grid">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="category-pill"
                  style={{ textDecoration: 'none' }}
                >
                  {cat.image?.url ? (
                    <img src={cat.image.url} alt={cat.name} className="category-pill__icon" />
                  ) : (
                    <span style={{ fontSize: '2.4rem' }}>{getCatIcon(cat.name)}</span>
                  )}
                  <span className="category-pill__name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Nearby Markets ────────────────────────────── */}
      <section className="section-sm home__section-alt">
        <div className="container">
          <div className="section-header-row">
            <div className="section-title-group">
              <h2>Nearby Weekend Farmers Markets</h2>
              <p>Community hubs operating near you with fresh produce stalls</p>
            </div>
            <Link to="/markets" className="section-view-all">
              View All Market Locations <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <NearbyMap markets={[...allMarkets, ...allFarmers.map(f => ({ ...f, isFarmer: true }))]} />
          </div>

          {loading ? (
            <div className="markets-grid">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} height={320} />)}
            </div>
          ) : markets.length > 0 ? (
            <div className="markets-grid">
              {markets.map((m) => <MarketCard key={m._id} market={m} />)}
            </div>
          ) : (
            <EmptyState
              icon={MapPin}
              title="No Active Markets Currently Listed"
              description="Check back soon for new local farmers market hubs in your city."
            />
          )}
        </div>
      </section>

      {/* ── 6. Featured Products ──────────────────────────── */}
      <section className="section-sm home__section">
        <div className="container">
          <div className="section-header-row">
            <div className="section-title-group">
              <h2>Fresh Harvest Produce & Pre-Orders</h2>
              <p>Picked fresh this morning by verified local family farms</p>
            </div>
            <Link to="/products" className="section-view-all">
              Browse Marketplace <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="products-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} height={340} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="No Produce Listed Yet"
              description="Fresh listings will appear here once farmers add their morning harvest."
            />
          )}
        </div>
      </section>

      {/* ── 7. CTA Banner ────────────────────────────────── */}
      <section className="home__cta">
        <div className="container">
          <div className="home__cta-content">
            <Leaf size={44} color="#6ee7b7" />
            <h2 className="home__cta-title">Good Food Builds Healthy Communities</h2>
            <p className="home__cta-desc">
              Join MarketLink (eGreen Basket) today. Connect directly with local family farms, eat 100% organic fresh produce, and support sustainable agriculture.
            </p>
            <div className="home__cta-actions">
              <Link to="/products" className="btn btn-white btn-lg">
                Explore Farm Harvest
              </Link>
              <Link to="/register?role=farmer" className="btn btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.15)' }}>
                Become a Farmer Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Trust Guarantees ───────────────────────────────── */}
      <section className="section-sm home__section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-item__icon"><ShieldCheck size={28} /></div>
              <div>
                <div className="trust-item__title">Verified Local Farms</div>
                <div className="trust-item__desc">Every grower is verified for clean farming</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item__icon trust-item__icon--amber"><Star size={28} /></div>
              <div>
                <div className="trust-item__title">Freshness Guarantee</div>
                <div className="trust-item__desc">Harvested within 24 hours of market pickup</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item__icon trust-item__icon--blue"><Calendar size={28} /></div>
              <div>
                <div className="trust-item__title">Pre-Order Convenience</div>
                <div className="trust-item__desc">Reserve produce before arriving at market</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item__icon trust-item__icon--pink"><Leaf size={28} /></div>
              <div>
                <div className="trust-item__title">Zero Middlemen</div>
                <div className="trust-item__desc">100% fair earnings go directly to farmers</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

