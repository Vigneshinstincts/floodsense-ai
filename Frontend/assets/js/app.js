// ─── State ────────────────────────────────────────────────
let originCoords = null;
let destCoords = null;

const BENGALURU_LOCATIONS = [
  // ── Major Junctions & Areas ──────────────────────────────
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
  { name: 'MG Road', lat: 12.9750, lon: 77.6070 },
  { name: 'Brigade Road', lat: 12.9710, lon: 77.6070 },
  { name: 'Commercial Street', lat: 12.9810, lon: 77.6090 },
  { name: 'Shivajinagar', lat: 12.9860, lon: 77.6010 },
  { name: 'Richmond Town', lat: 12.9630, lon: 77.5970 },
  { name: 'Basavanagudi', lat: 12.9430, lon: 77.5750 },
  { name: 'Ulsoor', lat: 12.9800, lon: 77.6210 },
  { name: 'Frazer Town', lat: 12.9860, lon: 77.6160 },
  { name: 'Benson Town', lat: 13.0000, lon: 77.6050 },
  { name: 'Vijayanagar', lat: 12.9710, lon: 77.5310 },
  { name: 'Nagarbhavi', lat: 12.9600, lon: 77.5070 },
  { name: 'Peenya', lat: 13.0280, lon: 77.5180 },
  { name: 'Mysore Road', lat: 12.9540, lon: 77.5110 },
  { name: 'Kengeri', lat: 12.9140, lon: 77.4820 },
  { name: 'Sarjapur Road', lat: 12.9090, lon: 77.6780 },
  { name: 'Bannerghatta Road', lat: 12.8933, lon: 77.5975 },
  { name: 'Kanakapura Road', lat: 12.8760, lon: 77.5620 },
  { name: 'Tumkur Road', lat: 13.0150, lon: 77.5280 },
  { name: 'Old Airport Road', lat: 12.9600, lon: 77.6490 },
  { name: 'HAL', lat: 12.9600, lon: 77.6680 },
  { name: 'Varthur', lat: 12.9380, lon: 77.7470 },
  { name: 'Kadugodi', lat: 12.9780, lon: 77.7580 },
  { name: 'Horamavu', lat: 13.0230, lon: 77.6600 },
  { name: 'Banaswadi', lat: 13.0100, lon: 77.6470 },
  { name: 'RT Nagar', lat: 13.0210, lon: 77.5950 },
  { name: 'Hennur', lat: 13.0460, lon: 77.6390 },
  { name: 'Thanisandra', lat: 13.0560, lon: 77.6320 },
  { name: 'Jakkur', lat: 13.0720, lon: 77.6110 },
  { name: 'Sahakara Nagar', lat: 13.0530, lon: 77.5850 },
  { name: 'Mathikere', lat: 13.0210, lon: 77.5560 },
  { name: 'Jalahalli', lat: 13.0390, lon: 77.5330 },
  { name: 'Nagawara', lat: 13.0380, lon: 77.6210 },
  { name: 'Kalyan Nagar', lat: 13.0270, lon: 77.6480 },
  { name: 'Kammanahalli', lat: 13.0030, lon: 77.6430 },
  { name: 'Ejipura', lat: 12.9500, lon: 77.6290 },
  { name: 'Gottigere', lat: 12.8580, lon: 77.5950 },
  { name: 'Hulimavu', lat: 12.8770, lon: 77.6070 },
  { name: 'Begur', lat: 12.8720, lon: 77.6250 },
  { name: 'Carmelaram', lat: 12.9080, lon: 77.7050 },
  { name: 'Gunjur', lat: 12.9280, lon: 77.7290 },
  { name: 'Uttarahalli', lat: 12.8980, lon: 77.5370 },
  { name: 'Rajarajeshwari Nagar', lat: 12.9130, lon: 77.5150 },
  { name: 'Dasarahalli', lat: 13.0430, lon: 77.5120 },
  { name: 'Magadi Road', lat: 12.9780, lon: 77.5420 },
  { name: 'Nayandahalli', lat: 12.9480, lon: 77.5180 },

  // ── IT Companies & MNCs ──────────────────────────────────
  { name: 'Infosys Bengaluru Campus', lat: 12.8461, lon: 77.6632 },
  { name: 'Wipro Electronic City', lat: 12.8431, lon: 77.6611 },
  { name: 'TCS Whitefield', lat: 12.9782, lon: 77.7480 },
  { name: 'Accenture Bengaluru', lat: 12.9340, lon: 77.6830 },
  { name: 'IBM India Bengaluru', lat: 12.9270, lon: 77.6870 },
  { name: 'Cognizant Bengaluru', lat: 12.9860, lon: 77.7270 },
  { name: 'HCL Technologies Bengaluru', lat: 12.8452, lon: 77.6602 },
  { name: 'Oracle India Bengaluru', lat: 12.9340, lon: 77.6830 },
  { name: 'SAP Labs India', lat: 12.9271, lon: 77.6853 },
  { name: 'Microsoft Bengaluru', lat: 12.9271, lon: 77.6853 },
  { name: 'Google India Bengaluru', lat: 12.9716, lon: 77.6413 },
  { name: 'Amazon India Bengaluru', lat: 12.9716, lon: 77.6413 },
  { name: 'Flipkart Headquarters', lat: 13.0141, lon: 77.6425 },
  { name: 'Myntra Headquarters', lat: 12.9716, lon: 77.6413 },
  { name: 'Swiggy Headquarters', lat: 12.9352, lon: 77.6245 },
  { name: 'Zomato Bengaluru Office', lat: 12.9716, lon: 77.6413 },
  { name: 'Ola Cabs Headquarters', lat: 12.9352, lon: 77.6245 },
  { name: 'Razorpay Headquarters', lat: 12.9716, lon: 77.6413 },
  { name: 'CRED Headquarters', lat: 12.9352, lon: 77.6245 },
  { name: 'Byju\'s Headquarters', lat: 12.9716, lon: 77.6413 },
  { name: 'Zepto Bengaluru Office', lat: 12.9352, lon: 77.6245 },
  { name: 'Meesho Headquarters', lat: 12.9716, lon: 77.6413 },
  { name: 'PhonePe Headquarters', lat: 12.9352, lon: 77.6245 },

  // ── Tech Parks ───────────────────────────────────────────
  { name: 'Manyata Tech Park', lat: 13.0470, lon: 77.6200 },
  { name: 'Bagmane Tech Park', lat: 12.9870, lon: 77.6460 },
  { name: 'RMZ Ecospace', lat: 12.9340, lon: 77.6830 },
  { name: 'Embassy Tech Village', lat: 12.9200, lon: 77.6900 },
  { name: 'Prestige Tech Park', lat: 12.9270, lon: 77.6870 },
  { name: 'ITPL Whitefield', lat: 12.9860, lon: 77.7270 },
  { name: 'Global Village Tech Park', lat: 12.9140, lon: 77.4980 },
  { name: 'Salarpuria Tech Park', lat: 12.9271, lon: 77.6853 },
  { name: 'Cessna Business Park', lat: 12.9271, lon: 77.6853 },
  { name: 'Brigade Softzone', lat: 12.9271, lon: 77.6853 },
  { name: 'Divyasree Tech Park', lat: 12.9271, lon: 77.6853 },
  { name: 'RGA Tech Park', lat: 12.9116, lon: 77.6389 },

  // ── Startups & Co-working Spaces ─────────────────────────
  { name: 'WeWork Residency Road', lat: 12.9690, lon: 77.5940 },
  { name: 'WeWork Galaxy', lat: 12.9716, lon: 77.6413 },
  { name: 'Cowrks Residency Road', lat: 12.9690, lon: 77.5940 },
  { name: 'IndiQube Sigma', lat: 12.9271, lon: 77.6853 },
  { name: ' 91springboard Koramangala', lat: 12.9352, lon: 77.6245 },
  { name: 'BHIVE Workspace HSR', lat: 12.9116, lon: 77.6389 },
  { name: 'Awfis Indiranagar', lat: 12.9719, lon: 77.6412 },
  { name: 'NASSCOM Bengaluru', lat: 12.9716, lon: 77.6413 },
  { name: 'STPI Bengaluru', lat: 12.9716, lon: 77.6413 },
  { name: 'T-Hub Bengaluru', lat: 12.9716, lon: 77.6413 },

  // ── Famous Food Stalls & Restaurants ─────────────────────
  { name: 'VV Puram Food Street', lat: 12.9480, lon: 77.5730 },
  { name: 'CTR Malleshwaram (Dosa)', lat: 13.0035, lon: 77.5668 },
  { name: 'Vidyarthi Bhavan Basavanagudi', lat: 12.9430, lon: 77.5750 },
  { name: 'Brahmin\'s Coffee Bar Basavanagudi', lat: 12.9430, lon: 77.5750 },
  { name: 'SLV Jayanagar (Darshini)', lat: 12.9254, lon: 77.5832 },
  { name: 'Shivaji Military Hotel Basavanagudi', lat: 12.9430, lon: 77.5750 },
  { name: 'Empire Restaurant Church Street', lat: 12.9750, lon: 77.6070 },
  { name: 'Koshy\'s Restaurant MG Road', lat: 12.9750, lon: 77.6070 },
  { name: 'MTR Restaurant Lalbagh Road', lat: 12.9550, lon: 77.5800 },
  { name: 'Nagarjuna Restaurant Residency Road', lat: 12.9690, lon: 77.5940 },
  { name: 'Truffles Koramangala', lat: 12.9352, lon: 77.6245 },
  { name: 'Toit Brewery Indiranagar', lat: 12.9719, lon: 77.6412 },
  { name: 'Meghana Foods Koramangala', lat: 12.9352, lon: 77.6245 },
  { name: 'Eat Street Whitefield', lat: 12.9698, lon: 77.7500 },
  { name: 'Food Street Commercial Street', lat: 12.9810, lon: 77.6090 },
  { name: 'Lakeview Milk Bar MG Road', lat: 12.9750, lon: 77.6070 },
  { name: 'Airlines Hotel Lavelle Road', lat: 12.9690, lon: 77.5940 },
  { name: 'Hotel Darshini BTM Layout', lat: 12.9166, lon: 77.6101 },
  { name: 'Halli Mane Restaurant', lat: 12.9430, lon: 77.5750 },
  { name: 'Adyar Ananda Bhavan Jayanagar', lat: 12.9254, lon: 77.5832 },
  { name: 'Corner House Ice Cream Indiranagar', lat: 12.9719, lon: 77.6412 },
  { name: 'Rameshwaram Cafe Indiranagar', lat: 12.9719, lon: 77.6412 },
  { name: 'Central Tiffin Room Malleshwaram', lat: 13.0035, lon: 77.5668 },
  { name: 'Hotel Janatha Gandhinagar', lat: 12.9770, lon: 77.5760 },

  // ── Famous Temples ───────────────────────────────────────
  { name: 'ISKCON Temple Rajajinagar', lat: 13.0095, lon: 77.5512 },
  { name: 'Bull Temple Basavanagudi', lat: 12.9413, lon: 77.5712 },
  { name: 'Dodda Ganapathi Temple Basavanagudi', lat: 12.9430, lon: 77.5750 },
  { name: 'Gavi Gangadhareshwara Temple', lat: 12.9380, lon: 77.5690 },
  { name: 'Ulsoor Lake Someshwara Temple', lat: 12.9800, lon: 77.6210 },
  { name: 'Halasuru Someshwara Temple', lat: 12.9800, lon: 77.6210 },
  { name: 'Banashankari Temple Jayanagar', lat: 12.9255, lon: 77.5468 },
  { name: 'Kadu Malleshwara Temple', lat: 13.0035, lon: 77.5668 },
  { name: 'Dharmaraya Swamy Temple', lat: 12.9640, lon: 77.5800 },
  { name: 'Sri Chamundeshwari Temple Vijayanagar', lat: 12.9710, lon: 77.5310 },
  { name: 'Murugan Temple Indiranagar', lat: 12.9719, lon: 77.6412 },
  { name: 'Ragigudda Anjaneya Temple', lat: 12.9254, lon: 77.5832 },
  { name: 'Chokkanathaswamy Temple Domlur', lat: 12.9610, lon: 77.6387 },
  { name: 'Venkataramana Swamy Temple Gandhinagar', lat: 12.9770, lon: 77.5760 },
  { name: 'Sri Ganesha Temple BTM Layout', lat: 12.9166, lon: 77.6101 },
  { name: 'Shirdi Sai Baba Temple Indiranagar', lat: 12.9719, lon: 77.6412 },
  { name: 'Shiva Temple Koramangala', lat: 12.9352, lon: 77.6245 },
  { name: 'Prasanna Venkataramana Temple Basavanagudi', lat: 12.9430, lon: 77.5750 },

  // ── Famous Apartments & Residential Areas ────────────────
  { name: 'Sobha City Hebbal', lat: 13.0358, lon: 77.5970 },
  { name: 'Prestige Shantiniketan Whitefield', lat: 12.9698, lon: 77.7500 },
  { name: 'Brigade Metropolis Mahadevapura', lat: 12.9908, lon: 77.6960 },
  { name: 'Purva Panorama Sarjapur Road', lat: 12.9090, lon: 77.6780 },
  { name: 'Godrej Woodsman Estate Hebbal', lat: 13.0358, lon: 77.5970 },
  { name: 'Mantri Serene Subramanyapura', lat: 12.8990, lon: 77.5200 },
  { name: 'Adarsh Palm Retreat Bellandur', lat: 12.9258, lon: 77.6649 },
  { name: 'Embassy Lake Terraces Hebbal', lat: 13.0358, lon: 77.5970 },
  { name: 'Salarpuria Sattva Greenage HSR', lat: 12.9116, lon: 77.6389 },
  { name: 'Prestige Ferns Residency Haralur', lat: 12.8960, lon: 77.6760 },
  { name: 'RMZ Galleria Yelahanka', lat: 13.1007, lon: 77.5963 },
  { name: 'Nitesh Caesars Palace Hebbal', lat: 13.0358, lon: 77.5970 },
  { name: 'Tata Carnatica Devanahalli', lat: 13.2484, lon: 77.7127 },
  { name: 'Brigade El Dorado Aerospace Park', lat: 13.2100, lon: 77.7000 },
  { name: 'Sobha Dream Acres Panathur', lat: 12.9380, lon: 77.7000 },
  { name: 'Mahindra Windchimes Bannerghatta', lat: 12.8933, lon: 77.5975 },
  { name: 'Assetz 63 Degree East Sarjapur', lat: 12.8590, lon: 77.7140 },
  { name: 'Provident Sunworth Mysore Road', lat: 12.9540, lon: 77.5110 },
  { name: 'Century Ethos Thanisandra', lat: 13.0560, lon: 77.6320 },
  { name: 'Shriram Samruddhi Whitefield', lat: 12.9698, lon: 77.7500 },

  // ── Hospitals ────────────────────────────────────────────
  { name: 'Manipal Hospital', lat: 12.9590, lon: 77.6470 },
  { name: 'Fortis Hospital Bannerghatta', lat: 12.8910, lon: 77.5980 },
  { name: 'Columbia Asia Hospital Hebbal', lat: 13.0430, lon: 77.5910 },
  { name: 'Victoria Hospital', lat: 12.9650, lon: 77.5780 },
  { name: 'Bowring Hospital', lat: 12.9790, lon: 77.6110 },
  { name: 'St John\'s Hospital', lat: 12.9500, lon: 77.6200 },
  { name: 'Narayana Health City', lat: 12.8452, lon: 77.6602 },
  { name: 'Sakra World Hospital Marathahalli', lat: 12.9569, lon: 77.7011 },
  { name: 'BGS Gleneagles Hospital Kengeri', lat: 12.9140, lon: 77.4820 },

  // ── Colleges & Universities ──────────────────────────────
  { name: 'IISc Bangalore', lat: 13.0213, lon: 77.5679 },
  { name: 'BMS College of Engineering', lat: 12.9597, lon: 77.5683 },
  { name: 'RV College of Engineering', lat: 12.9232, lon: 77.4988 },
  { name: 'PES University', lat: 12.9347, lon: 77.5355 },
  { name: 'Christ University', lat: 12.9347, lon: 77.6076 },
  { name: 'Bangalore University', lat: 12.9560, lon: 77.5070 },
  { name: 'NIMHANS', lat: 12.9430, lon: 77.5960 },
  { name: 'MS Ramaiah Institute of Technology', lat: 13.0213, lon: 77.5679 },
  { name: 'Dayananda Sagar College', lat: 12.9232, lon: 77.4988 },

  // ── Railway & Transport Hubs ─────────────────────────────
  { name: 'Kempegowda International Airport', lat: 13.1979, lon: 77.7063 },
  { name: 'Bangalore City Railway Station', lat: 12.9767, lon: 77.5713 },
  { name: 'Yeshwanthpur Railway Station', lat: 13.0275, lon: 77.5497 },
  { name: 'Cantonment Railway Station', lat: 12.9980, lon: 77.6010 },
  { name: 'KSR Bengaluru Bus Station', lat: 12.9767, lon: 77.5713 },
  { name: 'Shivajinagar Bus Station', lat: 12.9860, lon: 77.6010 },
  { name: 'Satellite Bus Station Mysore Road', lat: 12.9540, lon: 77.5110 },

  // ── Metro Stations ───────────────────────────────────────
  { name: 'Metro MG Road', lat: 12.9750, lon: 77.6070 },
  { name: 'Metro Indiranagar', lat: 12.9780, lon: 77.6410 },
  { name: 'Metro Baiyappanahalli', lat: 12.9990, lon: 77.6690 },
  { name: 'Metro Majestic', lat: 12.9767, lon: 77.5713 },
  { name: 'Metro Yeshwanthpur', lat: 13.0275, lon: 77.5497 },
  { name: 'Metro Banashankari', lat: 12.9255, lon: 77.5468 },
  { name: 'Metro Electronic City', lat: 12.8452, lon: 77.6602 },
  { name: 'Metro Whitefield', lat: 12.9698, lon: 77.7500 },
  { name: 'Metro Nagasandra', lat: 13.0480, lon: 77.5180 },
  { name: 'Metro Silk Board', lat: 12.9172, lon: 77.6228 },

  // ── Shopping Malls ───────────────────────────────────────
  { name: 'Phoenix Marketcity Whitefield', lat: 12.9698, lon: 77.7500 },
  { name: 'Orion Mall Rajajinagar', lat: 13.0000, lon: 77.5550 },
  { name: 'Forum Mall Koramangala', lat: 12.9352, lon: 77.6245 },
  { name: 'Garuda Mall MG Road', lat: 12.9750, lon: 77.6070 },
  { name: 'Mantri Square Malleshwaram', lat: 13.0035, lon: 77.5668 },
  { name: 'UB City Vittal Mallya Road', lat: 12.9716, lon: 77.5946 },
  { name: 'Lulu Mall Bengaluru', lat: 12.9908, lon: 77.6960 },

  // ── Parks & Lakes ────────────────────────────────────────
  { name: 'Lalbagh Botanical Garden', lat: 12.9507, lon: 77.5848 },
  { name: 'Cubbon Park', lat: 12.9763, lon: 77.5929 },
  { name: 'Ulsoor Lake', lat: 12.9800, lon: 77.6210 },
  { name: 'Hebbal Lake', lat: 13.0500, lon: 77.5920 },
  { name: 'Sankey Tank', lat: 13.0060, lon: 77.5750 },
  { name: 'Bannerghatta National Park', lat: 12.8000, lon: 77.5760 },
];

// ─── Autocomplete ──────────────────────────────────────────
function setupAutocomplete(inputId, suggestionsId, onSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(suggestionsId);

  input.addEventListener('input', async () => {
    const query = input.value.trim().toLowerCase();
    dropdown.innerHTML = '';

    if (query.length < 2) {
      dropdown.classList.remove('open');
      return;
    }

    const matches = BENGALURU_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length > 0) {
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
    } else {
      // Fallback to Nominatim for any location not in our list
      try {
        const results = await geocodeLocation(query);
        if (results.length === 0) {
          dropdown.classList.remove('open');
          return;
        }
        results.slice(0, 5).forEach(result => {
          const displayName = result.display_name.split(',')[0];
          const item = document.createElement('div');
          item.className = 'suggestion-item';
          item.innerHTML = `<span>🔍</span><span>${displayName}</span>`;
          item.addEventListener('click', () => {
            input.value = displayName;
            dropdown.classList.remove('open');
            onSelect({
              name: displayName,
              lat: parseFloat(result.lat),
              lon: parseFloat(result.lon),
            });
          });
          dropdown.appendChild(item);
        });
        dropdown.classList.add('open');
      } catch {
        dropdown.classList.remove('open');
      }
    }
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