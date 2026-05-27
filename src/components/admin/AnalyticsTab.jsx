import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function AnalyticsTab() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setData(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>;

  const maxRev   = Math.max(...data.map(m => parseFloat(m.revenue  || 0)), 1);
  const maxRides = Math.max(...data.map(m => parseInt(m.rides      || 0)), 1);

  const totalRev   = data.reduce((s, m) => s + parseFloat(m.revenue  || 0), 0);
  const totalRides = data.reduce((s, m) => s + parseInt(m.rides     || 0), 0);
  const totalCancelled = data.reduce((s, m) => s + parseInt(m.cancelled || 0), 0);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Analytics</h2>
          <p className="adm-page-sub">Last 6 months performance</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="adm-analytics-summary">
        <div className="adm-asumm-card">
          <span className="adm-asumm-label">Period Revenue</span>
          <span className="adm-asumm-value adm-asumm-gold">${totalRev.toFixed(2)}</span>
        </div>
        <div className="adm-asumm-card">
          <span className="adm-asumm-label">Completed Rides</span>
          <span className="adm-asumm-value">{totalRides}</span>
        </div>
        <div className="adm-asumm-card">
          <span className="adm-asumm-label">Cancelled</span>
          <span className="adm-asumm-value adm-asumm-red">{totalCancelled}</span>
        </div>
        <div className="adm-asumm-card">
          <span className="adm-asumm-label">Avg / Month</span>
          <span className="adm-asumm-value">${data.length ? (totalRev / data.length).toFixed(2) : '0.00'}</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="adm-empty-state">
          <span className="adm-empty-icon">📈</span>
          <p>No data yet — rides will appear here once completed</p>
        </div>
      ) : (
        <>
          {/* Revenue chart */}
          <div className="adm-chart-block">
            <h3 className="adm-chart-title">Monthly Revenue</h3>
            <div className="adm-bar-chart">
              {data.map((m, i) => {
                const pct = (parseFloat(m.revenue) / maxRev) * 100;
                return (
                  <div key={i} className="adm-bar-col">
                    <span className="adm-bar-amount">${parseFloat(m.revenue).toFixed(0)}</span>
                    <div className="adm-bar-track">
                      <div className="adm-bar-fill adm-bar-fill--gold" style={{ height: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <span className="adm-bar-month">{m.month.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rides chart */}
          <div className="adm-chart-block">
            <h3 className="adm-chart-title">Monthly Rides</h3>
            <div className="adm-bar-chart">
              {data.map((m, i) => {
                const pct = (parseInt(m.rides) / maxRides) * 100;
                return (
                  <div key={i} className="adm-bar-col">
                    <span className="adm-bar-amount">{m.rides}</span>
                    <div className="adm-bar-track">
                      <div className="adm-bar-fill adm-bar-fill--navy" style={{ height: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <span className="adm-bar-month">{m.month.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="adm-chart-block">
            <h3 className="adm-chart-title">Monthly Breakdown</h3>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Completed</th>
                    <th>Cancelled</th>
                    <th>Revenue</th>
                    <th>Avg Fare</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((m, i) => (
                    <tr key={i}>
                      <td>{m.month}</td>
                      <td>{m.rides}</td>
                      <td>{m.cancelled}</td>
                      <td className="adm-td-gold">${parseFloat(m.revenue).toFixed(2)}</td>
                      <td>{parseInt(m.rides) > 0 ? `$${(parseFloat(m.revenue)/parseInt(m.rides)).toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
