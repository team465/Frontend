import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const SEV_COLOR  = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7f1d1d' };
const STATUS_DOT = {
  completed: '#10b981', cancelled: '#ef4444', pending: '#f59e0b',
  matched: '#3b82f6', in_progress: '#8b5cf6',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' ' + new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function EventsLogTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    fetch('/api/admin/events-log', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading events…</div>;

  const rides     = (data?.rides     || []).map(r => ({ ...r, _type: 'ride' }));
  const users     = (data?.users     || []).map(u => ({ ...u, _type: 'user' }));
  const incidents = (data?.incidents || []).map(i => ({ ...i, _type: 'incident' }));

  const all = [...rides, ...users, ...incidents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filtered = filter === 'all' ? all : all.filter(e => e._type === filter);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Events Log</h2>
          <p className="adm-page-sub">{all.length} recent events across all platform activity</p>
        </div>
      </div>

      {/* Filter */}
      <div className="pay-row" style={{ marginBottom: 20 }}>
        {[['all','All Events'],['ride','Rides'],['user','Users'],['incident','Incidents']].map(([id, label]) => (
          <button key={id} type="button"
            className={`pay-chip ${filter === id ? 'pay-chip--active' : ''}`}
            onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">🗒️</span><p>No events</p></div>
      ) : (
        <div className="adm-audit-list">
          {filtered.map((ev, i) => {
            if (ev._type === 'ride') return (
              <div key={`r${ev.id}${i}`} className="adm-audit-row">
                <div className="adm-audit-dot" style={{ background: STATUS_DOT[ev.status] || '#999', fontSize: 13 }}>🛺</div>
                <div className="adm-audit-info">
                  <p className="adm-audit-label">Ride #{ev.id} — {ev.status}</p>
                  <p className="adm-audit-detail">
                    {ev.passenger_name || 'Passenger'}
                    {ev.driver_name ? ` → ${ev.driver_name}` : ''}
                    {ev.fare ? ` · $${parseFloat(ev.fare).toFixed(2)}` : ''}
                    {' · '}{ev.vehicle_type}
                  </p>
                </div>
                <span className="adm-audit-time">{formatDate(ev.created_at)}</span>
              </div>
            );
            if (ev._type === 'user') return (
              <div key={`u${ev.id}${i}`} className="adm-audit-row">
                <div className="adm-audit-dot" style={{ background: '#3b82f6', fontSize: 13 }}>👤</div>
                <div className="adm-audit-info">
                  <p className="adm-audit-label">{ev.name} registered as {ev.role}</p>
                  <p className="adm-audit-detail">{ev.email} · {ev.is_verified ? '✓ verified' : 'unverified'}</p>
                </div>
                <span className="adm-audit-time">{formatDate(ev.created_at)}</span>
              </div>
            );
            if (ev._type === 'incident') return (
              <div key={`i${ev.id}${i}`} className="adm-audit-row">
                <div className="adm-audit-dot" style={{ background: SEV_COLOR[ev.severity] || '#f59e0b', fontSize: 13 }}>⚠️</div>
                <div className="adm-audit-info">
                  <p className="adm-audit-label">Incident: {ev.type} ({ev.severity})</p>
                  <p className="adm-audit-detail">{ev.description?.slice(0, 80)}{ev.description?.length > 80 ? '…' : ''}</p>
                </div>
                <span className="adm-audit-time">{formatDate(ev.created_at)}</span>
              </div>
            );
            return null;
          })}
        </div>
      )}
    </div>
  );
}
