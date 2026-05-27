import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const STATUS_COLOR = { active: '#10b981', inactive: '#6b7280', pending: '#f59e0b' };

const BLANK = { name: '', contact_name: '', email: '', phone: '', location: '', commission_pct: '10' };

export default function HotelPartnersTab() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(BLANK);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/hotel-partners', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setList(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  function startEdit(partner) {
    setEditing(partner?.id || 'new');
    setForm(partner ? {
      name: partner.name, contact_name: partner.contact_name || '',
      email: partner.email || '', phone: partner.phone || '',
      location: partner.location || '', commission_pct: String(partner.commission_pct),
    } : BLANK);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault(); setError('');
    if (!form.name) { setError('Hotel name required'); return; }
    setSaving(true);
    try {
      const isNew = editing === 'new';
      const res = await fetch(isNew ? '/api/admin/hotel-partners' : `/api/admin/hotel-partners/${editing}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      load(); setEditing(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this hotel partner?')) return;
    await fetch(`/api/admin/hotel-partners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN()}` } });
    setList(prev => prev.filter(p => p.id !== id));
  }

  async function handleStatus(id, status) {
    const partner = list.find(p => p.id === id);
    if (!partner) return;
    const res = await fetch(`/api/admin/hotel-partners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
      body: JSON.stringify({ ...partner, status }),
    });
    const data = await res.json();
    if (res.ok) setList(prev => prev.map(p => p.id === id ? data : p));
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Hotel Partners</h2>
          <p className="adm-page-sub">{list.filter(p => p.status === 'active').length} active partners</p>
        </div>
        <button className="adm-send-btn" style={{ maxWidth: 160 }} onClick={() => startEdit(null)}>
          + Add Partner
        </button>
      </div>

      {editing && (
        <form className="adm-settings-section" onSubmit={handleSave}>
          <h3 className="adm-settings-section-title">{editing === 'new' ? 'New Partner' : 'Edit Partner'}</h3>
          {error && <p className="adm-error">{error}</p>}
          <div className="adm-settings-grid">
            {[['name','Hotel Name','text'],['contact_name','Contact Name','text'],['email','Email','email'],
              ['phone','Phone','text'],['location','Location','text'],['commission_pct','Commission (%)','number']].map(([k,l,t]) => (
              <div key={k} className="adm-settings-field">
                <label className="adm-form-label">{l}</label>
                <input type={t} className="adm-form-input" value={form[k]}
                  onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button type="button" className="adm-modal-cancel" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" className="adm-send-btn" style={{ maxWidth: 140 }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Partner'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">🏨</span><p>No hotel partners yet</p></div>
      ) : (
        <div className="adm-card-list">
          {list.map(p => (
            <div key={p.id} className="adm-user-card">
              <div className="adm-user-avatar" style={{ background: '#7c3aed', fontSize: 20 }}>🏨</div>
              <div className="adm-user-info" style={{ flex: 1 }}>
                <p className="adm-user-name">{p.name}</p>
                <p className="adm-user-email">
                  {p.contact_name && `${p.contact_name} · `}{p.email || p.phone || '—'}
                </p>
                <p className="adm-user-joined">
                  {p.location || 'No location'} · {p.commission_pct}% commission
                </p>
              </div>
              <select className="adm-form-input" style={{ width: 110, fontSize: 12 }}
                value={p.status} onChange={e => handleStatus(p.id, e.target.value)}>
                {['active','pending','inactive'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: STATUS_COLOR[p.status] + '33', color: STATUS_COLOR[p.status] }}>
                {p.status}
              </span>
              <button className="adm-fare-edit" onClick={() => startEdit(p)}>✏️</button>
              <button className="adm-delete-btn" onClick={() => handleDelete(p.id)}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
