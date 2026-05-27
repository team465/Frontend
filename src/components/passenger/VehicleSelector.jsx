export const VEHICLE_OPTIONS = [
  { type: 'tuktuk', icon: '🛺', image: '/passenger-tuktuk.png', label: 'Tuk Tuk', description: 'Classic Cambodia ride', baseFare: 1.0, perKm: 0.4, maxSeats: 4 },
  { type: 'car',    icon: '🚗', image: '/car-angkor.png',        label: 'Car',     description: 'Comfortable & AC',     baseFare: 1.5, perKm: 0.6, maxSeats: 5 },
  { type: 'moto',   icon: '🏍️', image: '/driver-moto.png',      label: 'Moto',    description: 'Fast & affordable',    baseFare: 0.75,perKm: 0.3, maxSeats: 1 },
  { type: 'van',    icon: '🚐', image: '/passenger-van.jpg',     label: 'Van',     description: 'Groups up to 8',       baseFare: 2.0, perKm: 0.8, maxSeats: 8 },
];

export const calculateFare = (vehicle, distanceKm) =>
  vehicle.baseFare + distanceKm * vehicle.perKm;

export default function VehicleSelector({ selected, onSelect, distanceKm }) {
  return (
    <div className="vehicle-selector">
      {VEHICLE_OPTIONS.map(v => {
        const fare = calculateFare(v, distanceKm);
        const isSelected = selected === v.type;
        return (
          <button
            key={v.type}
            className={`vs-card ${isSelected ? 'vs-card--active' : ''}`}
            onClick={() => onSelect(v.type)}
            type="button"
          >
            <img src={v.image} alt={v.label} className="vs-img" />
            <span className="vs-label">{v.label}</span>
            <span className="vs-desc">{v.description}</span>
            <span className="vs-fare">${fare.toFixed(2)}</span>
          </button>
        );
      })}
    </div>
  );
}
