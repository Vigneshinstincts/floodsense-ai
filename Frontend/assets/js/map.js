let mapInstance = null;
let routeLayer = null;
let markersLayer = null;

function initMap(lat = 12.9716, lon = 77.5946) {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  mapInstance = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([lat, lon], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);
  routeLayer = L.layerGroup().addTo(mapInstance);

  // Fix map not fitting container
  setTimeout(() => {
    mapInstance.invalidateSize();
  }, 300);
}

function renderRoute(geometry, originName, destName, floodLevel) {
  if (!mapInstance) initMap();

  routeLayer.clearLayers();
  markersLayer.clearLayers();

  if (!geometry || geometry.length === 0) return;

  // Fix size before rendering
  mapInstance.invalidateSize();

  const routeColors = { Low: '#3b82f6', Medium: '#f59e0b', High: '#ef4444' };
  const color = routeColors[floodLevel] || '#3b82f6';

  const polyline = L.polyline(geometry, {
    color: color,
    weight: 5,
    opacity: 0.85,
    lineJoin: 'round',
  }).addTo(routeLayer);

  // Origin marker — green
  const originIcon = L.divIcon({
    className: '',
    html: `<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  // Destination marker — red
  const destIcon = L.divIcon({
    className: '',
    html: `<div style="background:#ef4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const start = geometry[0];
  const end = geometry[geometry.length - 1];

  L.marker(start, { icon: originIcon })
    .bindPopup(`<b>📍 ${originName}</b><br>Origin`)
    .addTo(markersLayer);

  L.marker(end, { icon: destIcon })
    .bindPopup(`<b>🏁 ${destName}</b><br>Destination`)
    .addTo(markersLayer);

  // Fit map to route bounds with padding
  setTimeout(() => {
    mapInstance.invalidateSize();
    mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }, 200);
}

function trackUserLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      if (!mapInstance) initMap(lat, lon);

      // User location marker — blue pulsing
      const userIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative">
            <div style="
              background:#3b82f6;
              width:14px;height:14px;
              border-radius:50%;
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.5);
              position:relative;z-index:2
            "></div>
            <div style="
              background:rgba(59,130,246,0.3);
              width:30px;height:30px;
              border-radius:50%;
              position:absolute;
              top:-8px;left:-8px;
              z-index:1;
              animation: pulse 1.5s infinite
            "></div>
          </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([lat, lon], { icon: userIcon })
        .bindPopup('<b>📍 You are here</b>')
        .addTo(markersLayer)
        .openPopup();

      mapInstance.setView([lat, lon], 14);

      // Auto-fill origin input
      document.getElementById('origin-input').value = 'My Location';
      window._userLat = lat;
      window._userLon = lon;
      originCoords = {
        name: 'My Location'
        lat: lat,
        lon: lon,
      };
    },
    (error) => {
      alert('Could not get your location. Please enter it manually.');
      console.error('Geolocation error:', error);
    }
  );
}