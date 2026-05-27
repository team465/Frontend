import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const VEHICLE_ICON = { tuktuk: '🛺', car: '🚗', moto: '🏍️', van: '🚐' };

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function EarningsTab() {
  const [stats, setStats]     = useState(null);
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/driver/stats',   { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json()),
      fetch('/api/driver/history', { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json()),
    ]).then(([s, h]) => {
      setStats(s);
      setRides(Array.isArray(h) ? h : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="drv-loading"><span className="spin">⟳</span> Loading earnings…</div>;

  const completedRides = rides.filter(r => r.status === 'completed');

  return (
    <div className="drv-earnings">

      {/* Summary cards */}
      <div className="earn-grid">
        <div className="earn-card earn-card--wide">
          <span className="earn-label">Today's Earnings</span>
          <span className="earn-value earn-value--gold">${parseFloat(stats?.today_earned || 0).toFixed(2)}</span>
          <span className="earn-sub">{stats?.today_rides || 0} rides</span>
        </div>
        <div className="earn-card">
          <span className="earn-label">This Month</span>
          <span className="earn-value">${parseFloat(stats?.month_earned || 0).toFixed(2)}</span>
          <span className="earn-sub">{stats?.month_rides || 0} rides</span>
        </div>
        <div className="earn-card">
          <span className="earn-label">All Time</span>
          <span className="earn-value">${parseFloat(stats?.total_earned || 0).toFixed(2)}</span>
          <span className="earn-sub">{stats?.total_rides || 0} rides</span>
        </div>
        <div className="earn-card">
          <span className="earn-label">Avg Rating</span>
          <span className="earn-value earn-value--gold">
            {stats?.avg_rating ? `★ ${parseFloat(stats.avg_rating).toFixed(1)}` : '—'}
          </span>
          <span className="earn-sub">{stats?.rating_count || 0} ratings</span>
        </div>
      </div>

      {/* Ride history */}
      <h3 className="earn-history-title">Ride History</h3>

      {completedRides.length === 0 ? (
        <div className="drv-empty">
          <div className="drv-empty-icon">📊</div>
          <p>No completed rides yet</p>
          <span>Accept ride requests to start earning</span>
        </div>
      ) : (
        <div className="earn-ride-list">
          {rides.map(ride => (
            <div key={ride.id} className={`earn-ride-card ${ride.status === 'cancelled' ? 'earn-ride-card--cancelled' : ''}`}>
              <div className="earn-ride-head">
                <span className="earn-ride-vehicle">
                  {VEHICLE_ICON[ride.vehicle_type] || '🛺'} {ride.vehicle_type}
                </span>
                <span className="earn-ride-date">{formatDate(ride.updated_at || ride.created_at)}</span>
              </div>
              <div className="earn-ride-route">
                <div className="earn-route-row">
                  <span className="dot dot--green" />
                  <span className="earn-addr">{ride.pickup_address}</span>
                </div>
                {ride.destination_address && (
                  <div className="earn-route-row">
                    <span className="dot dot--red" />
                    <span className="earn-addr">{ride.destination_address}</span>
                  </div>
                )}
              </div>
              <div className="earn-ride-foot">
                <span className="earn-ride-pax">👤 {ride.passenger_name || 'Passenger'}</span>
                <div className="earn-ride-right">
                  {ride.driver_rating && (
                    <span className="earn-rating">{'★'.repeat(ride.driver_rating)}</span>
                  )}
                  {ride.status === 'cancelled' ? (
                    <span className="earn-cancelled">Cancelled</span>
                  ) : (
                    <span className="earn-fare">${parseFloat(ride.fare || 0).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
