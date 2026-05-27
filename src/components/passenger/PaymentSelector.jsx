const METHODS = [
  { id: 'cash',   icon: '💵', label: 'Cash',        desc: 'Pay the driver directly' },
  { id: 'card',   icon: '💳', label: 'Card (Demo)', desc: 'Demo card payment' },
  { id: 'aba',    icon: '🏦', label: 'ABA Bank',    desc: 'Transfer to ABA account' },
  { id: 'wing',   icon: '📱', label: 'Wing',        desc: 'Wing mobile money' },
  { id: 'wallet', icon: '👛', label: 'Wallet',      desc: 'Jih in-app wallet' },
];

export default function PaymentSelector({ selected, onSelect }) {
  return (
    <div className="payment-selector">
      {METHODS.map(m => (
        <button
          key={m.id}
          type="button"
          className={`pm-card ${selected === m.id ? 'pm-card--active' : ''}`}
          onClick={() => onSelect(m.id)}
        >
          <span className="pm-icon">{m.icon}</span>
          <div className="pm-text">
            <span className="pm-label">{m.label}</span>
            <span className="pm-desc">{m.desc}</span>
          </div>
          <span className={`pm-radio ${selected === m.id ? 'pm-radio--on' : ''}`} />
        </button>
      ))}
    </div>
  );
}
