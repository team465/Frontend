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

// Parse "lat, lon" coordinate strings directly (produced by the GPS button)
function parseCoordString(str) {
  if (!str) return null;
  const m = str.trim().match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (m) return [parseFloat(m[1]), parseFloat(m[2])];
  return null;
}

async function geocode(address) {
  if (!address?.trim()) return null;

  // If the address is already a "lat,lon" pair, use it directly
  const coord = parseCoordString(address);
  if (coord) return coord;

  try {
    // Try Cambodia-scoped search first for faster, more accurate results
    const trySearch = async (extra = '') => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1${extra}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
    };

    // First attempt: bias toward Cambodia
    const local = await trySearch('&countrycodes=kh');
    if (local) return local;

    // Second attempt: global fallback
    return await trySearch();
  } catch {
    return null;
  }
}

async function fetchRoute(from, to) {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000); // 5 s timeout

    const res  = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch {
    // OSRM unavailable or timed out — fall through to straight line
  }
  return [from, to];
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
  const [route,       setRoute]       = useState(null);
  const [status,      setStatus]      = useState(''); // 'locating' | 'routing' | ''
  const pickupTimer = useRef(null);
  const destTimer   = useRef(null);

  useEffect(() => {
    clearTimeout(pickupTimer.current);
    if (!pickup?.trim()) { setPickupCoord(null); return; }
    setStatus('locating');
    pickupTimer.current = setTimeout(async () => {
      const coord = await geocode(pickup);
      setPickupCoord(coord);
      if (!coord) setStatus('');
    }, 600);
  }, [pickup]);

  useEffect(() => {
    clearTimeout(destTimer.current);
    if (!destination?.trim()) { setDestCoord(null); return; }
    setStatus('locating');
    destTimer.current = setTimeout(async () => {
      const coord = await geocode(destination);
      setDestCoord(coord);
      if (!coord) setStatus('');
    }, 600);
  }, [destination]);

  useEffect(() => {
    if (pickupCoord && destCoord) {
      setStatus('routing');
      fetchRoute(pickupCoord, destCoord).then(r => {
        setRoute(r);
        setStatus('');
      });
    } else {
      setRoute(null);
    }
  }, [pickupCoord, destCoord]);

  const visiblePoints = [pickupCoord, destCoord].filter(Boolean);

  return (
    <div className={`ride-map-wrap ${className}`} style={{ height, position: 'relative' }}>
      {status && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 11,
          padding: '3px 10px', borderRadius: 20, zIndex: 1000, pointerEvents: 'none',
        }}>
          {status === 'routing' ? '🗺 Finding route…' : '📍 Locating…'}
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
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
            pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
