import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon paths when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const makePin = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const GREEN_PIN = makePin('#22c55e');
const RED_PIN   = makePin('#ef4444');

async function geocode(address) {
  if (!address?.trim()) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (!data[0]) return null;
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {
    return null;
  }
}

async function fetchRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch {}
  return [from, to]; // fallback: straight line
}

function BoundsController({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    } else {
      map.fitBounds(points, { padding: [48, 48], maxZoom: 16, animate: true });
    }
  }, [JSON.stringify(points)]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Default center: Phnom Penh
const DEFAULT_CENTER = [11.5564, 104.9282];

export default function RideMap({ pickup, destination, height = 240, className = '' }) {
  const [pickupCoord, setPickupCoord] = useState(null);
  const [destCoord,   setDestCoord]   = useState(null);
  const [route, setRoute]             = useState(null);
  const pickupTimer = useRef(null);
  const destTimer   = useRef(null);

  useEffect(() => {
    clearTimeout(pickupTimer.current);
    if (!pickup?.trim()) { setPickupCoord(null); return; }
    pickupTimer.current = setTimeout(async () => {
      setPickupCoord(await geocode(pickup));
    }, 900);
  }, [pickup]);

  useEffect(() => {
    clearTimeout(destTimer.current);
    if (!destination?.trim()) { setDestCoord(null); return; }
    destTimer.current = setTimeout(async () => {
      setDestCoord(await geocode(destination));
    }, 900);
  }, [destination]);

  useEffect(() => {
    if (pickupCoord && destCoord) {
      fetchRoute(pickupCoord, destCoord).then(setRoute);
    } else {
      setRoute(null);
    }
  }, [pickupCoord, destCoord]);

  const visiblePoints = [pickupCoord, destCoord].filter(Boolean);

  return (
    <div className={`ride-map-wrap ${className}`} style={{ height }}>
      <MapContainer
        center={visiblePoints[0] || DEFAULT_CENTER}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {visiblePoints.length > 0 && <BoundsController points={visiblePoints} />}
        {pickupCoord && <Marker position={pickupCoord} icon={GREEN_PIN} />}
        {destCoord   && <Marker position={destCoord}   icon={RED_PIN}   />}
        {route && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#111e2c', weight: 5, opacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
