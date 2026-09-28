import React, { useState } from 'react';

export default function EarningsChart() {
  const [hoveredBar, setHoveredBar] = useState(null);

  // 31 days data modeled closely on the screenshot's heights
  const chartData = [
    { day: 1, earning: 380, commission: 85 },
    { day: 2, earning: 340, commission: 60 },
    { day: 3, earning: 80, commission: 20 },
    { day: 4, earning: 160, commission: 35 },
    { day: 5, earning: 365, commission: 90 },
    { day: 6, earning: 235, commission: 45 },
    { day: 7, earning: 95, commission: 25 },
    { day: 8, earning: 250, commission: 55 },
    { day: 9, earning: 290, commission: 70 },
    { day: 10, earning: 190, commission: 40 },
    { day: 11, earning: 230, commission: 50 },
    { day: 12, earning: 175, commission: 35 },
    { day: 13, earning: 245, commission: 55 },
    { day: 14, earning: 75, commission: 20 },
    { day: 15, earning: 150, commission: 30 },
    { day: 16, earning: 230, commission: 50 },
    { day: 17, earning: 275, commission: 65 },
    { day: 18, earning: 375, commission: 80 },
    { day: 19, earning: 165, commission: 35 },
    { day: 20, earning: 270, commission: 60 },
    { day: 21, earning: 375, commission: 85 },
    { day: 22, earning: 310, commission: 70 },
    { day: 23, earning: 175, commission: 40 },
    { day: 24, earning: 255, commission: 55 },
    { day: 25, earning: 380, commission: 85 },
    { day: 26, earning: 345, commission: 75 },
    { day: 27, earning: 210, commission: 45 },
    { day: 28, earning: 365, commission: 80 },
    { day: 29, earning: 50, commission: 15 },
    { day: 30, earning: 335, commission: 70 },
    { day: 31, earning: 250, commission: 55 }
  ];

  const maxHeight = 400;
  const svgHeight = 180;
  const svgWidth = 920;
  const paddingLeft = 55;
  const paddingBottom = 26;
  const chartAreaHeight = svgHeight - paddingBottom;
  const chartAreaWidth = svgWidth - paddingLeft;
  const barWidth = 9;

  const yTicks = [400, 300, 200, 100, 0];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Earning and Commission</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot earning"></span>
            <span>Total earning: $ 2,968.90</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot commission"></span>
            <span>Commission given: $ 390.66</span>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <div style={{ position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: 'auto', display: 'block', maxWidth: '100%' }}
          >
            {/* Grid lines & Y-axis labels */}
            {yTicks.map((val) => {
              const y = chartAreaHeight - (val / maxHeight) * chartAreaHeight + 10;
              return (
                <g key={val}>
                  <text
                    x={paddingLeft - 14}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="inherit"
                  >
                    {val === 0 ? '0' : `${val}K`}
                  </text>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - 10}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })}

            {/* Bars */}
            {chartData.map((d, index) => {
              const x =
                paddingLeft +
                (index / (chartData.length - 1)) * (chartAreaWidth - 25);
              
              // Total bar height
              const totalBarH = (d.earning / maxHeight) * chartAreaHeight;
              // Dark top cap height (representing commission part of bar)
              const topCapH = Math.min(22, totalBarH * 0.25);
              const mainBarH = Math.max(0, totalBarH - topCapH);

              const baseY = chartAreaHeight + 10;
              const mainY = baseY - totalBarH;
              const capY = mainY;

              return (
                <g
                  key={d.day}
                  className="chart-bar-group"
                  onMouseEnter={() => setHoveredBar(d)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Base bar (vibrant blue) */}
                  <rect
                    x={x}
                    y={baseY - mainBarH}
                    width={barWidth}
                    height={mainBarH}
                    fill="#3b82f6"
                    rx="1.5"
                  />
                  {/* Top cap (dark navy blue) */}
                  <rect
                    x={x}
                    y={capY}
                    width={barWidth}
                    height={topCapH}
                    fill="#1e3a8a"
                    rx="1.5"
                  />
                  {/* Day label */}
                  <text
                    x={x + barWidth / 2}
                    y={baseY + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94a3b8"
                    fontFamily="inherit"
                  >
                    {d.day}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredBar && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#111827',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                pointerEvents: 'none',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <strong>Day {hoveredBar.day}</strong>
              <span style={{ color: '#60a5fa' }}>Earning: ${(hoveredBar.earning * 10).toLocaleString()}</span>
              <span style={{ color: '#93c5fd' }}>Commission: ${(hoveredBar.commission * 4).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
