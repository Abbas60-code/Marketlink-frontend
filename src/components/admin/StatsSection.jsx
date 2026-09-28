import React, { useState, useEffect } from 'react';
import StatCard from './StatCard.jsx';
import {
  Banknote,
  ShoppingBag,
  Boxes,
  Clock,
  RefreshCw,
  Store,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Leaf,
  Users
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { formatCurrency } from '../shared/index.jsx';

export default function StatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsRow1 = [
    {
      value: loading ? '…' : formatCurrency(stats?.totalRevenue || 0),
      label: 'Settled Platform Revenue',
      growth: 'Live DB',
      icon: Banknote,
      iconColor: '#10b981',
      iconBg: '#e6f7ef',
      themeClass: 'card-theme-green-tint'
    },
    {
      value: loading ? '…' : `${stats?.totalOrders || 0} Orders`,
      label: 'Total Platform Pre-Orders',
      growth: 'Realtime',
      icon: ShoppingBag,
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
      themeClass: 'card-theme-cyan-tint'
    },
    {
      value: loading ? '…' : `${stats?.totalCustomers || 0} Customers`,
      label: 'Registered Customers',
      tag: 'ACTIVE',
      icon: Users,
      iconColor: '#8b5cf6',
      iconBg: '#ede9fe',
      themeClass: 'card-theme-sky-tint'
    },
    {
      value: loading ? '…' : `${stats?.totalFarmers || 0} Growers`,
      label: 'Verified Local Farmers',
      tag: `${stats?.activeFarmersCount || 0} ACTIVE`,
      icon: Leaf,
      iconColor: '#059669',
      iconBg: '#d1fae5',
      themeClass: 'card-theme-mint-tint'
    },
    {
      value: loading ? '…' : `${stats?.totalMarkets || 0} Hubs`,
      label: 'Active Farmers Markets',
      tag: 'GROUNDS',
      icon: MapPin,
      iconColor: '#ea580c',
      iconBg: '#ffedd5',
      themeClass: 'card-theme-peach-tint'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
      <div className="stats-grid">
        {statsRow1.map((item, index) => (
          <StatCard key={`r1-${index}`} {...item} />
        ))}
      </div>
    </div>
  );
}
