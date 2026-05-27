import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const VEHICLE_ICON = { tuktuk: '🛺', car: '🚗', moto: '🏍️', van: '🚐' };

export default function FareManagementTab() {
  const [fares, setFares]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/fare-config', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setFares(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(fare) {
    setEditing(fare.vehicle_type);
    setForm({ base_fare: fare.base_fare, per_km: fare.per_km, min_fare: fare.min_fare });
    setError(''); setSaved('');
  }

  async function handleSave(vehicleType) {
    setSaving(true); setError('');
    try {
      const res  = await fetch(`/api/admin/fare-config/${vehicleType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({
          base_fare: parseFloat(form.base_fare),
          per_km:    parseFloat(form.per_km),
          min_fare:  parseFloat(form.min_fare),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed'); return; }
      setFares(prev => prev.map(f => f.vehicle_type === vehicleType ? data : f));
      setEditing(null);
      setSaved(vehicleType);
      setTimeout(() => setSaved(''), 2500);
    } finally { setSaving(false); }
  }

  const sampleFare = (f) => (parseFloat(f.base_fare) + 5 * parseFloat(f.per_km)).toFixed(2);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Fare Management</h2>
          <p className="adm-page-sub">Configure base fares and per-km rates for each vehicle type</p>
        </div>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading fare config…</div>
      ) : (
        <div className="adm-fare-grid">
          {fares.map(fare => (
            <div key={fare.vehicle_type} className={`adm-fare-card ${saved === fare.vehicle_type ? 'adm-fare-card--saved' : ''}`}>
              <div className="adm-fare-head">
                <span className="adm-fare-icon">{VEHICLE_ICON[fare.vehicle_type] || '🚗'}</span>
                <div>
                  <p className="adm-fare-vehicle">{fare.vehicle_type.charAt(0).toUpperCase() + fare.vehicle_type.slice(1)}</p>
                  <p className="adm-fare-sample">~${sampleFare(fare)} for 5 km</p>
                </div>
                {saved === fare.vehicle_type && <span className="adm-fare-saved-badge">✓ Saved</span>}
              </div>

              {editing === fare.vehicle_type ? (
                <div className="adm-fare-form">
                  {[['base_fare','Base fare ($)'],['per_km','Per km ($)'],['min_fare','Min fare ($)']].map(([key, label]) => (
                    <div key={key} className="adm-fare-field">
                      <label>{label}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="adm-fare-btns">
                    <button className="adm-fare-cancel" onClick={() => setEditing(null)}>Cancel</button>
                    <button className="adm-fare-save" onClick={() => handleSave(fare.vehicle_type)} disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="adm-fare-rows">
                  <div className="adm-fare-row"><span>Base fare</span><strong>${parseFloat(fare.base_fare).toFixed(2)}</strong></div>
                  <div className="adm-fare-row"><span>Per km</span><strong>${parseFloat(fare.per_km).toFixed(2)}</strong></div>
                  <div className="adm-fare-row"><span>Min fare</span><strong>${parseFloat(fare.min_fare).toFixed(2)}</strong></div>
                  <button className="adm-fare-edit" onClick={() => startEdit(fare)}>✏️ Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="adm-fare-note">
        <strong>📌 Formula:</strong> Fare = Base fare + (Distance km × Per km rate), minimum Min fare
      </div>
    </div>
  );
}
