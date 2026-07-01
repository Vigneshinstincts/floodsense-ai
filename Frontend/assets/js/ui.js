function showLoading() {
  document.getElementById('loading-overlay').classList.add('active');
  document.getElementById('results-section').classList.add('hidden');
  const steps = ['ls-weather','ls-flood','ls-route','ls-fare'];
  steps.forEach(s => document.getElementById(s).className = 'loading-step');
  let i = 0;
  window._loadingInterval = setInterval(() => {
    if (i > 0) document.getElementById(steps[i-1]).className = 'loading-step done';
    if (i < steps.length) {
      document.getElementById(steps[i]).className = 'loading-step active';
      i++;
    }
  }, 600);
}

function hideLoading() {
  clearInterval(window._loadingInterval);
  document.getElementById('loading-overlay').classList.remove('active');
}

function showError(msg) {
  document.getElementById('error-msg').textContent = msg;
  document.getElementById('error-toast').classList.remove('hidden');
  setTimeout(hideError, 5000);
}

function hideError() {
  document.getElementById('error-toast').classList.add('hidden');
}

function renderResults(data) {
  console.log('Full API response:', JSON.stringify(data, null, 2));

  document.getElementById('results-section').classList.remove('hidden');

  const route = data.route;
  const weather = data.weather;
  const flood_risk = data.flood_risk;
  const fare = data.fare;
  const origin = data.origin;
  const destination = data.destination;

  // ── Summary Bar ──────────────────────────────────────────
  document.getElementById('summary-origin').textContent = origin || '—';
  document.getElementById('summary-dest').textContent = destination || '—';
  document.getElementById('summary-distance').textContent = route.distance_km || '—';
  document.getElementById('summary-duration').textContent = route.duration_min || '—';
  document.getElementById('summary-safety').textContent = (route.safety_score || 0) + '%';

  // ── Weather ───────────────────────────────────────────────
  if (weather) {
    document.getElementById('weather-temp').textContent = `${weather.temperature_c}°C`;
    document.getElementById('weather-desc').textContent = weather.description;
    document.getElementById('weather-humidity').textContent = `${weather.humidity_pct}%`;
    document.getElementById('weather-wind').textContent = `${weather.wind_speed_kmh} km/h`;
    document.getElementById('weather-rain').textContent = `${weather.rain_1h_mm} mm`;
    document.getElementById('weather-visibility').textContent = `${weather.visibility_km} km`;
  }

  // ── Flood Risk ────────────────────────────────────────────
  // Handle both {risk: {...}} and flat {...} structures
  const risk = (flood_risk && flood_risk.risk) ? flood_risk.risk : flood_risk;

  if (risk && risk.level) {
    const riskBadge = document.getElementById('risk-badge');
    riskBadge.textContent = `${risk.level} Risk`;
    riskBadge.className = `risk-badge risk-${risk.level.toLowerCase()}`;

    const scoreFill = document.getElementById('risk-score-fill');
    scoreFill.style.width = `${risk.score || 0}%`;
    scoreFill.style.background = risk.color || '#22c55e';

    document.getElementById('risk-score-label').textContent = `Score: ${risk.score || 0}/100`;
    document.getElementById('risk-advisory').textContent = risk.advisory || '';

    const zonesEl = document.getElementById('affected-zones');
    zonesEl.innerHTML = '';
    (risk.affected_zones || []).forEach(z => {
      const chip = document.createElement('span');
      chip.className = 'zone-chip';
      chip.textContent = z;
      zonesEl.appendChild(chip);
    });
  }

  // ── Traffic ───────────────────────────────────────────────
  if (route.traffic_status) {
    const trafficBadge = document.getElementById('traffic-badge');
    const trafficClass = route.traffic_status.toLowerCase().replace(' ', '');
    trafficBadge.textContent = `🚦 ${route.traffic_status}`;
    trafficBadge.className = `traffic-badge traffic-${trafficClass}`;
  }

  const warningsList = document.getElementById('warnings-list');
  warningsList.innerHTML = '';
  (route.warnings || []).forEach(w => {
    const div = document.createElement('div');
    div.className = 'warning-item';
    div.textContent = w;
    warningsList.appendChild(div);
  });

  // ── Fare ──────────────────────────────────────────────────
  if (fare) {
    if (fare.bus_available) {
      document.getElementById('fare-bus-price').textContent = `₹${fare.bus_fare_inr}`;
      document.getElementById('fare-bus-route').textContent = fare.bus_route_name || 'BMTC Bus';
    } else {
      document.getElementById('fare-bus-price').textContent = 'N/A';
      document.getElementById('fare-bus-route').textContent = 'No direct bus found';
    }
    document.getElementById('fare-cab-price').textContent = `₹${fare.cab_fare_min_inr} – ₹${fare.cab_fare_max_inr}`;
    document.getElementById('fare-surge-note').textContent = fare.cab_surge_active ? '⚡ Surge active' : 'Normal pricing';
    document.getElementById('fare-note-bottom').textContent = fare.note || '';
  }

  // ── Steps ─────────────────────────────────────────────────
  const stepsList = document.getElementById('steps-list');
  stepsList.innerHTML = '';
  (route.steps || []).slice(0, 12).forEach((step, i) => {
    const div = document.createElement('div');
    div.className = 'step-item';
    const distKm = step.distance_m ? (step.distance_m / 1000).toFixed(1) : '0';
    const durMin = step.duration_s ? Math.round(step.duration_s / 60) : '0';
    div.innerHTML = `
      <div class="step-num">${i + 1}</div>
      <div>
        <div class="step-text">${step.instruction || 'Continue'}</div>
        <div class="step-meta">${distKm} km · ${durMin} min</div>
      </div>`;
    stepsList.appendChild(div);
  });

  // ── Map ───────────────────────────────────────────────────
  if (route.geometry && route.geometry.length > 0) {
    renderRoute(
      route.geometry,
      origin,
      destination,
      route.flood_risk_on_route || 'Low'
    );
  }

  // Scroll to results
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}