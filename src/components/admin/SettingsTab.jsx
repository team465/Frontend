import { useState } from 'react';

export default function SettingsTab() {
  const [saved, setSaved] = useState(false);
  const [form, setForm]   = useState({
    platform_name:    'Jih',
    support_email:    'support@jihwolrd.com',
    support_phone:    '+855 12 345 678',
    default_currency: 'USD',
    commission_pct:   '15',
    ngo_pct:          '5',
    booking_enabled:  true,
    maintenance_mode: false,
  });

  function handleChange(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Settings</h2>
          <p className="adm-page-sub">Platform configuration</p>
        </div>
      </div>

      {saved && <div className="adm-notify-success">✓ Settings saved successfully</div>}

      <form onSubmit={handleSave}>
        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">General</h3>
          <div className="adm-settings-grid">
            {[
              ['platform_name',    'Platform Name',     'text'  ],
              ['support_email',    'Support Email',      'email' ],
              ['support_phone',    'Support Phone',      'text'  ],
              ['default_currency', 'Currency',           'text'  ],
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
              <input type="number" min="0" max="100" className="adm-form-input" value={form.commission_pct} onChange={e => handleChange('commission_pct', e.target.value)} />
            </div>
            <div className="adm-settings-field">
              <label className="adm-form-label">MOOL NGO Contribution (%)</label>
              <input type="number" min="0" max="100" className="adm-form-input" value={form.ngo_pct} onChange={e => handleChange('ngo_pct', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Platform Status</h3>
          <div className="adm-toggle-list">
            {[
              ['booking_enabled',  'Booking Enabled',   'Allow passengers to book new rides'],
              ['maintenance_mode', 'Maintenance Mode',  'Take the platform offline for maintenance'],
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

        <button type="submit" className="adm-send-btn" style={{ maxWidth: 220 }}>Save Settings</button>
      </form>
    </div>
  );
}
