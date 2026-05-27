import { useState, useEffect, useCallback } from 'react';

const TOKEN = () => localStorage.getItem('token');

const STATUS_PILL = {
  pending:     { label: 'Pending',     cls: 'pill-neutral'  },
  matched:     { label: 'Matched',     cls: 'pill-purple'   },
  arrived:     { label: 'Arrived',     cls: 'pill-amber'    },
  in_progress: { label: 'In Progress', cls: 'pill-blue'     },
  completed:   { label: 'Completed',   cls: 'pill-green'    },
  cancelled:   { label: 'Cancelled',   cls: 'pill-red'      },
  scheduled:   { label: 'Scheduled',   cls: 'pill-stone'    },
};

const STATUS_FILTERS = ['all','pending','matched','arrived','in_progress','completed','cancelled','scheduled'];
const VEHICLE_ICON = { tuktuk: '🛺', car: '🚗', moto: '🏍️', van: '🚐' };

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function RidesTab() {
  const [rides, setRides]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState('all');
  const [search, setSearch]       = useState('');
  const [detail, setDetail]       = useState(null);

  const fetchRides = useCallback(async () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search.trim()) params.set('search', search.trim());
    try {
      const res  = await fetch(`/api/admin/rides?${params}`, {
        headers: { Authorization: `Bearer ${TOKEN()}` },
      });
      const data = await res.json();
      setRides(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, [status, search]);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const st = (s) => STATUS_PILL[s] || STATUS_PILL.pending;

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Rides</h2>
          <p className="adm-page-sub">All rides across the platform</p>
        </div>
      </div>

      {/* Search */}
      <input
        className="adm-search-full"
        placeholder="Search passenger, pickup, destination…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Status filter chips */}
      <div className="adm-status-filters">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            className={`adm-filter-btn ${status === s ? 'adm-filter-btn--active' : ''}`}
            onClick={() => setStatus(s)}
          >
            {s === 'all' ? 'All' : s.replace('_',' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading rides…</div>
      ) : rides.length === 0 ? (
        <div className="adm-empty">
          <span>🛺</span>
          <p>No rides found</p>
        </div>
      ) : (
        <div className="adm-ride-list">
          <div className="adm-ride-count">{rides.length} ride{rides.length !== 1 ? 's' : ''}</div>
          {rides.map(ride => (
            <button
              key={ride.id}
              className="adm-ride-card"
              onClick={() => setDetail(ride)}
            >
              <div className="adm-ride-head">
                <div className="adm-ride-who">
                  <span className="adm-ride-pax">👤 {ride.passenger_name || 'Passenger'}</span>
                  {ride.driver_name && (
                    <span className="adm-ride-drv">🚗 {ride.driver_name}</span>
                  )}
                </div>
                <div className="adm-ride-badges">
                  <span className="adm-ride-id">#{ride.id}</span>
                  <span className={`hist-pill ${st(ride.status).cls}`}>{st(ride.status).label}</span>
                </div>
              </div>

              <div className="adm-ride-route">
                <div className="adm-ride-row">
                  <span className="dot dot--green" />
                  <span className="adm-ride-addr">{ride.pickup_address}</span>
                </div>
                {ride.destination_address && (
                  <div className="adm-ride-row">
                    <span className="dot dot--red" />
                    <span className="adm-ride-addr">{ride.destination_address}</span>
                  </div>
                )}
              </div>

              <div className="adm-ride-foot">
                <span className="adm-ride-vehicle">
                  {VEHICLE_ICON[ride.vehicle_type] || '🛺'} {ride.vehicle_type}
                </span>
                <span className="adm-ride-date">{formatDate(ride.created_at)}</span>
                <span className="adm-ride-fare">
                  {ride.status === 'cancelled' ? '—' : `$${parseFloat(ride.fare || ride.offered_fare || 0).toFixed(2)}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal adm-ride-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            <h3>Ride #{detail.id}</h3>
            <div className="adm-detail-rows">
              {[
                ['Status',      <span className={`hist-pill ${st(detail.status).cls}`}>{st(detail.status).label}</span>],
                ['Passenger',   detail.passenger_name || '—'],
                ['Driver',      detail.driver_name    || 'Unassigned'],
                ['Pickup',      detail.pickup_address],
                ['Destination', detail.destination_address || '—'],
                ['Vehicle',     `${VEHICLE_ICON[detail.vehicle_type] || '🛺'} ${detail.vehicle_type}`],
                ['Fare',        `$${parseFloat(detail.fare || detail.offered_fare || 0).toFixed(2)}`],
                ['Payment',     detail.payment_method || '—'],
                ['Booking Type',detail.booking_type || 'standard'],
                detail.distance_km ? ['Distance', `~${parseFloat(detail.distance_km).toFixed(1)} km`] : null,
                detail.driver_rating ? ['Rating', '★'.repeat(detail.driver_rating)] : null,
                ['Created',     formatDate(detail.created_at)],
              ].filter(Boolean).map(([label, val], i) => (
                <div key={i} className="adm-detail-row">
                  <span>{label}</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
