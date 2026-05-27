import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import OverviewTab           from '../components/admin/OverviewTab';
import UsersTab              from '../components/admin/UsersTab';
import DriversTab            from '../components/admin/DriversTab';
import PassengersTab         from '../components/admin/PassengersTab';
import DriverApplicationsTab from '../components/admin/DriverApplicationsTab';
import ProfileRequestsTab    from '../components/admin/ProfileRequestsTab';
import WaitlistTab           from '../components/admin/WaitlistTab';
import DriverLeadsTab        from '../components/admin/DriverLeadsTab';
import RidesTab              from '../components/admin/RidesTab';
import SupportTab            from '../components/admin/SupportTab';
import LiveTrackerTab        from '../components/admin/LiveTrackerTab';
import SafetyTab             from '../components/admin/SafetyTab';
import OnboardingFunnelTab   from '../components/admin/OnboardingFunnelTab';
import IncidentsTab          from '../components/admin/IncidentsTab';
import DisputesTab           from '../components/admin/DisputesTab';
import TrafficMessagesTab    from '../components/admin/TrafficMessagesTab';
import FareManagementTab     from '../components/admin/FareManagementTab';
import AnalyticsTab          from '../components/admin/AnalyticsTab';
import PaymentsTab           from '../components/admin/PaymentsTab';
import WithdrawalsTab        from '../components/admin/WithdrawalsTab';
import DonationsTab          from '../components/admin/DonationsTab';
import AuditLogTab           from '../components/admin/AuditLogTab';
import DataExportTab         from '../components/admin/DataExportTab';
import NotificationsTab      from '../components/admin/NotificationsTab';
import CommunicationsTab     from '../components/admin/CommunicationsTab';
import EntFinanceTab         from '../components/admin/EntFinanceTab';
import EntComplianceTab      from '../components/admin/EntComplianceTab';
import HotelPartnersTab      from '../components/admin/HotelPartnersTab';
import InvestorAccessTab     from '../components/admin/InvestorAccessTab';
import EventsLogTab          from '../components/admin/EventsLogTab';
import ContentManagerTab     from '../components/admin/ContentManagerTab';
import SeoManagementTab      from '../components/admin/SeoManagementTab';
import TeamTab               from '../components/admin/TeamTab';
import SettingsTab           from '../components/admin/SettingsTab';
import NotificationBell      from '../components/NotificationBell';
import './AdminDashboard.css';

const NAV_SECTIONS = [
  {
    items: [
      { id: 'overview', icon: '📊', label: 'Overview' },
    ],
  },
  {
    label: 'USERS',
    items: [
      { id: 'driver-applications', icon: '📋', label: 'Driver Applications' },
      { id: 'drivers',             icon: '🚗', label: 'Drivers'             },
      { id: 'passengers',          icon: '👥', label: 'Passengers'          },
      { id: 'profile-requests',    icon: '🪪', label: 'Profile Requests'    },
      { id: 'waitlist',            icon: '⏳', label: 'Waitlist'            },
      { id: 'driver-leads',        icon: '🎯', label: 'Driver Leads'        },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { id: 'live-tracker',      icon: '📍', label: 'Live Tracker'      },
      { id: 'safety',            icon: '🛡️', label: 'Safety'            },
      { id: 'onboarding-funnel', icon: '🔰', label: 'Onboarding Funnel' },
      { id: 'incidents',         icon: '⚠️', label: 'Incidents'         },
      { id: 'disputes',          icon: '⚖️', label: 'Disputes'          },
      { id: 'fare-management',   icon: '💲', label: 'Fare Management'   },
    ],
  },
  {
    label: 'RIDES & SUPPORT',
    items: [
      { id: 'rides',            icon: '🛺', label: 'All Rides'        },
      { id: 'support',          icon: '🎧', label: 'Support'          },
      { id: 'traffic-messages', icon: '🚦', label: 'Traffic Messages' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { id: 'payments',    icon: '💳', label: 'Payments'    },
      { id: 'donations',   icon: '🌿', label: 'Donations'   },
      { id: 'withdrawals', icon: '💸', label: 'Withdrawals' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { id: 'content-manager', icon: '📝', label: 'Content Manager' },
      { id: 'seo',             icon: '🔍', label: 'SEO Management'  },
    ],
  },
  {
    label: 'COMPLIANCE',
    items: [
      { id: 'audit-log',   icon: '🗂️', label: 'Audit Log'   },
      { id: 'data-export', icon: '📤', label: 'Data Export' },
    ],
  },
  {
    label: 'ENTERPRISE',
    items: [
      { id: 'ent-finance',    icon: '🏦', label: 'Finance'        },
      { id: 'ent-compliance', icon: '📜', label: 'Compliance'     },
      { id: 'communications', icon: '📢', label: 'Communications' },
    ],
  },
  {
    label: 'MOOL NGO',
    items: [
      { id: 'mool-ngo', icon: '🌱', label: 'MOOL NGO' },
    ],
  },
  {
    label: 'PARTNERS',
    items: [
      { id: 'hotel-partners', icon: '🏨', label: 'Hotel Partners' },
    ],
  },
  {
    label: 'EXECUTIVE',
    items: [
      { id: 'investor-access', icon: '📈', label: 'Investor Access' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'analytics',    icon: '📉', label: 'Analytics'    },
      { id: 'events-log',   icon: '🗒️', label: 'Events Log'   },
      { id: 'team',         icon: '👤', label: 'Team'         },
      { id: 'settings',     icon: '⚙️', label: 'Settings'     },
      { id: 'notifications', icon: '🔔', label: 'Notifications' },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

function renderTab(id) {
  switch (id) {
    case 'overview':            return <OverviewTab />;
    case 'driver-applications': return <DriverApplicationsTab />;
    case 'drivers':             return <DriversTab />;
    case 'passengers':          return <PassengersTab />;
    case 'profile-requests':    return <ProfileRequestsTab />;
    case 'waitlist':            return <WaitlistTab />;
    case 'driver-leads':        return <DriverLeadsTab />;
    case 'rides':               return <RidesTab />;
    case 'support':             return <SupportTab />;
    case 'live-tracker':        return <LiveTrackerTab />;
    case 'safety':              return <SafetyTab />;
    case 'onboarding-funnel':   return <OnboardingFunnelTab />;
    case 'incidents':           return <IncidentsTab />;
    case 'disputes':            return <DisputesTab />;
    case 'traffic-messages':    return <TrafficMessagesTab />;
    case 'fare-management':     return <FareManagementTab />;
    case 'analytics':           return <AnalyticsTab />;
    case 'payments':            return <PaymentsTab />;
    case 'withdrawals':         return <WithdrawalsTab />;
    case 'donations':           return <DonationsTab />;
    case 'mool-ngo':            return <DonationsTab />;
    case 'audit-log':           return <AuditLogTab />;
    case 'data-export':         return <DataExportTab />;
    case 'notifications':       return <NotificationsTab />;
    case 'communications':      return <CommunicationsTab />;
    case 'ent-finance':         return <EntFinanceTab />;
    case 'ent-compliance':      return <EntComplianceTab />;
    case 'hotel-partners':      return <HotelPartnersTab />;
    case 'investor-access':     return <InvestorAccessTab />;
    case 'events-log':          return <EventsLogTab />;
    case 'content-manager':     return <ContentManagerTab />;
    case 'seo':                 return <SeoManagementTab />;
    case 'team':                return <TeamTab />;
    case 'settings':            return <SettingsTab />;
    default:                    return null;
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive]     = useState('overview');
  const [sideOpen, setSideOpen] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }
  function goTo(id) { setActive(id); setSideOpen(false); }

  const activeItem = ALL_ITEMS.find(i => i.id === active);

  return (
    <div className="adash">

      {/* ── Sidebar ─────────────────────────────────── */}
      <>
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

          {/* Nav sections */}
          <nav className="adash-nav">
            {NAV_SECTIONS.map((section, si) => (
              <div key={si} className="adash-nav-section">
                {section.label && (
                  <span className="adash-nav-section-label">{section.label}</span>
                )}
                {section.items.map(item => (
                  <button
                    key={item.id}
                    className={`adash-nav-item ${active === item.id ? 'adash-nav-item--active' : ''}`}
                    onClick={() => goTo(item.id)}
                  >
                    <span className="adash-nav-icon">{item.icon}</span>
                    <span className="adash-nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="adash-nav-badge">{item.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
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
        <header className="adash-topbar">
          <button className="adash-hamburger" onClick={() => setSideOpen(v => !v)}>
            <span /><span /><span />
          </button>
          <div className="adash-topbar-title">
            {activeItem?.icon}{' '}{activeItem?.label}
          </div>
          <div className="adash-topbar-right">
            <span className="adash-admin-chip">⚡ Admin</span>
            <NotificationBell />
          </div>
        </header>

        <main className="adash-content">
          {renderTab(active)}
        </main>
      </div>
    </div>
  );
}
