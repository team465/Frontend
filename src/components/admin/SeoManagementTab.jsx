import { useState, useEffect } from 'react';

const TOKEN = () => localStorage.getItem('token');

const DEFAULTS = {
  site_title: 'Jih - Ride Hailing Cambodia',
  meta_desc:  'Jih is the premier ride-hailing service in Cambodia.',
  keywords:   'ride hailing, tuktuk, cambodia, phnom penh',
  og_title:   '',
  og_desc:    '',
};

export default function SeoManagementTab() {
  const [form, setForm]       = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/seo', { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => { if (d?.site_title) setForm({ ...DEFAULTS, ...d }); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault(); setError(''); setSaved(false);
    setSaving(true);
    try {
      const res  = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  }

  if (loading) return <div className="adm-loading"><span className="spin">⟳</span> Loading SEO settings…</div>;

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">SEO Management</h2>
          <p className="adm-page-sub">Configure meta tags and search engine settings</p>
        </div>
      </div>

      {saved  && <div className="adm-notify-success">✓ SEO settings saved</div>}
      {error  && <p className="adm-error">{error}</p>}

      <form onSubmit={handleSave}>
        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Basic SEO</h3>
          <div className="adm-settings-field">
            <label className="adm-form-label">Site Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input className="adm-form-input" value={form.site_title} maxLength={200}
              onChange={e => setForm(f => ({...f, site_title: e.target.value}))} />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              {form.site_title.length}/200 · Appears in browser tab and search results
            </p>
          </div>
          <div className="adm-settings-field" style={{ marginTop: 16 }}>
            <label className="adm-form-label">Meta Description</label>
            <textarea className="adm-form-input" rows={3} value={form.meta_desc} maxLength={300}
              onChange={e => setForm(f => ({...f, meta_desc: e.target.value}))} style={{ resize: 'vertical' }} />
            <p style={{ fontSize: 11, color: form.meta_desc.length > 160 ? '#f59e0b' : 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              {form.meta_desc.length}/300 · Recommended: under 160 characters
            </p>
          </div>
          <div className="adm-settings-field" style={{ marginTop: 16 }}>
            <label className="adm-form-label">Keywords</label>
            <input className="adm-form-input" value={form.keywords}
              onChange={e => setForm(f => ({...f, keywords: e.target.value}))}
              placeholder="keyword1, keyword2, keyword3" />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Comma-separated keywords</p>
          </div>
        </div>

        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Open Graph (Social Sharing)</h3>
          <div className="adm-settings-field">
            <label className="adm-form-label">OG Title</label>
            <input className="adm-form-input" value={form.og_title || ''} maxLength={200}
              onChange={e => setForm(f => ({...f, og_title: e.target.value}))}
              placeholder="Leave blank to use site title" />
          </div>
          <div className="adm-settings-field" style={{ marginTop: 16 }}>
            <label className="adm-form-label">OG Description</label>
            <textarea className="adm-form-input" rows={3} value={form.og_desc || ''} maxLength={300}
              onChange={e => setForm(f => ({...f, og_desc: e.target.value}))}
              style={{ resize: 'vertical' }} placeholder="Leave blank to use meta description" />
          </div>
        </div>

        {/* Preview */}
        <div className="adm-settings-section">
          <h3 className="adm-settings-section-title">Search Preview</h3>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16 }}>
            <p style={{ color: '#4ade80', fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>
              {form.site_title || 'Site Title'}
            </p>
            <p style={{ color: '#93c5fd', fontSize: 13, margin: '0 0 4px' }}>jih.com</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
              {form.meta_desc || 'Meta description will appear here…'}
            </p>
          </div>
        </div>

        <button type="submit" className="adm-send-btn" style={{ maxWidth: 200 }} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save SEO Settings'}
        </button>
      </form>
    </div>
  );
}
