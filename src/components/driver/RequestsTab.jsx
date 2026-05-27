import { useState, useEffect, useCallback } from 'react';

const TOKEN = () => localStorage.getItem('token');

const VEHICLE_ICON = { tuktuk: '🛺', car: '🚗', moto: '🏍️', van: '🚐' };
const BOOKING_LABEL = { standard: 'Standard', full_day: 'Full Day', scheduled: 'Scheduled', favorite: 'Favorite' };

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function RequestsTab({ isOnline, onAccepted }) {
  const [rides, setRides]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError]       = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res  = await fetch('/api/driver/requests', {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      setRides(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRequests();
    const id = setInterval(fetchRequests, 8000);
    return () => clearInterval(id);
  }, [fetchRequests]);

  async function handleAccept(rideId) {
    setError('');
    setAccepting(rideId);
    try {
      const res  = await fetch(`/api/driver/rides/${rideId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to accept'); return; }
      onAccepted();
    } catch {
      setError('Connection error');
    } finally {
      setAccepting(null);
    }
  }

  if (!isOnline) {
    return (
      <div className="drv-offline">
        <div className="drv-offline-icon">📵</div>
        <h3>You're offline</h3>
        <p>Toggle the switch above to go online and start receiving ride requests.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="drv-loading"><span className="spin">⟳</span> Looking for rides…</div>;
  }

  return (
    <div className="drv-requests">
      <div className="drv-section-head">
        <h2>Ride Requests</h2>
        <span className="drv-live-dot" /> <span className="drv-live-label">Live</span>
      </div>

      {error && <p className="drv-error">{error}</p>}

      {rides.length === 0 ? (
        <div className="drv-empty">
          <div className="drv-empty-icon">🔍</div>
          <p>No ride requests right now</p>
          <span>We'll refresh automatically every 8 seconds</span>
        </div>
      ) : (
        <div className="drv-req-list">
          {rides.map(ride => (
            <div key={ride.id} className="drv-req-card">
              <div className="drv-req-head">
                <div className="drv-req-vehicle">
                  {VEHICLE_ICON[ride.vehicle_type] || '🛺'}
                  <span>{ride.vehicle_type}</span>
                  {ride.booking_type && ride.booking_type !== 'standard' && (
                    <span className="drv-btype-badge">{BOOKING_LABEL[ride.booking_type] || ride.booking_type}</span>
                  )}
                </div>
                <span className="drv-req-time">{timeAgo(ride.created_at)}</span>
              </div>

              <div className="drv-req-route">
                <div className="drv-req-row">
                  <span className="dot dot--green" />
                  <span className="drv-req-addr">{ride.pickup_address}</span>
                </div>
                {ride.destination_address && (
                  <div className="drv-req-row">
                    <span className="dot dot--red" />
                    <span className="drv-req-addr">{ride.destination_address}</span>
                  </div>
                )}
                {ride.hire_description && (
                  <div className="drv-req-desc">"{ride.hire_description}"</div>
                )}
              </div>

              <div className="drv-req-meta">
                {ride.distance_km && (
                  <span className="drv-meta-chip">📍 ~{parseFloat(ride.distance_km).toFixed(1)} km</span>
                )}
                <span className="drv-meta-chip">💳 {ride.payment_method || 'cash'}</span>
                {ride.passenger_name && (
                  <span className="drv-meta-chip">👤 {ride.passenger_name}</span>
                )}
              </div>

              <div className="drv-req-foot">
                <span className="drv-req-fare">
                  ${parseFloat(ride.offered_fare || ride.fare || 0).toFixed(2)}
                </span>
                <button
                  className="drv-accept-btn"
                  onClick={() => handleAccept(ride.id)}
                  disabled={accepting === ride.id}
                >
                  {accepting === ride.id ? 'Accepting…' : 'Accept Ride'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
