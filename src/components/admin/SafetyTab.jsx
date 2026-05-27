import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function SafetyTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/safety', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading safety data…</div>;

  const stats = data?.stats || {};
  const lowDrivers = data?.lowRatedDrivers || [];
  const cancellations = data?.recentCancellations || [];

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Safety</h2>
          <p className="adm-page-sub">Platform safety metrics and alerts</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="adm-kpi-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Completed Rides', value: stats.completed_rides || 0, color: '#10b981' },
          { label: 'Cancelled Rides', value: stats.cancelled_rides || 0, color: '#ef4444' },
          { label: 'Cancel Rate', value: `${stats.cancel_rate || 0}%`, color: '#f59e0b' },
          { label: 'Low Ratings', value: stats.low_ratings || 0, color: '#8b5cf6' },
        ].map(k => (
          <div key={k.label} className="adm-kpi-card" style={{ flex: '1 1 160px' }}>
            <div className="adm-kpi-bar" style={{ background: k.color }} />
            <span className="adm-kpi-label">{k.label}</span>
            <span className="adm-kpi-value">{k.value}</span>
          </div>
        ))}
      </div>

      {/* Low rated drivers */}
      {lowDrivers.length > 0 && (
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">⚠️ Low-Rated Drivers (avg &lt; 3★)</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Driver</th><th>Email</th><th>Avg Rating</th><th>Rides</th></tr></thead>
              <tbody>
                {lowDrivers.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td className="adm-td-muted">{d.email}</td>
                    <td style={{ color: '#ef4444' }}>{'★'.repeat(Math.round(d.avg_rating))} {d.avg_rating}</td>
                    <td>{d.total_rides}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent cancellations */}
      <div className="adm-chart-block">
        <h3 className="adm-chart-title">🚫 Recent Cancellations</h3>
        {cancellations.length === 0 ? (
          <div className="adm-empty-state"><span className="adm-empty-icon">✅</span><p>No recent cancellations</p></div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>#</th><th>Passenger</th><th>Driver</th><th>Route</th><th>Date</th></tr></thead>
              <tbody>
                {cancellations.map(r => (
                  <tr key={r.id}>
                    <td className="adm-td-muted">#{r.id}</td>
                    <td>{r.passenger_name || '—'}</td>
                    <td>{r.driver_name || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.pickup_address}
                    </td>
                    <td className="adm-td-muted">{new Date(r.created_at).toLocaleDateString()}</td>
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
