import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, Store, Users, ShieldCheck, Heart, Award, ArrowRight,
  CheckCircle, Sparkles, Sprout, TrendingUp, Clock, MapPin,
  ShoppingBag, Check
} from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero page-hero-banner">
        <img src="/zoe-richardson-D_VjFp1ds1Y-unsplash.jpg" alt="About Banner" className="page-hero-bg" />
        <div className="page-hero-overlay" />
        <div className="container about-hero__content page-hero-content">
          <div className="about-hero__badge">
            <Sprout size={15} /> The Farm-to-Fork Revolution
          </div>
          <h1 className="about-hero__title">
            Empowering Local Organic Farmers & Healthy Communities
          </h1>
          <p className="about-hero__subtitle">
            MarketLink (eGreen Basket) is a next-generation direct marketplace connecting conscious households with verified organic growers, eliminating middleman markups, ensuring peak nutritional freshness, and reducing food waste.
          </p>

          <div className="about-hero-pills">
            <span className="hero-pill"><Check size={14} /> 100% Pesticide Free</span>
            <span className="hero-pill"><Check size={14} /> 24hr Field-to-Hub Harvest</span>
            <span className="hero-pill"><Check size={14} /> Direct Farmer Fair Share</span>
            <span className="hero-pill"><Check size={14} /> Community Weekend Hubs</span>
          </div>
        </div>
      </section>

      {/* Story & Vision Split Section */}
      <section className="about-story-section">
        <div className="container about-story-grid">
          <div className="about-story-text">
            <div className="section-eyebrow">
              <Sparkles size={14} /> Why We Started
            </div>
            <h2 className="story-title">Bridging the Gap Between Soil and Table</h2>
            <p className="story-para">
              Traditional commercial grocery chains transport produce across thousands of miles through multiple cold storages, warehouses, and distributor markups. By the time food reaches your plate, it has lost up to <strong>50% of its vital nutrients</strong>, and hardworking farmers receive only pennies on the dollar.
            </p>
            <p className="story-para">
              We built <strong>MarketLink</strong> to rethink the food system. By giving small-scale organic farmers a digital pre-order storefront and localized community pickup hubs, we enable customers to enjoy heirloom fruits and crisp greens harvested at peak nutritional ripeness.
            </p>

            <div className="story-highlights">
              <div className="highlight-item">
                <div className="highlight-icon">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4>85%+ Returned to Growers</h4>
                  <p>Farmers earn sustainable livelihoods without distributor deductions.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <h4>Harvested Upon Pre-Order</h4>
                  <p>Crops are only picked when you order, eliminating farm food waste.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-story-card">
            <div className="story-card-inner">
              <div className="story-card-tag">Our Impact Promise</div>
              <h3 className="story-card-heading">Freshness You Can Trace to the Exact Farm</h3>
              
              <ul className="story-card-checklist">
                <li>
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span><strong>Zero Chemical Sprays:</strong> Verified organic farming practices that replenish the soil.</span>
                </li>
                <li>
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span><strong>Neighborhood Weekend Hubs:</strong> Skip crowded lines by grabbing your pre-packed basket.</span>
                </li>
                <li>
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span><strong>Community First:</strong> Know the growers behind your daily meals and support local agriculture.</span>
                </li>
              </ul>

              <div className="story-card-badge-row">
                <div className="mini-stat">
                  <span className="mini-num">100%</span>
                  <span className="mini-lbl">Traceable</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-num">0</span>
                  <span className="mini-lbl">Middlemen</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-num">24h</span>
                  <span className="mini-lbl">Freshness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Process */}
      <section className="about-how-section">
        <div className="container">
          <div className="about-section-header text-center">
            <div className="section-eyebrow justify-center">
              <Leaf size={14} /> Simple 3-Step Workflow
            </div>
            <h2 className="section-main-title">How MarketLink Works for You</h2>
            <p className="section-main-sub">From online reservation to your weekend basket pickup in three seamless steps.</p>
          </div>

          <div className="how-steps-grid">
            <div className="how-step-card">
              <div className="step-num">01</div>
              <div className="step-icon-wrap">
                <ShoppingBag size={24} />
              </div>
              <h3 className="step-title">1. Browse & Pre-Order</h3>
              <p className="step-desc">
                Explore weekly harvests, artisanal dairy, and organic staples from local stalls. Secure your favorites before market day.
              </p>
            </div>

            <div className="how-step-card">
              <div className="step-num">02</div>
              <div className="step-icon-wrap">
                <Sprout size={24} />
              </div>
              <h3 className="step-title">2. Picked at Sunrise</h3>
              <p className="step-desc">
                Local growers harvest your reserved produce fresh from the fields within 24 hours of market opening for peak flavor.
              </p>
            </div>

            <div className="how-step-card">
              <div className="step-num">03</div>
              <div className="step-icon-wrap">
                <Store size={24} />
              </div>
              <h3 className="step-title">3. Grab at Your Hub</h3>
              <p className="step-desc">
                Collect your sanitized, pre-packed produce box at your chosen weekend market hub or neighborhood pickup stall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Core Pillars */}
      <section className="about-pillars-section">
        <div className="container">
          <div className="about-section-header text-center">
            <div className="section-eyebrow justify-center">
              <ShieldCheck size={14} /> Our Core Pillars
            </div>
            <h2 className="section-main-title">Built on Trust, Ecology & Fair Trade</h2>
            <p className="section-main-sub">Our commitment to farmers, shoppers, and our natural ecosystem.</p>
          </div>

          <div className="about-mission-grid">
            <div className="mission-card">
              <div className="mission-icon">
                <Leaf size={26} />
              </div>
              <h3>100% Organic & Chemical-Free</h3>
              <p>
                We collaborate exclusively with certified organic farms that practice regenerative soil stewardship, protecting groundwater and soil biodiversity.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">
                <Store size={26} />
              </div>
              <h3>Community Market Hubs</h3>
              <p>
                Connecting urban neighborhoods with nearby farms through accessible weekly pickup stations and vibrant farmers markets.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">
                <Heart size={26} />
              </div>
              <h3>Fair Direct Pricing</h3>
              <p>
                By cutting out corporate distributors, farmers receive livable prices and shoppers get premium quality at transparent rates.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">
                <Award size={26} />
              </div>
              <h3>Zero Food Waste Initiative</h3>
              <p>
                With demand-driven pre-ordering, farmers only harvest what has been purchased, drastically reducing agricultural waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="about-stats-banner">
        <div className="container about-stats-grid">
          <div className="about-stat-item">
            <h2>50+</h2>
            <p>Verified Organic Farms</p>
          </div>
          <div className="about-stat-item">
            <h2>15+</h2>
            <p>Weekend Market Hubs</p>
          </div>
          <div className="about-stat-item">
            <h2>12,000+</h2>
            <p>Fresh Pre-Orders Fulfilled</p>
          </div>
          <div className="about-stat-item">
            <h2>100%</h2>
            <p>Freshness & Quality Guaranteed</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-box">
            <div className="about-cta-badge">
              <Sparkles size={14} /> Taste the Difference Today
            </div>
            <h2 className="cta-heading">Ready to Experience True Farm Freshness?</h2>
            <p className="cta-sub">
              Support local growers and nourish your family with freshly harvested organic produce.
            </p>

            <div className="about-cta-buttons">
              <Link to="/products" className="about-btn-primary">
                Explore Farm Produce <ArrowRight size={18} />
              </Link>
              <Link to="/markets" className="about-btn-secondary">
                <MapPin size={18} /> Find Nearby Market Hubs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

