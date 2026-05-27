import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const STATUS_COLOR = { open: '#ef4444', investigating: '#f59e0b', resolved: '#10b981', dismissed: '#6b7280' };

export default function DisputesTab() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ ride_id: '', reason: 'fare_dispute', description: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/disputes', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setList(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function handleResolve(id, status) {
    setResolving(true);
    const res = await fetch(`/api/admin/disputes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
      body: JSON.stringify({ status, resolution }),
    });
    const data = await res.json();
    if (res.ok) { setList(prev => prev.map(d => d.id === id ? data : d)); setSelected(null); setResolution(''); }
    setResolving(false);
  }

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    if (!form.reason) { setError('Reason required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ ...form, ride_id: form.ride_id || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setList(prev => [data, ...prev]);
      setForm({ ride_id: '', reason: 'fare_dispute', description: '' });
      setShowForm(false);
    } finally { setSaving(false); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Disputes</h2>
          <p className="adm-page-sub">{list.filter(d => d.status === 'open').length} open · {list.length} total</p>
        </div>
        <button className="adm-send-btn" style={{ maxWidth: 160 }} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Dispute'}
        </button>
      </div>

      {showForm && (
        <form className="adm-settings-section" onSubmit={handleAdd}>
          <h3 className="adm-settings-section-title">Log Dispute</h3>
          {error && <p className="adm-error">{error}</p>}
          <div className="adm-settings-grid">
            <div className="adm-settings-field">
              <label className="adm-form-label">Ride ID (optional)</label>
              <input type="number" className="adm-form-input" value={form.ride_id} onChange={e => setForm(f => ({...f,ride_id:e.target.value}))} placeholder="#" />
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">Reason</label>
              <select className="adm-form-input" value={form.reason} onChange={e => setForm(f => ({...f,reason:e.target.value}))}>
                {['fare_dispute','driver_behavior','late_arrival','wrong_route','payment_issue','other'].map(r => (
                  <option key={r} value={r}>{r.replace(/_/g,' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="adm-settings-field">
            <label className="adm-form-label">Description</label>
            <textarea className="adm-form-input" rows={3} style={{ resize: 'vertical' }}
              value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} />
          </div>
          <button type="submit" className="adm-send-btn" style={{ maxWidth: 140, marginTop: 12 }} disabled={saving}>
            {saving ? 'Saving…' : 'Submit'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">⚖️</span><p>No disputes filed</p></div>
      ) : (
        <div className="adm-card-list">
          {list.map(d => (
            <div key={d.id} className="adm-user-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0', fontSize: 14, textTransform: 'capitalize' }}>
                    {d.reason?.replace(/_/g,' ')}
                    {d.ride_id && <span className="adm-td-muted" style={{ fontWeight: 400 }}> · Ride #{d.ride_id}</span>}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    {d.raised_by_name || 'Admin'} · {new Date(d.created_at).toLocaleDateString()}
                    {d.fare && ` · $${parseFloat(d.fare).toFixed(2)}`}
                  </p>
                </div>
                <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                  background: STATUS_COLOR[d.status] + '33', color: STATUS_COLOR[d.status] }}>
                  {d.status}
                </span>
                {d.status === 'open' && (
                  <button className="adm-approve-btn" style={{ fontSize: 12 }} onClick={() => { setSelected(d); setResolution(''); }}>
                    Resolve
                  </button>
                )}
              </div>
              {d.description && <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingLeft: 4 }}>{d.description}</p>}
              {d.resolution && <p style={{ margin: 0, fontSize: 12, color: '#10b981' }}>✓ {d.resolution}</p>}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <h3>Resolve Dispute #{selected.id}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{selected.reason?.replace(/_/g,' ')}</p>
            <textarea className="adm-form-input" rows={4} style={{ width: '100%', resize: 'vertical', marginTop: 8 }}
              placeholder="Resolution notes…" value={resolution} onChange={e => setResolution(e.target.value)} />
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="adm-modal-cancel" onClick={() => handleResolve(selected.id, 'dismissed')} disabled={resolving}>Dismiss</button>
              <button className="adm-approve-btn" onClick={() => handleResolve(selected.id, 'resolved')} disabled={resolving}>
                {resolving ? '…' : '✓ Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
