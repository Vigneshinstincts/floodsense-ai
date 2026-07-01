// ─── State ────────────────────────────────────────────────
let originCoords = null;
let destCoords = null;

// Known Bengaluru locations for fast suggestions
const BENGALURU_LOCATIONS = [
  { name: 'Silk Board', lat: 12.9172, lon: 77.6228 },
  { name: 'Hebbal', lat: 13.0358, lon: 77.5970 },
  { name: 'Marathahalli', lat: 12.9569, lon: 77.7011 },
  { name: 'Whitefield', lat: 12.9698, lon: 77.7500 },
  { name: 'Koramangala', lat: 12.9352, lon: 77.6245 },
  { name: 'Indiranagar', lat: 12.9719, lon: 77.6412 },
  { name: 'Jayanagar', lat: 12.9254, lon: 77.5832 },
  { name: 'Banashankari', lat: 12.9255, lon: 77.5468 },
  { name: 'Electronic City', lat: 12.8452, lon: 77.6602 },
  { name: 'Majestic', lat: 12.9767, lon: 77.5713 },
  { name: 'KR Puram', lat: 13.0088, lon: 77.6964 },
  { name: 'Yelahanka', lat: 13.1007, lon: 77.5963 },
  { name: 'Bellandur', lat: 12.9258, lon: 77.6649 },
  { name: 'Domlur', lat: 12.9610, lon: 77.6387 },
  { name: 'HSR Layout', lat: 12.9116, lon: 77.6389 },
  { name: 'BTM Layout', lat: 12.9166, lon: 77.6101 },
  { name: 'JP Nagar', lat: 12.9063, lon: 77.5857 },
  { name: 'Rajajinagar', lat: 12.9911, lon: 77.5554 },
  { name: 'Malleshwaram', lat: 13.0035, lon: 77.5668 },
  { name: 'Yeshwanthpur', lat: 13.0275, lon: 77.5497 },
];

// ─── Autocomplete ──────────────────────────────────────────
function setupAutocomplete(inputId, suggestionsId, onSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(suggestionsId);

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    dropdown.innerHTML = '';

    if (query.length < 2) {
      dropdown.classList.remove('open');
      return;
    }

    const matches = BENGALURU_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length === 0) {
      dropdown.classList.remove('open');
      return;
    }

    matches.forEach(loc => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `<span>📍</span><span>${loc.name}</span>`;
      item.addEventListener('click', () => {
        input.value = loc.name;
        dropdown.classList.remove('open');
        onSelect(loc);
      });
      dropdown.appendChild(item);
    });

    dropdown.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

// ─── Quick Route Chips ─────────────────────────────────────
document.querySelectorAll('.quick-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const originName = chip.dataset.origin;
    const destName = chip.dataset.dest;
    const oLat = parseFloat(chip.dataset.olat);
    const oLon = parseFloat(chip.dataset.olon);
    const dLat = parseFloat(chip.dataset.dlat);
    const dLon = parseFloat(chip.dataset.dlon);

    document.getElementById('origin-input').value = originName;
    document.getElementById('dest-input').value = destName;
    originCoords = { name: originName, lat: oLat, lon: oLon };
    destCoords = { name: destName, lat: dLat, lon: dLon };

    handleSearch();
  });
});

// ─── Swap Button ───────────────────────────────────────────
document.getElementById('swap-btn').addEventListener('click', () => {
  const originInput = document.getElementById('origin-input');
  const destInput = document.getElementById('dest-input');
  [originInput.value, destInput.value] = [destInput.value, originInput.value];
  [originCoords, destCoords] = [destCoords, originCoords];
});

// ─── Search Handler ────────────────────────────────────────
async function handleSearch() {
  if (!originCoords || !destCoords) {
    showError('Please select both origin and destination from the suggestions.');
    return;
  }
  if (originCoords.name === destCoords.name) {
    showError('Origin and destination cannot be the same.');
    return;
  }

  showLoading();

  try {
    const data = await fetchRoute(
      originCoords.lat, originCoords.lon,
      destCoords.lat, destCoords.lon,
      originCoords.name, destCoords.name,
    );
    hideLoading();
    renderResults(data);
  } catch (err) {
    hideLoading();
    showError(err.message || 'Failed to fetch route. Please try again.');
    console.error(err);
  }
}

document.getElementById('search-btn').addEventListener('click', handleSearch);

// ─── Setup autocomplete ────────────────────────────────────
setupAutocomplete('origin-input', 'origin-suggestions', (loc) => {
  originCoords = loc;
});
setupAutocomplete('dest-input', 'dest-suggestions', (loc) => {
  destCoords = loc;
});

// ─── Init map on load ──────────────────────────────────────
window.addEventListener('load', () => {
  initMap();
});