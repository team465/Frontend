import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function InvestorAccessTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/investor-metrics', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading investor metrics…</div>;

  const kpi       = data?.kpi       || {};
  const growth    = data?.growth    || [];
  const topDrivers = data?.topDrivers || [];

  const maxRevenue = Math.max(...growth.map(m => parseFloat(m.revenue || 0)), 1);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Investor Access</h2>
          <p className="adm-page-sub">Key performance indicators and growth metrics</p>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>
          🔒 Confidential · Admin only
        </span>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: `$${parseFloat(kpi.total_revenue || 0).toFixed(2)}`, color: '#e8a020' },
          { label: 'This Month', value: `$${parseFloat(kpi.month_revenue || 0).toFixed(2)}`, color: '#10b981' },
          { label: 'Total Rides', value: kpi.total_rides || 0, color: '#3b82f6' },
          { label: 'Month Rides', value: kpi.month_rides || 0, color: '#8b5cf6' },
          { label: 'Passengers', value: kpi.total_passengers || 0, color: '#3b82f6' },
          { label: 'Drivers', value: kpi.total_drivers || 0, color: '#10b981' },
          { label: 'New Users (mo)', value: kpi.new_users_month || 0, color: '#f59e0b' },
          { label: 'Avg Fare', value: `$${parseFloat(kpi.avg_fare || 0).toFixed(2)}`, color: '#e8a020' },
        ].map(k => (
          <div key={k.label} className="adm-kpi-card">
            <div className="adm-kpi-bar" style={{ background: k.color }} />
            <span className="adm-kpi-label">{k.label}</span>
            <span className="adm-kpi-value">{k.value}</span>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {growth.length > 0 && (
        <div className="adm-chart-block" style={{ marginBottom: 24 }}>
          <h3 className="adm-chart-title">Monthly Revenue (last 6 months)</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 120, padding: '0 8px' }}>
            {growth.map(m => {
              const pct = (parseFloat(m.revenue) / maxRevenue) * 100;
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#e8a020' }}>${parseFloat(m.revenue).toFixed(0)}</span>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 80, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', background: '#e8a020', borderRadius: 4, height: `${Math.max(pct, 3)}%`, transition: 'height 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{m.month?.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Growth table */}
        {growth.length > 0 && (
          <div className="adm-chart-block">
            <h3 className="adm-chart-title">Growth Table</h3>
            <table className="adm-table">
              <thead><tr><th>Month</th><th>Revenue</th><th>Rides</th><th>Passengers</th><th>Drivers</th></tr></thead>
              <tbody>
                {growth.map(m => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 600 }}>{m.month}</td>
                    <td className="adm-td-gold">${parseFloat(m.revenue).toFixed(2)}</td>
                    <td>{m.rides}</td>
                    <td>{m.active_passengers}</td>
                    <td>{m.active_drivers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Top drivers */}
        {topDrivers.length > 0 && (
          <div className="adm-chart-block">
            <h3 className="adm-chart-title">Top Earning Drivers</h3>
            <table className="adm-table">
              <thead><tr><th>Driver</th><th>Rides</th><th>Earned</th></tr></thead>
              <tbody>
                {topDrivers.map((d, i) => (
                  <tr key={d.id}>
                    <td><span style={{ color: '#e8a020', marginRight: 6 }}>#{i+1}</span>{d.name}</td>
                    <td>{d.rides}</td>
                    <td className="adm-td-gold">${parseFloat(d.earned).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
