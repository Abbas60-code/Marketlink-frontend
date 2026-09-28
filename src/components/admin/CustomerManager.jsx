import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Mail, Phone, MapPin, Calendar, Shield, RefreshCw, UserCheck, UserX } from 'lucide-react';
import adminService from '../../services/adminService.js';
import { useToast, EmptyState, SkeletonCard } from '../shared/index.jsx';

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterActive !== '') params.isActive = filterActive;
      const res = await adminService.getCustomers(params);
      setCustomers(res?.data || []);
    } catch (err) {
      toast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, filterActive]);

  const handleToggleStatus = async (customerId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await adminService.updateCustomerStatus(customerId, nextStatus);
      toast(`Customer account ${nextStatus ? 'Activated' : 'Deactivated'}`, 'success');
      setCustomers(customers.map((c) => (c._id === customerId ? { ...c, isActive: nextStatus } : c)));
    } catch (err) {
      toast('Failed to update customer status', 'error');
    }
  };

  const activeCount = customers.filter((c) => c.isActive !== false).length;
  const deactivatedCount = customers.length - activeCount;

  return (
    <div className="admin-section-container">
      {/* Page Header */}
      <div className="admin-page-hero">
        <div className="admin-page-hero__text">
          <div className="admin-badge-pill green">
            <Users size={14} /> Registered Consumers Directory
          </div>
          <h1 className="admin-page-title">Customer Account Management</h1>
          <p className="admin-page-subtitle">
            Manage registered shoppers, oversee account permissions, and verify contact and pickup locations.
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="admin-hero-stats">
          <div className="hero-stat-box">
            <span className="hero-stat-label">Total Registered</span>
            <span className="hero-stat-val text-blue">{loading ? '…' : customers.length}</span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-label">Active Shoppers</span>
            <span className="hero-stat-val text-emerald">{loading ? '…' : activeCount}</span>
          </div>
          {deactivatedCount > 0 && (
            <div className="hero-stat-box">
              <span className="hero-stat-label">Deactivated</span>
              <span className="hero-stat-val text-rose">{loading ? '…' : deactivatedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-search-field"
          />
          {searchInput && (
            <button className="clear-btn" onClick={() => { setSearchInput(''); setSearch(''); }}>
              
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          <div className="filter-pill-toggle">
            <button
              className={`filter-pill-btn ${filterActive === '' ? 'active' : ''}`}
              onClick={() => setFilterActive('')}
            >
              All ({customers.length})
            </button>
            <button
              className={`filter-pill-btn ${filterActive === 'true' ? 'active' : ''}`}
              onClick={() => setFilterActive('true')}
            >
               Active ({activeCount})
            </button>
            <button
              className={`filter-pill-btn ${filterActive === 'false' ? 'active' : ''}`}
              onClick={() => setFilterActive('false')}
            >
               Deactivated ({deactivatedCount})
            </button>
          </div>

          <button className="admin-refresh-btn" onClick={loadCustomers} title="Refresh data">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="admin-table-loading">
          <SkeletonCard height={320} />
        </div>
      ) : customers.length === 0 ? (
        <div className="admin-empty-card">
          <EmptyState
            icon={Users}
            title="No Customers Found"
            description={search ? `No customer records matched your query "${search}".` : "No registered customers found in database."}
          />
        </div>
      ) : (
        <div className="admin-modern-table-card">
          <div className="table-responsive">
            <table className="admin-modern-table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Details</th>
                  <th>Primary City / Area</th>
                  <th>Registered On</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const initial = (cust.name || cust.email || 'U').charAt(0).toUpperCase();
                  const isActive = cust.isActive !== false;
                  return (
                    <tr key={cust._id} className={!isActive ? 'row-deactivated' : ''}>
                      <td>
                        <div className="user-profile-cell">
                          <div className="avatar-gradient-circle">
                            {initial}
                          </div>
                          <div className="user-profile-text">
                            <strong className="user-name-title">{cust.name || 'Anonymous User'}</strong>
                            <span className="user-email-subtitle">
                              <Mail size={12} /> {cust.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="contact-cell">
                          {cust.phone ? (
                            <span className="contact-chip phone">
                              <Phone size={12} /> {cust.phone}
                            </span>
                          ) : (
                            <span className="text-muted-sm">No phone added</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="location-cell">
                          {cust.address?.city || cust.address?.street ? (
                            <span className="location-chip">
                              <MapPin size={12} />
                              {cust.address?.city || ''}{cust.address?.street ? `, ${cust.address.street}` : ''}
                            </span>
                          ) : (
                            <span className="text-muted-sm">Unspecified</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="date-chip">
                          <Calendar size={12} />
                          {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge-glow ${isActive ? 'active' : 'suspended'}`}>
                          <span className="status-dot" />
                          {isActive ? 'Active Consumer' : 'Deactivated'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={`admin-toggle-status-btn ${isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(cust._id, isActive)}
                          title={isActive ? 'Deactivate customer account' : 'Reactivate customer account'}
                        >
                          {isActive ? (
                            <>
                              <UserX size={14} /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} /> Reactivate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
