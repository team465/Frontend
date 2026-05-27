import { useState, useEffect } from 'react';
import { VEHICLE_OPTIONS, calculateFare } from './VehicleSelector';

const TOKEN = () => localStorage.getItem('token');

export default function FavoriteTab({ onRideCreated }) {
  const [favorites, setFavorites]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [pickup, setPickup]           = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('tuktuk');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [booking, setBooking]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const distanceKm = pickup && destination
    ? parseFloat(Math.max(1, Math.min(15, Math.abs(pickup.length - destination.length) * 0.4 + 2)).toFixed(1))
    : 3;
  const selectedVehicle = VEHICLE_OPTIONS.find(v => v.type === vehicleType);
  const fare = selectedVehicle ? calculateFare(selectedVehicle, distanceKm) : 0;

  useEffect(() => {
    fetch('/api/rides/favorites', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleBook(e) {
    e.preventDefault();
    setError('');
    if (!pickup || !destination) { setError('Enter pickup and destination'); return; }
    setBooking(true);
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({
          booking_type:        'favorite',
          pickup_address:      pickup,
          destination_address: destination,
          vehicle_type:        selected?.vehicle_type || vehicleType,
          fare:                fare.toFixed(2),
          distance_km:         distanceKm,
          payment_method:      paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => { onRideCreated(); setSuccess(false); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  }

  if (success) {
    return (
      <div className="book-success">
        <div className="book-success-icon">❤️</div>
        <h2>Ride Booked!</h2>
        <p>Sending request to your favorite driver…</p>
      </div>
    );
  }

  return (
    <div className="book-form">
      <div className="fullday-header">
        <span className="fullday-icon">❤️</span>
        <div>
          <h2 className="book-title" style={{ marginBottom: 2 }}>Favorite Driver</h2>
          <p className="book-hint">Book a driver you trust</p>
        </div>
      </div>

      {/* Favorites list */}
      <div className="book-section">
        <p className="book-section-title">Your favorites</p>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading…</p>
        ) : favorites.length === 0 ? (
          <div className="fav-empty">
            <span style={{ fontSize: 32 }}>⭐</span>
            <p>No favorite drivers yet</p>
            <p style={{ fontSize: 12, opacity: 0.5 }}>Rate a driver after a ride to add them to favorites</p>
          </div>
        ) : (
          <div className="fav-list">
            {favorites.map(f => (
              <button
                key={f.id}
                type="button"
                className={`fav-card ${selected?.id === f.id ? 'fav-card--active' : ''}`}
                onClick={() => { setSelected(f); setVehicleType(f.vehicle_type || 'tuktuk'); }}
              >
                <div className="fav-avatar">{(f.driver_name || 'D').charAt(0).toUpperCase()}</div>
                <div className="fav-info">
                  <p className="fav-name">{f.driver_name || 'Driver'}</p>
                  <p className="fav-meta">{f.vehicle_type} · {f.is_online ? '🟢 Online' : '⚫ Offline'}</p>
                  {f.average_rating > 0 && (
                    <p className="fav-rating">{'★'.repeat(Math.round(f.average_rating))} {f.average_rating.toFixed(1)}</p>
                  )}
                </div>
                {selected?.id === f.id && <span className="fav-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Booking form — only shown after selecting a driver */}
      {(selected || favorites.length === 0) && (
        <form onSubmit={handleBook}>
          {error && <p className="book-error">{error}</p>}

          <div className="book-section">
            <p className="book-section-title">Route</p>
            <div className="location-inputs">
              <div className="location-input-wrap">
                <span className="loc-dot loc-dot--green" />
                <input className="location-input" placeholder="Pickup location" value={pickup} onChange={e => setPickup(e.target.value)} />
              </div>
              <div className="location-divider" />
              <div className="location-input-wrap">
                <span className="loc-dot loc-dot--red" />
                <input className="location-input" placeholder="Where to?" value={destination} onChange={e => setDestination(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="book-section">
            <p className="book-section-title">Vehicle</p>
            <div className="vehicle-selector">
              {VEHICLE_OPTIONS.map(v => (
                <button key={v.type} type="button"
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

          <div className="book-section">
            <p className="book-section-title">Payment</p>
            <div className="pay-row">
              {[{ id:'cash',icon:'💵',label:'Cash'},{ id:'card',icon:'💳',label:'Card'},{ id:'wallet',icon:'👛',label:'Wallet'}].map(p => (
                <button key={p.id} type="button" className={`pay-chip ${paymentMethod === p.id ? 'pay-chip--active' : ''}`} onClick={() => setPaymentMethod(p.id)}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-book" disabled={booking}>
            {booking ? 'Booking…' : `❤️ Book with ${selected?.driver_name || 'Favorite'} — $${fare.toFixed(2)}`}
          </button>
        </form>
      )}
    </div>
  );
}
