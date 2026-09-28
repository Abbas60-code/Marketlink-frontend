import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronDown,
  Leaf,
  MapPin,
  ShoppingBag,
  BarChart2,
  Home,
  Mail,
  Globe,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import categoryService from "../../services/categoryService.js";
import "./Navbar.css";

// ── Language helpers ──────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    home: 'Home', markets: 'Markets', products: 'Products',
    farmers: 'Farmers', about: 'About Us', contact: 'Contact',
    basket: 'Produce Basket', favorites: 'Saved Favorites',
    selectCountry: 'Select Country', lang: 'EN',
    searchPlaceholder: 'Search fresh produce, farms...',
  },
  ur: {
    home: 'ہوم', markets: 'مارکیٹس', products: 'پروڈکٹس',
    farmers: 'کسان', about: 'ہمارے بارے میں', contact: 'رابطہ',
    basket: 'ٹوکری', favorites: 'پسندیدہ',
    selectCountry: 'ملک منتخب کریں', lang: 'اردو',
    searchPlaceholder: 'تازہ پیداوار، فارم تلاش کریں...',
  },
};

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isFarmer, logout } = useAuth();
  const { cartCount, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem("emart_country") || "PK";
  });
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  // Dark mode
  const [theme, setTheme] = useState(() => localStorage.getItem('ml_theme') || 'light');
  // Language: 'en' | 'ur'
  const [lang, setLang] = useState(() => localStorage.getItem('ml_lang') || 'en');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ml_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const toggleLang = () => {
    const next = lang === 'en' ? 'ur' : 'en';
    setLang(next);
    localStorage.setItem('ml_lang', next);
    document.documentElement.setAttribute('dir', next === 'ur' ? 'rtl' : 'ltr');
  };

  const dropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load categories
  useEffect(() => {
    categoryService
      .getActiveCategories()
      .then((res) => {
        if (res?.data?.length) setCategories(res.data.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setUserDropdownOpen(false);
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target))
        setCountryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    localStorage.setItem("emart_country", countryCode);
    setCountryDropdownOpen(false);

    const langMap = {
      PK: "ur",
      IN: "hi",
      BD: "bn",
      LK: "si",
      NP: "ne",
      AE: "ar",
      SA: "ar",
      US: "en",
      UK: "en",
      CA: "en",
      AU: "en",
      DE: "de",
      FR: "fr",
      ES: "es"
    };

    const targetLang = langMap[countryCode] || "en";
    
    if (targetLang === "en") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    } else {
      document.cookie = `googtrans=/en/${targetLang}; path=/;`;
      document.cookie = `googtrans=/en/${targetLang}; domain=${window.location.hostname}; path=/;`;
    }
    
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isFarmer) return "/farmer-dashboard";
    return "/profile?tab=orders";
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">
              <Leaf size={20} />
            </div>
            <div className="navbar__logo-text">
              <span className="navbar__logo-main">MarketLink</span>
              <span className="navbar__logo-sub">eGreen Basket</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="navbar__links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navbar__link${isActive ? " active" : ""}`
              }
            >
              <Home size={15} /> {t.home}
            </NavLink>
            <NavLink
              to="/markets"
              className={({ isActive }) =>
                `navbar__link${isActive ? " active" : ""}`
              }
            >
              <MapPin size={15} /> {t.markets}
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `navbar__link${isActive ? " active" : ""}`
              }
            >
              <ShoppingBag size={15} /> {t.products}
            </NavLink>
            <NavLink
              to="/farmers"
              className={({ isActive }) =>
                `navbar__link${isActive ? " active" : ""}`
              }
            >
              <Leaf size={15} /> {t.farmers}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `navbar__link${isActive ? " active" : ""}`
              }
            >
              {t.about}
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `navbar__link${isActive ? " active" : ""}`
              }
            >
              {t.contact}
            </NavLink>
          </nav>

          {/* Action icons */}
          <div className="navbar__actions">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              className="navbar__icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language Toggle EN / Urdu */}
            <button
              type="button"
              className="navbar__icon-btn navbar__lang-btn"
              onClick={toggleLang}
              title={lang === 'en' ? 'Switch to Urdu' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <Languages size={18} />
              <span className="navbar__lang-label">{t.lang}</span>
            </button>

            {/* Country Selector */}
            <div style={{ position: "relative" }} ref={countryDropdownRef}>
              <button
                type="button"
                className="navbar__icon-btn"
                onClick={() => setCountryDropdownOpen((p) => !p)}
                title={`Selected: ${selectedCountry}`}
              >
                <Globe size={20} />
              </button>

              {countryDropdownOpen && (
                <div
                  className="navbar__dropdown animate-fade-in notranslate"
                  style={{ width: "190px", right: 0, maxHeight: "350px", overflowY: "auto" }}
                >
                  <div className="navbar__dropdown-header">
                    <div className="navbar__dropdown-name">Select Country</div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("PK")}> Pakistan</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("IN")}> India</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("BD")}> Bangladesh</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("LK")}> Sri Lanka</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("NP")}> Nepal</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("AE")}> UAE</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("SA")}> Saudi Arabia</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("US")}> United States</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("UK")}> United Kingdom</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("CA")}> Canada</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("AU")}> Australia</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("DE")}> Germany</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("FR")}> France</button>
                  <button className="navbar__dropdown-item" onClick={() => handleCountrySelect("ES")}> Spain</button>
                </div>
              )}
            </div>

            <Link
              to="/favorites"
              className="navbar__icon-btn"
              title="Saved Favorites"
            >
              <Heart size={20} />
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              className="navbar__icon-btn navbar__cart-btn"
              title="Produce Basket"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="navbar__cart-count">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="navbar__user" ref={dropdownRef}>
                <button
                  className="navbar__user-btn"
                  onClick={() => setUserDropdownOpen((p) => !p)}
                  id="navbar-user-menu-btn"
                >
                  {user?.profileImage?.url ? (
                    <img
                      src={user.profileImage.url}
                      alt={user.name}
                      className="navbar__avatar"
                    />
                  ) : (
                    <div className="navbar__avatar navbar__avatar--placeholder">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="navbar__username">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`navbar__chevron ${userDropdownOpen ? "open" : ""}`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="navbar__dropdown animate-fade-in">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__dropdown-name">{user?.name}</div>
                      <div className="navbar__dropdown-role">
                        {user?.role === "admin"
                          ? "️ Admin"
                          : user?.role === "farmer"
                            ? " Farmer / Producer"
                            : " Verified Customer"}
                      </div>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link
                      to={getDashboardLink()}
                      className="navbar__dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <BarChart2 size={15} />{" "}
                      {isAdmin
                        ? "Admin Dashboard"
                        : isFarmer
                          ? "Farmer Panel"
                          : "My Pre-Orders"}
                    </Link>
                    <Link
                      to="/profile?tab=personal"
                      className="navbar__dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User size={15} /> Customer Profile
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      className="navbar__dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <ShoppingBag size={15} /> Pre-Order History
                    </Link>
                    <Link
                      to="/favorites"
                      className="navbar__dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Heart size={15} /> Saved Favorites
                    </Link>
                    <div className="navbar__dropdown-divider" />
                    <button
                      className="navbar__dropdown-item navbar__dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar__auth-links">
                <Link to="/login" className="navbar__link">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="navbar__mobile-toggle"
              onClick={() => setMobileOpen((p) => !p)}
              id="navbar-mobile-toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar__mobile animate-fade-in">
          <nav className="navbar__mobile-links">
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              <Home size={18} /> Home
            </NavLink>
            <NavLink
              to="/markets"
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              <MapPin size={18} /> Markets
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              <ShoppingBag size={18} /> Products
            </NavLink>
            <NavLink
              to="/farmers"
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              <Leaf size={18} /> Farmers
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              About Us
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              Contact Us
            </NavLink>
            <NavLink
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              <ShoppingCart size={18} /> Basket
              {cartCount > 0 && (
                <span
                  className="badge badge-green"
                  style={{ marginLeft: "auto" }}
                >
                  {cartCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/favorites"
              onClick={() => setMobileOpen(false)}
              className="navbar__mobile-link"
            >
              <Heart size={18} /> Favorites
            </NavLink>
          </nav>

          <div className="navbar__mobile-divider" />

          {isAuthenticated ? (
            <div className="navbar__mobile-user">
              <div className="navbar__mobile-user-info">
                {user?.profileImage?.url ? (
                  <img
                    src={user.profileImage.url}
                    alt={user.name}
                    className="navbar__avatar"
                  />
                ) : (
                  <div className="navbar__avatar navbar__avatar--placeholder">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    {user?.name}
                  </div>
                  <div
                    style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}
                  >
                    {user?.email}
                  </div>
                </div>
              </div>
              <Link
                to={getDashboardLink()}
                className="btn btn-outline"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar__mobile-auth">
              <Link
                to="/login"
                className="btn btn-outline"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
