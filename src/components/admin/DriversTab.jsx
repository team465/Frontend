import { useState, useEffect, useCallback } from 'react';

const TOKEN = () => localStorage.getItem('token');

function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function DriversTab() {
  const [drivers, setDrivers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [demoting, setDemoting] = useState(null);
  const [error, setError]       = useState('');

  const fetchDrivers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    try {
      const res  = await fetch(`/api/admin/drivers?${params}`, { headers: { Authorization: `Bearer ${TOKEN()}` } });
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  async function handleDemote(id, name) {
    if (!confirm(`Demote ${name} to passenger?`)) return;
    setDemoting(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ role: 'passenger' }),
      });
      if (res.ok) setDrivers(prev => prev.filter(d => d.id !== id));
      else { const d = await res.json(); setError(d.error); }
    } finally { setDemoting(null); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Drivers</h2>
          <p className="adm-page-sub">{drivers.length} registered driver{drivers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <input
        className="adm-search-full"
        placeholder="Search driver name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading drivers…</div>
      ) : drivers.length === 0 ? (
        <div className="adm-empty-state">
          <span className="adm-empty-icon">🚗</span>
          <p>No drivers found</p>
        </div>
      ) : (
        <div className="adm-card-list">
          {drivers.map(d => (
            <div key={d.id} className="adm-driver-card">
              <div className="adm-driver-left">
                <div className={`adm-driver-avatar ${parseInt(d.active_rides) > 0 ? 'adm-driver-avatar--active' : ''}`}>
                  {d.name?.charAt(0).toUpperCase()}
                  {parseInt(d.active_rides) > 0 && <span className="adm-avatar-dot" />}
                </div>
                <div>
                  <p className="adm-driver-name">{d.name}</p>
                  <p className="adm-driver-email">{d.email}</p>
                  <p className="adm-driver-last">Last active: {timeAgo(d.last_active)}</p>
                </div>
              </div>

              <div className="adm-driver-stats">
                <div className="adm-dstat">
                  <span className="adm-dstat-val">{d.total_rides || 0}</span>
                  <span className="adm-dstat-lbl">Rides</span>
                </div>
                <div className="adm-dstat">
                  <span className="adm-dstat-val">${parseFloat(d.total_earned || 0).toFixed(0)}</span>
                  <span className="adm-dstat-lbl">Earned</span>
                </div>
                <div className="adm-dstat">
                  <span className="adm-dstat-val adm-dstat-gold">
                    {d.avg_rating ? `★ ${d.avg_rating}` : '—'}
                  </span>
                  <span className="adm-dstat-lbl">Rating</span>
                </div>
                {parseInt(d.active_rides) > 0 && (
                  <div className="adm-dstat">
                    <span className="adm-dstat-val adm-dstat-green">{d.active_rides}</span>
                    <span className="adm-dstat-lbl">Active</span>
                  </div>
                )}
              </div>

              <button
                className="adm-demote-btn"
                onClick={() => handleDemote(d.id, d.name)}
                disabled={demoting === d.id}
                title="Demote to passenger"
              >
                {demoting === d.id ? '…' : '↓ Demote'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
