import { useState, useEffect } from 'react';
import VehicleSelector, { VEHICLE_OPTIONS, calculateFare } from './VehicleSelector';
import PaymentSelector from './PaymentSelector';

const TOKEN = () => localStorage.getItem('token');

function haversineKm(a, b) {
  const R = 6371, toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Simple city-centre coords for Siem Reap estimate
const SIEM_REAP = { lat: 13.3671, lon: 103.8448 };

export default function BookTab({ onRideCreated }) {
  const [pickup, setPickup]           = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('tuktuk');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [step, setStep]               = useState('form'); // form | confirm | success
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [distanceKm, setDistanceKm]   = useState(3); // default estimate
  const [durationMin, setDurationMin] = useState(10);

  // Rough distance estimate from pickup/destination length as proxy
  useEffect(() => {
    if (pickup && destination) {
      // Estimate 1–15 km based on address similarity (pure heuristic, no maps API)
      const est = Math.max(1, Math.min(15, Math.abs(pickup.length - destination.length) * 0.4 + 2));
      setDistanceKm(parseFloat(est.toFixed(1)));
      setDurationMin(Math.round((est / 25) * 60));
    }
  }, [pickup, destination]);

  const selectedVehicle = VEHICLE_OPTIONS.find(v => v.type === vehicleType);
  const fare = selectedVehicle ? calculateFare(selectedVehicle, distanceKm) : 0;

  function handleReview(e) {
    e.preventDefault();
    setError('');
    if (!pickup.trim() || !destination.trim()) {
      setError('Please enter both pickup and destination.');
      return;
    }
    setStep('confirm');
  }

  async function handleBook() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({
          pickup_address: pickup,
          destination_address: destination,
          vehicle_type: vehicleType,
          fare: fare.toFixed(2),
          distance_km: distanceKm,
          duration_min: durationMin,
          payment_method: paymentMethod,
          ride_type: 'private',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setStep('success');
      setTimeout(() => {
        onRideCreated();
        setStep('form');
        setPickup(''); setDestination('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="book-success">
        <div className="book-success-icon">🎉</div>
        <h2>Ride booked!</h2>
        <p>Looking for a driver near you…</p>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="book-confirm">
        <button className="back-btn" onClick={() => setStep('form')}>← Back</button>
        <h2>Confirm your ride</h2>

        <div className="confirm-route">
          <div className="confirm-point confirm-point--pickup">
            <span className="dot dot--green" />
            <div>
              <p className="confirm-point-label">Pickup</p>
              <p className="confirm-point-addr">{pickup}</p>
            </div>
          </div>
          <div className="confirm-line" />
          <div className="confirm-point">
            <span className="dot dot--red" />
            <div>
              <p className="confirm-point-label">Destination</p>
              <p className="confirm-point-addr">{destination}</p>
            </div>
          </div>
        </div>

        <div className="confirm-details">
          <div className="confirm-row">
            <span>Vehicle</span>
            <strong>{selectedVehicle?.icon} {selectedVehicle?.label}</strong>
          </div>
          <div className="confirm-row">
            <span>Distance</span>
            <strong>~{distanceKm} km</strong>
          </div>
          <div className="confirm-row">
            <span>Duration</span>
            <strong>~{durationMin} min</strong>
          </div>
          <div className="confirm-row">
            <span>Payment</span>
            <strong>{paymentMethod}</strong>
          </div>
          <div className="confirm-row confirm-row--fare">
            <span>Total fare</span>
            <strong className="confirm-fare">${fare.toFixed(2)}</strong>
          </div>
        </div>

        {error && <p className="book-error">{error}</p>}

        <button className="btn-book" onClick={handleBook} disabled={loading}>
          {loading ? 'Booking…' : `Confirm & Book — $${fare.toFixed(2)}`}
        </button>
      </div>
    );
  }

  return (
    <div className="book-form">
      <h2 className="book-title">Where are you going?</h2>

      <form onSubmit={handleReview}>
        {error && <p className="book-error">{error}</p>}

        <div className="location-inputs">
          <div className="location-input-wrap">
            <span className="loc-dot loc-dot--green" />
            <input
              className="location-input"
              placeholder="Pickup location"
              value={pickup}
              onChange={e => setPickup(e.target.value)}
            />
          </div>
          <div className="location-divider" />
          <div className="location-input-wrap">
            <span className="loc-dot loc-dot--red" />
            <input
              className="location-input"
              placeholder="Where to?"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>
        </div>

        {pickup && destination && (
          <div className="route-estimate">
            <span>📍 ~{distanceKm} km</span>
            <span>⏱ ~{durationMin} min</span>
          </div>
        )}

        <div className="book-section">
          <p className="book-section-title">Choose vehicle</p>
          <VehicleSelector
            selected={vehicleType}
            onSelect={setVehicleType}
            distanceKm={distanceKm}
          />
        </div>

        <div className="book-section">
          <p className="book-section-title">Payment method</p>
          <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>

        <button type="submit" className="btn-book">
          Review booking — ${fare.toFixed(2)}
        </button>
      </form>
    </div>
  );
}
