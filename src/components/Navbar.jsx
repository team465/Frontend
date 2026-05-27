import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function getDashboardLink() {
    if (!user) return null;
    if (user.role === 'admin') return { href: '/admin', label: 'Admin Panel' };
    if (user.role === 'driver') return { href: '/driver', label: 'Driver Dashboard' };
    return { href: '/passenger', label: 'My Rides' };
  }

  const dash = getDashboardLink();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/jih-logo.png" alt="Jih" width="42" height="42" />
          <span className="navbar-brand-name">Jih</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link to="/safety" onClick={() => setMenuOpen(false)}>Safety</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          {dash && (
            <Link to={dash.href} onClick={() => setMenuOpen(false)} className="navbar-dash-link">
              {dash.label}
            </Link>
          )}
        </div>

        <div className="navbar-cta">
          {user ? (
            <button className="btn-gold" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="navbar-login">Sign in</Link>
              <Link to="/register" className="btn-gold">Get started</Link>
            </>
          )}
        </div>

        <button className="navbar-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link to="/safety" onClick={() => setMenuOpen(false)}>Safety</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          {dash && <Link to={dash.href} onClick={() => setMenuOpen(false)}>{dash.label}</Link>}
          <div className="mobile-auth">
            {user ? (
              <button className="btn-gold" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login" className="btn-outline-navy" onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn-gold" onClick={() => setMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
