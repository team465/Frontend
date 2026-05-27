import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RequestsTab  from '../components/driver/RequestsTab';
import ActiveRideTab from '../components/driver/ActiveRideTab';
import EarningsTab  from '../components/driver/EarningsTab';
import NotificationBell from '../components/NotificationBell';
import './DriverDashboard.css';

const TABS = [
  { id: 'requests', icon: '📋', label: 'Requests' },
  { id: 'active',   icon: '🚗', label: 'Active'   },
  { id: 'earnings', icon: '💰', label: 'Earnings'  },
  { id: 'profile',  icon: '👤', label: 'Profile'   },
];

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [isOnline, setIsOnline]   = useState(false);

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="ddash">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="ddash-header">
        <div className="ddash-header-inner">
          <div className="ddash-logo">
            <img src="/jih-logo.png" alt="Jih" width="34" height="34" />
            <span>Jih Driver</span>
          </div>

          {/* Online / Offline toggle */}
          <button
            className={`online-toggle ${isOnline ? 'online-toggle--on' : ''}`}
            onClick={() => setIsOnline(v => !v)}
          >
            <span className="online-toggle-dot" />
            {isOnline ? 'Online' : 'Offline'}
          </button>

          <div className="ddash-header-right">
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────── */}
      <main className="ddash-content">
        {activeTab === 'requests' && (
          <RequestsTab isOnline={isOnline} onAccepted={() => setActiveTab('active')} />
        )}
        {activeTab === 'active' && (
          <ActiveRideTab onFinished={() => setActiveTab('earnings')} />
        )}
        {activeTab === 'earnings' && <EarningsTab />}
        {activeTab === 'profile'  && <DriverProfile user={user} onLogout={handleLogout} />}
      </main>

      {/* ── Bottom tab bar ─────────────────────────────── */}
      <nav className="ddash-tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ddash-tab ${activeTab === t.id ? 'ddash-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="ddash-tab-icon">{t.icon}</span>
            <span className="ddash-tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function DriverProfile({ user, onLogout }) {
  return (
    <div className="profile-tab">
      <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
      <h2 className="profile-name">{user?.name}</h2>
      <p className="profile-email">{user?.email}</p>
      <span className="pill pill--blue" style={{ margin: '8px auto 0', display: 'inline-block' }}>Driver</span>
      <div className="profile-card" style={{ maxWidth: 340, margin: '24px auto 0' }}>
        <div className="profile-row">
          <span>Member since</span>
          <strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</strong>
        </div>
        <div className="profile-row">
          <span>Account status</span>
          <strong className="text-green">Active</strong>
        </div>
        <div className="profile-row">
          <span>Role</span>
          <strong>Driver</strong>
        </div>
      </div>
      <button
        className="btn-cancel"
        style={{ maxWidth: 300, margin: '24px auto 0', display: 'block' }}
        onClick={onLogout}
      >
        Sign out
      </button>
    </div>
  );
}
