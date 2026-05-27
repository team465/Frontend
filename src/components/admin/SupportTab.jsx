import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' · ' + new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function SupportTab() {
  const [rides, setRides]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use cancelled rides as support tickets proxy
    fetch('/api/admin/rides?status=cancelled', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setRides(Array.isArray(d) ? d.slice(0, 20) : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Support</h2>
          <p className="adm-page-sub">Recent cancelled rides requiring follow-up</p>
        </div>
        {rides.length > 0 && (
          <div className="adm-alert-badge">{rides.length} cases</div>
        )}
      </div>

      <div className="adm-support-note">
        💡 Cancelled rides may indicate issues. Follow up with passengers or drivers as needed.
      </div>

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : rides.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">💬</span><p>No support cases</p></div>
      ) : (
        <div className="adm-card-list">
          {rides.map(ride => (
            <div key={ride.id} className="adm-support-card">
              <div className="adm-support-head">
                <span className="hist-pill pill-red">Cancelled</span>
                <span className="adm-td-muted" style={{ fontSize: 12 }}>#{ride.id} · {formatDate(ride.created_at)}</span>
              </div>
              <p className="adm-support-who">
                👤 {ride.passenger_name || 'Passenger'}
                {ride.driver_name ? ` · 🚗 ${ride.driver_name}` : ' · No driver assigned'}
              </p>
              <div className="adm-support-route">
                <span>📍 {ride.pickup_address}</span>
                {ride.destination_address && <span>🏁 {ride.destination_address}</span>}
              </div>
              <div className="adm-support-foot">
                <span>{ride.vehicle_type} · {ride.payment_method}</span>
                <span>${parseFloat(ride.fare || ride.offered_fare || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
