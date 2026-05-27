import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function DriverLeadsTab() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [converting, setConverting] = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetch('/api/admin/driver-leads', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setList(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleConvert(id) {
    if (!confirm('Convert this passenger to driver?')) return;
    setConverting(id); setError('');
    try {
      const res  = await fetch(`/api/admin/driver-leads/${id}/convert`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setList(prev => prev.filter(u => u.id !== id));
    } finally { setConverting(null); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Driver Leads</h2>
          <p className="adm-page-sub">Frequent passengers who could become drivers (2+ rides)</p>
        </div>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state">
          <span className="adm-empty-icon">🎯</span>
          <p>No driver leads yet</p>
          <p style={{ fontSize: 12, opacity: 0.5 }}>Passengers with 2+ rides will appear here</p>
        </div>
      ) : (
        <div className="adm-card-list">
          {list.map(u => (
            <div key={u.id} className="adm-user-card">
              <div className="adm-user-avatar" style={{ background: '#f59e0b' }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info" style={{ flex: 1 }}>
                <p className="adm-user-name">{u.name}</p>
                <p className="adm-user-email">{u.email}</p>
                <p className="adm-user-joined">
                  Last ride: {u.last_ride ? new Date(u.last_ride).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="adm-pax-stats">
                <div className="adm-pstat">
                  <span className="adm-pstat-val">{u.total_rides}</span>
                  <span className="adm-pstat-lbl">Rides</span>
                </div>
                <div className="adm-pstat">
                  <span className="adm-pstat-val">${parseFloat(u.total_spent || 0).toFixed(0)}</span>
                  <span className="adm-pstat-lbl">Spent</span>
                </div>
              </div>
              <button
                className="adm-approve-btn"
                onClick={() => handleConvert(u.id)}
                disabled={converting === u.id}
                style={{ whiteSpace: 'nowrap' }}
              >
                {converting === u.id ? '…' : '🚗 Make Driver'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
