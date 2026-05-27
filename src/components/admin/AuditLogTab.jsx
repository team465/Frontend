import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · ' + new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function AuditLogTab() {
  const [rides, setRides]   = useState([]);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/rides?status=cancelled', { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json()),
      fetch('/api/admin/users', { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json()),
    ]).then(([r, u]) => {
      setRides(Array.isArray(r) ? r.slice(0, 10) : []);
      setUsers(Array.isArray(u) ? u.slice(0, 10) : []);
    }).finally(() => setLoading(false));
  }, []);

  const events = [
    ...rides.map(r => ({
      type: 'ride_cancel',
      icon: '🛺',
      color: '#ef4444',
      label: `Ride #${r.id} cancelled`,
      detail: `${r.passenger_name || 'Passenger'} → ${r.destination_address || 'N/A'}`,
      time: r.created_at,
    })),
    ...users.map(u => ({
      type: 'user_join',
      icon: '👤',
      color: '#3b82f6',
      label: `${u.name} joined as ${u.role}`,
      detail: u.email,
      time: u.created_at,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 25);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Audit Log</h2>
          <p className="adm-page-sub">Recent platform activity</p>
        </div>
      </div>

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : events.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">📋</span><p>No events yet</p></div>
      ) : (
        <div className="adm-audit-list">
          {events.map((ev, i) => (
            <div key={i} className="adm-audit-row">
              <div className="adm-audit-dot" style={{ background: ev.color }}>{ev.icon}</div>
              <div className="adm-audit-info">
                <p className="adm-audit-label">{ev.label}</p>
                <p className="adm-audit-detail">{ev.detail}</p>
              </div>
              <span className="adm-audit-time">{formatDate(ev.time)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
