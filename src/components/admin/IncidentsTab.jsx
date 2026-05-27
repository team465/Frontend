import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const SEV_COLOR = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7f1d1d' };
const STATUS_COLOR = { open: '#ef4444', investigating: '#f59e0b', resolved: '#10b981', closed: '#6b7280' };

export default function IncidentsTab() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ type: 'general', description: '', severity: 'medium', ride_id: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/incidents', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setList(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    if (!form.description) { setError('Description required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ ...form, ride_id: form.ride_id || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setList(prev => [data, ...prev]);
      setForm({ type: 'general', description: '', severity: 'medium', ride_id: '' });
      setShowForm(false);
    } finally { setSaving(false); }
  }

  async function handleStatus(id, status) {
    const res  = await fetch(`/api/admin/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) setList(prev => prev.map(i => i.id === id ? data : i));
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Incidents</h2>
          <p className="adm-page-sub">{list.filter(i => i.status === 'open').length} open · {list.length} total</p>
        </div>
        <button className="adm-send-btn" style={{ maxWidth: 160 }} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Log Incident'}
        </button>
      </div>

      {showForm && (
        <form className="adm-settings-section" onSubmit={handleAdd}>
          <h3 className="adm-settings-section-title">New Incident</h3>
          {error && <p className="adm-error">{error}</p>}
          <div className="adm-settings-grid">
            <div className="adm-settings-field">
              <label className="adm-form-label">Type</label>
              <select className="adm-form-input" value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))}>
                {['general','accident','fraud','harassment','vehicle','payment'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">Severity</label>
              <select className="adm-form-input" value={form.severity} onChange={e => setForm(f => ({...f,severity:e.target.value}))}>
                {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">Ride ID (optional)</label>
              <input type="number" className="adm-form-input" value={form.ride_id} onChange={e => setForm(f => ({...f,ride_id:e.target.value}))} placeholder="#" />
            </div>
          </div>
          <div className="adm-settings-field">
            <label className="adm-form-label">Description</label>
            <textarea className="adm-form-input" rows={3} style={{ resize: 'vertical' }}
              value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} />
          </div>
          <button type="submit" className="adm-send-btn" style={{ maxWidth: 160, marginTop: 12 }} disabled={saving}>
            {saving ? 'Saving…' : 'Log Incident'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">⚠️</span><p>No incidents logged</p></div>
      ) : (
        <div className="adm-card-list">
          {list.map(inc => (
            <div key={inc.id} className="adm-user-card" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: SEV_COLOR[inc.severity], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0', fontSize: 14, textTransform: 'capitalize' }}>
                    {inc.type} · {inc.severity}
                    {inc.ride_id && <span className="adm-td-muted"> · Ride #{inc.ride_id}</span>}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    By {inc.reporter_name || 'Admin'} · {new Date(inc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                  background: STATUS_COLOR[inc.status] + '33', color: STATUS_COLOR[inc.status] }}>
                  {inc.status}
                </span>
                <select className="adm-form-input" style={{ width: 130, fontSize: 11 }}
                  value={inc.status} onChange={e => handleStatus(inc.id, e.target.value)}>
                  {['open','investigating','resolved','closed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', paddingLeft: 22 }}>{inc.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
