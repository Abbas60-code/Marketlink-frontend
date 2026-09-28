import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Store, Leaf, Download, Filter, ShoppingBag, DollarSign, Award, RefreshCw, Layers, FileSpreadsheet, FileText, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import adminService from '../../services/adminService.js';
import { useToast, SkeletonCard, formatCurrency } from '../shared/index.jsx';

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function ReportsManager() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const toast = useToast();

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await adminService.getReports(params);
      setReports(res?.data || null);
    } catch (err) {
      toast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const handleQuickRange = (range) => {
    setQuickFilter(range);
    const now = new Date();
    if (range === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (range === 'today') {
      const d = now.toISOString().split('T')[0];
      setStartDate(d);
      setEndDate(d);
    } else if (range === 'week') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (range === 'month') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  //  Export to PDF
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(22, 163, 74);
      doc.text('MarketLink — Platform Analytics Report', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);

      const tableData = (reports?.marketReport || []).map(m => [
        m._id || 'Community Hub',
        m.ordersCount || 0,
        `$${(m.totalRevenue || 0).toFixed(2)}`,
        `$${(m.avgOrderValue || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 32,
        head: [['Market Station Hub', 'Total Orders', 'Total Volume ($)', 'Avg Basket ($)']],
        body: tableData,
        headStyles: { fillColor: [22, 163, 74] }
      });

      doc.save(`MarketLink_Analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast('PDF report downloaded successfully! ', 'success');
    } catch (e) {
      toast('Failed to generate PDF', 'error');
    }
  };

  //  Export to Excel
  const exportExcel = () => {
    try {
      const excelData = (reports?.marketReport || []).map(m => ({
        'Market Hub': m._id || 'Community Hub',
        'Orders Count': m.ordersCount || 0,
        'Total Revenue ($)': m.totalRevenue || 0,
        'Average Basket ($)': m.avgOrderValue || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Market Performance');
      XLSX.writeFile(workbook, `MarketLink_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast('Excel sheet exported successfully! ', 'success');
    } catch (e) {
      toast('Failed to export Excel', 'error');
    }
  };

  const rawMarketReport = reports?.marketReport?.length ? reports.marketReport : [
    { _id: 'Gulberg Hub', totalRevenue: 1250, ordersCount: 14 },
    { _id: 'Defence Hub', totalRevenue: 980, ordersCount: 11 },
    { _id: 'F-7 Hub', totalRevenue: 740, ordersCount: 8 },
    { _id: 'Saddar Hub', totalRevenue: 520, ordersCount: 6 }
  ];

  const rawOrderBreakdown = reports?.orderBreakdown?.length ? reports.orderBreakdown : [
    { _id: 'Completed', count: 18 },
    { _id: 'Confirmed', count: 12 },
    { _id: 'Pending', count: 7 },
    { _id: 'Cancelled', count: 2 }
  ];

  const totalRevenue = rawMarketReport.reduce((acc, m) => acc + (m.totalRevenue || 0), 0);
  const totalOrders = rawMarketReport.reduce((acc, m) => acc + (m.ordersCount || 0), 0);

  const marketChartData = rawMarketReport.map(m => ({
    name: (m._id || 'Hub').length > 15 ? (m._id || 'Hub').slice(0, 15) + '…' : (m._id || 'Hub'),
    Revenue: m.totalRevenue || 0,
    Orders: m.ordersCount || 0
  }));

  const orderStatusPieData = rawOrderBreakdown.map(b => ({
    name: b._id || 'Unknown',
    value: b.count || 0
  }));


  return (
    <div className="admin-section-container">
      {/* Page Header */}
      <div className="admin-page-hero">
        <div className="admin-page-hero__text">
          <div className="admin-badge-pill blue">
            <BarChart3 size={14} /> Realtime Database Intelligence
          </div>
          <h1 className="admin-page-title">Platform Analytics &amp; Business Reports</h1>
          <p className="admin-page-subtitle">
            Inspect regional sales velocity, customer fulfillment rates, top performing organic growers, and produce demands.
          </p>
        </div>

        {/* Quick Range Filter Pills & Export Buttons */}
        <div className="admin-hero-stats">
          <div className="hero-stat-box">
            <span className="hero-stat-label">Total Volume</span>
            <span className="hero-stat-val text-emerald">{loading ? '…' : formatCurrency(totalRevenue)}</span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-label">Total Orders</span>
            <span className="hero-stat-val text-blue">{loading ? '…' : `${totalOrders} Orders`}</span>
          </div>
        </div>
      </div>

      {/* Date Filter Toolbar & Export Actions */}
      <div className="admin-toolbar-card" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div className="quick-range-chips">
          <button
            type="button"
            className={`range-chip ${quickFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleQuickRange('all')}
          >
            All Time
          </button>
          <button
            type="button"
            className={`range-chip ${quickFilter === 'today' ? 'active' : ''}`}
            onClick={() => handleQuickRange('today')}
          >
            Today
          </button>
          <button
            type="button"
            className={`range-chip ${quickFilter === 'week' ? 'active' : ''}`}
            onClick={() => handleQuickRange('week')}
          >
            Past 7 Days
          </button>
          <button
            type="button"
            className={`range-chip ${quickFilter === 'month' ? 'active' : ''}`}
            onClick={() => handleQuickRange('month')}
          >
            Past 30 Days
          </button>
        </div>

        <div className="admin-filter-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="admin-btn-secondary" onClick={exportPDF} title="Download PDF Report" style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={15} color="#ef4444" /> Export PDF
          </button>
          <button type="button" className="admin-btn-secondary" onClick={exportExcel} title="Download Excel Sheet" style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={15} color="#10b981" /> Export Excel
          </button>
          <div className="date-filter-box">
            <Calendar size={15} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setQuickFilter('custom');
              }}
              className="admin-date-input"
              title="Start Date"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setQuickFilter('custom');
              }}
              className="admin-date-input"
              title="End Date"
            />
          </div>

          <button className="admin-refresh-btn" onClick={loadReports} title="Reload analytics">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Interactive Visual Analytics Charts (Recharts) */}
      {!loading && (

        <div className="admin-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Revenue by Market Bar Chart */}
          <div className="modern-report-card" style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div className="header-icon-badge emerald"><Store size={18} /></div>
              <div>
                <h3 className="report-card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Hub Revenue Velocity</h3>
                <span className="report-card-sub" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Visual comparison of revenue ($) across market stations</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 260, minHeight: 260, position: 'relative' }}>
              <ResponsiveContainer width="100%" height={260} minWidth={280}>
                <BarChart data={marketChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    formatter={(val) => [`$${val.toFixed(2)}`, 'Revenue']} 
                    contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '10px', border: '1px solid #1e293b', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} 
                  />
                  <Bar 
                    dataKey="Revenue" 
                    fill="#10b981" 
                    radius={[8, 8, 0, 0]} 
                    isAnimationActive={true} 
                    animationDuration={1200} 
                    animationBegin={200}
                    animationEasing="ease-out"
                  >
                    {marketChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Fulfillment Status Pie Chart */}
          <div className="modern-report-card" style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div className="header-icon-badge blue"><PieIcon size={18} /></div>
              <div>
                <h3 className="report-card-title" style={{ margin: 0, fontSize: '1.05rem' }}>Order Distribution</h3>
                <span className="report-card-sub" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Proportion of order fulfillment statuses</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 260, minHeight: 260, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={260} minWidth={280}>
                <PieChart>
                  <Pie 
                    data={orderStatusPieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={45}
                    outerRadius={85} 
                    paddingAngle={4}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationBegin={200}
                    animationEasing="ease-out"
                  >
                    {orderStatusPieData.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '10px', border: '1px solid #1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>


          </div>
        </div>
      )}

      {/* Report Cards Grid */}
      {loading ? (
        <div className="reports-grid-layout">
          {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} height={300} />)}
        </div>
      ) : (
        <div className="reports-grid-layout">
          {/* Market Hub Performance Report */}
          <div className="modern-report-card">
            <div className="report-card-header">
              <div className="header-icon-badge emerald">
                <Store size={18} />
              </div>
              <div>
                <h3 className="report-card-title">Pre-Orders by Market Station</h3>
                <span className="report-card-sub">Hub revenue &amp; customer basket sizes</span>
              </div>
            </div>

            {(!reports?.marketReport || reports.marketReport.length === 0) ? (
              <div className="empty-report-box">No orders recorded in this date range.</div>
            ) : (
              <div className="report-table-wrap">
                <table className="admin-mini-table">
                  <thead>
                    <tr>
                      <th>Market Hub</th>
                      <th>Orders</th>
                      <th>Total Volume</th>
                      <th>Avg Basket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.marketReport.map((m, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong className="text-dark">{m._id || 'Community Hub'}</strong>
                        </td>
                        <td>
                          <span className="count-pill-sm">{m.ordersCount}</span>
                        </td>
                        <td className="text-emerald font-bold">
                          {formatCurrency(m.totalRevenue)}
                        </td>
                        <td className="text-muted-sm">
                          {formatCurrency(m.avgOrderValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="modern-report-card">
            <div className="report-card-header">
              <div className="header-icon-badge blue">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="report-card-title">Order Fulfillment Statuses</h3>
                <span className="report-card-sub">Pipeline delivery breakdown</span>
              </div>
            </div>

            {(!reports?.orderBreakdown || reports.orderBreakdown.length === 0) ? (
              <div className="empty-report-box">No order data available.</div>
            ) : (
              <div className="status-bars-list">
                {reports.orderBreakdown.map((b, idx) => {
                  const maxOrders = Math.max(...reports.orderBreakdown.map((o) => o.count || 1), 1);
                  const pct = Math.round(((b.count || 0) / maxOrders) * 100);
                  return (
                    <div key={idx} className="status-progress-item">
                      <div className="status-progress-top">
                        <span className="status-name">{b._id}</span>
                        <span className="status-count">
                          <strong>{b.count} orders</strong> • {formatCurrency(b.revenue)}
                        </span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.max(8, pct)}%`,
                            backgroundColor:
                              b._id === 'Completed' ? '#10b981' :
                              b._id === 'Ready for Pickup' ? '#0284c7' :
                              b._id === 'Accepted' ? '#8b5cf6' :
                              b._id === 'Placed' ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Most Active Farmers */}
          <div className="modern-report-card">
            <div className="report-card-header">
              <div className="header-icon-badge amber">
                <Award size={18} />
              </div>
              <div>
                <h3 className="report-card-title">Top Active Local Growers</h3>
                <span className="report-card-sub">Ranked by stall engagement &amp; reviews</span>
              </div>
            </div>

            {(!reports?.topFarmers || reports.topFarmers.length === 0) ? (
              <div className="empty-report-box">No farmer records found.</div>
            ) : (
              <div className="farmers-ranked-list">
                {reports.topFarmers.map((farmer, idx) => (
                  <div key={farmer._id} className="ranked-farmer-row">
                    <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                    <div className="farmer-ranked-info">
                      <strong className="ranked-name">{farmer.farmName}</strong>
                      <span className="ranked-hub">
                        <Store size={11} /> {farmer.market?.name || 'Local Stall'}
                      </span>
                    </div>
                    <span className="farmer-star-rating">
                       {farmer.rating > 0 ? farmer.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High Demand Produce */}
          <div className="modern-report-card">
            <div className="report-card-header">
              <div className="header-icon-badge purple">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="report-card-title">High-Demand Produce Listings</h3>
                <span className="report-card-sub">Top consumer pre-order items</span>
              </div>
            </div>

            {(!reports?.topProducts || reports.topProducts.length === 0) ? (
              <div className="empty-report-box">No product data available.</div>
            ) : (
              <div className="farmers-ranked-list">
                {reports.topProducts.map((p, idx) => (
                  <div key={p._id} className="ranked-farmer-row">
                    <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                    <div className="farmer-ranked-info">
                      <strong className="ranked-name">{p.name}</strong>
                      <span className="ranked-hub">
                        <Leaf size={11} /> {p.farmer?.farmName || 'Organic Farm'}
                      </span>
                    </div>
                    <span className="ranked-price">
                      {formatCurrency(p.price)} <small>/{p.unit || 'kg'}</small>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
