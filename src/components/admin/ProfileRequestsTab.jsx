import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const ROLE_COLOR = { passenger: '#3b82f6', driver: '#10b981' };

export default function ProfileRequestsTab() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/profile-requests', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setList(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleVerify(id, verified) {
    setUpdating(id); setError('');
    try {
      const res  = await fetch(`/api/admin/profile-requests/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ verified }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setList(prev => prev.filter(u => u.id !== id));
    } finally { setUpdating(null); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Profile Requests</h2>
          <p className="adm-page-sub">{list.length} user{list.length !== 1 ? 's' : ''} awaiting verification</p>
        </div>
        {list.length > 0 && <div className="adm-alert-badge">{list.length} pending</div>}
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state">
          <span className="adm-empty-icon">✅</span>
          <p>All profiles are verified</p>
        </div>
      ) : (
        <div className="adm-card-list">
          {list.map(u => (
            <div key={u.id} className="adm-app-card adm-app-card--pending">
              <div className="adm-driver-avatar" style={{ background: ROLE_COLOR[u.role] || '#6b7280' }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info" style={{ flex: 1 }}>
                <p className="adm-user-name">{u.name}</p>
                <p className="adm-user-email">{u.email}</p>
                <p className="adm-user-joined">
                  Role: <strong>{u.role}</strong> · Joined {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="adm-app-actions">
                <button className="adm-approve-btn" onClick={() => handleVerify(u.id, true)} disabled={updating === u.id}>
                  {updating === u.id ? '…' : '✓ Verify'}
                </button>
                <button className="adm-reject-btn" onClick={() => handleVerify(u.id, false)} disabled={updating === u.id}>
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
