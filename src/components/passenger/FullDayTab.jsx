import { useState } from 'react';

const TOKEN = () => localStorage.getItem('token');

const VEHICLES = [
  { type: 'tuktuk', icon: '🛺', image: '/passenger-tuktuk.png', label: 'Tuk Tuk' },
  { type: 'car',    icon: '🚗', image: '/car-angkor.png',        label: 'Car'     },
  { type: 'van',    icon: '🚐', image: null,                     label: 'Van'     },
];

const PAYMENTS = [
  { id: 'cash',   icon: '💵', label: 'Cash'   },
  { id: 'card',   icon: '💳', label: 'Card'   },
  { id: 'wallet', icon: '👛', label: 'Wallet' },
];

export default function FullDayTab({ onRideCreated }) {
  const [pickup, setPickup]             = useState('');
  const [description, setDescription]   = useState('');
  const [offeredFare, setOfferedFare]   = useState('');
  const [vehicleType, setVehicleType]   = useState('tuktuk');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);

  const formComplete = pickup.trim() && description.trim() && parseFloat(offeredFare) > 0;

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
    const fare = parseFloat(offeredFare);
    if (isNaN(fare) || fare <= 0) { setError('Enter a valid price'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({
          booking_type: 'full_day',
          pickup_address: pickup,
          vehicle_type: vehicleType,
          offered_fare: fare,
          hire_description: description,
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => { onRideCreated(); setSuccess(false); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="book-success">
        <div className="book-success-icon">✅</div>
        <h2>Offer Sent!</h2>
        <p>Looking for a driver for your full-day hire…</p>
      </div>
    );
  }

  return (
    <div className="book-form">
      <div className="fullday-header">
        <span className="fullday-icon">⏱</span>
        <div>
          <h2 className="book-title" style={{ marginBottom: 2 }}>Full Day Hire</h2>
          <p className="book-hint">Book a driver for the whole day</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <p className="book-error">{error}</p>}

        <div className="book-section">
          <p className="book-section-title">Pickup location</p>
          <div className="location-inputs">
            <div className="location-input-wrap">
              <span className="loc-dot loc-dot--green" />
              <input
                className="location-input"
                placeholder="Where should driver meet you?"
                value={pickup}
                onChange={e => setPickup(e.target.value)}
              />
              <button type="button" className="gps-btn" onClick={handleGps} title="Use my location">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="book-section">
          <p className="book-section-title">What do you want to do?</p>
          <textarea
            className="fullday-textarea"
            placeholder="e.g. Tour Angkor Wat temples, visit Tonle Sap lake, explore local markets…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="char-count">{description.length}/500</p>
        </div>

        <div className="book-section">
          <p className="book-section-title">Your offered price (USD)</p>
          <div className="price-input-wrap">
            <span className="price-prefix">$</span>
            <input
              type="number"
              className="price-input"
              placeholder="50.00"
              value={offeredFare}
              onChange={e => setOfferedFare(e.target.value)}
              min="1"
              step="0.50"
            />
          </div>
          <p className="book-hint">Drivers will accept or negotiate your offer</p>
        </div>

        {formComplete && (
          <>
            <div className="book-section">
              <p className="book-section-title">Vehicle type</p>
              <div className="vehicle-selector">
                {VEHICLES.map(v => (
                  <button
                    key={v.type}
                    type="button"
                    className={`vs-card ${vehicleType === v.type ? 'vs-card--active' : ''}`}
                    onClick={() => setVehicleType(v.type)}
                  >
                    {v.image
                      ? <img src={v.image} alt={v.label} className="vs-img" />
                      : <span style={{ fontSize: 28 }}>{v.icon}</span>
                    }
                    <span className="vs-label">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="book-section">
              <p className="book-section-title">Payment method</p>
              <div className="pay-row">
                {PAYMENTS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`pay-chip ${paymentMethod === p.id ? 'pay-chip--active' : ''}`}
                    onClick={() => setPaymentMethod(p.id)}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="btn-book"
          disabled={!formComplete || loading}
        >
          {loading ? 'Sending offer…' : `Send Full Day Request — $${offeredFare || '0'}`}
        </button>
      </form>
    </div>
  );
}
