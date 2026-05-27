import { useState } from 'react';
import { VEHICLE_OPTIONS, calculateFare } from './VehicleSelector';

const TOKEN = () => localStorage.getItem('token');

function toMinutes(dt) {
  return Math.round((dt - new Date()) / 60000);
}

export default function ScheduledTab({ onRideCreated }) {
  const [pickup, setPickup]           = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate]               = useState('');
  const [time, setTime]               = useState('');
  const [vehicleType, setVehicleType] = useState('tuktuk');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [confirmed, setConfirmed]     = useState(null);

  // Estimate distance heuristic (same as BookTab)
  const distanceKm = pickup && destination
    ? parseFloat(Math.max(1, Math.min(15, Math.abs(pickup.length - destination.length) * 0.4 + 2)).toFixed(1))
    : 3;

  const selectedVehicle = VEHICLE_OPTIONS.find(v => v.type === vehicleType);
  const fare = selectedVehicle ? calculateFare(selectedVehicle, distanceKm) : 0;

  function getScheduledDt() {
    if (!date || !time) return null;
    return new Date(`${date}T${time}`);
  }

  const scheduledDt = getScheduledDt();
  const isValidTime = scheduledDt && toMinutes(scheduledDt) >= 30;
  const canBook = pickup && destination && date && time && isValidTime;

  function formatDt(dt) {
    return dt.toLocaleString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  // Min date = today, max = 30 days out
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  async function handleGps() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        );
        const data = await res.json();
        setPickup(data.display_name || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      } catch {
        setPickup(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      }
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isValidTime) { setError('Scheduled time must be at least 30 minutes from now'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({
          booking_type:         'scheduled',
          pickup_address:       pickup,
          destination_address:  destination,
          vehicle_type:         vehicleType,
          fare:                 fare.toFixed(2),
          distance_km:          distanceKm,
          duration_min:         Math.round((distanceKm / 25) * 60),
          payment_method:       paymentMethod,
          scheduled_at:         scheduledDt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConfirmed({ dt: scheduledDt, pickup, destination, vehicleType, fare });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="book-success">
        <div className="book-success-icon">📅</div>
        <h2>Ride Scheduled!</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>{formatDt(confirmed.dt)}</p>
        <div className="confirm-route" style={{ maxWidth: 340, margin: '0 auto 20px' }}>
          <div className="confirm-point">
            <span className="dot dot--green" />
            <div><p className="confirm-point-addr">{confirmed.pickup}</p></div>
          </div>
          <div className="confirm-line" />
          <div className="confirm-point">
            <span className="dot dot--red" />
            <div><p className="confirm-point-addr">{confirmed.destination}</p></div>
          </div>
        </div>
        <button className="btn-book" style={{ maxWidth: 280, margin: '0 auto' }} onClick={() => { onRideCreated(); setConfirmed(null); }}>
          View in History →
        </button>
      </div>
    );
  }

  return (
    <div className="book-form">
      <div className="fullday-header">
        <span className="fullday-icon">📅</span>
        <div>
          <h2 className="book-title" style={{ marginBottom: 2 }}>Scheduled Ride</h2>
          <p className="book-hint">Book in advance — min 30 minutes ahead</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <p className="book-error">{error}</p>}

        {/* Date + Time row */}
        <div className="book-section">
          <p className="book-section-title">When?</p>
          <div className="datetime-row">
            <div className="datetime-field">
              <label className="dt-label">📆 Date</label>
              <input
                type="date"
                className="dt-input"
                value={date}
                min={today}
                max={maxDate}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="datetime-field">
              <label className="dt-label">🕐 Time</label>
              <input
                type="time"
                className="dt-input"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>
          {scheduledDt && (
            <p className={`dt-validation ${isValidTime ? 'dt-valid' : 'dt-invalid'}`}>
              {isValidTime ? `✓ ${formatDt(scheduledDt)}` : '⚠ Must be at least 30 minutes from now'}
            </p>
          )}
        </div>

        {/* Locations */}
        <div className="book-section">
          <p className="book-section-title">Route</p>
          <div className="location-inputs">
            <div className="location-input-wrap">
              <span className="loc-dot loc-dot--green" />
              <input className="location-input" placeholder="Pickup location" value={pickup} onChange={e => setPickup(e.target.value)} />
              <button type="button" className="gps-btn" onClick={handleGps}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
              </button>
            </div>
            <div className="location-divider" />
            <div className="location-input-wrap">
              <span className="loc-dot loc-dot--red" />
              <input className="location-input" placeholder="Where to?" value={destination} onChange={e => setDestination(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="book-section">
          <p className="book-section-title">Vehicle — ${fare.toFixed(2)} est.</p>
          <div className="vehicle-selector">
            {VEHICLE_OPTIONS.map(v => (
              <button
                key={v.type}
                type="button"
                className={`vs-card ${vehicleType === v.type ? 'vs-card--active' : ''}`}
                onClick={() => setVehicleType(v.type)}
              >
                <img src={v.image} alt={v.label} className="vs-img" />
                <span className="vs-label">{v.label}</span>
                <span className="vs-fare">${calculateFare(v, distanceKm).toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="book-section">
          <p className="book-section-title">Payment method</p>
          <div className="pay-row">
            {[{ id:'cash',icon:'💵',label:'Cash'},{ id:'card',icon:'💳',label:'Card'},{ id:'wallet',icon:'👛',label:'Wallet'}].map(p => (
              <button key={p.id} type="button" className={`pay-chip ${paymentMethod === p.id ? 'pay-chip--active' : ''}`} onClick={() => setPaymentMethod(p.id)}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-book" disabled={!canBook || loading}>
          {loading ? 'Scheduling…' : `📅 Schedule — $${fare.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
