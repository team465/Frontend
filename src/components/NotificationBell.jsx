import { useState, useEffect, useRef } from 'react';
import './NotificationBell.css';

const TOKEN = () => localStorage.getItem('token');

export default function NotificationBell() {
  const [notifs, setNotifs]   = useState([]);
  const [open, setOpen]       = useState(false);
  const ref = useRef(null);

  async function fetchNotifs() {
    try {
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${TOKEN()}` } });
      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClickOut(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'PATCH', headers: { Authorization: `Bearer ${TOKEN()}` } });
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
  }

  const unread = notifs.filter(n => !n.is_read).length;

  function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-btn" onClick={() => { setOpen(o => !o); if (!open && unread) markAllRead(); }}>
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-head">
            <span>Notifications</span>
            {unread > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notif-list">
            {notifs.length === 0 ? (
              <div className="notif-empty">
                <span>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifs.map(n => (
                <div key={n.id} className={`notif-item ${!n.is_read ? 'notif-item--unread' : ''}`}>
                  <div className="notif-dot-wrap">
                    {!n.is_read && <span className="notif-dot" />}
                  </div>
                  <div className="notif-body">
                    <p className="notif-title">{n.title}</p>
                    {n.message && <p className="notif-msg">{n.message}</p>}
                    <p className="notif-time">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
