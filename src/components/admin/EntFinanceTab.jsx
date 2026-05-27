import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const VEHICLE_ICON = { tuktuk: '🛺', car: '🚗', moto: '🏍️', van: '🚐' };
const PAY_ICON = { cash: '💵', card: '💳', wallet: '👛', aba: '🏦', wing: '🦋', khqr: '📱' };

export default function EntFinanceTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/ent-finance', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading finance data…</div>;

  const byVehicle = data?.byVehicle || [];
  const byPayment = data?.byPayment || [];
  const monthly   = data?.monthly   || [];
  const totalRev  = byVehicle.reduce((s, v) => s + parseFloat(v.revenue || 0), 0);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Enterprise Finance</h2>
          <p className="adm-page-sub">Revenue breakdown and financial summary</p>
        </div>
        <div className="adm-kpi-card" style={{ minWidth: 150, textAlign: 'center', padding: '12px 20px' }}>
          <span className="adm-kpi-label">Total Revenue</span>
          <span className="adm-kpi-value" style={{ fontSize: 20 }}>${totalRev.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* By vehicle */}
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">Revenue by Vehicle Type</h3>
          {byVehicle.map(v => {
            const pct = totalRev > 0 ? (parseFloat(v.revenue) / totalRev) * 100 : 0;
            return (
              <div key={v.vehicle_type} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{VEHICLE_ICON[v.vehicle_type] || '🚗'} {v.vehicle_type}</span>
                  <span className="adm-td-gold">${parseFloat(v.revenue).toFixed(2)} · {v.rides} rides</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 8 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#e8a020', borderRadius: 6 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* By payment */}
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">Revenue by Payment Method</h3>
          {byPayment.map(p => {
            const pct = totalRev > 0 ? (parseFloat(p.revenue) / totalRev) * 100 : 0;
            return (
              <div key={p.payment_method} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{PAY_ICON[p.payment_method] || '💰'} {p.payment_method}</span>
                  <span className="adm-td-gold">${parseFloat(p.revenue).toFixed(2)} · {p.rides} rides</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 8 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: 6 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly P&L */}
      {monthly.length > 0 && (
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">Monthly P&amp;L (last 12 months)</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Month</th><th>Rides</th><th>Gross Revenue</th><th>Platform (15%)</th><th>NGO (5%)</th><th>Driver Payout</th></tr>
              </thead>
              <tbody>
                {monthly.map(m => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 600 }}>{m.month}</td>
                    <td>{m.rides}</td>
                    <td className="adm-td-gold">${parseFloat(m.revenue).toFixed(2)}</td>
                    <td style={{ color: '#3b82f6' }}>${parseFloat(m.platform_cut).toFixed(2)}</td>
                    <td style={{ color: '#10b981' }}>${parseFloat(m.ngo_cut).toFixed(2)}</td>
                    <td className="adm-td-muted">
                      ${(parseFloat(m.revenue) - parseFloat(m.platform_cut) - parseFloat(m.ngo_cut)).toFixed(2)}
                    </td>
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
