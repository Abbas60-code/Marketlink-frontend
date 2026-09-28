import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="site-footer" id="footer-contact">
      <div className="footer-main-container">
        {/* ================= SECTION 1: Brand & About ================= */}
        <div className="footer-section-col">
          <Link to="/" className="footer-brand">
            <div className="brand-icon-box">
              <ShoppingBag size={22} />
            </div>
            <div className="footer-brand-name">
              Shop<span>Sphere</span>
            </div>
          </Link>

          <p className="footer-about-text">
            Your premium destination for trendsetting electronics, fashion, and home lifestyle.
            We deliver top quality, direct to your doorstep with guaranteed customer satisfaction.
          </p>

          <div className="footer-social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Instagram">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Facebook">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="Twitter / X">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-btn" title="LinkedIn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ================= SECTION 2: Quick Links ================= */}
        <div className="footer-section-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/">
                <ArrowRight size={13} color="#10b981" />
                <span>Home Page</span>
              </Link>
            </li>
            <li>
              <Link to="/products">
                <ArrowRight size={13} color="#10b981" />
                <span>Organic Produce</span>
              </Link>
            </li>
            <li>
              <Link to="/markets">
                <ArrowRight size={13} color="#10b981" />
                <span>Farmers Markets</span>
              </Link>
            </li>
            <li>
              <Link to="/farmers">
                <ArrowRight size={13} color="#10b981" />
                <span>Our Farmers</span>
              </Link>
            </li>
            <li>
              <Link to="/about">
                <ArrowRight size={13} color="#10b981" />
                <span>About MarketLink</span>
              </Link>
            </li>
            <li>
              <Link to="/cart">
                <ArrowRight size={13} color="#10b981" />
                <span>Pre-Order Basket</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* ================= SECTION 3: Customer Service & Policies ================= */}
        <div className="footer-section-col">
          <h4 className="footer-heading">Portals & Support</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/farmer-dashboard">
                <ArrowRight size={13} color="#10b981" />
                <span>Farmer Vendor Portal</span>
              </Link>
            </li>
            <li>
              <Link to="/admin">
                <ArrowRight size={13} color="#10b981" />
                <span>Admin Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/profile">
                <ArrowRight size={13} color="#10b981" />
                <span>My Customer Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/login">
                <ArrowRight size={13} color="#10b981" />
                <span>Sign In / Register</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* ================= SECTION 4: Contact & Newsletter ================= */}
        <div className="footer-section-col">
          <h4 className="footer-heading">Contact & Newsletter</h4>

          <div className="footer-contact-items">
            <div className="footer-contact-row">
              <MapPin size={17} className="icon-box" />
              <span>742 Evergreen Terrace, Tech District, CA 90210</span>
            </div>
            <div className="footer-contact-row">
              <Phone size={17} className="icon-box" />
              <span>+1 (800) 555-0199 / +1 (415) 890-1234</span>
            </div>
            <div className="footer-contact-row">
              <Mail size={17} className="icon-box" />
              <span>support@shopsphere.com</span>
            </div>
          </div>

          <div className="footer-newsletter-box">
            <p>Subscribe to our newsletter & get <strong>15% OFF</strong> coupon:</p>
            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="footer-newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="footer-newsletter-btn">
                <Send size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                <span>Join</span>
              </button>
            </form>
            {subscribed && (
              <span className="newsletter-success-badge">
                <CheckCircle2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Thanks for subscribing! Check your inbox.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div>
             {new Date().getFullYear()} <strong>ShopSphere Inc.</strong> All rights reserved. Designed with for excellence.
          </div>
          <div className="payment-badges-row">
            <span className="payment-pill">VISA</span>
            <span className="payment-pill">MASTERCARD</span>
            <span className="payment-pill">PAYPAL</span>
            <span className="payment-pill">APPLE PAY</span>
            <span className="payment-pill">STRIPE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
