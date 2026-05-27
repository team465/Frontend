import { useState, useEffect, useCallback } from 'react';

const TOKEN = () => localStorage.getItem('token');

function timeAgo(iso) {
  if (!iso) return 'Never';
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

export default function PassengersTab() {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [error, setError]   = useState('');

  const fetch_ = useCallback(async () => {
    const p = new URLSearchParams();
    if (search.trim()) p.set('search', search.trim());
    try {
      const res  = await fetch(`/api/admin/passengers?${p}`, { headers: { Authorization: `Bearer ${TOKEN()}` } });
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch_(); }, [fetch_]);

  async function handleDelete(id) {
    setDeleting(id); setError('');
    try {
      const res  = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN()}` } });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Delete failed'); return; }
      setList(prev => prev.filter(u => u.id !== id));
      setConfirmDel(null);
    } finally { setDeleting(null); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Passengers</h2>
          <p className="adm-page-sub">{list.length} registered passenger{list.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <input className="adm-search-full" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">👤</span><p>No passengers found</p></div>
      ) : (
        <div className="adm-card-list">
          {list.map(u => (
            <div key={u.id} className="adm-user-card">
              <div className="adm-user-avatar" style={{ background: '#3b82f6' }}>{u.name?.charAt(0).toUpperCase()}</div>
              <div className="adm-user-info">
                <p className="adm-user-name">{u.name}</p>
                <p className="adm-user-email">{u.email}</p>
                <p className="adm-user-joined">Last ride: {timeAgo(u.last_ride)}</p>
              </div>
              <div className="adm-pax-stats">
                <div className="adm-pstat">
                  <span className="adm-pstat-val">{u.total_rides || 0}</span>
                  <span className="adm-pstat-lbl">Rides</span>
                </div>
                <div className="adm-pstat">
                  <span className="adm-pstat-val">${parseFloat(u.total_spent || 0).toFixed(0)}</span>
                  <span className="adm-pstat-lbl">Spent</span>
                </div>
              </div>
              <button className="adm-delete-btn" onClick={() => setConfirmDel(u)} title="Delete">🗑</button>
            </div>
          ))}
        </div>
      )}

      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConfirmDel(null)}>✕</button>
            <h3>Delete passenger?</h3>
            <p>Permanently delete <strong>{confirmDel.name}</strong>? This cannot be undone.</p>
            {error && <p className="adm-error">{error}</p>}
            <div className="modal-actions">
              <button className="adm-modal-cancel" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="adm-modal-delete" onClick={() => handleDelete(confirmDel.id)} disabled={deleting === confirmDel.id}>
                {deleting === confirmDel.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
