import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({
  value,
  label,
  growth,
  tag,
  icon: Icon,
  iconColor,
  iconBg,
  themeClass
}) {
  return (
    <div className={`stat-card ${themeClass}`}>
      <div className="stat-card-top">
        <div
          className="stat-icon-badge"
          style={{ backgroundColor: iconBg || 'rgba(0,0,0,0.04)', color: iconColor || '#334155' }}
        >
          {Icon && <Icon size={19} />}
        </div>

        {growth && (
          <span className="stat-growth-badge">
            <ArrowUpRight size={13} strokeWidth={2.5} />
            {growth}
          </span>
        )}

        {tag && (
          <span className="stat-growth-badge tag-pill">
            {tag}
          </span>
        )}
      </div>

      <div className="stat-card-bottom">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
