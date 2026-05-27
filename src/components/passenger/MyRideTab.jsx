import { useState, useEffect, useCallback } from 'react';
import RideMap from '../RideMap';

const TOKEN = () => localStorage.getItem('token');

const STATUS_LABELS = {
  pending:     { label: 'Looking for driver…', color: '#e8a020', icon: '🔍' },
  matched:     { label: 'Driver on the way',   color: '#3b82f6', icon: '🚗' },
  arrived:     { label: 'Driver has arrived',  color: '#8b5cf6', icon: '📍' },
  in_progress: { label: 'Ride in progress',    color: '#10b981', icon: '🛺' },
  completed:   { label: 'Ride completed',      color: '#22c55e', icon: '✅' },
  cancelled:   { label: 'Ride cancelled',      color: '#ef4444', icon: '❌' },
};

const STARS = [1, 2, 3, 4, 5];

export default function MyRideTab({ onTabChange }) {
  const [ride, setRide]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [rating, setRating]     = useState(0);
  const [rated, setRated]       = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const fetchRide = useCallback(async () => {
    try {
      const res = await fetch('/api/rides/active', {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      setRide(data);
    } catch {
      setRide(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 5 seconds for live status updates
  useEffect(() => {
    fetchRide();
    const id = setInterval(fetchRide, 5000);
    return () => clearInterval(id);
  }, [fetchRide]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await fetch(`/api/rides/${ride.id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      setShowCancel(false);
      fetchRide();
    } finally {
      setCancelling(false);
    }
  }

  async function handleRate(star) {
    setRating(star);
    await fetch(`/api/rides/${ride.id}/rate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
      body: JSON.stringify({ rating: star }),
    });
    setRated(true);
  }

  if (loading) return <div className="tab-empty"><span className="spin">⟳</span> Loading…</div>;

  if (!ride) {
    return (
      <div className="tab-empty">
        <div className="tab-empty-icon">🛺</div>
        <h3>No active ride</h3>
        <p>Book a ride to get started</p>
        <button className="btn-book" onClick={() => onTabChange('book')}>Book a ride</button>
      </div>
    );
  }

  const st = STATUS_LABELS[ride.status] || STATUS_LABELS.pending;

  return (
    <div className="myride">

      {/* Map */}
      <RideMap
        pickup={ride.pickup_address}
        destination={ride.destination_address}
        height={220}
        className="myride-map"
      />

      {/* Status banner */}
      <div className="myride-status" style={{ background: st.color }}>
        <span className="myride-status-icon">{st.icon}</span>
        <span className="myride-status-label">{st.label}</span>
        {ride.status === 'pending' && (
          <span className="myride-pulse">
            <span className="pulse-dot" />
          </span>
        )}
      </div>

      {/* Route card */}
      <div className="ride-card">
        <div className="ride-route">
          <div className="route-row">
            <span className="dot dot--green" />
            <div>
              <p className="route-label">Pickup</p>
              <p className="route-addr">{ride.pickup_address}</p>
            </div>
          </div>
          <div className="route-track-line" />
          <div className="route-row">
            <span className="dot dot--red" />
            <div>
              <p className="route-label">Destination</p>
              <p className="route-addr">{ride.destination_address}</p>
            </div>
          </div>
        </div>

        <div className="ride-meta">
          <div className="ride-meta-item">
            <span className="ride-meta-label">Vehicle</span>
            <span className="ride-meta-value">{ride.vehicle_type}</span>
          </div>
          <div className="ride-meta-item">
            <span className="ride-meta-label">Distance</span>
            <span className="ride-meta-value">~{ride.distance_km} km</span>
          </div>
          <div className="ride-meta-item">
            <span className="ride-meta-label">Fare</span>
            <span className="ride-meta-value ride-fare">${parseFloat(ride.fare).toFixed(2)}</span>
          </div>
          <div className="ride-meta-item">
            <span className="ride-meta-label">Payment</span>
            <span className="ride-meta-value">{ride.payment_method}</span>
          </div>
        </div>
      </div>

      {/* Driver info (when matched) */}
      {ride.driver_name && (
        <div className="driver-card">
          <div className="driver-avatar">{ride.driver_name.charAt(0).toUpperCase()}</div>
          <div className="driver-info">
            <p className="driver-name">{ride.driver_name}</p>
            <p className="driver-sub">Your driver</p>
          </div>
          <div className="driver-badges">
            <span className="badge badge--green">✓ Verified</span>
          </div>
        </div>
      )}

      {/* Rating (completed) */}
      {ride.status === 'completed' && !rated && !ride.driver_rating && (
        <div className="rating-card">
          <p className="rating-title">Rate your driver</p>
          <div className="stars">
            {STARS.map(s => (
              <button
                key={s}
                className={`star ${rating >= s ? 'star--on' : ''}`}
                onClick={() => handleRate(s)}
                type="button"
              >★</button>
            ))}
          </div>
        </div>
      )}

      {rated && (
        <div className="rating-done">
          <span>⭐ Thanks for rating your driver!</span>
        </div>
      )}

      {ride.status === 'completed' && (ride.driver_rating || rated) && (
        <div className="receipt-card">
          <h3>Receipt</h3>
          <div className="receipt-row"><span>Fare</span><strong>${parseFloat(ride.fare).toFixed(2)}</strong></div>
          <div className="receipt-row"><span>Payment</span><strong>{ride.payment_method}</strong></div>
          <div className="receipt-row"><span>Rating</span><strong>{'★'.repeat(ride.driver_rating || rating)}</strong></div>
          <button className="btn-book" style={{ marginTop: 16 }} onClick={() => onTabChange('book')}>
            Book another ride
          </button>
        </div>
      )}

      {/* Cancel button */}
      {['pending', 'matched'].includes(ride.status) && (
        <>
          <button className="btn-cancel" onClick={() => setShowCancel(true)}>Cancel ride</button>
          {showCancel && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Cancel this ride?</h3>
                <p>Are you sure you want to cancel your ride to <strong>{ride.destination_address}</strong>?</p>
                <div className="modal-actions">
                  <button className="btn-outline-navy" onClick={() => setShowCancel(false)}>Keep ride</button>
                  <button className="btn-cancel-confirm" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
