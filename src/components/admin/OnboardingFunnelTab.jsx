import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const STAGES = [
  { key: 'registered',    label: 'Registered',      icon: '📝', desc: 'Signed up as driver' },
  { key: 'verified',      label: 'Verified',         icon: '✅', desc: 'Profile approved by admin' },
  { key: 'first_ride',    label: 'First Ride',       icon: '🚗', desc: 'Completed at least 1 ride' },
  { key: 'power_drivers', label: 'Power Driver',     icon: '⭐', desc: '10+ completed rides' },
];

export default function OnboardingFunnelTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/onboarding-funnel', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading funnel…</div>;

  const total = parseInt(data?.registered || 0);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Onboarding Funnel</h2>
          <p className="adm-page-sub">Driver progression through onboarding stages</p>
        </div>
      </div>

      <div style={{ maxWidth: 600 }}>
        {STAGES.map((stage, i) => {
          const count = parseInt(data?.[stage.key] || 0);
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          const width = `${Math.max(pct, 4)}%`;
          return (
            <div key={stage.key} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{stage.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>{stage.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{stage.desc}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#e8a020' }}>{count}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>({pct}%)</span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
                <div style={{
                  width,
                  height: '100%',
                  background: i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : '#8b5cf6',
                  borderRadius: 8,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="adm-fare-note" style={{ marginTop: 16 }}>
        <strong>📌 Conversion rate:</strong>{' '}
        {total > 0 ? Math.round((parseInt(data?.first_ride || 0) / total) * 100) : 0}% of registered drivers complete their first ride.
      </div>
    </div>
  );
}
