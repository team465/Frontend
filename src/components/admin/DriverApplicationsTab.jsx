import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DriverApplicationsTab() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/driver-applications', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setDrivers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleVerify(id, verified) {
    setUpdating(id); setError('');
    try {
      const res  = await fetch(`/api/admin/driver-applications/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ verified }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, is_verified: verified } : d));
    } finally { setUpdating(null); }
  }

  const pending   = drivers.filter(d => !d.is_verified);
  const approved  = drivers.filter(d =>  d.is_verified);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Driver Applications</h2>
          <p className="adm-page-sub">{pending.length} pending · {approved.length} approved</p>
        </div>
        {pending.length > 0 && (
          <div className="adm-alert-badge">{pending.length} awaiting review</div>
        )}
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : drivers.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">📋</span><p>No driver applications</p></div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <p className="adm-sub-section-title">⏳ Pending Review ({pending.length})</p>
              <div className="adm-card-list">
                {pending.map(d => (
                  <div key={d.id} className="adm-app-card adm-app-card--pending">
                    <div className="adm-driver-avatar">{d.name?.charAt(0).toUpperCase()}</div>
                    <div className="adm-user-info" style={{ flex: 1 }}>
                      <p className="adm-user-name">{d.name}</p>
                      <p className="adm-user-email">{d.email}</p>
                      <p className="adm-user-joined">Applied: {formatDate(d.created_at)}</p>
                    </div>
                    <div className="adm-app-actions">
                      <button className="adm-approve-btn" onClick={() => handleVerify(d.id, true)} disabled={updating === d.id}>
                        {updating === d.id ? '…' : '✓ Approve'}
                      </button>
                      <button className="adm-reject-btn" onClick={() => handleVerify(d.id, false)} disabled={updating === d.id}>
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {approved.length > 0 && (
            <div>
              <p className="adm-sub-section-title">✓ Approved Drivers ({approved.length})</p>
              <div className="adm-card-list">
                {approved.map(d => (
                  <div key={d.id} className="adm-app-card">
                    <div className="adm-driver-avatar adm-driver-avatar--active">{d.name?.charAt(0).toUpperCase()}</div>
                    <div className="adm-user-info" style={{ flex: 1 }}>
                      <p className="adm-user-name">{d.name}</p>
                      <p className="adm-user-email">{d.email}</p>
                      <p className="adm-user-joined">Joined: {formatDate(d.created_at)} · {d.total_rides || 0} rides</p>
                    </div>
                    <span className="adm-verified-badge">✓ Verified</span>
                    <button className="adm-reject-btn" onClick={() => handleVerify(d.id, false)} disabled={updating === d.id}>
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
