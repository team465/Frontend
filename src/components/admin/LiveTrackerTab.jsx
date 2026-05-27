import { useState, useEffect, useCallback } from 'react';
import RideMap from '../RideMap';

const TOKEN = () => localStorage.getItem('token');

const STATUS_COLOR = {
  pending:     '#e8a020',
  matched:     '#3b82f6',
  arrived:     '#8b5cf6',
  in_progress: '#10b981',
};
const STATUS_LABEL = {
  pending:     'Looking for driver',
  matched:     'Driver on the way',
  arrived:     'Driver arrived',
  in_progress: 'Ride in progress',
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

export default function LiveTrackerTab() {
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchRides = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/active-rides', { headers: { Authorization: `Bearer ${TOKEN()}` } });
      const data = await res.json();
      setRides(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRides();
    const id = setInterval(fetchRides, 10000);
    return () => clearInterval(id);
  }, [fetchRides]);

  const selectedRide = rides.find(r => r.id === selected) || rides[0] || null;

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Live Tracker</h2>
          <p className="adm-page-sub">Real-time active rides — refreshes every 10s</p>
        </div>
        {rides.length > 0 && (
          <div className="adm-live-badge">
            <span className="adm-live-dot" /> {rides.length} active ride{rides.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="adm-tracker-layout">
        {/* Map */}
        <div className="adm-tracker-map">
          {selectedRide ? (
            <RideMap
              pickup={selectedRide.pickup_address}
              destination={selectedRide.destination_address}
              height={420}
            />
          ) : (
            <div className="adm-map-placeholder">
              <span>🗺️</span>
              <p>No active rides to display</p>
            </div>
          )}
        </div>

        {/* Ride list */}
        <div className="adm-tracker-list">
          {loading ? (
            <div className="adm-loading"><span className="spin">⟳</span></div>
          ) : rides.length === 0 ? (
            <div className="adm-empty-state" style={{ padding: '32px 16px' }}>
              <span className="adm-empty-icon">🛺</span>
              <p>No active rides</p>
            </div>
          ) : (
            rides.map(ride => (
              <button
                key={ride.id}
                className={`adm-tracker-card ${selected === ride.id || (!selected && rides[0]?.id === ride.id) ? 'adm-tracker-card--active' : ''}`}
                onClick={() => setSelected(ride.id)}
              >
                <div className="adm-tracker-card-top">
                  <span
                    className="adm-tracker-status-dot"
                    style={{ background: STATUS_COLOR[ride.status] || '#999' }}
                  />
                  <span className="adm-tracker-status-label">{STATUS_LABEL[ride.status] || ride.status}</span>
                  <span className="adm-tracker-time">{timeAgo(ride.created_at)}</span>
                </div>
                <p className="adm-tracker-who">
                  👤 {ride.passenger_name || 'Passenger'}
                  {ride.driver_name ? ` · 🚗 ${ride.driver_name}` : ''}
                </p>
                <p className="adm-tracker-pickup">{ride.pickup_address}</p>
                {ride.destination_address && (
                  <p className="adm-tracker-dest">→ {ride.destination_address}</p>
                )}
                <p className="adm-tracker-fare">${parseFloat(ride.fare || 0).toFixed(2)} · {ride.vehicle_type}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
