import { useState, useEffect, useCallback } from 'react';
import RideMap from '../RideMap';

const TOKEN = () => localStorage.getItem('token');

const STATUS_CONFIG = {
  matched:     { label: 'Head to pickup',   color: '#3b82f6', icon: '🚗', action: "I've Arrived",  actionColor: '#8b5cf6' },
  arrived:     { label: 'At pickup',        color: '#8b5cf6', icon: '📍', action: 'Start Ride',    actionColor: '#10b981' },
  in_progress: { label: 'Ride in progress', color: '#10b981', icon: '🛺', action: 'Complete Ride', actionColor: '#e8a020' },
};

export default function ActiveRideTab({ onFinished }) {
  const [ride, setRide]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError]         = useState('');

  const fetchRide = useCallback(async () => {
    try {
      const res  = await fetch('/api/driver/active', {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      setRide(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRide();
    const id = setInterval(fetchRide, 5000);
    return () => clearInterval(id);
  }, [fetchRide]);

  async function handleAdvance() {
    setError('');
    setAdvancing(true);
    try {
      const res  = await fetch(`/api/driver/rides/${ride.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      if (data.status === 'completed') { onFinished(); }
      else { setRide(data); }
    } catch {
      setError('Connection error');
    } finally {
      setAdvancing(false);
    }
  }

  if (loading) return <div className="drv-loading"><span className="spin">⟳</span> Loading…</div>;

  if (!ride) {
    return (
      <div className="drv-empty-active">
        <div className="drv-empty-icon">📭</div>
        <h3>No active ride</h3>
        <p>Accept a ride request to get started.</p>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[ride.status] || STATUS_CONFIG.matched;

  return (
    <div className="drv-active">
      {/* Status banner */}
      <div className="drv-status-banner" style={{ background: cfg.color }}>
        <span className="drv-status-icon">{cfg.icon}</span>
        <span className="drv-status-label">{cfg.label}</span>
        <span className="myride-pulse"><span className="pulse-dot" /></span>
      </div>

      {/* Map */}
      <RideMap
        pickup={ride.pickup_address}
        destination={ride.destination_address}
        height={220}
        className="drv-map"
      />

      {/* Route card */}
      <div className="drv-route-card">
        <div className="drv-route-row">
          <span className="dot dot--green" style={{ marginTop: 3 }} />
          <div>
            <p className="drv-route-label">Pickup</p>
            <p className="drv-route-addr">{ride.pickup_address}</p>
          </div>
        </div>
        {ride.destination_address && (
          <>
            <div className="drv-route-track" />
            <div className="drv-route-row">
              <span className="dot dot--red" style={{ marginTop: 3 }} />
              <div>
                <p className="drv-route-label">Destination</p>
                <p className="drv-route-addr">{ride.destination_address}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Passenger info */}
      {ride.passenger_name && (
        <div className="drv-passenger-card">
          <div className="drv-pax-avatar">{ride.passenger_name.charAt(0).toUpperCase()}</div>
          <div className="drv-pax-info">
            <p className="drv-pax-name">{ride.passenger_name}</p>
            <p className="drv-pax-sub">Passenger</p>
          </div>
          <div className="drv-pax-right">
            <span className="drv-fare-tag">${parseFloat(ride.fare || ride.offered_fare || 0).toFixed(2)}</span>
            <span className="drv-pay-method">{ride.payment_method || 'cash'}</span>
          </div>
        </div>
      )}

      {/* Ride meta */}
      <div className="drv-meta-row">
        <div className="drv-meta-item">
          <span className="drv-meta-label">Vehicle</span>
          <span className="drv-meta-value">{ride.vehicle_type || '—'}</span>
        </div>
        {ride.distance_km && (
          <div className="drv-meta-item">
            <span className="drv-meta-label">Distance</span>
            <span className="drv-meta-value">~{parseFloat(ride.distance_km).toFixed(1)} km</span>
          </div>
        )}
        <div className="drv-meta-item">
          <span className="drv-meta-label">Fare</span>
          <span className="drv-meta-value drv-fare-hi">${parseFloat(ride.fare || ride.offered_fare || 0).toFixed(2)}</span>
        </div>
      </div>

      {error && <p className="drv-error">{error}</p>}

      {/* Advance button */}
      <button
        className="drv-advance-btn"
        style={{ background: cfg.actionColor }}
        onClick={handleAdvance}
        disabled={advancing}
      >
        {advancing ? 'Updating…' : cfg.action}
      </button>
    </div>
  );
}
