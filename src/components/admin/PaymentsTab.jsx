import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const METHOD_ICON = { cash: '💵', card: '💳', khqr: '📱', aba: '🏦', wing: '🦋' };

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' · ' + new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function PaymentsTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/payments-breakdown', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading payments…</div>;

  const byMethod = data?.byMethod || [];
  const recent   = data?.recent   || [];
  const totalRev = byMethod.reduce((s, m) => s + parseFloat(m.total || 0), 0);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Payments</h2>
          <p className="adm-page-sub">Revenue breakdown by payment method</p>
        </div>
        <div className="adm-kpi-card" style={{ minWidth: 140, textAlign: 'center', padding: '12px 20px' }}>
          <span className="adm-kpi-label">Total Revenue</span>
          <span className="adm-kpi-value" style={{ fontSize: 20 }}>${totalRev.toFixed(2)}</span>
        </div>
      </div>

      {/* Method breakdown */}
      <div className="adm-payment-methods">
        {byMethod.length === 0 ? (
          <div className="adm-empty-state"><span className="adm-empty-icon">💳</span><p>No payment data yet</p></div>
        ) : byMethod.map(m => {
          const pct = totalRev > 0 ? (parseFloat(m.total) / totalRev) * 100 : 0;
          return (
            <div key={m.payment_method} className="adm-pay-method-card">
              <div className="adm-pay-method-head">
                <span className="adm-pay-icon">{METHOD_ICON[m.payment_method] || '💰'}</span>
                <span className="adm-pay-name">{m.payment_method?.toUpperCase() || 'OTHER'}</span>
                <span className="adm-pay-count">{m.count} rides</span>
                <span className="adm-pay-total">${parseFloat(m.total).toFixed(2)}</span>
              </div>
              <div className="adm-pay-bar-track">
                <div className="adm-pay-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="adm-pay-pct">{pct.toFixed(1)}% of revenue</span>
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      {recent.length > 0 && (
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">Recent Transactions</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>#</th><th>Passenger</th><th>Method</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id}>
                    <td className="adm-td-muted">#{r.id}</td>
                    <td>{r.passenger_name || '—'}</td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{METHOD_ICON[r.payment_method] || '💰'} {r.payment_method}</span></td>
                    <td className="adm-td-gold">${parseFloat(r.fare || 0).toFixed(2)}</td>
                    <td className="adm-td-muted">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
