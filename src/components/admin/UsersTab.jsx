import { useState, useEffect, useCallback } from 'react';

const TOKEN = () => localStorage.getItem('token');

const ROLE_PILL = {
  passenger: 'adm-role-pill--passenger',
  driver:    'adm-role-pill--driver',
  admin:     'adm-role-pill--admin',
};

function formatJoined(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UsersTab() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [changingRole, setChangingRole] = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError]         = useState('');

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (search.trim()) params.set('search', search.trim());
    try {
      const res  = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleRoleChange(userId, newRole) {
    setChangingRole(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } finally { setChangingRole(null); }
  }

  async function handleDelete(userId) {
    setError('');
    setDeleting(userId);
    try {
      const res  = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Delete failed'); return; }
      setUsers(prev => prev.filter(u => u.id !== userId));
      setConfirmDelete(null);
    } finally { setDeleting(null); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Users</h2>
          <p className="adm-page-sub">{users.length} user{users.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="adm-filters">
        <input
          className="adm-search-full"
          placeholder="Search name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="adm-role-filter">
          {['all','passenger','driver','admin'].map(r => (
            <button
              key={r}
              className={`adm-filter-btn ${roleFilter === r ? 'adm-filter-btn--active' : ''}`}
              onClick={() => setRoleFilter(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading users…</div>
      ) : users.length === 0 ? (
        <div className="adm-empty">
          <span>👤</span>
          <p>No users found</p>
        </div>
      ) : (
        <div className="adm-user-list">
          {users.map(user => (
            <div key={user.id} className="adm-user-card">
              <div className="adm-user-avatar">{user.name?.charAt(0).toUpperCase() || '?'}</div>
              <div className="adm-user-info">
                <p className="adm-user-name">{user.name}</p>
                <p className="adm-user-email">{user.email}</p>
                <p className="adm-user-joined">Joined {formatJoined(user.created_at)}</p>
              </div>
              <div className="adm-user-actions">
                <span className={`adm-role-pill ${ROLE_PILL[user.role] || ''}`}>{user.role}</span>
                <select
                  className="adm-role-select"
                  value={user.role}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                  disabled={changingRole === user.id}
                >
                  <option value="passenger">Passenger</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  className="adm-delete-btn"
                  onClick={() => setConfirmDelete(user)}
                  title="Delete user"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            <h3>Delete user?</h3>
            <p>
              Permanently delete <strong>{confirmDelete.name}</strong> ({confirmDelete.email})?
              This cannot be undone.
            </p>
            {error && <p className="adm-error">{error}</p>}
            <div className="modal-actions">
              <button className="adm-modal-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="adm-modal-delete"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting === confirmDelete.id}
              >
                {deleting === confirmDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
