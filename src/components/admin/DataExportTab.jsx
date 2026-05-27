import { useState } from 'react';

const TOKEN = () => localStorage.getItem('token');

function toCSV(rows, cols) {
  const header = cols.map(c => c.label).join(',');
  const body   = rows.map(r => cols.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  return header + '\n' + body;
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function DataExportTab() {
  const [exporting, setExporting] = useState('');
  const [success, setSuccess]     = useState('');

  async function handleExport(type) {
    setExporting(type); setSuccess('');
    try {
      let url, cols, filename;
      if (type === 'users') {
        url  = '/api/admin/users';
        cols = [
          { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' },
          { key: 'is_verified', label: 'Verified' }, { key: 'created_at', label: 'Joined' },
        ];
        filename = `jih-users-${new Date().toISOString().slice(0,10)}.csv`;
      } else if (type === 'rides') {
        url  = '/api/admin/rides';
        cols = [
          { key: 'id', label: 'ID' }, { key: 'passenger_name', label: 'Passenger' },
          { key: 'driver_name', label: 'Driver' }, { key: 'pickup_address', label: 'Pickup' },
          { key: 'destination_address', label: 'Destination' }, { key: 'vehicle_type', label: 'Vehicle' },
          { key: 'fare', label: 'Fare' }, { key: 'status', label: 'Status' },
          { key: 'payment_method', label: 'Payment' }, { key: 'created_at', label: 'Date' },
        ];
        filename = `jih-rides-${new Date().toISOString().slice(0,10)}.csv`;
      }
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN()}` } });
      const data = await res.json();
      const csv  = toCSV(Array.isArray(data) ? data : [], cols);
      downloadCSV(csv, filename);
      setSuccess(`${type} data exported successfully`);
    } finally { setExporting(''); }
  }

  const EXPORTS = [
    { id: 'users', icon: '👥', title: 'Export Users',  desc: 'All users with name, email, role, and join date' },
    { id: 'rides', icon: '🛺', title: 'Export Rides',  desc: 'All rides with passenger, driver, route, fare, and status' },
  ];

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">Data Export</h2>
          <p className="adm-page-sub">Download platform data as CSV</p>
        </div>
      </div>

      {success && <div className="adm-notify-success">✓ {success}</div>}

      <div className="adm-export-grid">
        {EXPORTS.map(ex => (
          <div key={ex.id} className="adm-export-card">
            <span className="adm-export-icon">{ex.icon}</span>
            <h3 className="adm-export-title">{ex.title}</h3>
            <p className="adm-export-desc">{ex.desc}</p>
            <button
              className="adm-export-btn"
              onClick={() => handleExport(ex.id)}
              disabled={exporting === ex.id}
            >
              {exporting === ex.id ? 'Exporting…' : '⬇ Download CSV'}
            </button>
          </div>
        ))}
      </div>

      <div className="adm-fare-note">
        <strong>ℹ️ Note:</strong> Exported data includes all records visible in the platform. Data is in UTF-8 CSV format.
      </div>
    </div>
  );
}
