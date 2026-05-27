import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const STATUS_PILL = {
  pending:     { label: 'Pending',     cls: 'pill-neutral' },
  matched:     { label: 'Matched',     cls: 'pill-purple'  },
  arrived:     { label: 'Arrived',     cls: 'pill-amber'   },
  in_progress: { label: 'In Progress', cls: 'pill-blue'    },
  completed:   { label: 'Completed',   cls: 'pill-green'   },
  cancelled:   { label: 'Cancelled',   cls: 'pill-red'     },
  scheduled:   { label: 'Scheduled',   cls: 'pill-stone'   },
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="adm-kpi-card">
      {color && <div className="adm-kpi-bar" style={{ background: color }} />}
      <span className="adm-kpi-label">{label}</span>
      <span className="adm-kpi-value">{value}</span>
      {sub && <span className="adm-kpi-sub">{sub}</span>}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function OverviewTab() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>;

  const u = stats?.users   || {};
  const r = stats?.rides   || {};
  const v = stats?.revenue || {};
  const recent = stats?.recent || [];

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Overview</h2>
          <p className="adm-page-sub">Platform at a glance</p>
        </div>
        {parseInt(r.active) > 0 && (
          <div className="adm-live-badge">
            <span className="adm-live-dot" />
            {r.active} active ride{r.active !== '1' ? 's' : ''}
          </div>
        )}
      </div>

      {/* Revenue KPIs */}
      <p className="adm-kpi-group-label">💰 Revenue</p>
      <div className="adm-kpi-grid adm-kpi-grid--3">
        <StatCard label="All Time"   value={`$${parseFloat(v.total_revenue||0).toFixed(2)}`} color="#e8a020" />
        <StatCard label="This Month" value={`$${parseFloat(v.month_revenue||0).toFixed(2)}`} color="#3b82f6" />
        <StatCard label="Avg Fare"   value={`$${parseFloat(v.avg_fare||0).toFixed(2)}`}      color="#10b981" />
      </div>

      {/* Ride KPIs */}
      <p className="adm-kpi-group-label">🛺 Rides</p>
      <div className="adm-kpi-grid adm-kpi-grid--4">
        <StatCard label="Total"      value={r.total||0}                                    color="#6366f1" />
        <StatCard label="Active Now" value={r.active||0}     sub="live"                    color="#22c55e" />
        <StatCard label="Completed"  value={r.completed||0}                                color="#10b981" />
        <StatCard label="Cancelled"  value={r.cancelled||0}                                color="#ef4444" />
      </div>

      {/* User KPIs */}
      <p className="adm-kpi-group-label">👥 Users</p>
      <div className="adm-kpi-grid adm-kpi-grid--4">
        <StatCard label="Total"      value={u.total||0}                                    color="#6366f1" />
        <StatCard label="Passengers" value={u.passengers||0}                               color="#3b82f6" />
        <StatCard label="Drivers"    value={u.drivers||0}                                  color="#10b981" />
        <StatCard label="New (7d)"   value={u.new_week||0}   sub="this week"               color="#e8a020" />
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <>
          <p className="adm-kpi-group-label">🕐 Recent Rides</p>
          <div className="adm-recent-list">
            {recent.map(ride => {
              const pill = STATUS_PILL[ride.status] || STATUS_PILL.pending;
              return (
                <div key={ride.id} className="adm-recent-row">
                  <div className="adm-recent-left">
                    <span className={`hist-pill ${pill.cls}`}>{pill.label}</span>
                    <div className="adm-recent-info">
                      <span className="adm-recent-who">
                        {ride.passenger_name || 'Passenger'}
                        {ride.driver_name ? ` → ${ride.driver_name}` : ''}
                      </span>
                      <span className="adm-recent-route">
                        {ride.pickup_address}
                        {ride.destination_address ? ` → ${ride.destination_address}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="adm-recent-right">
                    <span className="adm-recent-fare">
                      {ride.status === 'cancelled' ? '—' : `$${parseFloat(ride.fare||0).toFixed(2)}`}
                    </span>
                    <span className="adm-recent-time">{timeAgo(ride.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
