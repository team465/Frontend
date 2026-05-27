import { useState } from 'react';

const TOKEN = () => localStorage.getItem('token');

const TARGET_OPTIONS = [
  { value: 'all',       label: 'Everyone',   icon: '🌐' },
  { value: 'passenger', label: 'Passengers',  icon: '👤' },
  { value: 'driver',    label: 'Drivers',     icon: '🚗' },
];

export default function NotificationsTab() {
  const [target,  setTarget]  = useState('all');
  const [title,   setTitle]   = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  async function handleSend(e) {
    e.preventDefault();
    setError(''); setResult(null);
    if (!title.trim() || !message.trim()) { setError('Title and message are required'); return; }
    setSending(true);
    try {
      const res  = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({ role: target, title: title.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send'); return; }
      setResult(data.sent);
      setTitle(''); setMessage('');
    } catch { setError('Connection error'); }
    finally { setSending(false); }
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Notifications</h2>
          <p className="adm-page-sub">Broadcast messages to users</p>
        </div>
      </div>

      <div className="adm-notify-wrap">
        <form className="adm-notify-form" onSubmit={handleSend}>

          {/* Target audience */}
          <div className="adm-form-group">
            <label className="adm-form-label">Target Audience</label>
            <div className="adm-target-row">
              {TARGET_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`adm-target-btn ${target === opt.value ? 'adm-target-btn--active' : ''}`}
                  onClick={() => setTarget(opt.value)}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="adm-form-group">
            <label className="adm-form-label">Title</label>
            <input
              className="adm-form-input"
              placeholder="Notification title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
            />
            <span className="adm-char-count">{title.length}/80</span>
          </div>

          {/* Message */}
          <div className="adm-form-group">
            <label className="adm-form-label">Message</label>
            <textarea
              className="adm-form-textarea"
              placeholder="Write your message…"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={300}
            />
            <span className="adm-char-count">{message.length}/300</span>
          </div>

          {error  && <p className="adm-error">{error}</p>}
          {result !== null && (
            <div className="adm-notify-success">
              ✓ Sent to {result} user{result !== 1 ? 's' : ''}
            </div>
          )}

          <button type="submit" className="adm-send-btn" disabled={sending}>
            {sending ? 'Sending…' : `Send to ${TARGET_OPTIONS.find(o=>o.value===target)?.label}`}
          </button>
        </form>

        {/* Tips panel */}
        <div className="adm-notify-tips">
          <h4>📋 Best Practices</h4>
          <ul>
            <li>Keep titles short and clear</li>
            <li>Personalise messages to the audience</li>
            <li>Avoid sending too many notifications</li>
            <li>Use for important updates only</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
