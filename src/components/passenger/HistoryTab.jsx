import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const STATUS_PILL = {
  completed: { label: 'Completed', cls: 'pill--green' },
  cancelled:  { label: 'Cancelled',  cls: 'pill--red'   },
  pending:    { label: 'Pending',    cls: 'pill--yellow' },
  matched:    { label: 'Matched',    cls: 'pill--blue'   },
  in_progress:{ label: 'In progress',cls: 'pill--purple' },
};

const VEHICLE_ICON = { tuktuk: '🛺', car: '🚗', moto: '🏍️', van: '🚐' };

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HistoryTab() {
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetch('/api/rides/history', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(data => setRides(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const completed = rides.filter(r => r.status === 'completed');
  const totalSpent = completed.reduce((sum, r) => sum + parseFloat(r.fare || 0), 0);

  if (loading) return <div className="tab-empty"><span className="spin">⟳</span> Loading…</div>;

  return (
    <div className="history-tab">

      {/* Spending summary */}
      <div className="spending-summary">
        <div className="spending-card">
          <span className="spending-label">Total rides</span>
          <span className="spending-value">{completed.length}</span>
        </div>
        <div className="spending-card">
          <span className="spending-label">Total spent</span>
          <span className="spending-value">${totalSpent.toFixed(2)}</span>
        </div>
        <div className="spending-card">
          <span className="spending-label">Avg fare</span>
          <span className="spending-value">
            {completed.length ? `$${(totalSpent / completed.length).toFixed(2)}` : '—'}
          </span>
        </div>
      </div>

      {rides.length === 0 ? (
        <div className="tab-empty">
          <div className="tab-empty-icon">📋</div>
          <h3>No ride history yet</h3>
          <p>Your completed and cancelled rides will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {rides.map(ride => {
            const st = STATUS_PILL[ride.status] || STATUS_PILL.completed;
            return (
              <div key={ride.id} className="history-card" onClick={() => setReceipt(ride)}>
                <div className="hc-left">
                  <span className="hc-vehicle-icon">{VEHICLE_ICON[ride.vehicle_type] || '🛺'}</span>
                  <div className="hc-route">
                    <p className="hc-pickup">{ride.pickup_address}</p>
                    <p className="hc-dest">→ {ride.destination_address}</p>
                    <p className="hc-date">{formatDate(ride.created_at)}</p>
                  </div>
                </div>
                <div className="hc-right">
                  <span className={`pill ${st.cls}`}>{st.label}</span>
                  <span className="hc-fare">${parseFloat(ride.fare || 0).toFixed(2)}</span>
                  {ride.driver_rating && (
                    <span className="hc-rating">{'★'.repeat(ride.driver_rating)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt modal */}
      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setReceipt(null)}>✕</button>
            <h3>Ride Receipt</h3>
            <div className="receipt-card" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
              <div className="receipt-row"><span>Date</span><strong>{formatDate(receipt.created_at)}</strong></div>
              <div className="receipt-row"><span>Vehicle</span><strong>{VEHICLE_ICON[receipt.vehicle_type]} {receipt.vehicle_type}</strong></div>
              <div className="receipt-row"><span>From</span><strong>{receipt.pickup_address}</strong></div>
              <div className="receipt-row"><span>To</span><strong>{receipt.destination_address}</strong></div>
              <div className="receipt-row"><span>Distance</span><strong>~{receipt.distance_km} km</strong></div>
              <div className="receipt-row"><span>Payment</span><strong>{receipt.payment_method}</strong></div>
              {receipt.driver_name && <div className="receipt-row"><span>Driver</span><strong>{receipt.driver_name}</strong></div>}
              {receipt.driver_rating && <div className="receipt-row"><span>Rating</span><strong>{'★'.repeat(receipt.driver_rating)}</strong></div>}
              <div className="receipt-row receipt-row--total"><span>Total</span><strong>${parseFloat(receipt.fare || 0).toFixed(2)}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
