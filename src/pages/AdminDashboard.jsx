import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OverviewTab       from '../components/admin/OverviewTab';
import UsersTab          from '../components/admin/UsersTab';
import DriversTab        from '../components/admin/DriversTab';
import RidesTab          from '../components/admin/RidesTab';
import AnalyticsTab      from '../components/admin/AnalyticsTab';
import NotificationsTab  from '../components/admin/NotificationsTab';
import NotificationBell  from '../components/NotificationBell';
import './AdminDashboard.css';

const NAV = [
  { id: 'overview',       icon: '📊', label: 'Overview'      },
  { id: 'users',          icon: '👥', label: 'Users'         },
  { id: 'drivers',        icon: '🚗', label: 'Drivers'       },
  { id: 'rides',          icon: '🛺', label: 'Rides'         },
  { id: 'analytics',      icon: '📈', label: 'Analytics'     },
  { id: 'notifications',  icon: '🔔', label: 'Notifications' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive]       = useState('overview');
  const [sideOpen, setSideOpen]   = useState(false);

  function handleLogout() { logout(); navigate('/login'); }
  function goTo(id) { setActive(id); setSideOpen(false); }

  return (
    <div className="adash">

      {/* ── Sidebar ─────────────────────────────────── */}
      <>
        {/* Mobile backdrop */}
        {sideOpen && <div className="adash-backdrop" onClick={() => setSideOpen(false)} />}

        <aside className={`adash-sidebar ${sideOpen ? 'adash-sidebar--open' : ''}`}>
          {/* Logo */}
          <div className="adash-sidebar-logo">
            <img src="/jih-logo.png" alt="Jih" width="34" height="34" />
            <div>
              <span className="adash-sidebar-brand">Jih</span>
              <span className="adash-sidebar-role">Admin Panel</span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="adash-nav">
            {NAV.map(n => (
              <button
                key={n.id}
                className={`adash-nav-item ${active === n.id ? 'adash-nav-item--active' : ''}`}
                onClick={() => goTo(n.id)}
              >
                <span className="adash-nav-icon">{n.icon}</span>
                <span className="adash-nav-label">{n.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom: admin profile + logout */}
          <div className="adash-sidebar-foot">
            <div className="adash-admin-profile">
              <div className="adash-admin-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="adash-admin-info">
                <p className="adash-admin-name">{user?.name}</p>
                <p className="adash-admin-email">{user?.email}</p>
              </div>
            </div>
            <button className="adash-logout-btn" onClick={handleLogout}>
              ↩ Sign out
            </button>
          </div>
        </aside>
      </>

      {/* ── Main area ───────────────────────────────── */}
      <div className="adash-main">

        {/* Top bar */}
        <header className="adash-topbar">
          <button className="adash-hamburger" onClick={() => setSideOpen(v => !v)}>
            <span /><span /><span />
          </button>
          <div className="adash-topbar-title">
            {NAV.find(n => n.id === active)?.icon}{' '}
            {NAV.find(n => n.id === active)?.label}
          </div>
          <div className="adash-topbar-right">
            <span className="adash-admin-chip">⚡ Admin</span>
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="adash-content">
          {active === 'overview'      && <OverviewTab />}
          {active === 'users'         && <UsersTab />}
          {active === 'drivers'       && <DriversTab />}
          {active === 'rides'         && <RidesTab />}
          {active === 'analytics'     && <AnalyticsTab />}
          {active === 'notifications' && <NotificationsTab />}
        </main>
      </div>
    </div>
  );
}
