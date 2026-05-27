import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function EntComplianceTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/ent-compliance', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading compliance data…</div>;

  const u = data?.userSummary || {};
  const r = data?.rideSummary || {};
  const unverified = data?.unverified || [];

  const verificationRate = u.total_users > 0
    ? Math.round((parseInt(u.verified_users) / parseInt(u.total_users)) * 100)
    : 0;

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Compliance</h2>
          <p className="adm-page-sub">Data governance and regulatory compliance overview</p>
        </div>
      </div>

      {/* Status cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Verification Rate', value: `${verificationRate}%`, color: verificationRate > 80 ? '#10b981' : '#f59e0b' },
          { label: 'Total Users', value: u.total_users || 0, color: '#3b82f6' },
          { label: 'Unverified Users', value: u.unverified_users || 0, color: '#ef4444' },
          { label: 'New Users (30d)', value: u.new_30d || 0, color: '#8b5cf6' },
        ].map(k => (
          <div key={k.label} className="adm-kpi-card" style={{ flex: '1 1 150px' }}>
            <div className="adm-kpi-bar" style={{ background: k.color }} />
            <span className="adm-kpi-label">{k.label}</span>
            <span className="adm-kpi-value">{k.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* User breakdown */}
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">User Data Summary</h3>
          <table className="adm-table">
            <tbody>
              {[
                ['Total users', u.total_users || 0],
                ['Verified', u.verified_users || 0],
                ['Unverified', u.unverified_users || 0],
                ['Passengers', u.passengers || 0],
                ['Drivers', u.drivers || 0],
              ].map(([label, val]) => (
                <tr key={label}><td>{label}</td><td style={{ fontWeight: 600, textAlign: 'right' }}>{val}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ride data */}
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">Ride Data Summary</h3>
          <table className="adm-table">
            <tbody>
              {[
                ['Total rides', r.total_rides || 0],
                ['Completed', r.completed || 0],
                ['Cancelled', r.cancelled || 0],
                ['Total revenue', `$${parseFloat(r.total_revenue || 0).toFixed(2)}`],
                ['Rides missing fare', r.rides_no_fare || 0],
              ].map(([label, val]) => (
                <tr key={label}><td>{label}</td><td style={{ fontWeight: 600, textAlign: 'right' }}>{val}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unverified users */}
      {unverified.length > 0 && (
        <div className="adm-chart-block">
          <h3 className="adm-chart-title">⚠️ Unverified Accounts (recent)</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {unverified.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="adm-td-muted">{u.email}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td className="adm-td-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="adm-fare-note">
        <strong>📌 GDPR Note:</strong> User data is stored securely. Passwords are bcrypt-hashed.
        Admins can delete users from the Users tab to fulfil right-to-erasure requests.
      </div>
    </div>
  );
}
