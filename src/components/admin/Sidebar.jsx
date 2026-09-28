import React from 'react';
import {
  LayoutGrid,
  Image as ImageIcon,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
  FolderTree,
  MapPin,
  Leaf,
  Package,
  Star,
  Users,
  BarChart3,
  Bell,
  X,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';


export default function Sidebar({
  collapsed,
  setCollapsed,
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen
}) {
  const menuSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { name: 'Overview Dashboard', id: 'Dashboard', icon: LayoutGrid },
        { name: 'Analytics & Reports', id: 'Reports', icon: BarChart3, badge: 'KPIs' },
        { name: 'Live Admin Support', id: 'SupportChat', icon: MessageSquare, badge: 'Live' },
      ]
    },

    {
      title: 'COMMUNITY & STALLS',
      items: [
        { name: 'Registered Customers', id: 'Customers', icon: Users },
        { name: 'Registered Farmers', id: 'Farmers', icon: Leaf },
        { name: 'Farmers Market Hubs', id: 'Markets', icon: MapPin },
      ]
    },
    {
      title: 'CATALOG & ORDERS',
      items: [
        { name: 'Produce Moderation', id: 'Products', icon: Package },
        { name: 'Pre-Orders & Pickup', id: 'Orders', icon: ShoppingBag },
        { name: 'Produce Categories', id: 'Categories', icon: FolderTree },
        { name: 'Customer Reviews', id: 'Reviews', icon: Star },
      ]
    },
    {
      title: 'MARKETING & ALERTS',
      items: [
        { name: 'In-App Announcements', id: 'Announcements', icon: Bell, badge: 'Live' },
        { name: 'Promos & Banners', id: 'Banners', icon: ImageIcon },
      ]
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-wrapper">
              <Leaf size={20} />
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="brand-title">
                  Market<span>Link</span>
                </span>
                <span className="brand-subtitle">
                  <ShieldCheck size={11} style={{ display: 'inline', marginRight: 3 }} />
                  Super Admin Panel
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse button */}
          <button
            className="sidebar-toggle-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          </button>

          {/* Mobile close button */}
          <button
            className="sidebar-toggle-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            title="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="sidebar-nav-container">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="nav-section-group">
              <div className="nav-section-title">
                {collapsed ? '•••' : section.title}
              </div>
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={iIdx}
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTab(item.id)}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="nav-item-left">
                      <span className="nav-icon">
                        <Icon size={17} />
                      </span>
                      {!collapsed && <span className="nav-label">{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span className={`nav-badge ${item.badge === 'Live' ? 'badge-live' : ''}`}>
                        {item.badge}
                      </span>
                    )}

                    {isActive && <div className="active-pill-indicator" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Info */}
        {!collapsed && (
          <div className="sidebar-bottom-badge">
            <div className="system-status-chip">
              <span className="pulse-dot" />
              <span>Database Connected</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
