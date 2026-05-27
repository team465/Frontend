import { useState, useEffect } from 'react';
import VehicleSelector, { VEHICLE_OPTIONS, calculateFare } from './VehicleSelector';
import PaymentSelector from './PaymentSelector';
import FullDayTab   from './FullDayTab';
import ScheduledTab from './ScheduledTab';
import FavoriteTab  from './FavoriteTab';
import RideMap from '../RideMap';

const TOKEN = () => localStorage.getItem('token');

const MODES = [
  { id: 'standard',  label: 'Standard'  },
  { id: 'full_day',  label: 'Full Day'  },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'favorite',  label: 'Favorite'  },
];

export default function BookTab({ onRideCreated }) {
  const [mode, setMode] = useState('standard');

  // Delegate non-standard modes
  if (mode === 'full_day')  return <ModeWrap mode={mode} setMode={setMode}><FullDayTab   onRideCreated={onRideCreated} /></ModeWrap>;
  if (mode === 'scheduled') return <ModeWrap mode={mode} setMode={setMode}><ScheduledTab onRideCreated={onRideCreated} /></ModeWrap>;
  if (mode === 'favorite')  return <ModeWrap mode={mode} setMode={setMode}><FavoriteTab  onRideCreated={onRideCreated} /></ModeWrap>;

  return <StandardBook mode={mode} setMode={setMode} onRideCreated={onRideCreated} />;
}

// ── Shared mode tab bar ──────────────────────────────
function ModeTabs({ active, onChange }) {
  return (
    <div className="mode-tabs">
      {MODES.map(m => (
        <button
          key={m.id}
          type="button"
          className={`mode-tab ${active === m.id ? 'mode-tab--active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// Wrapper keeps the mode tab bar on non-standard tabs
function ModeWrap({ mode, setMode, children }) {
  return (
    <div>
      <ModeTabs active={mode} onChange={setMode} />
      {children}
    </div>
  );
}

// ── Standard booking ─────────────────────────────────
function StandardBook({ mode, setMode, onRideCreated }) {
  const [pickup, setPickup]           = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('tuktuk');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [step, setStep]               = useState('form'); // form | confirm | success
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [distanceKm, setDistanceKm]   = useState(3);
  const [durationMin, setDurationMin] = useState(10);

  useEffect(() => {
    if (pickup && destination) {
      const est = Math.max(1, Math.min(15, Math.abs(pickup.length - destination.length) * 0.4 + 2));
      setDistanceKm(parseFloat(est.toFixed(1)));
      setDurationMin(Math.round((est / 25) * 60));
    }
  }, [pickup, destination]);

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

  const selectedVehicle = VEHICLE_OPTIONS.find(v => v.type === vehicleType);
  const fare = selectedVehicle ? calculateFare(selectedVehicle, distanceKm) : 0;

  function handleReview(e) {
    e.preventDefault();
    setError('');
    if (!pickup.trim() || !destination.trim()) { setError('Enter both pickup and destination.'); return; }
    setStep('confirm');
  }

  async function handleBook() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({
          booking_type: 'standard', pickup_address: pickup,
          destination_address: destination, vehicle_type: vehicleType,
          fare: fare.toFixed(2), distance_km: distanceKm,
          duration_min: durationMin, payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setStep('success');
      setTimeout(() => { onRideCreated(); setStep('form'); setPickup(''); setDestination(''); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <>
        <ModeTabs active={mode} onChange={setMode} />
        <div className="book-success">
          <div className="book-success-icon">🎉</div>
          <h2>Ride Booked!</h2>
          <p>Looking for a driver near you…</p>
        </div>
      </>
    );
  }

  if (step === 'confirm') {
    return (
      <>
        <ModeTabs active={mode} onChange={setMode} />
        <div className="book-confirm">
          <button className="back-btn" onClick={() => setStep('form')}>← Back</button>
          <h2>Confirm your ride</h2>
          <RideMap pickup={pickup} destination={destination} height={180} className="book-map" />
          <div className="confirm-route">
            <div className="confirm-point">
              <span className="dot dot--green" />
              <div><p className="confirm-point-label">Pickup</p><p className="confirm-point-addr">{pickup}</p></div>
            </div>
            <div className="confirm-line" />
            <div className="confirm-point">
              <span className="dot dot--red" />
              <div><p className="confirm-point-label">Destination</p><p className="confirm-point-addr">{destination}</p></div>
            </div>
          </div>
          <div className="confirm-details">
            <div className="confirm-row"><span>Vehicle</span><strong>{selectedVehicle?.icon} {selectedVehicle?.label}</strong></div>
            <div className="confirm-row"><span>Distance</span><strong>~{distanceKm} km</strong></div>
            <div className="confirm-row"><span>Duration</span><strong>~{durationMin} min</strong></div>
            <div className="confirm-row"><span>Payment</span><strong>{paymentMethod}</strong></div>
            <div className="confirm-row confirm-row--fare"><span>Total fare</span><strong className="confirm-fare">${fare.toFixed(2)}</strong></div>
          </div>
          {error && <p className="book-error">{error}</p>}
          <button className="btn-book" onClick={handleBook} disabled={loading}>
            {loading ? 'Booking…' : `Confirm & Book — $${fare.toFixed(2)}`}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <ModeTabs active={mode} onChange={setMode} />
      <div className="book-form">
        <h2 className="book-title">Where are you going?</h2>
        <form onSubmit={handleReview}>
          {error && <p className="book-error">{error}</p>}
          <div className="location-inputs">
            <div className="location-input-wrap">
              <span className="loc-dot loc-dot--green" />
              <input className="location-input" placeholder="Pickup location" value={pickup} onChange={e => setPickup(e.target.value)} />
              <button type="button" className="gps-btn" onClick={handleGps} title="Use my location">
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
          {/* Map — always visible, shows pins when addresses are geocoded */}
          <RideMap pickup={pickup} destination={destination} height={220} className="book-map" />

          {pickup && destination && (
            <div className="route-estimate">
              <span>📍 ~{distanceKm} km</span>
              <span>⏱ ~{durationMin} min</span>
            </div>
          )}
          <div className="book-section">
            <p className="book-section-title">Choose vehicle</p>
            <VehicleSelector selected={vehicleType} onSelect={setVehicleType} distanceKm={distanceKm} />
          </div>
          <div className="book-section">
            <p className="book-section-title">Payment method</p>
            <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />
          </div>
          <button type="submit" className="btn-book">Review booking — ${fare.toFixed(2)}</button>
        </form>
      </div>
    </>
  );
}
