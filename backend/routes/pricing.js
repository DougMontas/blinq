// // routes/pricing.js
// import express from "express";
// const router = express.Router();

// // ──────────────────────────────────────────────────────────────────────────────
// // Smart Estimate v2 (Non‑breaking add‑on)
// // Requires: Node 18+ for global fetch. Optional env: BEA_API_KEY (for RPP).
// // ──────────────────────────────────────────────────────────────────────────────

// // ===== Config: anchors, NAICS per service, clamps, and weights =====
// const SPV2_SERVICE_ANCHORS = {
//   "Burst or Leaking Pipes": 350,
//   "Roof Leaks or Storm Damage": 750,
//   "HVAC System Failure": 650,
//   "Sewer Backups or Clogged Drains": 300,
//   "Select Electrical Issues Below": 250,
//   "Water Heater Failure": 800,
//   "Mold or Water Damage Remediation": 2500,
//   "Broken Windows or Doors": 400,
//   "Gas Leaks": 500,
//   "Appliance Failures": 275,
//   "Drywall Repair": 200,
// };

// // NAICS2017 codes by service for County Business Patterns competition proxy
// // (Falls back to plumbing/HVAC 238220 if a code returns suppressed data.)
// const SPV2_NAICS_BY_SERVICE = {
//   "Burst or Leaking Pipes": "238220",                  // Plumbing/HVAC Contractors
//   "Sewer Backups or Clogged Drains": "238220",         // Plumbing/HVAC Contractors
//   "Water Heater Failure": "238220",                    // Plumbing/HVAC Contractors
//   "HVAC System Failure": "238220",                     // Plumbing/HVAC Contractors
//   "Gas Leaks": "238220",

//   "Roof Leaks or Storm Damage": "238160",              // Roofing Contractors
//   "Select Electrical Issues Below": "238210",          // Electrical Contractors
//   "Drywall Repair": "238310",                          // Drywall & Insulation Contractors
//   "Broken Windows or Doors": "238350",                 // Finish Carpentry (doors) (alt: 238150 glass)
//   "Appliance Failures": "811412",                      // Appliance Repair & Maintenance
//   "Mold or Water Damage Remediation": "562910",        // Remediation Services
// };

// const SPV2_CFG = {
//   // Location factor
//   location: {
//     rppAlpha: 0.85,       // stronger if RPP available
//     acsAlpha: 0.60,       // gentler when using income as proxy
//     clamp: [0.80, 1.30],  // ±20–30% max swing
//   },
//   // Competition factor
//   competition: {
//     beta: 0.15,           // more firms per 10k HH → price down
//     clamp: [0.85, 1.15],  // ±15% cap
//   },
//   // Severity baseline multipliers
//   severityMult: { minor: 1.00, moderate: 1.25, severe: 1.60 },
//   // Flat add‑ons
//   addOnFees: {
//     urgent: 30,
//     chemicalAttempt: 20,
//     noShutoffAccess: 15,
//     roofSteep: 35,
//     securityEmergency: 75,
//     paintMatch: 125,
//   },
//   // Clamp rails per service (prevents wild numbers)
//   rails: {
//     default: [95, 4995],
//     "Drywall Repair": [95, 995],
//     "Appliance Failures": [95, 895],
//     "Burst or Leaking Pipes": [150, 1495],
//     "Sewer Backups or Clogged Drains": [150, 1495],
//     "Roof Leaks or Storm Damage": [250, 2995],
//     "Water Heater Failure": [250, 2495],
//     "HVAC System Failure": [200, 1995],
//     "Select Electrical Issues Below": [150, 1495],
//     "Broken Windows or Doors": [125, 1495],
//     "Gas Leaks": [200, 1995],
//     "Mold or Water Damage Remediation": [750, 4995],
//   },
//   roundTo: 5,
//   cacheTTLms: 10 * 60 * 1000, // micro‑cache public API responses (10m)
// };

// // ===== Tiny cache & helpers =====
// const _spv2_cache = new Map();
// const _spv2_get = (k) => {
//   const v = _spv2_cache.get(k);
//   if (!v) return null;
//   if (Date.now() - v.t > SPV2_CFG.cacheTTLms) { _spv2_cache.delete(k); return null; }
//   return v.v;
// };
// const _spv2_set = (k, v) => _spv2_cache.set(k, { v, t: Date.now() });

// const _spv2_clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
// const _spv2_roundTo = (x, step) => Math.round(x / step) * step;
// const _spv2_bumpSeverity = (cur, to) => {
//   const order = ['minor','moderate','severe'];
//   return order[Math.max(order.indexOf(cur), order.indexOf(to))];
// };

// async function _spv2_fetchJson(url, label='req') {
//   const ctrl = new AbortController();
//   const to = setTimeout(() => ctrl.abort(), 8000);
//   try {
//     const res = await fetch(url, { signal: ctrl.signal });
//     if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
//     return await res.json();
//   } finally { clearTimeout(to); }
// }

// // ===== Free public datasets =====

// // (1) Geocode to State/County FIPS
// async function _spv2_geocodeToFips(addressLine) {
//   const key = `geocode:${addressLine}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const base = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
//   const url = `${base}?address=${encodeURIComponent(addressLine)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
//   const json = await _spv2_fetchJson(url, 'census-geocoder');
//   const match = json?.result?.addressMatches?.[0];
//   const county = match?.geographies?.Counties?.[0];
//   if (!match || !county?.STATE || !county?.COUNTY) throw new Error('Address not found or FIPS missing');
//   const out = {
//     normalizedAddress: match.matchedAddress,
//     stateFIPS: county.STATE,
//     countyFIPS: county.COUNTY,
//     lat: match.coordinates?.y,
//     lon: match.coordinates?.x,
//   };
//   _spv2_set(key, out);
//   return out;
// }

// // (2) ACS 5‑year (2023) – county & U.S. Median HH Income + households
// async function _spv2_getACS(stateFIPS, countyFIPS) {
//   const key = `acs:${stateFIPS}:${countyFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const vars = 'B19013_001E,B11001_001E';
//   const countyURL = `https://api.census.gov/data/2023/acs/acs5?get=NAME,${vars}&for=county:${countyFIPS}&in=state:${stateFIPS}`;
//   const usURL     = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=us:*`;
//   const [cArr, uArr] = await Promise.all([
//     _spv2_fetchJson(countyURL, 'acs-county'),
//     _spv2_fetchJson(usURL, 'acs-us'),
//   ]);
//   const c = cArr?.[1]; const u = uArr?.[1];
//   const out = {
//     county: { name: c?.[0], medianIncome: Number(c?.[1]), households: Number(c?.[2]) },
//     us:     { medianIncome: Number(u?.[0]), households: Number(u?.[1]) },
//   };
//   if (!out.county.medianIncome || !out.us.medianIncome) throw new Error('ACS income unavailable');
//   _spv2_set(key, out);
//   return out;
// }

// // (3) County Business Patterns – establishments by NAICS (with fallback)
// async function _spv2_getCBPByNAICS(stateFIPS, countyFIPS, naics) {
//   const key = `cbp:${stateFIPS}:${countyFIPS}:${naics}`;
//   const hit = _spv2_get(key); if (hit) return hit;

//   const countyURL = `https://api.census.gov/data/2023/cbp?get=ESTAB,NAME&for=county:${countyFIPS}&in=state:${stateFIPS}&NAICS2017=${naics}`;
//   const usURL     = `https://api.census.gov/data/2023/cbp?get=ESTAB&for=us:*&NAICS2017=${naics}`;

//   const [cArr, uArr] = await Promise.all([
//     _spv2_fetchJson(countyURL, 'cbp-county'),
//     _spv2_fetchJson(usURL, 'cbp-us'),
//   ]);

//   // API can return "D" for suppressed data in some counties
//   const countyEst = Number(cArr?.[1]?.[0]);
//   const usEst = Number(uArr?.[1]?.[0]);
//   const out = {
//     ok: Number.isFinite(countyEst) && Number.isFinite(usEst),
//     county: { name: cArr?.[1]?.[1], establishments: countyEst },
//     us:     { establishments: usEst },
//     naics
//   };
//   _spv2_set(key, out);
//   return out;
// }

// async function _spv2_getCBPPreferTargeted(stateFIPS, countyFIPS, service) {
//   const targeted = SPV2_NAICS_BY_SERVICE[service] || "238220";
//   const primary = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, targeted);
//   if (primary.ok) return primary;
//   // Fallback to plumbing/HVAC as a broad home‑services density proxy
//   const fallback = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, "238220");
//   return { ...fallback, naics: fallback.naics };
// }

// // (4) Optional BEA RPP – state “All items”
// async function _spv2_getRPP(stateFIPS) {
//   const key = `rpp:${stateFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const user = process.env.BEA_API_KEY;
//   if (!user) return null;
//   const url = `https://apps.bea.gov/api/data/?UserID=${encodeURIComponent(user)}&method=GetData&datasetname=RegionalIncome&TableName=RPP1&LineCode=1&GeoFips=${stateFIPS}&Year=LAST&ResultFormat=json`;
//   try {
//     const json = await _spv2_fetchJson(url, 'bea-rpp');
//     const v = Number(json?.BEAAPI?.Results?.Data?.[0]?.DataValue);
//     if (!v) return null;
//     const out = { rppIndex: v, multiplier: v/100 };
//     _spv2_set(key, out);
//     return out;
//   } catch {
//     return null;
//   }
// }

// // ===== Multipliers =====
// function _spv2_locationMultiplier({ rppMult, countyIncome, usIncome }) {
//   if (rppMult) {
//     const m = Math.pow(rppMult, SPV2_CFG.location.rppAlpha);
//     return _spv2_clamp(m, SPV2_CFG.location.clamp);
//   }
//   const ratio = countyIncome / usIncome;
//   const m = Math.pow(ratio, SPV2_CFG.location.acsAlpha);
//   return _spv2_clamp(m, SPV2_CFG.location.clamp);
// }

// function _spv2_competitionMultiplier({ countyEstab, usEstab, countyHH, usHH }) {
//   const countyPer10k = (countyEstab / Math.max(1, countyHH)) * 10000;
//   const usPer10k     = (usEstab / Math.max(1, usHH)) * 10000;
//   const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
//   const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
//   return _spv2_clamp(m, SPV2_CFG.competition.clamp);
// }

// // ===== Questionnaire → severity/multipliers/add‑ons =====
// function _spv2_computeQuestionnaire(service, details = {}) {
//   const norm = (x='') => String(x).toLowerCase();
//   const entries = Object.entries(details).map(([q,a]) => [norm(q), norm(a)]);

//   const seen = (pred) => entries.some(([q,a]) => pred(q,a));
//   let severity = 'moderate';
//   let mult = 1.0;
//   let addOns = 0;
//   const mul = (x) => { mult *= x; };
//   const add = (x) => { addOns += x; };

//   switch (service) {
//     case "Burst or Leaking Pipes": {
//       if (seen((q,a) => q.includes('exposed') && (a.includes('behind') || a.includes('ceiling') || a.includes('floor') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('how long') && (a.includes('6+') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('still') && a.includes('yes'))) add(SPV2_CFG.addOnFees.urgent);
//       if (seen((q,a) => q.includes('damage') && (a.includes('water-stained') || a.includes('sagging') || a.includes('minor stain')))) mul(1.12);
//       if (seen((q,a) => a.includes('unknown'))) mul(1.06);
//       break;
//     }
//     case "Sewer Backups or Clogged Drains": {
//       if (seen((q,a) => q.includes('area') && (a.includes('entire') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('overflow') && (a.includes('sewage') || a.includes('toilet') || a.includes('sink')))) mul(1.15);
//       if (seen((q,a) => q.includes('cleanout') && (a.includes('no') || a.includes('maybe') || a.includes('not sure')))) mul(1.10);
//       if (seen((q,a) => q.includes('used') && (a.includes('liquid') || a.includes('snaked')))) add(SPV2_CFG.addOnFees.chemicalAttempt);
//       break;
//     }
//     case "Roof Leaks or Storm Damage": {
//       if (seen((q,a) => q.includes('where') && (a.includes('ceiling drip') || a.includes('skylight') || a.includes('multiple') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('type of roof') && (a.includes('tile') || a.includes('metal') || a.includes('flat')))) mul(1.10);
//       if (seen((q,a) => q.includes('steep') && (a.includes('steep') || a.includes('moderate')))) add(SPV2_CFG.addOnFees.roofSteep);
//       if (seen((q,a) => q.includes('isolated') && (a.includes('multiple') || a.includes('whole')))) mul(1.15);
//       if (seen((q,a) => q.includes('interior damage') && (a.includes('sagging') || a.includes('furniture') || a.includes('stain')))) mul(1.10);
//       break;
//     }
//     case "HVAC System Failure": {
//       if (seen((q,a) => q.includes('issue') && (a.includes('no power') || a.includes('breaker') || a.includes('water leak')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('type of system') && (a.includes('rooftop') || a.includes('mini-split')))) mul(1.10);
//       if (seen((q,a) => q.includes('which unit') && a.includes('both'))) mul(1.12);
//       if (seen((q,a) => q.includes('water or mold') && (a.includes('stained') || a.includes('mold')))) mul(1.12);
//       break;
//     }
//     case "Select Electrical Issues Below": {
//       if (seen((q,a) => a.includes('no power at all') || a.includes('sparks') || a.includes('smoke') || a.includes('burning'))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => a.includes('flicker'))) mul(1.06);
//       break;
//     }
//     case "Water Heater Failure": {
//       if (seen((q,a) => q.includes('what issue') && (a.includes('leak') || a.includes('not sure')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('type') && (a.includes('gas') || a.includes('tankless')))) mul(1.10);
//       if (seen((q,a) => q.includes('size') && (a.includes('50') || a.includes('75')))) mul(1.06);
//       if (seen((q,a) => q.includes('age') && a.includes('10'))) mul(1.08);
//       if (seen((q,a) => q.includes('visible water') && (a.includes('pooled') || a.includes('mold')))) mul(1.10);
//       break;
//     }
//     case "Mold or Water Damage Remediation": {
//       if (seen((q,a) => q.includes('area') && (a.includes('multiple') || a.includes('not sure')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('visible mold') && a.includes('yes'))) mul(1.15);
//       if (seen((q,a) => q.includes('cause') && a.includes('flood'))) mul(1.20);
//       if (seen((q,a) => q.includes('when') && (a.includes('3+') || a.includes('unknown')))) mul(1.12);
//       break;
//     }
//     case "Broken Windows or Doors": {
//       if (seen((q,a) => q.includes('what is broken') && (a.includes('full door') || a.includes('sliding') || a.includes('frame')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('is this a security emergency') && (a.includes('open') || a.includes('unsafe')))) add(SPV2_CFG.addOnFees.securityEmergency);
//       if (seen((q,a) => q.includes('location') && (a.includes('2nd') || a.includes('balcony')))) mul(1.08);
//       break;
//     }
//     case "Gas Leaks": {
//       if (seen((q,a) => q.includes('smell') && (a.includes('strong') || a.includes('rotten')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('shut off') && (a.includes('no') || a.includes('not sure')))) add(SPV2_CFG.addOnFees.noShutoffAccess);
//       break;
//     }
//     case "Appliance Failures": {
//       if (seen((q,a) => q.includes('appliance type') && (a.includes('fridge') || a.includes('ac')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('issue') && (a.includes('leak') || a.includes('spark') || a.includes('burn')))) mul(1.10);
//       if (seen((q,a) => q.includes('age') && (a.includes('10+') || a.includes('unknown')))) mul(1.06);
//       if (seen((q,a) => q.includes('warranty') && a.includes('yes'))) mul(0.95);
//       break;
//     }
//     case "Drywall Repair": {
//       if (seen((q,a) => q.includes('what size') && (a.includes('multiple') || a.includes('greater')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('what caused') && a.includes('water'))) mul(1.15);
//       if (seen((q,a) => q.includes('ceiling') && a.includes('yes'))) mul(1.10);
//       if (seen((q,a) => q.includes('paint') && a.includes('yes'))) add(SPV2_CFG.addOnFees.paintMatch);
//       if (seen((q,a) => q.includes('obstructed') && a.includes('yes'))) mul(1.08);
//       break;
//     }
//     default: {
//       if (seen((q,a) => a.includes('unknown') || a.includes('not sure'))) mul(1.05);
//     }
//   }

//   const sevFactor = SPV2_CFG.severityMult[severity] || 1.25;
//   mult *= sevFactor;

//   return { severity, multiplier: Number(mult.toFixed(3)), addOns };
// }

// // ===== Final & rails =====
// function _spv2_finalize(service, x) {
//   const rails = SPV2_CFG.rails[service] || SPV2_CFG.rails.default;
//   const clamped = _spv2_clamp(x, rails);
//   return _spv2_roundTo(clamped, SPV2_CFG.roundTo);
// }

// // ===== Unified handler, exposed on two paths =====
// const estimateHandler = async (req, res) => {
//   try {
//     const { service, address, city, zipcode, details = {} } = req.body || {};
//     if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
//       return res.status(400).json({ ok: false, error: 'Unknown or missing service' });
//     }
//     const addr = (address || '').trim();
//     const addrLine = `${addr}${city ? ', ' + city : ''}${zipcode ? ' ' + zipcode : ''}`.trim();
//     if (!addrLine) return res.status(400).json({ ok: false, error: 'Address (or address+city+zipcode) required' });

//     // 1) Geocode → FIPS
//     const geo = await _spv2_geocodeToFips(addrLine);

//     // 2) Datasets
//     const [acs, cbp, rpp] = await Promise.all([
//       _spv2_getACS(geo.stateFIPS, geo.countyFIPS),
//       _spv2_getCBPPreferTargeted(geo.stateFIPS, geo.countyFIPS, service),
//       _spv2_getRPP(geo.stateFIPS),
//     ]);

//     // 3) Multipliers
//     const locM = _spv2_locationMultiplier({
//       rppMult: rpp?.multiplier,
//       countyIncome: acs.county.medianIncome,
//       usIncome: acs.us.medianIncome,
//     });
//     const compM = _spv2_competitionMultiplier({
//       countyEstab: cbp.county.establishments,
//       usEstab: cbp.us.establishments,
//       countyHH: acs.county.households,
//       usHH: acs.us.households,
//     });
//     const q = _spv2_computeQuestionnaire(service, details);

//     // 4) Anchor → price
//     const base = SPV2_SERVICE_ANCHORS[service];
//     const raw = (base * locM * compM * q.multiplier) + q.addOns;
//     const priceUSD = _spv2_finalize(service, raw);

//     res.json({
//       ok: true,
//       service,
//       priceUSD,
//       address: geo.normalizedAddress,
//       lat: geo.lat, lon: geo.lon,
//       breakdown: {
//         anchorBase: base,
//         locationMultiplier: Number(locM.toFixed(3)),
//         competitionMultiplier: Number(compM.toFixed(3)),
//         questionnaire: { severity: q.severity, multiplier: q.multiplier, addOns: q.addOns },
//         rails: SPV2_CFG.rails[service] || SPV2_CFG.rails.default,
//         roundTo: SPV2_CFG.roundTo,
//         datasets: {
//           acs: {
//             county: acs.county.name,
//             countyMedianHHIncome: acs.county.medianIncome,
//             usMedianHHIncome: acs.us.medianIncome,
//             countyHouseholds: acs.county.households,
//             usHouseholds: acs.us.households
//           },
//           cbp: {
//             naicsUsed: cbp.naics,
//             countyEstablishments: cbp.county.establishments,
//             usEstablishments: cbp.us.establishments
//           },
//           rpp: rpp ? { stateRppIndexAllItems: rpp.rppIndex, multiplier: rpp.multiplier } : null
//         }
//       }
//     });
//   } catch (err) {
//     console.error('[SmartPriceV2]', err);
//     res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };

// // Expose on both paths to be compatible with either mount scheme
// router.post('/v2/estimate', estimateHandler); // e.g., /api/price/v2/estimate
// router.post('/estimate', estimateHandler);    // e.g., /api/routes/pricing/v2/estimate

// // ESM default export so `import pricingV2Router from "./routes/pricing.js"` works
// export default router;

// // backend/routes/pricing.js //latest working with  Beta
// import express from "express";
// const router = express.Router();

// console.log("[pricing] module loaded"); // 👈 will print at boot when import succeeds

// // ──────────────────────────────────────────────────────────────────────────────
// // Smart Estimate v2 (Non‑breaking add‑on)
// // Requires: Node 18+ for global fetch. Optional env: BEA_API_KEY (for RPP).
// // ──────────────────────────────────────────────────────────────────────────────

// const SPV2_SERVICE_ANCHORS = {
//   "Burst or Leaking Pipes": 350,
//   "Roof Leaks or Storm Damage": 750,
//   "HVAC System Failure": 650,
//   "Sewer Backups or Clogged Drains": 300,
//   "Select Electrical Issues Below": 250,
//   "Water Heater Failure": 800,
//   "Mold or Water Damage Remediation": 2500,
//   "Broken Windows or Doors": 400,
//   "Gas Leaks": 500,
//   "Appliance Failures": 275,
//   "Drywall Repair": 200,
// };

// const SPV2_NAICS_BY_SERVICE = {
//   "Burst or Leaking Pipes": "238220",
//   "Sewer Backups or Clogged Drains": "238220",
//   "Water Heater Failure": "238220",
//   "HVAC System Failure": "238220",
//   "Gas Leaks": "238220",
//   "Roof Leaks or Storm Damage": "238160",
//   "Select Electrical Issues Below": "238210",
//   "Drywall Repair": "238310",
//   "Broken Windows or Doors": "238350",
//   "Appliance Failures": "811412",
//   "Mold or Water Damage Remediation": "562910",
// };

// const SPV2_CFG = {
//   location: { rppAlpha: 0.85, acsAlpha: 0.60, clamp: [0.80, 1.30] },
//   competition: { beta: 0.15, clamp: [0.85, 1.15] },
//   severityMult: { minor: 1.00, moderate: 1.25, severe: 1.60 },
//   addOnFees: {
//     urgent: 30,
//     chemicalAttempt: 20,
//     noShutoffAccess: 15,
//     roofSteep: 35,
//     securityEmergency: 75,
//     paintMatch: 125,
//   },
//   rails: {
//     default: [95, 4995],
//     "Drywall Repair": [95, 995],
//     "Appliance Failures": [95, 895],
//     "Burst or Leaking Pipes": [150, 1495],
//     "Sewer Backups or Clogged Drains": [150, 1495],
//     "Roof Leaks or Storm Damage": [250, 2995],
//     "Water Heater Failure": [250, 2495],
//     "HVAC System Failure": [200, 1995],
//     "Select Electrical Issues Below": [150, 1495],
//     "Broken Windows or Doors": [125, 1495],
//     "Gas Leaks": [200, 1995],
//     "Mold or Water Damage Remediation": [750, 4995],
//   },
//   roundTo: 5,
//   cacheTTLms: 10 * 60 * 1000,
// };

// const _spv2_cache = new Map();
// const _spv2_get = (k) => {
//   const v = _spv2_cache.get(k);
//   if (!v) return null;
//   if (Date.now() - v.t > SPV2_CFG.cacheTTLms) { _spv2_cache.delete(k); return null; }
//   return v.v;
// };
// const _spv2_set = (k, v) => _spv2_cache.set(k, { v, t: Date.now() });

// const _spv2_clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
// const _spv2_roundTo = (x, step) => Math.round(x / step) * step;
// const _spv2_bumpSeverity = (cur, to) => {
//   const order = ["minor","moderate","severe"];
//   return order[Math.max(order.indexOf(cur), order.indexOf(to))];
// };

// async function _spv2_fetchJson(url, label="req") {
//   const ctrl = new AbortController();
//   const to = setTimeout(() => ctrl.abort(), 8000);
//   try {
//     const res = await fetch(url, { signal: ctrl.signal });
//     if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
//     return await res.json();
//   } finally { clearTimeout(to); }
// }

// // (1) Geocode → FIPS
// async function _spv2_geocodeToFips(addressLine) {
//   const key = `geocode:${addressLine}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const base = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";
//   const url = `${base}?address=${encodeURIComponent(addressLine)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
//   const json = await _spv2_fetchJson(url, "census-geocoder");
//   const match = json?.result?.addressMatches?.[0];
//   const county = match?.geographies?.Counties?.[0];
//   if (!match || !county?.STATE || !county?.COUNTY) throw new Error("Address not found or FIPS missing");
//   const out = {
//     normalizedAddress: match.matchedAddress,
//     stateFIPS: county.STATE,
//     countyFIPS: county.COUNTY,
//     lat: match.coordinates?.y,
//     lon: match.coordinates?.x,
//   };
//   _spv2_set(key, out);
//   return out;
// }

// // (2) ACS
// async function _spv2_getACS(stateFIPS, countyFIPS) {
//   const key = `acs:${stateFIPS}:${countyFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const vars = "B19013_001E,B11001_001E";
//   const countyURL = `https://api.census.gov/data/2023/acs/acs5?get=NAME,${vars}&for=county:${countyFIPS}&in=state:${stateFIPS}`;
//   const usURL     = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=us:*`;
//   const [cArr, uArr] = await Promise.all([
//     _spv2_fetchJson(countyURL, "acs-county"),
//     _spv2_fetchJson(usURL, "acs-us"),
//   ]);
//   const c = cArr?.[1]; const u = uArr?.[1];
//   const out = {
//     county: { name: c?.[0], medianIncome: Number(c?.[1]), households: Number(c?.[2]) },
//     us:     { medianIncome: Number(u?.[0]), households: Number(u?.[1]) },
//   };
//   if (!out.county.medianIncome || !out.us.medianIncome) throw new Error("ACS income unavailable");
//   _spv2_set(key, out);
//   return out;
// }

// // (3) CBP
// async function _spv2_getCBPByNAICS(stateFIPS, countyFIPS, naics) {
//   const key = `cbp:${stateFIPS}:${countyFIPS}:${naics}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const countyURL = `https://api.census.gov/data/2023/cbp?get=ESTAB,NAME&for=county:${countyFIPS}&in=state:${stateFIPS}&NAICS2017=${naics}`;
//   const usURL     = `https://api.census.gov/data/2023/cbp?get=ESTAB&for=us:*&NAICS2017=${naics}`;
//   const [cArr, uArr] = await Promise.all([
//     _spv2_fetchJson(countyURL, "cbp-county"),
//     _spv2_fetchJson(usURL, "cbp-us"),
//   ]);
//   const countyEst = Number(cArr?.[1]?.[0]);
//   const usEst = Number(uArr?.[1]?.[0]);
//   const out = {
//     ok: Number.isFinite(countyEst) && Number.isFinite(usEst),
//     county: { name: cArr?.[1]?.[1], establishments: countyEst },
//     us:     { establishments: usEst },
//     naics
//   };
//   _spv2_set(key, out);
//   return out;
// }
// async function _spv2_getCBPPreferTargeted(stateFIPS, countyFIPS, service) {
//   const targeted = SPV2_NAICS_BY_SERVICE[service] || "238220";
//   const primary = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, targeted);
//   if (primary.ok) return primary;
//   const fallback = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, "238220");
//   return { ...fallback, naics: fallback.naics };
// }

// // (4) RPP (optional)
// async function _spv2_getRPP(stateFIPS) {
//   const key = `rpp:${stateFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const user = process.env.BEA_API_KEY;
//   if (!user) return null;
//   const url = `https://apps.bea.gov/api/data/?UserID=${encodeURIComponent(user)}&method=GetData&datasetname=RegionalIncome&TableName=RPP1&LineCode=1&GeoFips=${stateFIPS}&Year=LAST&ResultFormat=json`;
//   try {
//     const json = await _spv2_fetchJson(url, "bea-rpp");
//     const v = Number(json?.BEAAPI?.Results?.Data?.[0]?.DataValue);
//     if (!v) return null;
//     const out = { rppIndex: v, multiplier: v/100 };
//     _spv2_set(key, out);
//     return out;
//   } catch {
//     return null;
//   }
// }

// // Multipliers
// function _spv2_locationMultiplier({ rppMult, countyIncome, usIncome }) {
//   if (rppMult) {
//     const m = Math.pow(rppMult, SPV2_CFG.location.rppAlpha);
//     return _spv2_clamp(m, SPV2_CFG.location.clamp);
//   }
//   const ratio = countyIncome / usIncome;
//   const m = Math.pow(ratio, SPV2_CFG.location.acsAlpha);
//   return _spv2_clamp(m, SPV2_CFG.location.clamp);
// }
// function _spv2_competitionMultiplier({ countyEstab, usEstab, countyHH, usHH }) {
//   const countyPer10k = (countyEstab / Math.max(1, countyHH)) * 10000;
//   const usPer10k     = (usEstab / Math.max(1, usHH)) * 10000;
//   const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
//   const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
//   return _spv2_clamp(m, SPV2_CFG.competition.clamp);
// }

// // Questionnaire → severity/add‑ons/mult
// function _spv2_computeQuestionnaire(service, details = {}) {
//   const norm = (x='') => String(x).toLowerCase();
//   const entries = Object.entries(details).map(([q,a]) => [norm(q), norm(a)]);
//   const seen = (pred) => entries.some(([q,a]) => pred(q,a));
//   let severity = "moderate";
//   let mult = 1.0;
//   let addOns = 0;
//   const mul = (x) => { mult *= x; };
//   const add = (x) => { addOns += x; };

//   switch (service) {
//     case "Burst or Leaking Pipes": {
//       if (seen((q,a) => q.includes("exposed") && (a.includes("behind") || a.includes("ceiling") || a.includes("floor") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("how long") && (a.includes("6+") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("still") && a.includes("yes"))) add(SPV2_CFG.addOnFees.urgent);
//       if (seen((q,a) => q.includes("damage") && (a.includes("water-stained") || a.includes("sagging") || a.includes("minor stain")))) mul(1.12);
//       if (seen((q,a) => a.includes("unknown"))) mul(1.06);
//       break;
//     }
//     case "Sewer Backups or Clogged Drains": {
//       if (seen((q,a) => q.includes("area") && (a.includes("entire") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("overflow") && (a.includes("sewage") || a.includes("toilet") || a.includes("sink")))) mul(1.15);
//       if (seen((q,a) => q.includes("cleanout") && (a.includes("no") || a.includes("maybe") || a.includes("not sure")))) mul(1.10);
//       if (seen((q,a) => q.includes("used") && (a.includes("liquid") || a.includes("snaked")))) add(SPV2_CFG.addOnFees.chemicalAttempt);
//       break;
//     }
//     case "Roof Leaks or Storm Damage": {
//       if (seen((q,a) => q.includes("where") && (a.includes("ceiling drip") || a.includes("skylight") || a.includes("multiple") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("type of roof") && (a.includes("tile") || a.includes("metal") || a.includes("flat")))) mul(1.10);
//       if (seen((q,a) => q.includes("steep") && (a.includes("steep") || a.includes("moderate")))) add(SPV2_CFG.addOnFees.roofSteep);
//       if (seen((q,a) => q.includes("isolated") && (a.includes("multiple") || a.includes("whole")))) mul(1.15);
//       if (seen((q,a) => q.includes("interior damage") && (a.includes("sagging") || a.includes("furniture") || a.includes("stain")))) mul(1.10);
//       break;
//     }
//     case "HVAC System Failure": {
//       if (seen((q,a) => q.includes("issue") && (a.includes("no power") || a.includes("breaker") || a.includes("water leak")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("type of system") && (a.includes("rooftop") || a.includes("mini-split")))) mul(1.10);
//       if (seen((q,a) => q.includes("which unit") && a.includes("both"))) mul(1.12);
//       if (seen((q,a) => q.includes("water or mold") && (a.includes("stained") || a.includes("mold")))) mul(1.12);
//       break;
//     }
//     case "Select Electrical Issues Below": {
//       if (seen((q,a) => a.includes("no power at all") || a.includes("sparks") || a.includes("smoke") || a.includes("burning"))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => a.includes("flicker"))) mul(1.06);
//       break;
//     }
//     case "Water Heater Failure": {
//       if (seen((q,a) => q.includes("what issue") && (a.includes("leak") || a.includes("not sure")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("type") && (a.includes("gas") || a.includes("tankless")))) mul(1.10);
//       if (seen((q,a) => q.includes("size") && (a.includes("50") || a.includes("75")))) mul(1.06);
//       if (seen((q,a) => q.includes("age") && a.includes("10"))) mul(1.08);
//       if (seen((q,a) => q.includes("visible water") && (a.includes("pooled") || a.includes("mold")))) mul(1.10);
//       break;
//     }
//     case "Mold or Water Damage Remediation": {
//       if (seen((q,a) => q.includes("area") && (a.includes("multiple") || a.includes("not sure")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("visible mold") && a.includes("yes"))) mul(1.15);
//       if (seen((q,a) => q.includes("cause") && a.includes("flood"))) mul(1.20);
//       if (seen((q,a) => q.includes("when") && (a.includes("3+") || a.includes("unknown")))) mul(1.12);
//       break;
//     }
//     case "Broken Windows or Doors": {
//       if (seen((q,a) => q.includes("what is broken") && (a.includes("full door") || a.includes("sliding") || a.includes("frame")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("is this a security emergency") && (a.includes("open") || a.includes("unsafe")))) add(SPV2_CFG.addOnFees.securityEmergency);
//       if (seen((q,a) => q.includes("location") && (a.includes("2nd") || a.includes("balcony")))) mul(1.08);
//       break;
//     }
//     case "Gas Leaks": {
//       if (seen((q,a) => q.includes("smell") && (a.includes("strong") || a.includes("rotten")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("shut off") && (a.includes("no") || a.includes("not sure")))) add(SPV2_CFG.addOnFees.noShutoffAccess);
//       break;
//     }
//     case "Appliance Failures": {
//       if (seen((q,a) => q.includes("appliance type") && (a.includes("fridge") || a.includes("ac")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("issue") && (a.includes("leak") || a.includes("spark") || a.includes("burn")))) mul(1.10);
//       if (seen((q,a) => q.includes("age") && (a.includes("10+") || a.includes("unknown")))) mul(1.06);
//       if (seen((q,a) => q.includes("warranty") && a.includes("yes"))) mul(0.95);
//       break;
//     }
//     case "Drywall Repair": {
//       if (seen((q,a) => q.includes("what size") && (a.includes("multiple") || a.includes("greater")))) severity = _spv2_bumpSeverity(severity,"severe");
//       if (seen((q,a) => q.includes("what caused") && a.includes("water"))) mul(1.15);
//       if (seen((q,a) => q.includes("ceiling") && a.includes("yes"))) mul(1.10);
//       if (seen((q,a) => q.includes("paint") && a.includes("yes"))) add(SPV2_CFG.addOnFees.paintMatch);
//       if (seen((q,a) => q.includes("obstructed") && a.includes("yes"))) mul(1.08);
//       break;
//     }
//     default: {
//       if (seen((q,a) => a.includes("unknown") || a.includes("not sure"))) mul(1.05);
//     }
//   }

//   const sevFactor = SPV2_CFG.severityMult[severity] || 1.25;
//   mult *= sevFactor;
//   return { severity, multiplier: Number(mult.toFixed(3)), addOns };
// }

// function _spv2_finalize(service, x) {
//   const rails = SPV2_CFG.rails[service] || SPV2_CFG.rails.default;
//   const clamped = _spv2_clamp(x, rails);
//   return _spv2_roundTo(clamped, SPV2_CFG.roundTo);
// }

// const estimateHandler = async (req, res) => {
//   try {
//     const { service, address, city, zipcode, details = {} } = req.body || {};
//     if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
//       return res.status(400).json({ ok: false, error: "Unknown or missing service" });
//     }
//     const addr = (address || "").trim();
//     const addrLine = `${addr}${city ? ", " + city : ""}${zipcode ? " " + zipcode : ""}`.trim();
//     if (!addrLine) return res.status(400).json({ ok: false, error: "Address (or address+city+zipcode) required" });

//     const geo = await _spv2_geocodeToFips(addrLine);
//     const [acs, cbp, rpp] = await Promise.all([
//       _spv2_getACS(geo.stateFIPS, geo.countyFIPS),
//       _spv2_getCBPPreferTargeted(geo.stateFIPS, geo.countyFIPS, service),
//       _spv2_getRPP(geo.stateFIPS),
//     ]);

//     const locM = _spv2_locationMultiplier({
//       rppMult: rpp?.multiplier,
//       countyIncome: acs.county.medianIncome,
//       usIncome: acs.us.medianIncome,
//     });
//     const compM = _spv2_competitionMultiplier({
//       countyEstab: cbp.county.establishments,
//       usEstab: cbp.us.establishments,
//       countyHH: acs.county.households,
//       usHH: acs.us.households,
//     });
//     const q = _spv2_computeQuestionnaire(service, details);

//     const base = SPV2_SERVICE_ANCHORS[service];
//     const raw = (base * locM * compM * q.multiplier) + q.addOns;
//     const priceUSD = _spv2_finalize(service, raw);

//     res.json({
//       ok: true,
//       service,
//       priceUSD,
//       address: geo.normalizedAddress,
//       lat: geo.lat, lon: geo.lon,
//       breakdown: {
//         anchorBase: base,
//         locationMultiplier: Number(locM.toFixed(3)),
//         competitionMultiplier: Number(compM.toFixed(3)),
//         questionnaire: { severity: q.severity, multiplier: q.multiplier, addOns: q.addOns },
//         rails: SPV2_CFG.rails[service] || SPV2_CFG.rails.default,
//         roundTo: SPV2_CFG.roundTo,
//         datasets: {
//           acs: {
//             county: acs.county.name,
//             countyMedianHHIncome: acs.county.medianIncome,
//             usMedianHHIncome: acs.us.medianIncome,
//             countyHouseholds: acs.county.households,
//             usHouseholds: acs.us.households,
//           },
//           cbp: {
//             naicsUsed: cbp.naics,
//             countyEstablishments: cbp.county.establishments,
//             usEstablishments: cbp.us.establishments,
//           },
//           rpp: rpp ? { stateRppIndexAllItems: rpp.rppIndex, multiplier: rpp.multiplier } : null,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("[SmartPriceV2]", err);
//     res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };

// // routes
// router.get("/_ping", (_req, res) => res.json({ ok: true, route: "pricing-v2" })); // 👈 for quick mount test
// router.post("/v2/estimate", estimateHandler);
// router.post("/estimate", estimateHandler);

// export default router;

//working
import express from "express";
const router = express.Router();

// ──────────────────────────────────────────────────────────────────────────────
// Smart Estimate v2 (Non‑breaking add‑on)
// Requires: Node 18+ for global fetch. Optional env: BEA_API_KEY (for RPP).
// ──────────────────────────────────────────────────────────────────────────────

// ===== Config: anchors, NAICS per service, clamps, and weights =====
const SPV2_SERVICE_ANCHORS = {
  "Burst or Leaking Pipes": 350,
  "Roof Leaks or Storm Damage": 750,
  "HVAC System Failure": 650,
  "Sewer Backups or Clogged Drains": 300,
  "Select Electrical Issues Below": 250,
  "Water Heater Failure": 800,
  "Mold or Water Damage Remediation": 2500,
  "Broken Windows or Doors": 400,
  "Gas Leaks": 500,
  "Appliance Failures": 275,
  "Drywall Repair": 200,
};

// NAICS2017 codes by service for County Business Patterns competition proxy
const SPV2_NAICS_BY_SERVICE = {
  "Burst or Leaking Pipes": "238220",
  "Sewer Backups or Clogged Drains": "238220",
  "Water Heater Failure": "238220",
  "HVAC System Failure": "238220",
  "Gas Leaks": "238220",
  "Roof Leaks or Storm Damage": "238160",
  "Select Electrical Issues Below": "238210",
  "Drywall Repair": "238310",
  "Broken Windows or Doors": "238350",
  "Appliance Failures": "811412",
  "Mold or Water Damage Remediation": "562910",
};

const SPV2_CFG = {
  location: { rppAlpha: 0.85, acsAlpha: 0.60, clamp: [0.80, 1.30] },
  competition: { beta: 0.15, clamp: [0.85, 1.15] },
  severityMult: { minor: 1.00, moderate: 1.25, severe: 1.60 },
  addOnFees: {
    urgent: 30,
    chemicalAttempt: 20,
    noShutoffAccess: 15,
    roofSteep: 35,
    securityEmergency: 75,
    paintMatch: 125,
  },
  rails: {
    default: [95, 4995],
    "Drywall Repair": [95, 995],
    "Appliance Failures": [95, 895],
    "Burst or Leaking Pipes": [150, 1495],
    "Sewer Backups or Clogged Drains": [150, 1495],
    "Roof Leaks or Storm Damage": [250, 2995],
    "Water Heater Failure": [250, 2495],
    "HVAC System Failure": [200, 1995],
    "Select Electrical Issues Below": [150, 1495],
    "Broken Windows or Doors": [125, 1495],
    "Gas Leaks": [200, 1995],
    "Mold or Water Damage Remediation": [750, 4995],
  },
  roundTo: 5,
  cacheTTLms: 10 * 60 * 1000,
};

// ===== Tiny cache & helpers =====
const _spv2_cache = new Map();
const _spv2_get = (k) => {
  const v = _spv2_cache.get(k);
  if (!v) return null;
  if (Date.now() - v.t > SPV2_CFG.cacheTTLms) { _spv2_cache.delete(k); return null; }
  return v.v;
};
const _spv2_set = (k, v) => _spv2_cache.set(k, { v, t: Date.now() });

const _spv2_clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
const _spv2_roundTo = (x, step) => Math.round(x / step) * step;
const _spv2_bumpSeverity = (cur, to) => {
  const order = ['minor','moderate','severe'];
  return order[Math.max(order.indexOf(cur), Math.max(0, order.indexOf(to)))];
};

async function _spv2_fetchJson(url, label='req') {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
    return await res.json();
  } finally { clearTimeout(to); }
}

// ===== Free public datasets =====
async function _spv2_geocodeToFips(addressLine) {
  const key = `geocode:${addressLine}`;
  const hit = _spv2_get(key); if (hit) return hit;
  const base = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
  const url = `${base}?address=${encodeURIComponent(addressLine)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
  const json = await _spv2_fetchJson(url, 'census-geocoder');
  const match = json?.result?.addressMatches?.[0];
  const county = match?.geographies?.Counties?.[0];
  if (!match || !county?.STATE || !county?.COUNTY) throw new Error('Address not found or FIPS missing');
  const out = {
    normalizedAddress: match.matchedAddress,
    stateFIPS: county.STATE,
    countyFIPS: county.COUNTY,
    lat: match.coordinates?.y,
    lon: match.coordinates?.x,
  };
  _spv2_set(key, out);
  return out;
}

async function _spv2_getACS(stateFIPS, countyFIPS) {
  const key = `acs:${stateFIPS}:${countyFIPS}`;
  const hit = _spv2_get(key); if (hit) return hit;
  const vars = 'B19013_001E,B11001_001E';
  const countyURL = `https://api.census.gov/data/2023/acs/acs5?get=NAME,${vars}&for=county:${countyFIPS}&in=state:${stateFIPS}`;
  const usURL     = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=us:*`;
  const [cArr, uArr] = await Promise.all([
    _spv2_fetchJson(countyURL, 'acs-county'),
    _spv2_fetchJson(usURL, 'acs-us'),
  ]);
  const c = cArr?.[1]; const u = uArr?.[1];
  const out = {
    county: { name: c?.[0], medianIncome: Number(c?.[1]), households: Number(c?.[2]) },
    us:     { medianIncome: Number(u?.[0]), households: Number(u?.[1]) },
  };
  if (!out.county.medianIncome || !out.us.medianIncome) throw new Error('ACS income unavailable');
  _spv2_set(key, out);
  return out;
}

async function _spv2_getCBPByNAICS(stateFIPS, countyFIPS, naics) {
  const key = `cbp:${stateFIPS}:${countyFIPS}:${naics}`;
  const hit = _spv2_get(key); if (hit) return hit;
  const countyURL = `https://api.census.gov/data/2023/cbp?get=ESTAB,NAME&for=county:${countyFIPS}&in=state:${stateFIPS}&NAICS2017=${naics}`;
  const usURL     = `https://api.census.gov/data/2023/cbp?get=ESTAB&for=us:*&NAICS2017=${naics}`;
  const [cArr, uArr] = await Promise.all([
    _spv2_fetchJson(countyURL, 'cbp-county'),
    _spv2_fetchJson(usURL, 'cbp-us'),
  ]);
  const countyEst = Number(cArr?.[1]?.[0]);
  const usEst = Number(uArr?.[1]?.[0]);
  const out = {
    ok: Number.isFinite(countyEst) && Number.isFinite(usEst),
    county: { name: cArr?.[1]?.[1], establishments: countyEst },
    us:     { establishments: usEst },
    naics
  };
  _spv2_set(key, out);
  return out;
}

async function _spv2_getCBPPreferTargeted(stateFIPS, countyFIPS, service) {
  const targeted = SPV2_NAICS_BY_SERVICE[service] || "238220";
  const primary = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, targeted);
  if (primary.ok) return primary;
  const fallback = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, "238220");
  return { ...fallback, naics: fallback.naics };
}

async function _spv2_getRPP(stateFIPS) {
  const key = `rpp:${stateFIPS}`;
  const hit = _spv2_get(key); if (hit) return hit;
  const user = process.env.BEA_API_KEY;
  if (!user) return null;
  const url = `https://apps.bea.gov/api/data/?UserID=${encodeURIComponent(user)}&method=GetData&datasetname=RegionalIncome&TableName=RPP1&LineCode=1&GeoFips=${stateFIPS}&Year=LAST&ResultFormat=json`;
  try {
    const json = await _spv2_fetchJson(url, 'bea-rpp');
    const v = Number(json?.BEAAPI?.Results?.Data?.[0]?.DataValue);
    if (!v) return null;
    const out = { rppIndex: v, multiplier: v/100 };
    _spv2_set(key, out);
    return out;
  } catch {
    return null;
  }
}

// ===== Multipliers =====
function _spv2_locationMultiplier({ rppMult, countyIncome, usIncome }) {
  if (rppMult) {
    const m = Math.pow(rppMult, SPV2_CFG.location.rppAlpha);
    return _spv2_clamp(m, SPV2_CFG.location.clamp);
  }
  const ratio = countyIncome / usIncome;
  const m = Math.pow(ratio, SPV2_CFG.location.acsAlpha);
  return _spv2_clamp(m, SPV2_CFG.location.clamp);
}
function _spv2_competitionMultiplier({ countyEstab, usEstab, countyHH, usHH }) {
  const countyPer10k = (countyEstab / Math.max(1, countyHH)) * 10000;
  const usPer10k     = (usEstab / Math.max(1, usHH)) * 10000;
  const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
  const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
  return _spv2_clamp(m, SPV2_CFG.competition.clamp);
}

// ===== Questionnaire → severity/multipliers/add‑ons =====
function _spv2_computeQuestionnaire(service, details = {}) {
  const norm = (x='') => String(x).toLowerCase();
  const entries = Object.entries(details).map(([q,a]) => [norm(q), norm(a)]);
  const seen = (pred) => entries.some(([q,a]) => pred(q,a));
  let severity = 'moderate';
  let mult = 1.0;
  let addOns = 0;
  const mul = (x) => { mult *= x; };
  const add = (x) => { addOns += x; };

  switch (service) {
    case "Burst or Leaking Pipes": {
      if (seen((q,a) => q.includes('exposed') && (a.includes('behind') || a.includes('ceiling') || a.includes('floor') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('how long') && (a.includes('6+') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('still') && a.includes('yes'))) add(SPV2_CFG.addOnFees.urgent);
      if (seen((q,a) => q.includes('damage') && (a.includes('water-stained') || a.includes('sagging') || a.includes('minor stain')))) mul(1.12);
      if (seen((q,a) => a.includes('unknown'))) mul(1.06);
      break;
    }
    case "Sewer Backups or Clogged Drains": {
      if (seen((q,a) => q.includes('area') && (a.includes('entire') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('overflow') && (a.includes('sewage') || a.includes('toilet') || a.includes('sink')))) mul(1.15);
      if (seen((q,a) => q.includes('cleanout') && (a.includes('no') || a.includes('maybe') || a.includes('not sure')))) mul(1.10);
      if (seen((q,a) => q.includes('used') && (a.includes('liquid') || a.includes('snaked')))) add(SPV2_CFG.addOnFees.chemicalAttempt);
      break;
    }
    case "Roof Leaks or Storm Damage": {
      if (seen((q,a) => q.includes('where') && (a.includes('ceiling drip') || a.includes('skylight') || a.includes('multiple') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('type of roof') && (a.includes('tile') || a.includes('metal') || a.includes('flat')))) mul(1.10);
      if (seen((q,a) => q.includes('steep') && (a.includes('steep') || a.includes('moderate')))) add(SPV2_CFG.addOnFees.roofSteep);
      if (seen((q,a) => q.includes('isolated') && (a.includes('multiple') || a.includes('whole')))) mul(1.15);
      if (seen((q,a) => q.includes('interior damage') && (a.includes('sagging') || a.includes('furniture') || a.includes('stain')))) mul(1.10);
      break;
    }
    case "HVAC System Failure": {
      if (seen((q,a) => q.includes('issue') && (a.includes('no power') || a.includes('breaker') || a.includes('water leak')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('type of system') && (a.includes('rooftop') || a.includes('mini-split')))) mul(1.10);
      if (seen((q,a) => q.includes('which unit') && a.includes('both'))) mul(1.12);
      if (seen((q,a) => q.includes('water or mold') && (a.includes('stained') || a.includes('mold')))) mul(1.12);
      break;
    }
    case "Select Electrical Issues Below": {
      if (seen((q,a) => a.includes('no power at all') || a.includes('sparks') || a.includes('smoke') || a.includes('burning'))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => a.includes('flicker'))) mul(1.06);
      break;
    }
    case "Water Heater Failure": {
      if (seen((q,a) => q.includes('what issue') && (a.includes('leak') || a.includes('not sure')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('type') && (a.includes('gas') || a.includes('tankless')))) mul(1.10);
      if (seen((q,a) => q.includes('size') && (a.includes('50') || a.includes('75')))) mul(1.06);
      if (seen((q,a) => q.includes('age') && a.includes('10'))) mul(1.08);
      if (seen((q,a) => q.includes('visible water') && (a.includes('pooled') || a.includes('mold')))) mul(1.10);
      break;
    }
    case "Mold or Water Damage Remediation": {
      if (seen((q,a) => q.includes('area') && (a.includes('multiple') || a.includes('not sure')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('visible mold') && a.includes('yes'))) mul(1.15);
      if (seen((q,a) => q.includes('cause') && a.includes('flood'))) mul(1.20);
      if (seen((q,a) => q.includes('when') && (a.includes('3+') || a.includes('unknown')))) mul(1.12);
      break;
    }
    case "Broken Windows or Doors": {
      if (seen((q,a) => q.includes('what is broken') && (a.includes('full door') || a.includes('sliding') || a.includes('frame')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('is this a security emergency') && (a.includes('open') || a.includes('unsafe')))) add(SPV2_CFG.addOnFees.securityEmergency);
      if (seen((q,a) => q.includes('location') && (a.includes('2nd') || a.includes('balcony')))) mul(1.08);
      break;
    }
    case "Gas Leaks": {
      if (seen((q,a) => q.includes('smell') && (a.includes('strong') || a.includes('rotten')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('shut off') && (a.includes('no') || a.includes('not sure')))) add(SPV2_CFG.addOnFees.noShutoffAccess);
      break;
    }
    case "Appliance Failures": {
      if (seen((q,a) => q.includes('appliance type') && (a.includes('fridge') || a.includes('ac')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('issue') && (a.includes('leak') || a.includes('spark') || a.includes('burn')))) mul(1.10);
      if (seen((q,a) => q.includes('age') && (a.includes('10+') || a.includes('unknown')))) mul(1.06);
      if (seen((q,a) => q.includes('warranty') && a.includes('yes'))) mul(0.95);
      break;
    }
    case "Drywall Repair": {
      if (seen((q,a) => q.includes('what size') && (a.includes('multiple') || a.includes('greater')))) severity = _spv2_bumpSeverity(severity,'severe');
      if (seen((q,a) => q.includes('what caused') && a.includes('water'))) mul(1.15);
      if (seen((q,a) => q.includes('ceiling') && a.includes('yes'))) mul(1.10);
      if (seen((q,a) => q.includes('paint') && a.includes('yes'))) add(SPV2_CFG.addOnFees.paintMatch);
      if (seen((q,a) => q.includes('obstructed') && a.includes('yes'))) mul(1.08);
      break;
    }
    default: {
      if (seen((q,a) => a.includes('unknown') || a.includes('not sure'))) mul(1.05);
    }
  }

  const sevFactor = SPV2_CFG.severityMult[severity] || 1.25;
  mult *= sevFactor;
  return { severity, multiplier: Number(mult.toFixed(3)), addOns };
}

// Dynamic Service/Dispatch Fee: scales gently with market; **min $100**
function _spv2_dynamicServiceFee({ locM, compM, severity }) {
  const sevBoost = severity === 'severe' ? 1.2 : severity === 'moderate' ? 1.0 : 0.9;
  const raw = 100 * Math.pow(locM, 0.5) * Math.pow(compM, 0.5) * sevBoost;
  return Math.max(100, _spv2_roundTo(raw, SPV2_CFG.roundTo));
}

// ===== Final & rails =====
function _spv2_finalize(service, x) {
  const rails = SPV2_CFG.rails[service] || SPV2_CFG.rails.default;
  const clamped = _spv2_clamp(x, rails);
  return _spv2_roundTo(clamped, SPV2_CFG.roundTo);
}

// ===== Unified handler (POST /estimate and /v2/estimate) =====
const estimateHandler = async (req, res) => {
  try {
    const { service, address, city, zipcode, details = {} } = req.body || {};
    if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
      return res.status(400).json({ ok: false, error: 'Unknown or missing service' });
    }
    const addr = (address || '').trim();
    const addrLine = `${addr}${city ? ', ' + city : ''}${zipcode ? ' ' + zipcode : ''}`.trim();
    if (!addrLine) return res.status(400).json({ ok: false, error: 'Address (or address+city+zipcode) required' });

    // 1) Geocode → FIPS
    const geo = await _spv2_geocodeToFips(addrLine);

    // 2) Datasets
    const [acs, cbp, rpp] = await Promise.all([
      _spv2_getACS(geo.stateFIPS, geo.countyFIPS),
      _spv2_getCBPPreferTargeted(geo.stateFIPS, geo.countyFIPS, service),
      _spv2_getRPP(geo.stateFIPS),
    ]);

    // 3) Multipliers
    const locM = _spv2_locationMultiplier({
      rppMult: rpp?.multiplier,
      countyIncome: acs.county.medianIncome,
      usIncome: acs.us.medianIncome,
    });
    const compM = _spv2_competitionMultiplier({
      countyEstab: cbp.county.establishments,
      usEstab: cbp.us.establishments,
      countyHH: acs.county.households,
      usHH: acs.us.households,
    });
    const q = _spv2_computeQuestionnaire(service, details);

    // 4) Anchor → price (smart)
    const base = SPV2_SERVICE_ANCHORS[service];
    const raw = (base * locM * compM * q.multiplier) + q.addOns;
    const priceUSD = _spv2_finalize(service, raw);

    // 5) Dynamic Service/Dispatch Fee (min $100)
    const serviceFeeUSD = _spv2_dynamicServiceFee({ locM, compM, severity: q.severity });

    res.json({
      ok: true,
      service,
      priceUSD,                 // smart price for the work
      serviceFeeUSD,            // dynamic service/dispatch fee (min $100)
      suggestedSubtotalUSD: priceUSD + serviceFeeUSD,
      address: geo.normalizedAddress,
      lat: geo.lat, lon: geo.lon,
      breakdown: {
        anchorBase: base,
        locationMultiplier: Number(locM.toFixed(3)),
        competitionMultiplier: Number(compM.toFixed(3)),
        questionnaire: { severity: q.severity, multiplier: q.multiplier, addOns: q.addOns },
        serviceFeeRules: { min: 100, roundTo: SPV2_CFG.roundTo },
        rails: SPV2_CFG.rails[service] || SPV2_CFG.rails.default,
        roundTo: SPV2_CFG.roundTo,
        datasets: {
          acs: {
            county: acs.county.name,
            countyMedianHHIncome: acs.county.medianIncome,
            usMedianHHIncome: acs.us.medianIncome,
            countyHouseholds: acs.county.households,
            usHouseholds: acs.us.households
          },
          cbp: {
            naicsUsed: cbp.naics,
            countyEstablishments: cbp.county.establishments,
            usEstablishments: cbp.us.establishments
          },
          rpp: rpp ? { stateRppIndexAllItems: rpp.rppIndex, multiplier: rpp.multiplier } : null
        }
      }
    });
  } catch (err) {
    console.error('[SmartPriceV2]', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
};

router.post('/v2/estimate', estimateHandler); // mounted as /api/routes/pricing/v2/v2/estimate (kept for compatibility)
router.post('/estimate', estimateHandler);    // mounted as /api/routes/pricing/v2/estimate   ← use this on the client

export default router;


// import express from "express";
// const router = express.Router();

// // ──────────────────────────────────────────────────────────────────────────────
// // Smart Estimate v2 (Non‑breaking add‑on)
// // Requires: Node 18+ for global fetch. Optional env: BEA_API_KEY (for RPP).
// // ──────────────────────────────────────────────────────────────────────────────

// // ⚠️ TEST SERVICE KEY (exact match)
// // -----------------------------------------------------------------------------
// // This is the special test-only service that always prices at $1.00 and applies
// // NO other fees. You can remove this block when you no longer need it.
// const TEST_SERVICE_KEY = "Test $1 Service";

// // ===== Config: anchors, NAICS per service, clamps, and weights =====
// const SPV2_SERVICE_ANCHORS = {
//   "Burst or Leaking Pipes": 350,
//   "Roof Leaks or Storm Damage": 750,
//   "HVAC System Failure": 650,
//   "Sewer Backups or Clogged Drains": 300,
//   "Select Electrical Issues Below": 250,
//   "Water Heater Failure": 800,
//   "Mold or Water Damage Remediation": 2500,
//   "Broken Windows or Doors": 400,
//   "Gas Leaks": 500,
//   "Appliance Failures": 275,
//   "Drywall Repair": 200,

//   // ✅ ADDED: dev/test service anchored at $1 (anchor is not used—see short‑circuit)
//   [TEST_SERVICE_KEY]: 1,
// };

// // NAICS2017 codes by service for County Business Patterns competition proxy
// const SPV2_NAICS_BY_SERVICE = {
//   "Burst or Leaking Pipes": "238220",
//   "Sewer Backups or Clogged Drains": "238220",
//   "Water Heater Failure": "238220",
//   "HVAC System Failure": "238220",
//   "Gas Leaks": "238220",
//   "Roof Leaks or Storm Damage": "238160",
//   "Select Electrical Issues Below": "238210",
//   "Drywall Repair": "238310",
//   "Broken Windows or Doors": "238350",
//   "Appliance Failures": "811412",
//   "Mold or Water Damage Remediation": "562910",

//   // ✅ ADDED: any valid NAICS will do; we don't actually fetch for the test service
//   [TEST_SERVICE_KEY]: "238210",
// };

// const SPV2_CFG = {
//   location: { rppAlpha: 0.85, acsAlpha: 0.60, clamp: [0.80, 1.30] },
//   competition: { beta: 0.15, clamp: [0.85, 1.15] },
//   severityMult: { minor: 1.00, moderate: 1.25, severe: 1.60 },
//   addOnFees: {
//     urgent: 30,
//     chemicalAttempt: 20,
//     noShutoffAccess: 15,
//     roofSteep: 35,
//     securityEmergency: 75,
//     paintMatch: 125,
//   },
//   rails: {
//     default: [95, 4995],
//     "Drywall Repair": [95, 995],
//     "Appliance Failures": [95, 895],
//     "Burst or Leaking Pipes": [150, 1495],
//     "Sewer Backups or Clogged Drains": [150, 1495],
//     "Roof Leaks or Storm Damage": [250, 2995],
//     "Water Heater Failure": [250, 2495],
//     "HVAC System Failure": [200, 1995],
//     "Select Electrical Issues Below": [150, 1495],
//     "Broken Windows or Doors": [125, 1495],
//     "Gas Leaks": [200, 1995],
//     "Mold or Water Damage Remediation": [750, 4995],

//     // ✅ ADDED: rails for the test service (not used because we short‑circuit)
//     [TEST_SERVICE_KEY]: [1, 1],
//   },
//   roundTo: 5,
//   cacheTTLms: 10 * 60 * 1000,
// };

// // ===== Tiny cache & helpers =====
// const _spv2_cache = new Map();
// const _spv2_get = (k) => {
//   const v = _spv2_cache.get(k);
//   if (!v) return null;
//   if (Date.now() - v.t > SPV2_CFG.cacheTTLms) { _spv2_cache.delete(k); return null; }
//   return v.v;
// };
// const _spv2_set = (k, v) => _spv2_cache.set(k, { v, t: Date.now() });

// const _spv2_clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
// const _spv2_roundTo = (x, step) => Math.round(x / step) * step;
// const _spv2_bumpSeverity = (cur, to) => {
//   const order = ['minor','moderate','severe'];
//   return order[Math.max(order.indexOf(cur), Math.max(0, order.indexOf(to)))];
// };

// async function _spv2_fetchJson(url, label='req') {
//   const ctrl = new AbortController();
//   const to = setTimeout(() => ctrl.abort(), 8000);
//   try {
//     const res = await fetch(url, { signal: ctrl.signal });
//     if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
//     return await res.json();
//   } finally { clearTimeout(to); }
// }

// // ===== Free public datasets =====
// async function _spv2_geocodeToFips(addressLine) {
//   const key = `geocode:${addressLine}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const base = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
//   const url = `${base}?address=${encodeURIComponent(addressLine)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
//   const json = await _spv2_fetchJson(url, 'census-geocoder');
//   const match = json?.result?.addressMatches?.[0];
//   const county = match?.geographies?.Counties?.[0];
//   if (!match || !county?.STATE || !county?.COUNTY) throw new Error('Address not found or FIPS missing');
//   const out = {
//     normalizedAddress: match.matchedAddress,
//     stateFIPS: county.STATE,
//     countyFIPS: county.COUNTY,
//     lat: match.coordinates?.y,
//     lon: match.coordinates?.x,
//   };
//   _spv2_set(key, out);
//   return out;
// }

// async function _spv2_getACS(stateFIPS, countyFIPS) {
//   const key = `acs:${stateFIPS}:${countyFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const vars = 'B19013_001E,B11001_001E';
//   const countyURL = `https://api.census.gov/data/2023/acs/acs5?get=NAME,${vars}&for=county:${countyFIPS}&in=state:${stateFIPS}`;
//   const usURL     = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=us:*`;
//   const [cArr, uArr] = await Promise.all([
//     _spv2_fetchJson(countyURL, 'acs-county'),
//     _spv2_fetchJson(usURL, 'acs-us'),
//   ]);
//   const c = cArr?.[1]; const u = uArr?.[1];
//   const out = {
//     county: { name: c?.[0], medianIncome: Number(c?.[1]), households: Number(c?.[2]) },
//     us:     { medianIncome: Number(u?.[0]), households: Number(u?.[1]) },
//   };
//   if (!out.county.medianIncome || !out.us.medianIncome) throw new Error('ACS income unavailable');
//   _spv2_set(key, out);
//   return out;
// }

// async function _spv2_getCBPByNAICS(stateFIPS, countyFIPS, naics) {
//   const key = `cbp:${stateFIPS}:${countyFIPS}:${naics}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const countyURL = `https://api.census.gov/data/2023/cbp?get=ESTAB,NAME&for=county:${countyFIPS}&in=state:${stateFIPS}&NAICS2017=${naics}`;
//   const usURL     = `https://api.census.gov/data/2023/cbp?get=ESTAB&for=us:*&NAICS2017=${naics}`;
//   const [cArr, uArr] = await Promise.all([
//     _spv2_fetchJson(countyURL, 'cbp-county'),
//     _spv2_fetchJson(usURL, 'cbp-us'),
//   ]);
//   const countyEst = Number(cArr?.[1]?.[0]);
//   const usEst = Number(uArr?.[1]?.[0]);
//   const out = {
//     ok: Number.isFinite(countyEst) && Number.isFinite(usEst),
//     county: { name: cArr?.[1]?.[1], establishments: countyEst },
//     us:     { establishments: usEst },
//     naics
//   };
//   _spv2_set(key, out);
//   return out;
// }

// async function _spv2_getCBPPreferTargeted(stateFIPS, countyFIPS, service) {
//   const targeted = SPV2_NAICS_BY_SERVICE[service] || "238220";
//   const primary = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, targeted);
//   if (primary.ok) return primary;
//   const fallback = await _spv2_getCBPByNAICS(stateFIPS, countyFIPS, "238220");
//   return { ...fallback, naics: fallback.naics };
// }

// async function _spv2_getRPP(stateFIPS) {
//   const key = `rpp:${stateFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const user = process.env.BEA_API_KEY;
//   if (!user) return null;
//   const url = `https://apps.bea.gov/api/data/?UserID=${encodeURIComponent(user)}&method=GetData&datasetname=RegionalIncome&TableName=RPP1&LineCode=1&GeoFips=${stateFIPS}&Year=LAST&ResultFormat=json`;
//   try {
//     const json = await _spv2_fetchJson(url, 'bea-rpp');
//     const v = Number(json?.BEAAPI?.Results?.Data?.[0]?.DataValue);
//     if (!v) return null;
//     const out = { rppIndex: v, multiplier: v/100 };
//     _spv2_set(key, out);
//     return out;
//   } catch {
//     return null;
//   }
// }

// // ===== Multipliers =====
// function _spv2_locationMultiplier({ rppMult, countyIncome, usIncome }) {
//   if (rppMult) {
//     const m = Math.pow(rppMult, SPV2_CFG.location.rppAlpha);
//     return _spv2_clamp(m, SPV2_CFG.location.clamp);
//   }
//   const ratio = countyIncome / usIncome;
//   const m = Math.pow(ratio, SPV2_CFG.location.acsAlpha);
//   return _spv2_clamp(m, SPV2_CFG.location.clamp);
// }
// function _spv2_competitionMultiplier({ countyEstab, usEstab, countyHH, usHH }) {
//   const countyPer10k = (countyEstab / Math.max(1, countyHH)) * 10000;
//   const usPer10k     = (usEstab / Math.max(1, usHH)) * 10000;
//   const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
//   const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
//   return _spv2_clamp(m, SPV2_CFG.competition.clamp);
// }

// // ===== Questionnaire → severity/multipliers/add‑ons =====
// function _spv2_computeQuestionnaire(service, details = {}) {
//   const norm = (x='') => String(x).toLowerCase();
//   const entries = Object.entries(details).map(([q,a]) => [norm(q), norm(a)]);
//   const seen = (pred) => entries.some(([q,a]) => pred(q,a));
//   let severity = 'moderate';
//   let mult = 1.0;
//   let addOns = 0;
//   const mul = (x) => { mult *= x; };
//   const add = (x) => { addOns += x; };

//   switch (service) {
//     case "Burst or Leaking Pipes": {
//       if (seen((q,a) => q.includes('exposed') && (a.includes('behind') || a.includes('ceiling') || a.includes('floor') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('how long') && (a.includes('6+') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('still') && a.includes('yes'))) add(SPV2_CFG.addOnFees.urgent);
//       if (seen((q,a) => q.includes('damage') && (a.includes('water-stained') || a.includes('sagging') || a.includes('minor stain')))) mul(1.12);
//       if (seen((q,a) => a.includes('unknown'))) mul(1.06);
//       break;
//     }
//     case "Sewer Backups or Clogged Drains": {
//       if (seen((q,a) => q.includes('area') && (a.includes('entire') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('overflow') && (a.includes('sewage') || a.includes('toilet') || a.includes('sink')))) mul(1.15);
//       if (seen((q,a) => q.includes('cleanout') && (a.includes('no') || a.includes('maybe') || a.includes('not sure')))) mul(1.10);
//       if (seen((q,a) => q.includes('used') && (a.includes('liquid') || a.includes('snaked')))) add(SPV2_CFG.addOnFees.chemicalAttempt);
//       break;
//     }
//     case "Roof Leaks or Storm Damage": {
//       if (seen((q,a) => q.includes('where') && (a.includes('ceiling drip') || a.includes('skylight') || a.includes('multiple') || a.includes('unknown')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('type of roof') && (a.includes('tile') || a.includes('metal') || a.includes('flat')))) mul(1.10);
//       if (seen((q,a) => q.includes('steep') && (a.includes('steep') || a.includes('moderate')))) add(SPV2_CFG.addOnFees.roofSteep);
//       if (seen((q,a) => q.includes('isolated') && (a.includes('multiple') || a.includes('whole')))) mul(1.15);
//       if (seen((q,a) => q.includes('interior damage') && (a.includes('sagging') || a.includes('furniture') || a.includes('stain')))) mul(1.10);
//       break;
//     }
//     case "HVAC System Failure": {
//       if (seen((q,a) => q.includes('issue') && (a.includes('no power') || a.includes('breaker') || a.includes('water leak')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('type of system') && (a.includes('rooftop') || a.includes('mini-split')))) mul(1.10);
//       if (seen((q,a) => q.includes('which unit') && a.includes('both'))) mul(1.12);
//       if (seen((q,a) => q.includes('water or mold') && (a.includes('stained') || a.includes('mold')))) mul(1.12);
//       break;
//     }
//     case "Select Electrical Issues Below": {
//       if (seen((q,a) => a.includes('no power at all') || a.includes('sparks') || a.includes('smoke') || a.includes('burning'))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => a.includes('flicker'))) mul(1.06);
//       break;
//     }
//     case "Water Heater Failure": {
//       if (seen((q,a) => q.includes('what issue') && (a.includes('leak') || a.includes('not sure')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('type') && (a.includes('gas') || a.includes('tankless')))) mul(1.10);
//       if (seen((q,a) => q.includes('size') && (a.includes('50') || a.includes('75')))) mul(1.06);
//       if (seen((q,a) => q.includes('age') && a.includes('10'))) mul(1.08);
//       if (seen((q,a) => q.includes('visible water') && (a.includes('pooled') || a.includes('mold')))) mul(1.10);
//       break;
//     }
//     case "Mold or Water Damage Remediation": {
//       if (seen((q,a) => q.includes('area') && (a.includes('multiple') || a.includes('not sure')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('visible mold') && a.includes('yes'))) mul(1.15);
//       if (seen((q,a) => q.includes('cause') && a.includes('flood'))) mul(1.20);
//       if (seen((q,a) => q.includes('when') && (a.includes('3+') || a.includes('unknown')))) mul(1.12);
//       break;
//     }
//     case "Broken Windows or Doors": {
//       if (seen((q,a) => q.includes('what is broken') && (a.includes('full door') || a.includes('sliding') || a.includes('frame')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('is this a security emergency') && (a.includes('open') || a.includes('unsafe')))) add(SPV2_CFG.addOnFees.securityEmergency);
//       if (seen((q,a) => q.includes('location') && (a.includes('2nd') || a.includes('balcony')))) mul(1.08);
//       break;
//     }
//     case "Gas Leaks": {
//       if (seen((q,a) => q.includes('smell') && (a.includes('strong') || a.includes('rotten')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('shut off') && (a.includes('no') || a.includes('not sure')))) add(SPV2_CFG.addOnFees.noShutoffAccess);
//       break;
//     }
//     case "Appliance Failures": {
//       if (seen((q,a) => q.includes('appliance type') && (a.includes('fridge') || a.includes('ac')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('issue') && (a.includes('leak') || a.includes('spark') || a.includes('burn')))) mul(1.10);
//       if (seen((q,a) => q.includes('age') && (a.includes('10+') || a.includes('unknown')))) mul(1.06);
//       if (seen((q,a) => q.includes('warranty') && a.includes('yes'))) mul(0.95);
//       break;
//     }
//     case "Drywall Repair": {
//       if (seen((q,a) => q.includes('what size') && (a.includes('multiple') || a.includes('greater')))) severity = _spv2_bumpSeverity(severity,'severe');
//       if (seen((q,a) => q.includes('what caused') && a.includes('water'))) mul(1.15);
//       if (seen((q,a) => q.includes('ceiling') && a.includes('yes'))) mul(1.10);
//       if (seen((q,a) => q.includes('paint') && a.includes('yes'))) add(SPV2_CFG.addOnFees.paintMatch);
//       if (seen((q,a) => q.includes('obstructed') && a.includes('yes'))) mul(1.08);
//       break;
//     }

//     // ✅ ADDED (defensive; not actually used for the test service since we short‑circuit):
//     case TEST_SERVICE_KEY: {
//       severity = 'minor';
//       mult = 1.0;
//       addOns = 0;
//       break;
//     }

//     default: {
//       if (seen((q,a) => a.includes('unknown') || a.includes('not sure'))) mul(1.05);
//     }
//   }

//   const sevFactor = SPV2_CFG.severityMult[severity] || 1.25;
//   mult *= sevFactor;
//   return { severity, multiplier: Number(mult.toFixed(3)), addOns };
// }

// // Dynamic Service/Dispatch Fee: scales gently with market; **min $100**
// function _spv2_dynamicServiceFee({ locM, compM, severity }) {
//   const sevBoost = severity === 'severe' ? 1.2 : severity === 'moderate' ? 1.0 : 0.9;
//   const raw = 100 * Math.pow(locM, 0.5) * Math.pow(compM, 0.5) * sevBoost;
//   return Math.max(100, _spv2_roundTo(raw, SPV2_CFG.roundTo));
// }

// // ===== Final & rails =====
// function _spv2_finalize(service, x) {
//   // ✅ SPECIAL‑CASE: never round or clamp the test service—just return $1.00
//   if (service === TEST_SERVICE_KEY) return 1.0;

//   const rails = SPV2_CFG.rails[service] || SPV2_CFG.rails.default;
//   const clamped = _spv2_clamp(x, rails);
//   return _spv2_roundTo(clamped, SPV2_CFG.roundTo);
// }

// // ===== Unified handler (POST /estimate and /v2/estimate) =====
// const estimateHandler = async (req, res) => {
//   try {
//     const { service, address, city, zipcode, details = {} } = req.body || {};
//     if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
//       return res.status(400).json({ ok: false, error: 'Unknown or missing service' });
//     }
//     const addr = (address || '').trim();
//     const addrLine = `${addr}${city ? ', ' + city : ''}${zipcode ? ' ' + zipcode : ''}`.trim();
//     if (!addrLine) return res.status(400).json({ ok: false, error: 'Address (or address+city+zipcode) required' });

//     // ✅ SHORT‑CIRCUIT: Test service returns a fixed $1.00 and zero fees,
//     //    skipping geocoding failures, datasets, multipliers, add‑ons, rails,
//     //    and rounding. We still *try* to normalize address for consistency.
//     if (service === TEST_SERVICE_KEY) {
//       let normalized = addrLine, lat = null, lon = null;
//       try {
//         const geo = await _spv2_geocodeToFips(addrLine);
//         normalized = geo.normalizedAddress || addrLine;
//         lat = geo.lat ?? null;
//         lon = geo.lon ?? null;
//       } catch {
//         // swallow geocode errors; keep the provided address
//       }

//       return res.json({
//         ok: true,
//         service,
//         priceUSD: 1.00,                     // hard‑coded
//         serviceFeeUSD: 0,                   // no dispatch/service fee
//         suggestedSubtotalUSD: 1.00,         // price only
//         address: normalized,
//         lat, lon,
//         // Helpful flags the client can use to suppress any client‑side extra fees
//         flags: { testService: true, noExtraFees: true },
//         breakdown: {
//           note: "TEST SERVICE: hard-coded $1.00; all multipliers/fees disabled",
//           anchorBase: 1,
//           locationMultiplier: 1,
//           competitionMultiplier: 1,
//           questionnaire: { severity: 'minor', multiplier: 1.0, addOns: 0 },
//           railsBypassed: true,
//           serviceFeeRulesBypassed: true,
//         }
//       });
//     }

//     // 1) Geocode → FIPS
//     const geo = await _spv2_geocodeToFips(addrLine);

//     // 2) Datasets
//     const [acs, cbp, rpp] = await Promise.all([
//       _spv2_getACS(geo.stateFIPS, geo.countyFIPS),
//       _spv2_getCBPPreferTargeted(geo.stateFIPS, geo.countyFIPS, service),
//       _spv2_getRPP(geo.stateFIPS),
//     ]);

//     // 3) Multipliers
//     const locM = _spv2_locationMultiplier({
//       rppMult: rpp?.multiplier,
//       countyIncome: acs.county.medianIncome,
//       usIncome: acs.us.medianIncome,
//     });
//     const compM = _spv2_competitionMultiplier({
//       countyEstab: cbp.county.establishments,
//       usEstab: cbp.us.establishments,
//       countyHH: acs.county.households,
//       usHH: acs.us.households,
//     });
//     const q = _spv2_computeQuestionnaire(service, details);

//     // 4) Anchor → price (smart)
//     const base = SPV2_SERVICE_ANCHORS[service];
//     const raw = (base * locM * compM * q.multiplier) + q.addOns;
//     const priceUSD = _spv2_finalize(service, raw);

//     // 5) Dynamic Service/Dispatch Fee (min $100)
//     const serviceFeeUSD = _spv2_dynamicServiceFee({ locM, compM, severity: q.severity });

//     res.json({
//       ok: true,
//       service,
//       priceUSD,                 // smart price for the work
//       serviceFeeUSD,            // dynamic service/dispatch fee (min $100)
//       suggestedSubtotalUSD: priceUSD + serviceFeeUSD,
//       address: geo.normalizedAddress,
//       lat: geo.lat, lon: geo.lon,
//       breakdown: {
//         anchorBase: base,
//         locationMultiplier: Number(locM.toFixed(3)),
//         competitionMultiplier: Number(compM.toFixed(3)),
//         questionnaire: { severity: q.severity, multiplier: q.multiplier, addOns: q.addOns },
//         serviceFeeRules: { min: 100, roundTo: SPV2_CFG.roundTo },
//         rails: SPV2_CFG.rails[service] || SPV2_CFG.rails.default,
//         roundTo: SPV2_CFG.roundTo,
//         datasets: {
//           acs: {
//             county: acs.county.name,
//             countyMedianHHIncome: acs.county.medianIncome,
//             usMedianHHIncome: acs.us.medianIncome,
//             countyHouseholds: acs.county.households,
//             usHouseholds: acs.us.households
//           },
//           cbp: {
//             naicsUsed: cbp.naics,
//             countyEstablishments: cbp.county.establishments,
//             usEstablishments: cbp.us.establishments
//           },
//           rpp: rpp ? { stateRppIndexAllItems: rpp.rppIndex, multiplier: rpp.multiplier } : null
//         }
//       }
//     });
//   } catch (err) {
//     console.error('[SmartPriceV2]', err);
//     res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };

// router.post('/v2/estimate', estimateHandler); // kept for compatibility
// router.post('/estimate', estimateHandler);    // preferred endpoint

// export default router;
