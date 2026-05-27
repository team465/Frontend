import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');
const STATUS_COLOR = { pending: '#f59e0b', approved: '#3b82f6', paid: '#10b981', rejected: '#ef4444' };

export default function WithdrawalsTab() {
  const [list, setList]       = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ driver_id: '', amount: '', method: 'bank', notes: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json()),
      fetch('/api/admin/drivers', { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json()),
    ]).then(([w, d]) => {
      setList(Array.isArray(w) ? w : []);
      setDrivers(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    if (!form.driver_id || !form.amount) { setError('Driver and amount required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      load(); setShowForm(false);
      setForm({ driver_id: '', amount: '', method: 'bank', notes: '' });
    } finally { setSaving(false); }
  }

  async function handleStatus(id, status) {
    const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) setList(prev => prev.map(w => w.id === id ? data : w));
  }

  const totalPaid    = list.filter(w => w.status === 'paid').reduce((s, w) => s + parseFloat(w.amount), 0);
  const totalPending = list.filter(w => w.status === 'pending').reduce((s, w) => s + parseFloat(w.amount), 0);

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Withdrawals</h2>
          <p className="adm-page-sub">Driver payout requests</p>
        </div>
        <button className="adm-send-btn" style={{ maxWidth: 160 }} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Withdrawal'}
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { label: 'Total Paid Out', value: `$${totalPaid.toFixed(2)}`, color: '#10b981' },
          { label: 'Pending Payout', value: `$${totalPending.toFixed(2)}`, color: '#f59e0b' },
          { label: 'Pending Requests', value: list.filter(w => w.status === 'pending').length, color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} className="adm-kpi-card" style={{ flex: '1 1 160px' }}>
            <div className="adm-kpi-bar" style={{ background: k.color }} />
            <span className="adm-kpi-label">{k.label}</span>
            <span className="adm-kpi-value">{k.value}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <form className="adm-settings-section" onSubmit={handleAdd}>
          <h3 className="adm-settings-section-title">New Withdrawal Request</h3>
          {error && <p className="adm-error">{error}</p>}
          <div className="adm-settings-grid">
            <div className="adm-settings-field">
              <label className="adm-form-label">Driver</label>
              <select className="adm-form-input" value={form.driver_id} onChange={e => setForm(f => ({...f,driver_id:e.target.value}))}>
                <option value="">Select driver…</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
              </select>
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">Amount ($)</label>
              <input type="number" step="0.01" min="1" className="adm-form-input" value={form.amount}
                onChange={e => setForm(f => ({...f,amount:e.target.value}))} />
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">Method</label>
              <select className="adm-form-input" value={form.method} onChange={e => setForm(f => ({...f,method:e.target.value}))}>
                {['bank','aba','wing','khqr','cash'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">Notes</label>
              <input type="text" className="adm-form-input" value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))} />
            </div>
          </div>
          <button type="submit" className="adm-send-btn" style={{ maxWidth: 160, marginTop: 12 }} disabled={saving}>
            {saving ? 'Creating…' : 'Create Request'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="adm-loading"><span className="spin">⟳</span> Loading…</div>
      ) : list.length === 0 ? (
        <div className="adm-empty-state"><span className="adm-empty-icon">💸</span><p>No withdrawal requests</p></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Driver</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {list.map(w => (
                <tr key={w.id}>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600 }}>{w.driver_name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{w.driver_email}</p>
                  </td>
                  <td className="adm-td-gold">${parseFloat(w.amount).toFixed(2)}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: 12 }}>{w.method}</td>
                  <td>
                    <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: STATUS_COLOR[w.status] + '33', color: STATUS_COLOR[w.status] }}>
                      {w.status}
                    </span>
                  </td>
                  <td className="adm-td-muted">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td>
                    {w.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-approve-btn" style={{ fontSize: 11 }} onClick={() => handleStatus(w.id, 'approved')}>Approve</button>
                        <button className="adm-reject-btn" style={{ fontSize: 11 }} onClick={() => handleStatus(w.id, 'rejected')}>Reject</button>
                      </div>
                    )}
                    {w.status === 'approved' && (
                      <button className="adm-approve-btn" style={{ fontSize: 11, background: '#10b981' }} onClick={() => handleStatus(w.id, 'paid')}>
                        Mark Paid
                      </button>
                    )}
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
