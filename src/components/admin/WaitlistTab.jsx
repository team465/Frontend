import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const STATUS_COLOR = { pending: '#e8a020', contacted: '#3b82f6', accepted: '#10b981', rejected: '#ef4444' };

export default function WaitlistTab() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', phone: '', vehicle_type: 'tuktuk', notes: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/waitlist', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setList(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    if (!form.name || !form.email) { setError('Name and email required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setList(prev => [data, ...prev]);
      setForm({ name: '', email: '', phone: '', vehicle_type: 'tuktuk', notes: '' });
      setShowForm(false);
    } finally { setSaving(false); }
  }

  async function handleStatus(id, status) {
    const res  = await fetch(`/api/admin/waitlist/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) setList(prev => prev.map(w => w.id === id ? data : w));
  }

  async function handleDelete(id) {
    await fetch(`/api/admin/waitlist/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN()}` } });
    setList(prev => prev.filter(w => w.id !== id));
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Driver Waitlist</h2>
          <p className="adm-page-sub">{list.length} applicant{list.length !== 1 ? 's' : ''} on waitlist</p>
        </div>
        <button className="adm-send-btn" style={{ maxWidth: 160 }} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Applicant'}
        </button>
      </div>

      {showForm && (
        <form className="adm-settings-section" onSubmit={handleAdd}>
          <h3 className="adm-settings-section-title">New Waitlist Entry</h3>
          {error && <p className="adm-error">{error}</p>}
          <div className="adm-settings-grid">
            {[['name','Full Name','text'],['email','Email','email'],['phone','Phone','text']].map(([k,l,t]) => (
              <div key={k} className="adm-settings-field">
                <label className="adm-form-label">{l}</label>
                <input type={t} className="adm-form-input" value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
              </div>
            ))}
            <div className="adm-settings-field">
              <label className="adm-form-label">Vehicle Type</label>
              <select className="adm-form-input" value={form.vehicle_type} onChange={e => setForm(f => ({...f,vehicle_type:e.target.value}))}>
                {['tuktuk','moto','car','van'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="adm-settings-field">
            <label className="adm-form-label">Notes</label>
            <input type="text" className="adm-form-input" value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))} />
          </div>
          <button type="submit" className="adm-send-btn" style={{ maxWidth: 160, marginTop: 12 }} disabled={saving}>
            {saving ? 'Adding…' : 'Add to Waitlist'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">⏳</span><p>No applicants yet</p></div>
      ) : (
        <div className="adm-card-list">
          {list.map(w => (
            <div key={w.id} className="adm-user-card">
              <div className="adm-user-avatar" style={{ background: STATUS_COLOR[w.status] }}>
                {w.name?.charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info" style={{ flex: 1 }}>
                <p className="adm-user-name">{w.name}</p>
                <p className="adm-user-email">{w.email} {w.phone && `· ${w.phone}`}</p>
                <p className="adm-user-joined">{w.vehicle_type} · {new Date(w.created_at).toLocaleDateString()}</p>
                {w.notes && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{w.notes}</p>}
              </div>
              <select
                className="adm-form-input"
                style={{ width: 120, fontSize: 12 }}
                value={w.status}
                onChange={e => handleStatus(w.id, e.target.value)}
              >
                {['pending','contacted','accepted','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="adm-delete-btn" onClick={() => handleDelete(w.id)} title="Delete">🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
