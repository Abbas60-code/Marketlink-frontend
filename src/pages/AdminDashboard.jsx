import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar.jsx';
import AdminHeader from '../components/admin/AdminHeader.jsx';
import StatsSection from '../components/admin/StatsSection.jsx';
import EarningsChart from '../components/admin/EarningsChart.jsx';
import ProductTables from '../components/admin/ProductTables.jsx';
import BannerManager from '../components/admin/BannerManager.jsx';
import CategoryManager from '../components/admin/CategoryManager.jsx';
import MarketManager from '../components/admin/MarketManager.jsx';
import FarmerManager from '../components/admin/FarmerManager.jsx';
import CustomerManager from '../components/admin/CustomerManager.jsx';
import ReportsManager from '../components/admin/ReportsManager.jsx';
import AdminChatManager from '../components/admin/AdminChatManager.jsx';
import AnnouncementManager from '../components/admin/AnnouncementManager.jsx';

import ReviewManager from '../components/admin/ReviewManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import '../components/admin/admin.css';
import { Calendar, ChevronDown, ShieldAlert, LogIn } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('emart_theme') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('emart_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // While validating stored session token
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 42,
              height: 42,
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', fontWeight: 600 }}>
            Verifying Administrator Credentials...
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in as admin, show informational banner with sign-in link
  if (!isAuthenticated || !isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 20,
            padding: 36,
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
            Admin Access Required
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 20 }}>
            You must be logged in with an administrator account to access platform management, customer records, market hubs, and analytics.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: '#10b981',
                color: '#ffffff',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <LogIn size={16} />
              <span>Sign In as Admin</span>
            </Link>

            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: '#334155',
                color: '#ffffff',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${theme === 'dark' ? 'dark-theme' : ''}`} data-theme={theme}>
      {/* Admin Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Navbar */}
        <AdminHeader
          theme={theme}
          toggleTheme={toggleTheme}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Dashboard Content */}
        <main className="dashboard-content">
          {activeTab === 'Dashboard' && (
            <>
              <div className="page-title-bar">
                <div className="page-title-group">
                  <h1>MarketLink Platform Overview</h1>
                </div>

                <div className="page-controls">
                  <button className="filter-btn">
                    <Calendar size={14} color="#64748b" />
                    <span>Live Database KPIs</span>
                  </button>
                </div>
              </div>

              {/* Stat Cards from real DB */}
              <StatsSection />

              {/* Revenue & Pre-Orders Chart */}
              <EarningsChart />

              {/* Produce & Pre-Order Tables */}
              <ProductTables />
            </>
          )}

          {activeTab === 'Customers' && <CustomerManager />}

          {activeTab === 'Farmers' && <FarmerManager />}

          {activeTab === 'Markets' && <MarketManager />}

          {activeTab === 'Products' && <ProductTables />}

          {activeTab === 'Orders' && <ProductTables />}

          {activeTab === 'Reviews' && <ReviewManager />}

          {activeTab === 'Categories' && <CategoryManager />}

          {activeTab === 'Reports' && <ReportsManager />}

          {activeTab === 'SupportChat' && <AdminChatManager />}

          {activeTab === 'Announcements' && <AnnouncementManager />}


          {activeTab === 'Banners' && <BannerManager />}
        </main>
      </div>
    </div>
  );
}
