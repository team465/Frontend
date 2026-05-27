import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function DonationsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use existing ride stats as a proxy for NGO impact metrics
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>;

  const completedRides = parseInt(stats?.rides?.completed || 0);
  const totalRevenue   = parseFloat(stats?.revenue?.total_revenue || 0);
  const ngoContrib     = (totalRevenue * 0.05).toFixed(2); // 5% goes to MOOL NGO

  const IMPACT_ITEMS = [
    { icon: '🏫', label: 'School meals funded',    value: Math.floor(completedRides * 0.3) },
    { icon: '🌱', label: 'Trees planted',           value: Math.floor(completedRides * 0.1) },
    { icon: '👩‍⚕️', label: 'Health checkups supported', value: Math.floor(completedRides * 0.05) },
    { icon: '📚', label: 'Books donated',           value: Math.floor(completedRides * 0.2) },
  ];

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">MOOL NGO Donations</h2>
          <p className="adm-page-sub">5% of every completed ride supports local Cambodian communities</p>
        </div>
      </div>

      {/* NGO Summary */}
      <div className="adm-mool-banner">
        <div className="adm-mool-logo">❤️</div>
        <div>
          <p className="adm-mool-title">MOOL NGO Initiative</p>
          <p className="adm-mool-desc">Jih donates 5% of platform revenue to MOOL NGO to support education, health, and environmental projects across Cambodia.</p>
        </div>
      </div>

      <div className="adm-kpi-grid adm-kpi-grid--3">
        <div className="adm-kpi-card">
          <div className="adm-kpi-bar" style={{ background: '#e8a020' }} />
          <span className="adm-kpi-label">Total Contributed</span>
          <span className="adm-kpi-value">${ngoContrib}</span>
          <span className="adm-kpi-sub">5% of ${totalRevenue.toFixed(2)}</span>
        </div>
        <div className="adm-kpi-card">
          <div className="adm-kpi-bar" style={{ background: '#10b981' }} />
          <span className="adm-kpi-label">Rides Contributing</span>
          <span className="adm-kpi-value">{completedRides}</span>
          <span className="adm-kpi-sub">completed rides</span>
        </div>
        <div className="adm-kpi-card">
          <div className="adm-kpi-bar" style={{ background: '#ef4444' }} />
          <span className="adm-kpi-label">This Month</span>
          <span className="adm-kpi-value">${(parseFloat(stats?.revenue?.month_revenue || 0) * 0.05).toFixed(2)}</span>
          <span className="adm-kpi-sub">from {stats?.rides?.this_month || 0} rides</span>
        </div>
      </div>

      <div className="adm-impact-section">
        <h3 className="adm-chart-title">Community Impact</h3>
        <div className="adm-impact-grid">
          {IMPACT_ITEMS.map((item, i) => (
            <div key={i} className="adm-impact-card">
              <span className="adm-impact-icon">{item.icon}</span>
              <span className="adm-impact-val">{item.value.toLocaleString()}</span>
              <span className="adm-impact-lbl">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
