import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

const features = [
  { icon: '🛡️', title: 'Safety First', desc: 'All drivers are verified with background checks, ID, and vehicle inspection before going live.' },
  { icon: '💰', title: 'Fair Pricing', desc: 'Transparent fares with no surge pricing. What you see is what you pay — always.' },
  { icon: '📍', title: 'Real-time Tracking', desc: 'Track your ride live on the map. Share your trip with family for added peace of mind.' },
  { icon: '🤝', title: 'Community First', desc: 'We are a MOOL NGO initiative — every ride supports local Cambodian families.' },
  { icon: '🗓️', title: 'Schedule Rides', desc: 'Book in advance for airport pickups, tours, or any important journey.' },
  { icon: '⭐', title: 'Rated Drivers', desc: 'Read real reviews from real passengers. Only top-rated drivers stay on the platform.' },
];

const vehicles = [
  { img: '/hero-bright-tuktuk.jpg', name: 'Tuk-Tuk', desc: 'Iconic Cambodia ride — perfect for short hops and sightseeing.' },
  { img: '/car-angkor.png', name: 'Car', desc: 'Comfortable air-conditioned car for longer trips or families.' },
  { img: '/driver-moto.png', name: 'Moto', desc: 'Beat the traffic fast with a local moto driver.' },
];

const steps = [
  { num: '01', title: 'Open the app', desc: 'Enter your pickup and destination to see an instant fare estimate.' },
  { num: '02', title: 'Choose your ride', desc: 'Pick tuk-tuk, car, or moto — whichever suits your trip best.' },
  { num: '03', title: 'Get picked up', desc: 'Your driver arrives and you track them live on the map.' },
  { num: '04', title: 'Pay & rate', desc: 'Pay with cash or wallet. Rate your driver to help the community.' },
];

const stats = [
  { value: '5,000+', label: 'Rides completed' },
  { value: '200+', label: 'Verified drivers' },
  { value: '4.8★', label: 'Average rating' },
  { value: '100%', label: 'Cambodian owned' },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: 'url(/hero-airport-pickup.jpg)' }} />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="section-label" style={{ background: 'rgba(232,160,32,0.18)', color: '#f5b83a' }}>
            🇰🇭 Cambodia's community-first ride app
          </span>
          <h1 className="hero-title">
            Your ride,<br />
            <em className="hero-title-em">your community</em>
          </h1>
          <p className="hero-sub">
            Trusted tuk-tuks, cars, and motos across Siem Reap — safe, fair, and local.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-gold hero-btn">Book a ride</Link>
            <Link to="/register?role=driver" className="btn-outline hero-btn">Become a driver</Link>
          </div>
        </div>

        <div className="hero-stats container">
          {stats.map(s => (
            <div key={s.label} className="hero-stat">
              <span className="hero-stat-value">{s.value}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vehicles ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Our fleet</span>
            <h2>Choose your ride</h2>
            <p className="section-sub">Three vehicle types to fit every journey in Cambodia.</p>
          </div>
          <div className="vehicle-grid">
            {vehicles.map(v => (
              <div key={v.name} className="vehicle-card">
                <div className="vehicle-img-wrap">
                  <img src={v.img} alt={v.name} />
                </div>
                <div className="vehicle-info">
                  <h3>{v.name}</h3>
                  <p>{v.desc}</p>
                  <Link to="/register" className="vehicle-cta">Book a {v.name} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section className="section section-navy">
        <div className="container">
          <div className="section-head">
            <span className="section-label" style={{ background: 'rgba(232,160,32,0.15)', color: 'var(--gold-l)' }}>
              Simple process
            </span>
            <h2 style={{ color: '#fff' }}>How Jih works</h2>
            <p className="section-sub" style={{ color: 'rgba(255,255,255,0.55)' }}>
              From tap to destination in four easy steps.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map(s => (
              <div key={s.num} className="step-card">
                <span className="step-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Why Jih</span>
            <h2>Built for Cambodia</h2>
            <p className="section-sub">Every feature designed with local passengers and drivers in mind.</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Driver CTA ─────────────────────────────────── */}
      <section className="section section-gold">
        <div className="container driver-cta-inner">
          <div className="driver-cta-text">
            <span className="section-label" style={{ background: 'rgba(17,30,44,0.12)', color: 'var(--navy)' }}>
              Earn more
            </span>
            <h2>Drive with Jih</h2>
            <p>Join over 200 verified drivers earning fair income across Siem Reap. Flexible hours, no commission surprises.</p>
            <div className="driver-cta-actions">
              <Link to="/register" className="btn-outline-navy">Apply to drive</Link>
            </div>
          </div>
          <div className="driver-cta-img">
            <img src="/hero-drivers-group.png" alt="Jih drivers" />
          </div>
        </div>
      </section>

      {/* ── NGO Section ────────────────────────────────── */}
      <section className="section">
        <div className="container mool-inner">
          <div className="mool-img">
            <img src="/mool-ngo-logo.jpeg" alt="MOOL NGO" />
          </div>
          <div className="mool-text">
            <span className="section-label">Our mission</span>
            <h2>Powered by MOOL NGO</h2>
            <p>
              Jih is an initiative of MOOL — a Cambodian NGO dedicated to economic empowerment for local communities.
              Every ride you take helps fund driver training, safety programs, and community development across Cambodia.
            </p>
            <Link to="/about" className="btn-outline-navy" style={{ marginTop: '20px' }}>Learn about MOOL →</Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="section section-navy final-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: 16 }}>Ready to ride?</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 32, fontSize: '17px' }}>
            Join thousands of passengers and drivers across Siem Reap.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-gold">Book your first ride</Link>
            <Link to="/register" className="btn-outline">Drive with us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
