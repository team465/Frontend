import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function TrafficMessagesTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle]     = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/traffic-messages', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setHistory(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleSend(e) {
    e.preventDefault(); setError(''); setSent(null);
    if (!title || !message) { setError('Title and message required'); return; }
    setSending(true);
    try {
      const res  = await fetch('/api/admin/traffic-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setSent(data.sent);
      setHistory(prev => [{ id: Date.now(), title, message, created_at: new Date().toISOString() }, ...prev]);
      setTitle(''); setMessage('');
    } finally { setSending(false); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Traffic Messages</h2>
          <p className="adm-page-sub">Broadcast traffic alerts to all app users</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Compose */}
        <form className="adm-settings-section" onSubmit={handleSend}>
          <h3 className="adm-settings-section-title">🚦 Broadcast Alert</h3>
          {error && <p className="adm-error">{error}</p>}
          {sent !== null && (
            <div className="adm-notify-success">✓ Sent to {sent} users</div>
          )}
          <div className="adm-settings-field">
            <label className="adm-form-label">Alert Title</label>
            <input className="adm-form-input" value={title} maxLength={80}
              onChange={e => setTitle(e.target.value)} placeholder="e.g. Road closure on Street 271" />
          </div>
          <div className="adm-settings-field" style={{ marginTop: 12 }}>
            <label className="adm-form-label">Message</label>
            <textarea className="adm-form-input" rows={4} value={message} maxLength={300}
              onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical' }}
              placeholder="Describe the traffic situation…" />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{message.length}/300</p>
          </div>
          <button type="submit" className="adm-send-btn" style={{ marginTop: 12 }} disabled={sending}>
            {sending ? 'Sending…' : '🚦 Send to All Users'}
          </button>
        </form>

        {/* History */}
        <div>
          <h3 className="adm-settings-section-title" style={{ marginBottom: 12 }}>📋 Recent Alerts</h3>
          {loading ? (
            <div className="adm-loading"><span className="spin">⟳</span></div>
          ) : history.length === 0 ? (
            <div className="adm-empty-state"><span className="adm-empty-icon">🚦</span><p>No alerts sent yet</p></div>
          ) : (
            <div className="adm-audit-list">
              {history.map((m, i) => (
                <div key={m.id || i} className="adm-audit-row">
                  <div className="adm-audit-dot" style={{ background: '#f59e0b', fontSize: 14 }}>🚦</div>
                  <div className="adm-audit-info">
                    <p className="adm-audit-label">{m.title}</p>
                    <p className="adm-audit-detail" style={{ maxWidth: 200 }}>{m.message}</p>
                  </div>
                  <span className="adm-audit-time">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
