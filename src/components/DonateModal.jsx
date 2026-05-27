import { useState } from 'react';
import './DonateModal.css';

const AMOUNTS = [1, 3, 5, 10];

export default function DonateModal({ onClose }) {
  const [amount, setAmount]     = useState(3);
  const [custom, setCustom]     = useState('');
  const [method, setMethod]     = useState('cash');
  const [step, setStep]         = useState('pick'); // pick | confirm | done
  const [loading, setLoading]   = useState(false);

  const finalAmount = custom ? parseFloat(custom) : amount;

  async function handleDonate() {
    if (!finalAmount || finalAmount <= 0) return;
    setLoading(true);
    // Simulate a donation POST (wire up a real endpoint later)
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('done');
  }

  if (step === 'done') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal donate-modal" onClick={e => e.stopPropagation()}>
          <div className="donate-done">
            <span className="donate-heart">❤️</span>
            <h2>Thank you!</h2>
            <p>Your ${finalAmount.toFixed(2)} donation helps support Cambodian families through the MOOL NGO initiative.</p>
            <button className="btn-book" style={{ maxWidth: 260, margin: '20px auto 0' }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal donate-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="donate-logo">
          <img src="/mool-ngo-logo.jpeg" alt="MOOL NGO" width="52" height="52" />
        </div>
        <h2 className="donate-title">Support MOOL NGO</h2>
        <p className="donate-desc">
          Your donation empowers local Cambodian drivers and their families with training, safety programs, and community support.
        </p>

        {/* Amount picker */}
        <div className="donate-amounts">
          {AMOUNTS.map(a => (
            <button
              key={a}
              type="button"
              className={`donate-amount-btn ${!custom && amount === a ? 'donate-amount-btn--active' : ''}`}
              onClick={() => { setAmount(a); setCustom(''); }}
            >
              ${a}
            </button>
          ))}
        </div>

        <div className="donate-custom-wrap">
          <span className="donate-custom-prefix">$</span>
          <input
            type="number"
            className="donate-custom-input"
            placeholder="Custom amount"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            min="0.5"
            step="0.5"
          />
        </div>

        {/* Payment method */}
        <div className="donate-methods">
          {[{id:'cash',icon:'💵',label:'Cash'},{id:'card',icon:'💳',label:'Card'},{id:'aba',icon:'🏦',label:'ABA'},{id:'wing',icon:'📱',label:'Wing'}].map(m => (
            <button
              key={m.id}
              type="button"
              className={`donate-method ${method === m.id ? 'donate-method--active' : ''}`}
              onClick={() => setMethod(m.id)}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <button
          className="btn-book donate-btn"
          onClick={handleDonate}
          disabled={loading || !finalAmount || finalAmount <= 0}
        >
          {loading ? 'Processing…' : `❤️ Donate $${(finalAmount || 0).toFixed(2)} to MOOL`}
        </button>

        <p className="donate-footer">100% goes to MOOL NGO community programs</p>
      </div>
    </div>
  );
}
