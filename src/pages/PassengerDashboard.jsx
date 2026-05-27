import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookTab          from '../components/passenger/BookTab';
import MyRideTab        from '../components/passenger/MyRideTab';
import HistoryTab       from '../components/passenger/HistoryTab';
import NotificationBell from '../components/NotificationBell';
import DonateModal      from '../components/DonateModal';
import './PassengerDashboard.css';

const TABS = [
  { id: 'book',    icon: '🛺', label: 'Book'    },
  { id: 'myride',  icon: '📍', label: 'My Ride' },
  { id: 'history', icon: '📋', label: 'History' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export default function PassengerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState('book');
  const [showDonate, setShowDonate] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }
  function handleRideCreated() { setActiveTab('myride'); }

  return (
    <div className={`pdash ${activeTab === 'book' ? 'pdash--book' : ''}`}>

      {/* ── Top bar ──────────────────────────────────── */}
      <header className="pdash-header">
        <div className="pdash-header-inner">
          <div className="pdash-logo">
            <img src="/jih-logo.png" alt="Jih" width="34" height="34" />
            <span>Jih</span>
          </div>

          {/* MOOL Donate button — centre */}
          <button className="donate-trigger" onClick={() => setShowDonate(true)}>
            <span className="donate-heart-icon">♥</span>
            MOOL · Donate
          </button>

          {/* Right: notification bell */}
          <div className="pdash-header-right">
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────── */}
      <main className="pdash-content">
        {activeTab === 'book'    && <BookTab    onRideCreated={handleRideCreated} />}
        {activeTab === 'myride'  && <MyRideTab  onTabChange={setActiveTab} />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'profile' && <ProfileTab user={user} onLogout={handleLogout} />}
      </main>

      {/* ── Bottom tab bar ───────────────────────────── */}
      <nav className="pdash-tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`pdash-tab ${activeTab === t.id ? 'pdash-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="pdash-tab-icon">{t.icon}</span>
            <span className="pdash-tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Donate modal ─────────────────────────────── */}
      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </div>
  );
}

function ProfileTab({ user, onLogout }) {
  return (
    <div className="profile-tab">
      <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
      <h2 className="profile-name">{user?.name}</h2>
      <p className="profile-email">{user?.email}</p>
      <span className="pill pill--blue" style={{ margin: '8px auto 0', display: 'inline-block' }}>{user?.role}</span>
      <div className="profile-card">
        <div className="profile-row">
          <span>Member since</span>
          <strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</strong>
        </div>
        <div className="profile-row">
          <span>Account status</span>
          <strong className="text-green">Active</strong>
        </div>
      </div>
      <button className="btn-cancel" style={{ maxWidth: 300, margin: '24px auto 0' }} onClick={onLogout}>Sign out</button>
    </div>
  );
}
