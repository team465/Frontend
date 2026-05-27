import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

export default function CommunicationsTab() {
  const [users, setUsers]     = useState([]);
  const [target, setTarget]   = useState('all');
  const [userId, setUserId]   = useState('');
  const [title, setTitle]     = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
  }, []);

  async function handleSend(e) {
    e.preventDefault(); setError(''); setSent(null);
    if (!title || !message) { setError('Title and message required'); return; }
    setSending(true);
    try {
      const body = target === 'specific'
        ? { user_id: parseInt(userId), title, message }
        : { role: target === 'all' ? 'all' : target, title, message };
      const res  = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Send failed'); return; }
      setSent(data.sent);
      setTitle(''); setMessage('');
    } finally { setSending(false); }
  }

  const targetOptions = [
    { id: 'all',       label: '📢 Everyone',     desc: 'All users on the platform' },
    { id: 'passenger', label: '👥 Passengers',    desc: 'All registered passengers' },
    { id: 'driver',    label: '🚗 Drivers',       desc: 'All registered drivers' },
    { id: 'specific',  label: '👤 Specific User', desc: 'Send to one person' },
  ];

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Communications</h2>
          <p className="adm-page-sub">Send targeted messages to users via in-app notifications</p>
        </div>
      </div>

      {sent !== null && (
        <div className="adm-notify-success">✓ Message delivered to {sent} user{sent !== 1 ? 's' : ''}</div>
      )}
      {error && <p className="adm-error">{error}</p>}

      <form onSubmit={handleSend}>
        {/* Target audience */}
        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Target Audience</h3>
          <div className="pay-row" style={{ flexWrap: 'wrap' }}>
            {targetOptions.map(opt => (
              <button key={opt.id} type="button"
                className={`pay-chip ${target === opt.id ? 'pay-chip--active' : ''}`}
                onClick={() => setTarget(opt.id)}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {target === 'specific' && (
            <div className="adm-settings-field" style={{ marginTop: 12 }}>
              <label className="adm-form-label">Select User</label>
              <select className="adm-form-input" value={userId} onChange={e => setUserId(e.target.value)}>
                <option value="">Choose a user…</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email}) — {u.role}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Message</h3>
          <div className="adm-settings-field">
            <label className="adm-form-label">Title</label>
            <input className="adm-form-input" value={title} maxLength={80}
              onChange={e => setTitle(e.target.value)} placeholder="Message title…" />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{title.length}/80</p>
          </div>
          <div className="adm-settings-field" style={{ marginTop: 12 }}>
            <label className="adm-form-label">Message</label>
            <textarea className="adm-form-input" rows={5} value={message} maxLength={500}
              onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical' }}
              placeholder="Type your message…" />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{message.length}/500</p>
          </div>
        </div>

        <button type="submit" className="adm-send-btn" style={{ maxWidth: 220 }} disabled={sending || (target === 'specific' && !userId)}>
          {sending ? 'Sending…' : '📢 Send Message'}
        </button>
      </form>
    </div>
  );
}
