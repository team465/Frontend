import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const DEFAULTS = {
  platform_name:    'Jih',
  support_email:    'support@jihwolrd.com',
  support_phone:    '+855 12 345 678',
  default_currency: 'USD',
  commission_pct:   '15',
  ngo_pct:          '5',
  booking_enabled:  true,
  maintenance_mode: false,
};

export default function SettingsTab() {
  const [form, setForm]       = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => {
        if (d && d.platform_name) {
          setForm({
            platform_name:    d.platform_name    ?? DEFAULTS.platform_name,
            support_email:    d.support_email    ?? DEFAULTS.support_email,
            support_phone:    d.support_phone    ?? DEFAULTS.support_phone,
            default_currency: d.default_currency ?? DEFAULTS.default_currency,
            commission_pct:   String(d.commission_pct ?? DEFAULTS.commission_pct),
            ngo_pct:          String(d.ngo_pct          ?? DEFAULTS.ngo_pct),
            booking_enabled:  d.booking_enabled  ?? DEFAULTS.booking_enabled,
            maintenance_mode: d.maintenance_mode ?? DEFAULTS.maintenance_mode,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify({
          ...form,
          commission_pct: parseFloat(form.commission_pct),
          ngo_pct:        parseFloat(form.ngo_pct),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Network error — is the backend running?');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading settings…</div>;

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Settings</h2>
          <p className="adm-page-sub">Platform configuration</p>
        </div>
      </div>

      {saved  && <div className="adm-notify-success">✓ Settings saved successfully</div>}
      {error  && <p className="adm-error">{error}</p>}

      <form onSubmit={handleSave}>
        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">General</h3>
          <div className="adm-settings-grid">
            {[
              ['platform_name',    'Platform Name',  'text' ],
              ['support_email',    'Support Email',  'email'],
              ['support_phone',    'Support Phone',  'text' ],
              ['default_currency', 'Currency',       'text' ],
            ].map(([key, label, type]) => (
              <div key={key} className="adm-settings-field">
                <label className="adm-form-label">{label}</label>
                <input
                  type={type}
                  className="adm-form-input"
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Revenue Sharing</h3>
          <div className="adm-settings-grid">
            <div className="adm-settings-field">
              <label className="adm-form-label">Platform Commission (%)</label>
              <input type="number" min="0" max="100" step="0.1" className="adm-form-input"
                value={form.commission_pct} onChange={e => handleChange('commission_pct', e.target.value)} />
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">MOOL NGO Contribution (%)</label>
              <input type="number" min="0" max="100" step="0.1" className="adm-form-input"
                value={form.ngo_pct} onChange={e => handleChange('ngo_pct', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Platform Status</h3>
          <div className="adm-toggle-list">
            {[
              ['booking_enabled',  'Booking Enabled',  'Allow passengers to book new rides'],
              ['maintenance_mode', 'Maintenance Mode', 'Take the platform offline for maintenance'],
            ].map(([key, label, desc]) => (
              <div key={key} className="adm-toggle-row">
                <div>
                  <p className="adm-toggle-label">{label}</p>
                  <p className="adm-toggle-desc">{desc}</p>
                </div>
                <button
                  type="button"
                  className={`adm-toggle-switch ${form[key] ? 'adm-toggle-switch--on' : ''}`}
                  onClick={() => handleChange(key, !form[key])}
                >
                  <span className="adm-toggle-knob" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="adm-send-btn" style={{ maxWidth: 220 }} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
