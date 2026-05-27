import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function TeamTab() {
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/users?role=admin', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setAdmins(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDemote(id, name) {
    if (!confirm(`Remove ${name} from admin team? They will become a passenger.`)) return;
    setPromoting(id); setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ role: 'passenger' }),
      });
      if (res.ok) setAdmins(prev => prev.filter(a => a.id !== id));
      else { const d = await res.json(); setError(d.error); }
    } finally { setPromoting(null); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Team</h2>
          <p className="adm-page-sub">{admins.length} admin{admins.length !== 1 ? 's' : ''} on the platform</p>
        </div>
      </div>

      <div className="adm-team-tip">
        To add a new admin, go to <strong>Users</strong> and change the user's role to Admin.
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : (
        <div className="adm-card-list">
          {admins.map(a => (
            <div key={a.id} className="adm-team-card">
              <div className="adm-user-avatar" style={{ background: '#7c3aed' }}>{a.name?.charAt(0).toUpperCase()}</div>
              <div className="adm-user-info">
                <p className="adm-user-name">{a.name}</p>
                <p className="adm-user-email">{a.email}</p>
              </div>
              <span className="adm-role-pill adm-role-pill--admin">Admin</span>
              <button
                className="adm-demote-btn"
                onClick={() => handleDemote(a.id, a.name)}
                disabled={promoting === a.id}
              >
                {promoting === a.id ? '…' : 'Remove admin'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
