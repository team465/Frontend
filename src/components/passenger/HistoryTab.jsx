import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const ACTIVE_STATUSES = ['pending', 'matched', 'arrived', 'in_progress'];

const STATUS_PILL = {
  pending:     { label: 'Looking for driver', cls: 'pill-neutral'  },
  matched:     { label: 'Driver on the way',  cls: 'pill-purple'   },
  arrived:     { label: 'Driver arrived',     cls: 'pill-amber'    },
  in_progress: { label: 'Ride in progress',   cls: 'pill-blue'     },
  completed:   { label: 'Completed',          cls: 'pill-green'    },
  cancelled:   { label: 'Cancelled',          cls: 'pill-red'      },
  scheduled:   { label: 'Scheduled',          cls: 'pill-stone'    },
};

const VEHICLE_ICON = { tuktuk: '🛺', car: '🚗', moto: '🏍️', van: '🚐' };

function formatDate(iso, isScheduled) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function isThisMonth(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function HistoryTab({ onGoToBook }) {
  const [rides, setRides]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [section, setSection]     = useState('upcoming');
  const [receipt, setReceipt]     = useState(null);
  const [detail, setDetail]       = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetch('/api/rides/all', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(data => setRides(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const upcoming  = rides.filter(r => ACTIVE_STATUSES.includes(r.status));
  const scheduled = rides.filter(r => r.status === 'scheduled');
  const past      = rides.filter(r => !ACTIVE_STATUSES.includes(r.status) && r.status !== 'scheduled');

  // Spending summary (past completed this month)
  const completedThisMonth = past.filter(r => r.status === 'completed' && isThisMonth(r.created_at));
  const monthSpent  = completedThisMonth.reduce((s, r) => s + parseFloat(r.fare || 0), 0);
  const avgFare     = completedThisMonth.length ? monthSpent / completedThisMonth.length : 0;
  const methodCount = {};
  completedThisMonth.forEach(r => { const m = r.payment_method || 'cash'; methodCount[m] = (methodCount[m] || 0) + 1; });
  const topMethod = Object.entries(methodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'cash';

  const SECTIONS = [
    { id: 'upcoming',  label: 'Upcoming',  count: upcoming.length  },
    { id: 'scheduled', label: 'Scheduled', count: scheduled.length },
    { id: 'past',      label: 'Past',      count: past.length      },
  ];

  const currentList = section === 'upcoming' ? upcoming : section === 'scheduled' ? scheduled : past;

  async function cancelScheduled(id) {
    setCancelling(id);
    try {
      await fetch(`/api/rides/${id}/cancel-scheduled`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      setRides(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    } finally {
      setCancelling(null);
    }
  }

  if (loading) return <div className="hist-loading"><span className="spin">⟳</span> Loading…</div>;

  if (rides.length === 0) {
    return (
      <div className="tab-empty">
        <div className="tab-empty-icon">📋</div>
        <h3>No rides yet</h3>
        <p>Book your first ride to get started</p>
        {onGoToBook && <button className="btn-book" style={{ maxWidth: 260, margin: '0 auto' }} onClick={onGoToBook}>Book a Ride</button>}
      </div>
    );
  }

  return (
    <div className="history-tab">

      {/* ── Section tabs ─────────────────────────────── */}
      <div className="hist-tabs">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`hist-tab ${section === s.id ? 'hist-tab--active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
            {s.count > 0 && <span className="hist-tab-count">({s.count})</span>}
          </button>
        ))}
      </div>

      <div className="hist-body">
        {/* Spending summary — Past tab only */}
        {section === 'past' && completedThisMonth.length > 0 && (
          <div className="spending-summary-card">
            <p className="spending-label-head">📊 This Month</p>
            <div className="spending-grid-4">
              <div className="sg-item">
                <span className="sg-label">Total Spent</span>
                <span className="sg-value">${monthSpent.toFixed(2)}</span>
              </div>
              <div className="sg-item">
                <span className="sg-label">Total Rides</span>
                <span className="sg-value">{completedThisMonth.length}</span>
              </div>
              <div className="sg-item">
                <span className="sg-label">Avg Fare</span>
                <span className="sg-value">${avgFare.toFixed(2)}</span>
              </div>
              <div className="sg-item">
                <span className="sg-label">Top Method</span>
                <span className="sg-value" style={{ textTransform: 'capitalize' }}>{topMethod}</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state per section */}
        {currentList.length === 0 ? (
          <div className="hist-empty">
            <p>
              {section === 'upcoming'  ? 'No upcoming rides' :
               section === 'scheduled' ? 'No scheduled rides' :
               'No past rides'}
            </p>
          </div>
        ) : (
          currentList.map(ride => (
            <div key={ride.id}>
              <RideCard
                ride={ride}
                onClickReceipt={ride.status === 'completed' ? () => setReceipt(ride) : () => setDetail(ride)}
              />
              {section === 'scheduled' && ride.status === 'scheduled' && (
                <div className="sched-actions">
                  <button
                    className="sched-cancel-btn"
                    onClick={() => cancelScheduled(ride.id)}
                    disabled={cancelling === ride.id}
                  >
                    {cancelling === ride.id ? 'Cancelling…' : 'Cancel ride'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Receipt modal */}
      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setReceipt(null)}>✕</button>
            <h3>Receipt</h3>
            <div style={{ marginTop: 16 }}>
              <ReceiptRows ride={receipt} />
            </div>
          </div>
        </div>
      )}

      {/* Detail modal (non-completed) */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            <h3>Ride Details</h3>
            <div style={{ marginTop: 16 }}>
              <ReceiptRows ride={detail} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RideCard({ ride, onClickReceipt }) {
  const st = STATUS_PILL[ride.status] || STATUS_PILL.completed;
  const dateStr = ride.status === 'scheduled' && ride.scheduled_at
    ? formatDate(ride.scheduled_at, true)
    : formatDate(ride.created_at);

  return (
    <button className="hist-card" onClick={onClickReceipt}>
      <div className="hist-card-head">
        <span className="hist-date">
          {ride.status === 'scheduled' ? '📅 ' : ''}{dateStr}
        </span>
        <div className="hist-card-badges">
          {ride.status === 'completed' && ride.payment_method && (
            <span className="payment-badge">{ride.payment_method}</span>
          )}
          <span className={`hist-pill ${st.cls}`}>{st.label}</span>
        </div>
      </div>

      <div className="hist-route">
        <div className="hist-route-row">
          <span className="dot dot--green" style={{ marginTop: 3 }} />
          <span className="hist-addr">{ride.pickup_address || 'Pickup'}</span>
        </div>
        {ride.destination_address && (
          <div className="hist-route-row">
            <span className="dot dot--red" style={{ marginTop: 3 }} />
            <span className="hist-addr">{ride.destination_address}</span>
          </div>
        )}
      </div>

      <div className="hist-card-foot">
        <span className="hist-vehicle">
          {VEHICLE_ICON[ride.vehicle_type] || '🛺'} {ride.vehicle_type || 'Standard'}
          {ride.booking_type && ride.booking_type !== 'standard' && (
            <span className="hist-btype"> · {ride.booking_type.replace('_', ' ')}</span>
          )}
        </span>
        <div className="hist-fare-wrap">
          {ride.status === 'cancelled' ? (
            <span className="hist-cancelled">Cancelled</span>
          ) : (
            <>
              <span className="hist-fare">${parseFloat(ride.fare || ride.offered_fare || 0).toFixed(2)}</span>
              {ride.status === 'completed' && (
                <span className="hist-paid">✓ Paid</span>
              )}
            </>
          )}
        </div>
      </div>

      {ride.driver_rating && (
        <div className="hist-rating">{'★'.repeat(ride.driver_rating)}</div>
      )}
    </button>
  );
}

function ReceiptRows({ ride }) {
  const rows = [
    ['Date',        formatDate(ride.created_at)],
    ['Status',      ride.status],
    ride.scheduled_at ? ['Scheduled for', formatDate(ride.scheduled_at)] : null,
    ['Vehicle',     `${VEHICLE_ICON[ride.vehicle_type] || '🛺'} ${ride.vehicle_type || '—'}`],
    ['Pickup',      ride.pickup_address || '—'],
    ride.destination_address ? ['Destination', ride.destination_address] : null,
    ride.distance_km ? ['Distance', `~${parseFloat(ride.distance_km).toFixed(1)} km`] : null,
    ['Payment',     ride.payment_method || '—'],
    ride.driver_name ? ['Driver', ride.driver_name] : null,
    ride.driver_rating ? ['Your rating', '★'.repeat(ride.driver_rating)] : null,
    ['Total fare',  `$${parseFloat(ride.fare || ride.offered_fare || 0).toFixed(2)}`],
  ].filter(Boolean);

  return (
    <div className="receipt-card" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
      {rows.map(([label, value], i) => (
        <div key={i} className={`receipt-row ${label === 'Total fare' ? 'receipt-row--total' : ''}`}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
