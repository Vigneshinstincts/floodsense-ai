const API_BASE = 'https://floodsense-ai-4pux.onrender.com';

async function fetchRoute(originLat, originLon, destLat, destLon, originName, destName) {
  const response = await fetch(`${API_BASE}/api/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin_lat: originLat,
      origin_lon: originLon,
      dest_lat: destLat,
      dest_lon: destLon,
      origin_name: originName,
      dest_name: destName,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${response.status}`);
  }
  return response.json();
}

async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Bengaluru, Karnataka, India')}&format=json&limit=5&addressdetails=1`;
  const response = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'FloodSenseAI/1.0' }
  });
  if (!response.ok) throw new Error('Geocoding failed');
  return response.json();
}