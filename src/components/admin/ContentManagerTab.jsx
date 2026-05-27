import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function ContentManagerTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving]   = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ key: '', value: '', category: 'general' });
  const [addSaving, setAddSaving] = useState(false);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/content', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function handleSave(key, category) {
    setSaving(key);
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ value: editVal, category }),
      });
      const data = await res.json();
      if (res.ok) setItems(prev => prev.map(i => i.key === key ? data : i));
      setEditing(null);
    } finally { setSaving(null); }
  }

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    if (!newItem.key) { setError('Key required'); return; }
    setAddSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      load(); setShowAdd(false); setNewItem({ key: '', value: '', category: 'general' });
    } finally { setAddSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this content item?')) return;
    await fetch(`/api/admin/content/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN()}` } });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const categories = ['all', ...new Set(items.map(i => i.category))];
  const filtered   = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Content Manager</h2>
          <p className="adm-page-sub">Manage app text, labels, and copy</p>
        </div>
        <button className="adm-send-btn" style={{ maxWidth: 140 }} onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {showAdd && (
        <form className="adm-settings-section" onSubmit={handleAdd}>
          <h3 className="adm-settings-section-title">New Content Item</h3>
          {error && <p className="adm-error">{error}</p>}
          <div className="adm-settings-grid">
            <div className="adm-settings-field">
              <label className="adm-form-label">Key (slug)</label>
              <input className="adm-form-input" value={newItem.key}
                onChange={e => setNewItem(n => ({...n, key: e.target.value.toLowerCase().replace(/\s+/g,'_')}))}
                placeholder="home_hero_title" />
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">Category</label>
              <input className="adm-form-input" value={newItem.category}
                onChange={e => setNewItem(n => ({...n, category: e.target.value}))} placeholder="general" />
            </div>
          </div>
          <div className="adm-settings-field">
            <label className="adm-form-label">Value</label>
            <textarea className="adm-form-input" rows={3} value={newItem.value}
              onChange={e => setNewItem(n => ({...n, value: e.target.value}))} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="adm-send-btn" style={{ maxWidth: 140, marginTop: 12 }} disabled={addSaving}>
            {addSaving ? 'Adding…' : 'Add Item'}
          </button>
        </form>
      )}

      {/* Category filter */}
      <div className="pay-row" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
        {categories.map(c => (
          <button key={c} type="button"
            className={`pay-chip ${filter === c ? 'pay-chip--active' : ''}`}
            onClick={() => setFilter(c)}
            style={{ textTransform: 'capitalize' }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Key</th><th>Category</th><th>Value</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8a020' }}>{item.key}</td>
                  <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{item.category}</td>
                  <td>
                    {editing === item.key ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <textarea className="adm-form-input" rows={2} value={editVal}
                          onChange={e => setEditVal(e.target.value)} style={{ resize: 'vertical', minWidth: 200 }} />
                        <button className="adm-approve-btn" style={{ fontSize: 11 }}
                          onClick={() => handleSave(item.key, item.category)} disabled={saving === item.key}>
                          {saving === item.key ? '…' : '✓'}
                        </button>
                        <button className="adm-reject-btn" style={{ fontSize: 11 }} onClick={() => setEditing(null)}>✕</button>
                      </div>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{item.value || <em style={{ opacity: 0.4 }}>empty</em>}</span>
                    )}
                  </td>
                  <td className="adm-td-muted" style={{ fontSize: 11 }}>{new Date(item.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="adm-fare-edit" onClick={() => { setEditing(item.key); setEditVal(item.value || ''); }}>✏️</button>
                      <button className="adm-delete-btn" onClick={() => handleDelete(item.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
