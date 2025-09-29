// //test code
// import express from "express";
// const router = express.Router();

// /**
//  * Smart Estimate v2 (Resilient)
//  * - Test service short-circuited to $1.00, no extra fees.
//  * - External datasets are optional; if unavailable, we degrade gracefully.
//  * - Requires Node 18+ for native fetch; if fetch is missing, we avoid using it.
//  */

// // ──────────────────────────────────────────────────────────────────────────────
// // Test service (exact label). Always $1, no other fees.
// // ──────────────────────────────────────────────────────────────────────────────
// const TEST_SERVICE_KEY = "Test $1 Service";

// // ──────────────────────────────────────────────────────────────────────────────
// // Config: anchors, NAICS mapping, clamps, and weights
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

//   // Test service (anchor not used; kept for completeness)
//   [TEST_SERVICE_KEY]: 1,
// };

// // NAICS2017 codes (competition proxy). Not critical when degrading.
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

//     // Not used for the test service (we short-circuit), but present for clarity
//     [TEST_SERVICE_KEY]: [1, 1],
//   },
//   roundTo: 5,
//   cacheTTLms: 10 * 60 * 1000,
// };

// // ──────────────────────────────────────────────────────────────────────────────
// // Tiny cache & helpers
// // ──────────────────────────────────────────────────────────────────────────────
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

// // Centralized resilient fetch wrapper
// async function _spv2_fetchJson(url, label = 'req') {
//   // If fetch is unavailable (Node < 18), gracefully refuse and let caller degrade.
//   if (typeof fetch !== "function") {
//     const e = new Error("fetch-unavailable");
//     e.code = "FETCH_UNAVAILABLE";
//     throw e;
//   }
//   const ctrl = new AbortController();
//   const to = setTimeout(() => ctrl.abort(), 8000);
//   try {
//     const res = await fetch(url, { signal: ctrl.signal });
//     if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
//     return await res.json();
//   } finally {
//     clearTimeout(to);
//   }
// }

// // ──────────────────────────────────────────────────────────────────────────────
// /** Public datasets (all optional; we degrade if they fail) */
// // ──────────────────────────────────────────────────────────────────────────────
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
//     lat: match.coordinates?.y ?? null,
//     lon: match.coordinates?.x ?? null,
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
//     const out = { rppIndex: v, multiplier: v / 100 };
//     _spv2_set(key, out);
//     return out;
//   } catch {
//     return null;
//   }
// }

// // ──────────────────────────────────────────────────────────────────────────────
// // Multipliers
// // ──────────────────────────────────────────────────────────────────────────────
// function _spv2_locationMultiplier({ rppMult, countyIncome, usIncome }) {
//   if (rppMult) {
//     const m = Math.pow(rppMult, SPV2_CFG.location.rppAlpha);
//     return _spv2_clamp(m, SPV2_CFG.location.clamp);
//   }
//   const ratio = (countyIncome && usIncome) ? (countyIncome / usIncome) : 1.0;
//   const m = Math.pow(ratio, SPV2_CFG.location.acsAlpha);
//   return _spv2_clamp(m, SPV2_CFG.location.clamp);
// }

// function _spv2_competitionMultiplier({ countyEstab, usEstab, countyHH, usHH }) {
//   const countyPer10k = (Number(countyEstab) / Math.max(1, Number(countyHH))) * 10000;
//   const usPer10k     = (Number(usEstab) / Math.max(1, Number(usHH))) * 10000;
//   const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
//   const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
//   return _spv2_clamp(m, SPV2_CFG.competition.clamp);
// }

// // ──────────────────────────────────────────────────────────────────────────────
// // Questionnaire → severity/multipliers/add-ons
// // ──────────────────────────────────────────────────────────────────────────────
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

// // Dynamic service/dispatch fee (min $100)
// function _spv2_dynamicServiceFee({ locM, compM, severity }) {
//   const sevBoost = severity === 'severe' ? 1.2 : severity === 'moderate' ? 1.0 : 0.9;
//   const raw = 100 * Math.pow(locM, 0.5) * Math.pow(compM, 0.5) * sevBoost;
//   return Math.max(100, _spv2_roundTo(raw, SPV2_CFG.roundTo));
// }

// // Final & rails
// function _spv2_finalize(service, x) {
//   if (service === TEST_SERVICE_KEY) return 1.0; // never round/clamp test service
//   const rails = SPV2_CFG.rails[service] || SPV2_CFG.rails.default;
//   const clamped = _spv2_clamp(x, rails);
//   return _spv2_roundTo(clamped, SPV2_CFG.roundTo);
// }

// // ──────────────────────────────────────────────────────────────────────────────
// // Unified handler (POST /estimate and /v2/estimate)
// // ──────────────────────────────────────────────────────────────────────────────
// const estimateHandler = async (req, res) => {
//   try {
//     const { service, address, city, zipcode, details = {} } = req.body || {};
//     if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
//       return res.status(400).json({ ok: false, error: 'Unknown or missing service' });
//     }

//     // Address line (tolerate missing city/zipcode)
//     const addr = (address || '').trim();
//     const addrLine = `${addr}${city ? ', ' + city : ''}${zipcode ? ' ' + zipcode : ''}`.trim();
//     if (!addrLine) {
//       return res.status(400).json({ ok: false, error: 'Address (or address+city+zipcode) required' });
//     }

//     // TEST SERVICE: $1.00, no other fees, no external calls
//     if (service === TEST_SERVICE_KEY) {
//       // Best-effort normalization; do not fail if geocode is unavailable
//       let normalized = addrLine, lat = null, lon = null;
//       try {
//         const geo = await _spv2_geocodeToFips(addrLine);
//         normalized = geo.normalizedAddress || addrLine;
//         lat = geo.lat ?? null;
//         lon = geo.lon ?? null;
//       } catch { /* swallow */ }

//       return res.json({
//         ok: true,
//         service,
//         priceUSD: 1.00,
//         serviceFeeUSD: 0,
//         suggestedSubtotalUSD: 1.00,
//         address: normalized,
//         lat, lon,
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

//     // 1) Geocode → FIPS (degrade if unavailable)
//     let geo = null;
//     try {
//       geo = await _spv2_geocodeToFips(addrLine);
//     } catch {
//       geo = {
//         normalizedAddress: addrLine,
//         stateFIPS: null,
//         countyFIPS: null,
//         lat: null,
//         lon: null,
//       };
//     }

//     // 2) Datasets (degrade individually)
//     let acs = null, cbp = null, rpp = null;
//     try {
//       if (geo.stateFIPS && geo.countyFIPS) {
//         acs = await _spv2_getACS(geo.stateFIPS, geo.countyFIPS);
//       }
//     } catch { /* degrade */ }
//     try {
//       if (geo.stateFIPS && geo.countyFIPS) {
//         cbp = await _spv2_getCBPPreferTargeted(geo.stateFIPS, geo.countyFIPS, service);
//       }
//     } catch { /* degrade */ }
//     try {
//       if (geo.stateFIPS) {
//         rpp = await _spv2_getRPP(geo.stateFIPS);
//       }
//     } catch { /* degrade */ }

//     // 3) Multipliers with safe fallbacks
//     const locM = _spv2_locationMultiplier({
//       rppMult: rpp?.multiplier ?? null,
//       countyIncome: acs?.county?.medianIncome ?? null,
//       usIncome: acs?.us?.medianIncome ?? null,
//     });

//     const compM = _spv2_competitionMultiplier({
//       countyEstab: cbp?.county?.establishments ?? 1,
//       usEstab: cbp?.us?.establishments ?? 1,
//       countyHH: acs?.county?.households ?? 10000,
//       usHH: acs?.us?.households ?? 10000,
//     });

//     const q = _spv2_computeQuestionnaire(service, details);

//     // 4) Anchor → price (smart)
//     const base = SPV2_SERVICE_ANCHORS[service];
//     const raw = (base * locM * compM * q.multiplier) + q.addOns;
//     const priceUSD = _spv2_finalize(service, raw);

//     // 5) Dynamic Service/Dispatch Fee (min $100)
//     const serviceFeeUSD = _spv2_dynamicServiceFee({ locM, compM, severity: q.severity });

//     return res.json({
//       ok: true,
//       service,
//       priceUSD,
//       serviceFeeUSD,
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
//           acs: acs ? {
//             county: acs.county.name,
//             countyMedianHHIncome: acs.county.medianIncome,
//             usMedianHHIncome: acs.us.medianIncome,
//             countyHouseholds: acs.county.households,
//             usHouseholds: acs.us.households
//           } : null,
//           cbp: cbp ? {
//             naicsUsed: cbp.naics,
//             countyEstablishments: cbp.county.establishments,
//             usEstablishments: cbp.us.establishments
//           } : null,
//           rpp: rpp ? { stateRppIndexAllItems: rpp.rppIndex, multiplier: rpp.multiplier } : null
//         }
//       }
//     });
//   } catch (err) {
//     console.error('[SmartPriceV2] Fatal:', err?.message || err);
//     // Return a 200 with a conservative fallback price so we never 503 the app
//     try {
//       const { service } = req.body || {};
//       const base = service && SPV2_SERVICE_ANCHORS[service] ? SPV2_SERVICE_ANCHORS[service] : 200;
//       const priceUSD = _spv2_finalize(service, base);
//       const serviceFeeUSD = 100; // conservative min
//       return res.json({
//         ok: true,
//         service,
//         priceUSD,
//         serviceFeeUSD,
//         suggestedSubtotalUSD: priceUSD + serviceFeeUSD,
//         fallback: true,
//         breakdown: {
//           note: "Degraded pricing fallback due to internal error",
//           anchorBase: base,
//           locationMultiplier: 1,
//           competitionMultiplier: 1,
//           questionnaire: { severity: 'moderate', multiplier: 1.25, addOns: 0 },
//         }
//       });
//     } catch {
//       // Absolute last resort: still avoid crashing the app
//       return res.status(200).json({
//         ok: true,
//         service: req.body?.service ?? "Unknown",
//         priceUSD: 200,
//         serviceFeeUSD: 100,
//         suggestedSubtotalUSD: 300,
//         fallback: true,
//       });
//     }
//   }
// };

// router.post('/v2/estimate', estimateHandler); // kept for compatibility
// router.post('/estimate', estimateHandler);    // preferred endpoint

// export default router;




// // working latest backup
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

// router.post('/v2/estimate', estimateHandler); // mounted as /api/routes/pricing/v2/v2/estimate (kept for compatibility)
// router.post('/estimate', estimateHandler);    // mounted as /api/routes/pricing/v2/estimate   ← use this on the client

// export default router;
// //_________________________________________________//___________________//__________


//new testing with all categoriesimport express from "express";
// import express from "express";

// const router = express.Router();

// /* ============================================================================
//    Smart Estimate v2 (with always-on Rush Fee)
//    ============================================================================
//    - Anchors by service
//    - NAICS codes for CBP proxy
//    - ACS, CBP, RPP datasets
//    - Questionnaire adjustments
//    - Rush fee always included
// ============================================================================ */

// // ===== Config =====
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
//   severityMult: { minor: 1.0, moderate: 1.25, severe: 1.6 },
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

// const FEE_RATE = 0.07;   // 7% BlinqFix fee
// const RUSH_FEE = 100;    // Always included

// // ===== Cache & helpers =====
// const _spv2_cache = new Map();
// const _spv2_get = (k) => {
//   const v = _spv2_cache.get(k);
//   if (!v) return null;
//   if (Date.now() - v.t > SPV2_CFG.cacheTTLms) {
//     _spv2_cache.delete(k);
//     return null;
//   }
//   return v.v;
// };
// const _spv2_set = (k, v) => _spv2_cache.set(k, { v, t: Date.now() });

// const _spv2_clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
// const _spv2_roundTo = (x, step) => Math.round(x / step) * step;
// const _spv2_bumpSeverity = (cur, to) => {
//   const order = ["minor", "moderate", "severe"];
//   return order[Math.max(order.indexOf(cur), order.indexOf(to))];
// };

// async function _spv2_fetchJson(url, label = "req") {
//   const ctrl = new AbortController();
//   const to = setTimeout(() => ctrl.abort(), 8000);
//   try {
//     const res = await fetch(url, { signal: ctrl.signal });
//     if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
//     return await res.json();
//   } finally {
//     clearTimeout(to);
//   }
// }

// // ===== Free public datasets =====
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

// async function _spv2_getACS(stateFIPS, countyFIPS) {
//   const key = `acs:${stateFIPS}:${countyFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const vars = "B19013_001E,B11001_001E";
//   const countyURL = `https://api.census.gov/data/2023/acs/acs5?get=NAME,${vars}&for=county:${countyFIPS}&in=state:${stateFIPS}`;
//   const usURL = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=us:*`;
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

// async function _spv2_getCBPByNAICS(stateFIPS, countyFIPS, naics) {
//   const key = `cbp:${stateFIPS}:${countyFIPS}:${naics}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const countyURL = `https://api.census.gov/data/2023/cbp?get=ESTAB,NAME&for=county:${countyFIPS}&in=state:${stateFIPS}&NAICS2017=${naics}`;
//   const usURL = `https://api.census.gov/data/2023/cbp?get=ESTAB&for=us:*&NAICS2017=${naics}`;
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
//     naics,
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
//     const json = await _spv2_fetchJson(url, "bea-rpp");
//     const v = Number(json?.BEAAPI?.Results?.Data?.[0]?.DataValue);
//     if (!v) return null;
//     const out = { rppIndex: v, multiplier: v / 100 };
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
//   const usPer10k = (usEstab / Math.max(1, usHH)) * 10000;
//   const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
//   const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
//   return _spv2_clamp(m, SPV2_CFG.competition.clamp);
// }

// // ===== Questionnaire → severity/multipliers/add-ons =====
// function _spv2_computeQuestionnaire(service, details = {}) {
//   const norm = (x = "") => String(x).toLowerCase();
//   const entries = Object.entries(details).map(([q, a]) => [norm(q), norm(a)]);
//   const seen = (pred) => entries.some(([q, a]) => pred(q, a));
//   let severity = "moderate";
//   let mult = 1.0;
//   let addOns = 0;
//   const mul = (x) => { mult *= x; };
//   const add = (x) => { addOns += x; };

//   switch (service) {
//     case "Burst or Leaking Pipes": {
//       if (seen((q, a) => q.includes("exposed") && (a.includes("behind") || a.includes("ceiling") || a.includes("floor") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("how long") && (a.includes("6+") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("still") && a.includes("yes"))) add(SPV2_CFG.addOnFees.urgent);
//       if (seen((q, a) => q.includes("damage") && (a.includes("water-stained") || a.includes("sagging") || a.includes("minor stain")))) mul(1.12);
//       if (seen((q, a) => a.includes("unknown"))) mul(1.06);
//       break;
//     }
//     case "Sewer Backups or Clogged Drains": {
//       if (seen((q, a) => q.includes("area") && (a.includes("entire") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("overflow") && (a.includes("sewage") || a.includes("toilet") || a.includes("sink")))) mul(1.15);
//       if (seen((q, a) => q.includes("cleanout") && (a.includes("no") || a.includes("maybe") || a.includes("not sure")))) mul(1.10);
//       if (seen((q, a) => q.includes("used") && (a.includes("liquid") || a.includes("snaked")))) add(SPV2_CFG.addOnFees.chemicalAttempt);
//       break;
//     }
//     case "Roof Leaks or Storm Damage": {
//       if (seen((q, a) => q.includes("where") && (a.includes("ceiling drip") || a.includes("skylight") || a.includes("multiple") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("type of roof") && (a.includes("tile") || a.includes("metal") || a.includes("flat")))) mul(1.10);
//       if (seen((q, a) => q.includes("steep") && (a.includes("steep") || a.includes("moderate")))) add(SPV2_CFG.addOnFees.roofSteep);
//       if (seen((q, a) => q.includes("isolated") && (a.includes("multiple") || a.includes("whole")))) mul(1.15);
//       if (seen((q, a) => q.includes("interior damage") && (a.includes("sagging") || a.includes("furniture") || a.includes("stain")))) mul(1.10);
//       break;
//     }
//     // ... include all other cases you had before ...
//     default: {
//       if (seen((q, a) => a.includes("unknown") || a.includes("not sure"))) mul(1.05);
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

// // ===== Unified handler =====
// const estimateHandler = async (req, res) => {
//   try {
//     const { service, address, city, zipcode, details = {} } = req.body || {};
//     if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
//       return res.status(400).json({ ok: false, error: "Unknown or missing service" });
//     }
//     const addrLine = `${address || ""}${city ? ", " + city : ""}${zipcode ? " " + zipcode : ""}`.trim();
//     if (!addrLine) return res.status(400).json({ ok: false, error: "Address required" });

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
//     const raw = base * locM * compM * q.multiplier + q.addOns;
//     const priceUSD = _spv2_finalize(service, raw);

//     // 5) Rush Fee (always $100)
//     const serviceFeeUSD = RUSH_FEE;

//     // 6) Fees & totals
//     const subtotal = priceUSD + serviceFeeUSD;
//     const convenienceFee = Number((subtotal * FEE_RATE).toFixed(2));
//     const grandTotal = subtotal + convenienceFee;

//     res.json({
//       ok: true,
//       service,
//       priceUSD,
//       serviceFeeUSD,
//       convenienceFee,
//       estimatedTotal: grandTotal,
//       address: geo.normalizedAddress,
//       lat: geo.lat,
//       lon: geo.lon,
//     });
//   } catch (err) {
//     console.error("[SmartPriceV2]", err);
//     res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };

// router.post("/v2/estimate", estimateHandler);
// router.post("/estimate", estimateHandler);

// export default router;

//_______________________________________________________________________
//_______________________________________________________________________
//_______________________________________________________________________

// //Added categories test >>> 

// import express from "express";

// const router = express.Router();

// /* ============================================================================
//    Smart Estimate v2 (with always-on Rush Fee)
//    ============================================================================
//    - Anchors by service
//    - NAICS codes for CBP proxy
//    - ACS, CBP, RPP datasets
//    - Questionnaire adjustments
//    - Rush fee always included
// ============================================================================ */

// /* ========================================================================== */
// /* SMART ESTIMATE v2 CONFIG                                                   */
// /* ========================================================================== */

// // ===== Anchors by service (base price anchors) =====
// const SPV2_SERVICE_ANCHORS = {
//   // Existing
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

//   // New (mirrors BASE_PRICE)
//   "Handyman (general fixes)": 175,
//   "Cleaner / Housekeeper": 150,
//   "Locksmith": 225,
//   "Landscaper / Lawn Care": 200,
//   "Painter (interior/exterior)": 500,
//   "Pest Control / Exterminator": 250,
//   "Carpenter (doors/trim/cabinets)": 300,
//   "Garage Door Technician": 400,
//   "Window & Glass Repair": 350,
//   "Gutter Cleaning / Repair": 225,
//   "Irrigation / Sprinkler Tech": 275,
//   "Tile & Grout Specialist": 325,
//   "Flooring Installer / Repair": 450,
//   "Smart-home / Low-voltage Installer": 275,
//   "Security System Installer": 400,
//   "IT / Wi-Fi Setup (Home Networking)": 200,
//   "TV Mounting / Home Theater Installer": 250,
//   "Moving Help (Labor-only)": 175,
//   "Junk Removal / Hauling": 250,
//   "Pressure Washing": 200,
//   "Fence Repair / Installer": 350,
//   "Masonry / Concrete": 400,
//   "Insulation / Weatherization Tech": 325,
//   "Chimney Sweep & Masonry": 300,
//   "Water Damage Mitigation": 1000,
//   "Basement Waterproofing": 1200,
//   "Tree Service / Arborist": 600,
//   "Pool & Spa Technician": 350,
//   "Deck/Patio Repair & Build": 550,
//   "Window/Door Replacement (Glazier)": 500,
//   "Solar Installer": 750,
//   "General Contractor / Remodeler": 1000,
//   "Radon Mitigation / Environmental": 600,
//   "Car Mechanic (general)": 250,
//   "Mobile Mechanic": 225,
//   "Tow Truck / Roadside Assistance": 150,
//   "Auto Glass Repair/Replacement": 300,
//   "Car Detailing (mobile)": 175,
//   "Mobile Tire Service": 200,
//   "Barber / Hairdresser": 75,
// };

// /* ========================================================================== */
// /* SERVICE ALIASES                                                            */
// /* ========================================================================== */
// const SERVICE_ALIASES = {
//   /* ─── Core Trade Mapping ─────────────────────────── */
//   Plumbing: "Burst or Leaking Pipes",
//   Roofing: "Roof Leaks or Storm Damage",
//   HVAC: "HVAC System Failure",
//   Electrician: "Select Electrical Issues Below",
//   // Core categories → correct anchors
// "Plumbing": "Burst or Leaking Pipes",
// "Roofing": "Roof Leaks or Storm Damage",
// "HVAC": "HVAC System Failure",
// "Electrician": "Select Electrical Issues Below",

//   /* ─── Electrical Sub-Aliases ────────────────────── */
//   "Single outlet/fixture": "Select Electrical Issues Below",
//   "Multiple circuits": "Select Electrical Issues Below",
//   "Panel or attic work": "Select Electrical Issues Below",

//   /* ─── Plumbing Sub-Aliases ──────────────────────── */
//   "Leaking faucet": "Burst or Leaking Pipes",
//   "Clogged sink": "Sewer Backups or Clogged Drains",
//   "Water heater issue": "Water Heater Failure",

//   /* ─── HVAC Sub-Aliases ──────────────────────────── */
//   "AC not cooling": "HVAC System Failure",
//   "Heater not working": "HVAC System Failure",

//   /* ─── Roofing Sub-Aliases ───────────────────────── */
//   "Ceiling leak": "Roof Leaks or Storm Damage",
//   "Missing shingles": "Roof Leaks or Storm Damage",

//   /* ─── Locksmith ─────────────────────────────────── */
//   "Locked out": "Locksmith",
//   "Rekey locks": "Locksmith",

//   /* ─── Cleaning ──────────────────────────────────── */
//   "Cleaning": "Cleaner / Housekeeper",
//   "Housekeeper": "Cleaner / Housekeeper",
//   "House Cleaning": "Cleaner / Housekeeper",
//   "Janitorial": "Cleaner / Housekeeper",
//   "Home cleaning": "Cleaner / Housekeeper",
//   "Move-out cleaning": "Cleaner / Housekeeper",
//   "Deep cleaning": "Cleaner / Housekeeper",

//   /* ─── Handyman / Case Fixes ─────────────────────── */
//   "Handyman (General Fixes)": "Handyman (general fixes)",
//   "Handyman": "Handyman (general fixes)",

//   /* ─── Painter / Case Fixes ──────────────────────── */
//   "Painter (Interior/Exterior)": "Painter (interior/exterior)",

//   /* ─── Gutter / Flooring / Case Fixes ────────────── */
//   "Gutter Cleaning/Repair": "Gutter Cleaning / Repair",
//   "Flooring Installer/Repair": "Flooring Installer / Repair",

//   /* ─── Window/Door Variants ──────────────────────── */
//   "Window/Door Replacement (Glazier)": "Window/Door Replacement (Glazier)",
//   "Window Repair": "Window & Glass Repair",
//   "Glass Repair": "Window & Glass Repair",

//   /* ─── Landscaping ───────────────────────────────── */
//   "Landscaper": "Landscaper / Lawn Care",
//   "Lawn Care": "Landscaper / Lawn Care",

//   /* ─── Pest Control ──────────────────────────────── */
//   "Exterminator": "Pest Control / Exterminator",
//   "Pest Control": "Pest Control / Exterminator",

//   /* ─── Fence ────────────────────────────────────── */
//   "Fence Installer": "Fence Repair / Installer",
//   "Fence Repair": "Fence Repair / Installer",

//   /* ─── Pool / Spa ───────────────────────────────── */
//   "Pool Technician": "Pool & Spa Technician",
//   "Spa Technician": "Pool & Spa Technician",
//   "Pool Service": "Pool & Spa Technician",

//   /* ─── Contractor ───────────────────────────────── */
//   "Remodeler": "General Contractor / Remodeler",
//   "Contractor": "General Contractor / Remodeler",

//   /* ─── Auto / Roadside ──────────────────────────── */
//   "Car Mechanic (General)": "Car Mechanic (general)",
//   "Car Detailing (Mobile)": "Car Detailing (mobile)",
//   "Tow Truck": "Tow Truck / Roadside Assistance",
//   "Roadside Assistance": "Tow Truck / Roadside Assistance",
//   "Auto Glass": "Auto Glass Repair/Replacement",
//   "Auto Glass Repair": "Auto Glass Repair/Replacement",
//   "Auto Glass Replacement": "Auto Glass Repair/Replacement",

//   /* ─── Misc ─────────────────────────────────────── */
//   "Arborist": "Tree Service / Arborist",
// };

// // Unified resolver
// // export const resolveService = (svc) => SERVICE_ALIASES[svc] || svc;


// // /** Helper to normalize any input service name */
// // // const resolveService = (svc) => SERVICE_ALIASES[svc] || svc;


// // ===== NAICS 2017 codes per service =====
// const SPV2_NAICS_BY_SERVICE = {
//   // Existing
//   "Burst or Leaking Pipes": "238220", // Plumbing
//   "Sewer Backups or Clogged Drains": "238220",
//   "Water Heater Failure": "238220",
//   "HVAC System Failure": "238220",
//   "Gas Leaks": "238220",
//   "Roof Leaks or Storm Damage": "238160", // Roofing
//   "Select Electrical Issues Below": "238210", // Electrical
//   "Drywall Repair": "238310", // Drywall
//   "Broken Windows or Doors": "238350", // Carpentry/finish
//   "Appliance Failures": "811412", // Appliance repair
//   "Mold or Water Damage Remediation": "562910", // Remediation

//   // New
//   "Handyman (general fixes)": "236118", // Residential remodel/handyman
//   "Cleaner / Housekeeper": "561720", // Janitorial/cleaning
//   "Locksmith": "561622", // Locksmiths
//   "Landscaper / Lawn Care": "561730", // Landscaping
//   "Painter (interior/exterior)": "238320", // Painting contractors
//   "Pest Control / Exterminator": "561710", // Pest control
//   "Carpenter (doors/trim/cabinets)": "238350", // Carpentry
//   "Garage Door Technician": "238290", // Other building equipment
//   "Window & Glass Repair": "238150", // Glass & glazing
//   "Gutter Cleaning / Repair": "238170", // Siding/gutter contractors
//   "Irrigation / Sprinkler Tech": "561730", // Landscaping/Irrigation
//   "Tile & Grout Specialist": "238340", // Tile contractors
//   "Flooring Installer / Repair": "238330", // Flooring contractors
//   "Smart-home / Low-voltage Installer": "238210", // Electrical low-voltage
//   "Security System Installer": "561621", // Security systems
//   "IT / Wi-Fi Setup (Home Networking)": "541512", // Computer systems design
//   "TV Mounting / Home Theater Installer": "238210", // Electrical/AV install
//   "Moving Help (Labor-only)": "484210", // Moving & storage
//   "Junk Removal / Hauling": "562111", // Waste collection
//   "Pressure Washing": "561790", // Building exterior cleaning
//   "Fence Repair / Installer": "238990", // All other specialty trade
//   "Masonry / Concrete": "238140", // Masonry
//   "Insulation / Weatherization Tech": "238310", // Insulation
//   "Chimney Sweep & Masonry": "238140", // Masonry
//   "Water Damage Mitigation": "562910", // Remediation
//   "Basement Waterproofing": "238190", // Foundation/waterproofing
//   "Tree Service / Arborist": "561730", // Landscaping/tree
//   "Pool & Spa Technician": "238990", // Pool contractors
//   "Deck/Patio Repair & Build": "238990", // Decking
//   "Window/Door Replacement (Glazier)": "238150", // Glazing
//   "Solar Installer": "238220", // Solar contractors (can also map 238290)
//   "General Contractor / Remodeler": "236118", // Residential remodel
//   "Radon Mitigation / Environmental": "562910", // Environmental remediation
//   "Car Mechanic (general)": "811111", // General auto repair
//   "Mobile Mechanic": "811111", // Same category
//   "Tow Truck / Roadside Assistance": "488410", // Towing
//   "Auto Glass Repair/Replacement": "811122", // Auto glass
//   "Car Detailing (mobile)": "811192", // Car wash/detail
//   "Mobile Tire Service": "811198", // Other auto repair/tire
//   "Barber / Hairdresser": "812111", // Barber shops
// };

// // const SPV2_CFG = {
// //   location: { rppAlpha: 0.85, acsAlpha: 0.60, clamp: [0.80, 1.30] },
// //   competition: { beta: 0.15, clamp: [0.85, 1.15] },
// //   severityMult: { minor: 1.0, moderate: 1.25, severe: 1.6 },
// //   addOnFees: {
// //     urgent: 30,
// //     chemicalAttempt: 20,
// //     noShutoffAccess: 15,
// //     roofSteep: 35,
// //     securityEmergency: 75,
// //     paintMatch: 125,
// //   },
// //   rails: {
// //     default: [95, 4995],
// //     "Drywall Repair": [95, 995],
// //     "Appliance Failures": [95, 895],
// //     "Burst or Leaking Pipes": [150, 1495],
// //     "Sewer Backups or Clogged Drains": [150, 1495],
// //     "Roof Leaks or Storm Damage": [250, 2995],
// //     "Water Heater Failure": [250, 2495],
// //     "HVAC System Failure": [200, 1995],
// //     "Select Electrical Issues Below": [150, 1495],
// //     "Broken Windows or Doors": [125, 1495],
// //     "Gas Leaks": [200, 1995],
// //     "Mold or Water Damage Remediation": [750, 4995],

// //     // === New Services ===
// //     "Handyman (general fixes)": [95, 595],
// //     "Cleaner / Housekeeper": [95, 495],
// //     "Locksmith": [125, 695],
// //     "Landscaper / Lawn Care": [125, 895],
// //     "Painter (interior/exterior)": [250, 2995],
// //     "Pest Control / Exterminator": [125, 795],
// //     "Carpenter (doors/trim/cabinets)": [150, 1295],
// //     "Garage Door Technician": [200, 1195],
// //     "Window & Glass Repair": [150, 1295],
// //     "Gutter Cleaning / Repair": [125, 695],
// //     "Irrigation / Sprinkler Tech": [150, 895],
// //     "Tile & Grout Specialist": [150, 995],
// //     "Flooring Installer / Repair": [250, 1995],
// //     "Smart-home / Low-voltage Installer": [150, 895],
// //     "Security System Installer": [200, 1295],
// //     "IT / Wi-Fi Setup (Home Networking)": [95, 495],
// //     "TV Mounting / Home Theater Installer": [125, 695],
// //     "Moving Help (Labor-only)": [95, 595],
// //     "Junk Removal / Hauling": [125, 995],
// //     "Pressure Washing": [95, 495],
// //     "Fence Repair / Installer": [200, 1495],
// //     "Masonry / Concrete": [250, 1995],
// //     "Insulation / Weatherization Tech": [200, 1295],
// //     "Chimney Sweep & Masonry": [200, 1295],
// //     "Water Damage Mitigation": [500, 2995],
// //     "Basement Waterproofing": [750, 3995],
// //     "Tree Service / Arborist": [300, 1995],
// //     "Pool & Spa Technician": [200, 1295],
// //     "Deck/Patio Repair & Build": [300, 2495],
// //     "Window/Door Replacement (Glazier)": [250, 1995],
// //     "Solar Installer": [500, 4995],
// //     "General Contractor / Remodeler": [750, 4995],
// //     "Radon Mitigation / Environmental": [300, 1995],
// //     "Car Mechanic (general)": [125, 995],
// //     "Mobile Mechanic": [125, 795],
// //     "Tow Truck / Roadside Assistance": [95, 495],
// //     "Auto Glass Repair/Replacement": [125, 795],
// //     "Car Detailing (mobile)": [95, 395],
// //     "Mobile Tire Service": [125, 695],
// //     "Barber / Hairdresser": [25, 195],
// //   },
// //   roundTo: 5,
// //   cacheTTLms: 10 * 60 * 1000,
// // };

// const SPV2_CFG = {
//   location: { rppAlpha: 0.85, acsAlpha: 0.60, clamp: [0.80, 1.30] },
//   competition: { beta: 0.15, clamp: [0.85, 1.15] },
//   severityMult: { minor: 1.0, moderate: 1.25, severe: 1.6 },
//   addOnFees: {
//     urgent: 30,
//     chemicalAttempt: 20,
//     noShutoffAccess: 15,
//     roofSteep: 35,
//     securityEmergency: 75,
//     paintMatch: 125,
//   },
//   rails: {
//     // Defaults
//     default: [95, 4995],

//     // Already done
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

//     // New Handyman / related
//     "Handyman (General Fixes)": [95, 695],
//     "Locksmith": [95, 595],
//     "Carpenter (Doors/Trim/Cabinets)": [150, 1295],
//     "Garage Door Technician": [200, 1495],
//     "Window & Glass Repair": [150, 1295],
//     "Gutter Cleaning/Repair": [95, 795],
//     "Fence Repair/Installer": [200, 1995],
//     "Deck/Patio Repair & Build": [300, 2995],

//     // Cleaning / Maintenance
//     "Cleaner/Housekeeper": [95, 495],
//     "Landscaper / Lawn Care": [95, 995],
//     "Painter (Interior/Exterior)": [250, 2495],
//     "Pest Control / Exterminator": [150, 995],
//     "Irrigation/Sprinkler Tech": [150, 1195],
//     "Tile & Grout Specialist": [150, 1195],
//     "Flooring Installer/Repair": [250, 2995],
//     "Pressure Washing": [95, 795],
//     "Insulation / Weatherization Tech": [200, 1995],
//     "Chimney Sweep & Masonry": [150, 1295],
//     "Basement Waterproofing": [750, 4995],
//     "Water Damage Mitigation": [500, 3995],

//     // Tech / Smart Home
//     "Smart-home / Low-voltage Installer": [150, 1295],
//     "Security System Installer": [200, 1995],
//     "IT / Wi-Fi Setup (Home Networking)": [95, 495],
//     "TV Mounting / Home Theater Installer": [95, 695],
//     "Solar Installer": [1000, 9995],
//     "General Contractor / Remodeler": [750, 9995],
//     "Radon Mitigation / Environmental": [750, 4995],

//     // Outdoor
//     "Masonry / Concrete (Steps, Walkways)": [300, 3995],
//     "Tree Service / Arborist": [250, 2495],
//     "Pool & Spa Technician": [200, 1495],

//     // Auto & Personal
//     "Car Mechanic (General)": [95, 695],
//     "Mobile Mechanic": [95, 895],
//     "Tow Truck / Roadside Assistance": [75, 495],
//     "Auto Glass Repair/Replacement": [95, 695],
//     "Car Detailing (Mobile)": [75, 495],
//     "Mobile Tire Service": [95, 695],
//     "Barber / Hairdresser": [25, 195],
//   },
//   roundTo: 5,
//   cacheTTLms: 10 * 60 * 1000,
// };


// const FEE_RATE = 0.07;   // 7% BlinqFix fee
// const RUSH_FEE = 100;    // Always included

// // ===== Cache & helpers =====
// const _spv2_cache = new Map();
// const _spv2_get = (k) => {
//   const v = _spv2_cache.get(k);
//   if (!v) return null;
//   if (Date.now() - v.t > SPV2_CFG.cacheTTLms) {
//     _spv2_cache.delete(k);
//     return null;
//   }
//   return v.v;
// };
// const _spv2_set = (k, v) => _spv2_cache.set(k, { v, t: Date.now() });

// const _spv2_clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
// const _spv2_roundTo = (x, step) => Math.round(x / step) * step;
// const _spv2_bumpSeverity = (cur, to) => {
//   const order = ["minor", "moderate", "severe"];
//   return order[Math.max(order.indexOf(cur), order.indexOf(to))];
// };

// async function _spv2_fetchJson(url, label = "req") {
//   const ctrl = new AbortController();
//   const to = setTimeout(() => ctrl.abort(), 8000);
//   try {
//     const res = await fetch(url, { signal: ctrl.signal });
//     if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
//     return await res.json();
//   } finally {
//     clearTimeout(to);
//   }
// }

// // ===== Free public datasets =====
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

// async function _spv2_getACS(stateFIPS, countyFIPS) {
//   const key = `acs:${stateFIPS}:${countyFIPS}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const vars = "B19013_001E,B11001_001E";
//   const countyURL = `https://api.census.gov/data/2023/acs/acs5?get=NAME,${vars}&for=county:${countyFIPS}&in=state:${stateFIPS}`;
//   const usURL = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=us:*`;
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

// async function _spv2_getCBPByNAICS(stateFIPS, countyFIPS, naics) {
//   const key = `cbp:${stateFIPS}:${countyFIPS}:${naics}`;
//   const hit = _spv2_get(key); if (hit) return hit;
//   const countyURL = `https://api.census.gov/data/2023/cbp?get=ESTAB,NAME&for=county:${countyFIPS}&in=state:${stateFIPS}&NAICS2017=${naics}`;
//   const usURL = `https://api.census.gov/data/2023/cbp?get=ESTAB&for=us:*&NAICS2017=${naics}`;
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
//     naics,
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
//     const json = await _spv2_fetchJson(url, "bea-rpp");
//     const v = Number(json?.BEAAPI?.Results?.Data?.[0]?.DataValue);
//     if (!v) return null;
//     const out = { rppIndex: v, multiplier: v / 100 };
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
//   const usPer10k = (usEstab / Math.max(1, usHH)) * 10000;
//   const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
//   const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
//   return _spv2_clamp(m, SPV2_CFG.competition.clamp);
// }

// // ===== Questionnaire → severity/multipliers/add-ons =====
// // function _spv2_computeQuestionnaire(service, details = {}) {
// //   const norm = (x = "") => String(x).toLowerCase();
// //   const entries = Object.entries(details).map(([q, a]) => [norm(q), norm(a)]);
// //   const seen = (pred) => entries.some(([q, a]) => pred(q, a));
// //   let severity = "moderate";
// //   let mult = 1.0;
// //   let addOns = 0;
// //   const mul = (x) => { mult *= x; };
// //   const add = (x) => { addOns += x; };

// //   switch (service) {
// //     case "Burst or Leaking Pipes": {
// //       if (seen((q, a) => q.includes("exposed") && (a.includes("behind") || a.includes("ceiling") || a.includes("floor") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
// //       if (seen((q, a) => q.includes("how long") && (a.includes("6+") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
// //       if (seen((q, a) => q.includes("still") && a.includes("yes"))) add(SPV2_CFG.addOnFees.urgent);
// //       if (seen((q, a) => q.includes("damage") && (a.includes("water-stained") || a.includes("sagging") || a.includes("minor stain")))) mul(1.12);
// //       if (seen((q, a) => a.includes("unknown"))) mul(1.06);
// //       break;
// //     }
// //     case "Sewer Backups or Clogged Drains": {
// //       if (seen((q, a) => q.includes("area") && (a.includes("entire") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
// //       if (seen((q, a) => q.includes("overflow") && (a.includes("sewage") || a.includes("toilet") || a.includes("sink")))) mul(1.15);
// //       if (seen((q, a) => q.includes("cleanout") && (a.includes("no") || a.includes("maybe") || a.includes("not sure")))) mul(1.10);
// //       if (seen((q, a) => q.includes("used") && (a.includes("liquid") || a.includes("snaked")))) add(SPV2_CFG.addOnFees.chemicalAttempt);
// //       break;
// //     }
// //     case "Roof Leaks or Storm Damage": {
// //       if (seen((q, a) => q.includes("where") && (a.includes("ceiling drip") || a.includes("skylight") || a.includes("multiple") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
// //       if (seen((q, a) => q.includes("type of roof") && (a.includes("tile") || a.includes("metal") || a.includes("flat")))) mul(1.10);
// //       if (seen((q, a) => q.includes("steep") && (a.includes("steep") || a.includes("moderate")))) add(SPV2_CFG.addOnFees.roofSteep);
// //       if (seen((q, a) => q.includes("isolated") && (a.includes("multiple") || a.includes("whole")))) mul(1.15);
// //       if (seen((q, a) => q.includes("interior damage") && (a.includes("sagging") || a.includes("furniture") || a.includes("stain")))) mul(1.10);
// //       break;
// //     }
// //     // ... include all other cases you had before ...
// //     default: {
// //       if (seen((q, a) => a.includes("unknown") || a.includes("not sure"))) mul(1.05);
// //     }
// //   }

// //   const sevFactor = SPV2_CFG.severityMult[severity] || 1.25;
// //   mult *= sevFactor;
// //   return { severity, multiplier: Number(mult.toFixed(3)), addOns };
// // }
// function _spv2_computeQuestionnaire(service, details = {}) {
//   const norm = (x = "") => String(x).toLowerCase();
//   const entries = Object.entries(details).map(([q, a]) => [norm(q), norm(a)]);
//   const seen = (pred) => entries.some(([q, a]) => pred(q, a));

//   let severity = "moderate";
//   let mult = 1.0;
//   let addOns = 0;
//   const mul = (x) => { mult *= x; };
//   const add = (x) => { addOns += x; };

//   switch (service) {
//     /* ─── Existing Cases ───────────────────────────────────── */
//     case "Burst or Leaking Pipes": {
//       if (seen((q, a) => q.includes("exposed") && (a.includes("behind") || a.includes("ceiling") || a.includes("floor") || a.includes("unknown")))) 
//         severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("how long") && (a.includes("6+") || a.includes("unknown")))) 
//         severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("still") && a.includes("yes"))) 
//         add(SPV2_CFG.addOnFees.urgent);
//       if (seen((q, a) => q.includes("damage") && (a.includes("water-stained") || a.includes("sagging") || a.includes("minor stain")))) 
//         mul(1.12);
//       if (seen((q, a) => a.includes("unknown"))) mul(1.06);
//       break;
//     }
//     case "Sewer Backups or Clogged Drains": {
//       if (seen((q, a) => q.includes("area") && (a.includes("entire") || a.includes("unknown")))) 
//         severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("overflow") && (a.includes("sewage") || a.includes("toilet") || a.includes("sink")))) 
//         mul(1.15);
//       if (seen((q, a) => q.includes("cleanout") && (a.includes("no") || a.includes("maybe") || a.includes("not sure")))) 
//         mul(1.10);
//       if (seen((q, a) => q.includes("used") && (a.includes("liquid") || a.includes("snaked")))) 
//         add(SPV2_CFG.addOnFees.chemicalAttempt);
//       break;
//     }
//     case "Roof Leaks or Storm Damage": {
//       if (seen((q, a) => q.includes("where") && (a.includes("ceiling drip") || a.includes("skylight") || a.includes("multiple") || a.includes("unknown")))) 
//         severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("type of roof") && (a.includes("tile") || a.includes("metal") || a.includes("flat")))) 
//         mul(1.10);
//       if (seen((q, a) => q.includes("steep") && (a.includes("steep") || a.includes("moderate")))) 
//         add(SPV2_CFG.addOnFees.roofSteep);
//       if (seen((q, a) => q.includes("isolated") && (a.includes("multiple") || a.includes("whole")))) 
//         mul(1.15);
//       if (seen((q, a) => q.includes("interior damage") && (a.includes("sagging") || a.includes("furniture") || a.includes("stain")))) 
//         mul(1.10);
//       break;
//     }

//     /* ─── New Services ─────────────────────────────────────── */
//     case "Handyman (general fixes)": {
//       if (seen((q, a) => q.includes("issue") && a.includes("multiple"))) mul(1.15);
//       if (seen((q, a) => a.includes("urgent"))) add(SPV2_CFG.addOnFees.urgent);
//       break;
//     }
//     case "Cleaner / Housekeeper": {
//       if (seen((q, a) => q.includes("frequency") && a.includes("deep"))) mul(1.25);
//       if (seen((q, a) => q.includes("sqft") && (a.includes("3000") || a.includes("large")))) mul(1.20);
//       break;
//     }
//     case "Locksmith": {
//       if (seen((q, a) => a.includes("locked out"))) add(SPV2_CFG.addOnFees.urgent);
//       if (seen((q, a) => a.includes("car"))) mul(1.15);
//       break;
//     }
//     case "Appliance Failures": {
//       if (seen((q, a) => q.includes("issue") && a.includes("spark"))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("age") && (a.includes("10+") || a.includes("unknown")))) mul(1.15);
//       break;
//     }
//     case "Painter (interior/exterior)": {
//       if (seen((q, a) => q.includes("sqft") && a.includes("large"))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => a.includes("paint match"))) add(SPV2_CFG.addOnFees.paintMatch);
//       break;
//     }
//     case "Pest Control / Exterminator": {
//       if (seen((q, a) => q.includes("type") && a.includes("termites"))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => a.includes("whole home"))) mul(1.20);
//       break;
//     }
//     case "Carpenter (doors/trim/cabinets)": {
//       if (seen((q, a) => q.includes("repair") && a.includes("custom"))) mul(1.25);
//       break;
//     }
//     case "Garage Door Technician": {
//       if (seen((q, a) => a.includes("spring"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Window & Glass Repair": {
//       if (seen((q, a) => a.includes("large") || a.includes("tempered"))) mul(1.20);
//       break;
//     }
//     case "Gutter Cleaning / Repair": {
//       if (seen((q, a) => q.includes("story") && a.includes("2"))) add(SPV2_CFG.addOnFees.roofSteep);
//       break;
//     }
//     case "Tile & Grout Specialist": {
//       if (seen((q, a) => a.includes("mold") || a.includes("water"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Flooring Installer / Repair": {
//       if (seen((q, a) => q.includes("sqft") && a.includes("1000+"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Smart-home / Low-voltage Installer": {
//       if (seen((q, a) => a.includes("multi-room"))) mul(1.20);
//       break;
//     }
//     case "Security System Installer": {
//       if (seen((q, a) => a.includes("whole home"))) mul(1.25);
//       break;
//     }
//     case "IT / Wi-Fi Setup (Home Networking)": {
//       if (seen((q, a) => a.includes("enterprise") || a.includes("mesh"))) mul(1.20);
//       break;
//     }
//     case "TV Mounting / Home Theater Installer": {
//       if (seen((q, a) => a.includes("over fireplace") || a.includes("large"))) mul(1.20);
//       break;
//     }
//     case "Moving Help (Labor-only)": {
//       if (seen((q, a) => a.includes("stairs"))) mul(1.15);
//       if (seen((q, a) => a.includes("urgent"))) add(SPV2_CFG.addOnFees.urgent);
//       break;
//     }
//     case "Junk Removal / Hauling": {
//       if (seen((q, a) => a.includes("truckloads") || a.includes("multiple"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Pressure Washing": {
//       if (seen((q, a) => a.includes("roof"))) add(SPV2_CFG.addOnFees.roofSteep);
//       break;
//     }
//     case "Fence Repair / Installer": {
//       if (seen((q, a) => a.includes("linear feet") && a.includes("100+"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Masonry / Concrete": {
//       if (seen((q, a) => a.includes("steps") || a.includes("foundation"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Insulation / Weatherization Tech": {
//       if (seen((q, a) => a.includes("attic"))) mul(1.20);
//       break;
//     }
//     case "Chimney Sweep & Masonry": {
//       if (seen((q, a) => a.includes("structural"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Water Damage Mitigation": {
//       severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => a.includes("mold"))) mul(1.20);
//       break;
//     }
//     case "Basement Waterproofing": {
//       severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Tree Service / Arborist": {
//       if (seen((q, a) => a.includes("large") || a.includes("near power"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Pool & Spa Technician": {
//       if (seen((q, a) => a.includes("pump") || a.includes("heater"))) mul(1.25);
//       break;
//     }
//     case "Deck/Patio Repair & Build": {
//       if (seen((q, a) => a.includes("new build"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Window/Door Replacement (Glazier)": {
//       if (seen((q, a) => a.includes("double pane") || a.includes("storm"))) mul(1.20);
//       break;
//     }
//     case "Solar Installer": {
//       severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "General Contractor / Remodeler": {
//       severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Radon Mitigation / Environmental": {
//       severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Car Mechanic (general)":
//     case "Mobile Mechanic": {
//       if (seen((q, a) => a.includes("engine") || a.includes("transmission"))) severity = _spv2_bumpSeverity(severity, "severe");
//       break;
//     }
//     case "Tow Truck / Roadside Assistance": {
//       if (seen((q, a) => a.includes("after hours"))) add(SPV2_CFG.addOnFees.urgent);
//       break;
//     }
//     case "Auto Glass Repair/Replacement": {
//       if (seen((q, a) => a.includes("windshield"))) mul(1.20);
//       break;
//     }
//     case "Car Detailing (mobile)": {
//       if (seen((q, a) => a.includes("full interior"))) mul(1.15);
//       break;
//     }
//     case "Mobile Tire Service": {
//       if (seen((q, a) => a.includes("all four"))) mul(1.25);
//       break;
//     }
//     case "Barber / Hairdresser": {
//       if (seen((q, a) => a.includes("wedding") || a.includes("event"))) mul(1.20);
//       break;
//     }

//     /* ─── Default ─────────────────────────────────────────── */
//     default: {
//       if (seen((q, a) => a.includes("unknown") || a.includes("not sure"))) mul(1.05);
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

// function resolveService(input) {
//   if (!input) return input;
//   // Direct match
//   if (SPV2_SERVICE_ANCHORS[input]) return input;
//   // Alias match
//   if (SERVICE_ALIASES[input]) return SERVICE_ALIASES[input];
//   // Fallback: try case-insensitive match
//   const lower = input.toLowerCase();
//   const foundKey = Object.keys(SPV2_SERVICE_ANCHORS).find(
//     (k) => k.toLowerCase() === lower
//   );
//   return foundKey || input;
// }


// // ===== Unified handler =====
// const estimateHandler = async (req, res) => {
//       try {
//         let { service, address, city, zipcode, details = {} } = req.body || {};
        
//         // Normalize service name
//         service = resolveService(service);
    
//         if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
//           return res.status(400).json({ ok: false, error: "Unknown or missing service" });
//         }
    
//         const addrLine = `${address || ""}${city ? ", " + city : ""}${zipcode ? " " + zipcode : ""}`.trim();
//         if (!addrLine) return res.status(400).json({ ok: false, error: "Address required" });
//     // const { service, address, city, zipcode, details = {} } = req.body || {};
//     // if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
//     //   return res.status(400).json({ ok: false, error: "Unknown or missing service" });
//     // }
//     // const addrLine = `${address || ""}${city ? ", " + city : ""}${zipcode ? " " + zipcode : ""}`.trim();
//     // if (!addrLine) return res.status(400).json({ ok: false, error: "Address required" });

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
//     const raw = base * locM * compM * q.multiplier + q.addOns;
//     const priceUSD = _spv2_finalize(service, raw);

//     // 5) Rush Fee (always $100)
//     const serviceFeeUSD = RUSH_FEE;

//     // 6) Fees & totals
//     const subtotal = priceUSD + serviceFeeUSD;
//     const convenienceFee = Number((subtotal * FEE_RATE).toFixed(2));
//     const grandTotal = subtotal + convenienceFee;

//     res.json({
//       ok: true,
//       service,
//       priceUSD,
//       serviceFeeUSD,
//       convenienceFee,
//       estimatedTotal: grandTotal,
//       address: geo.normalizedAddress,
//       lat: geo.lat,
//       lon: geo.lon,
//     });
//   } catch (err) {
//     console.error("[SmartPriceV2]", err);
//     res.status(500).json({ ok: false, error: err.message || String(err) });
//   }
// };

// router.post("/v2/estimate", estimateHandler);
// router.post("/estimate", estimateHandler);

// export default router;


//version 3 testing
// pricing.js
import express from "express";
import { resolveService } from "../utils/serviceResolver.js";

const router = express.Router();

/* ============================================================================
   Smart Estimate v2 (with always-on Rush Fee)
   ============================================================================
   - Anchors by service
   - NAICS codes for CBP proxy
   - ACS, CBP, RPP datasets
   - Questionnaire adjustments
   - Rush fee always included
============================================================================ */

/* ========================================================================== */
/* SMART ESTIMATE v2 CONFIG                                                   */
/* ========================================================================== */

// ===== Anchors by service (base price anchors) =====
const SPV2_SERVICE_ANCHORS = {
  // Existing
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

  // New (mirrors BASE_PRICE)
  "Handyman (general fixes)": 175,
  "Cleaner / Housekeeper": 150,
  "Locksmith": 225,
  "Landscaper / Lawn Care": 200,
  "Painter (interior/exterior)": 500,
  "Pest Control / Exterminator": 250,
  "Carpenter (doors/trim/cabinets)": 300,
  "Garage Door Technician": 400,
  "Window & Glass Repair": 350,
  "Gutter Cleaning / Repair": 225,
  "Irrigation / Sprinkler Tech": 275,
  "Tile & Grout Specialist": 325,
  "Flooring Installer / Repair": 450,
  "Smart-home / Low-voltage Installer": 275,
  "Security System Installer": 400,
  "IT / Wi-Fi Setup (Home Networking)": 200,
  "TV Mounting / Home Theater Installer": 250,
  "Moving Help (Labor-only)": 175,
  "Junk Removal / Hauling": 250,
  "Pressure Washing": 200,
  "Fence Repair / Installer": 350,
  "Masonry / Concrete": 400,
  "Insulation / Weatherization Tech": 325,
  "Chimney Sweep & Masonry": 300,
  "Water Damage Mitigation": 1000,
  "Basement Waterproofing": 1200,
  "Tree Service / Arborist": 600,
  "Pool & Spa Technician": 350,
  "Deck/Patio Repair & Build": 550,
  "Window/Door Replacement (Glazier)": 500,
  "Solar Installer": 750,
  "General Contractor / Remodeler": 1000,
  "Radon Mitigation / Environmental": 600,
  "Car Mechanic (general)": 250,
  "Mobile Mechanic": 225,
  "Tow Truck / Roadside Assistance": 150,
  "Auto Glass Repair/Replacement": 300,
  "Car Detailing (mobile)": 175,
  "Mobile Tire Service": 200,
  "Barber / Hairdresser": 75,
};

/* ========================================================================== */
/* SERVICE ALIASES                                                            */
/* ========================================================================== */
const SERVICE_ALIASES = {
  /* ─── Core Trade Mapping ─────────────────────────── */
  Plumbing: "Burst or Leaking Pipes",
  Roofing: "Roof Leaks or Storm Damage",
  HVAC: "HVAC System Failure",
  Electrician: "Select Electrical Issues Below",
  // Core categories → correct anchors
"Plumbing": "Burst or Leaking Pipes",
"Roofing": "Roof Leaks or Storm Damage",
"HVAC": "HVAC System Failure",
"Electrician": "Select Electrical Issues Below",

  /* ─── Electrical Sub-Aliases ────────────────────── */
  "Single outlet/fixture": "Select Electrical Issues Below",
  "Multiple circuits": "Select Electrical Issues Below",
  "Panel or attic work": "Select Electrical Issues Below",

  /* ─── Plumbing Sub-Aliases ──────────────────────── */
  "Leaking faucet": "Burst or Leaking Pipes",
  "Clogged sink": "Sewer Backups or Clogged Drains",
  "Water heater issue": "Water Heater Failure",

  /* ─── HVAC Sub-Aliases ──────────────────────────── */
  "AC not cooling": "HVAC System Failure",
  "Heater not working": "HVAC System Failure",

  /* ─── Roofing Sub-Aliases ───────────────────────── */
  "Ceiling leak": "Roof Leaks or Storm Damage",
  "Missing shingles": "Roof Leaks or Storm Damage",

  /* ─── Locksmith ─────────────────────────────────── */
  "Locked out": "Locksmith",
  "Rekey locks": "Locksmith",

  /* ─── Cleaning ──────────────────────────────────── */
  "Cleaning": "Cleaner / Housekeeper",
  "Housekeeper": "Cleaner / Housekeeper",
  "House Cleaning": "Cleaner / Housekeeper",
  "Janitorial": "Cleaner / Housekeeper",
  "Home cleaning": "Cleaner / Housekeeper",
  "Move-out cleaning": "Cleaner / Housekeeper",
  "Deep cleaning": "Cleaner / Housekeeper",

  /* ─── Handyman / Case Fixes ─────────────────────── */
  "Handyman (General Fixes)": "Handyman (general fixes)",
  "Handyman": "Handyman (general fixes)",

  /* ─── Painter / Case Fixes ──────────────────────── */
  "Painter (Interior/Exterior)": "Painter (interior/exterior)",

  /* ─── Gutter / Flooring / Case Fixes ────────────── */
  "Gutter Cleaning/Repair": "Gutter Cleaning / Repair",
  "Flooring Installer/Repair": "Flooring Installer / Repair",

  /* ─── Window/Door Variants ──────────────────────── */
  "Window/Door Replacement (Glazier)": "Window/Door Replacement (Glazier)",
  "Window Repair": "Window & Glass Repair",
  "Glass Repair": "Window & Glass Repair",

  /* ─── Landscaping ───────────────────────────────── */
  "Landscaper": "Landscaper / Lawn Care",
  "Lawn Care": "Landscaper / Lawn Care",

  /* ─── Pest Control ──────────────────────────────── */
  "Exterminator": "Pest Control / Exterminator",
  "Pest Control": "Pest Control / Exterminator",

  /* ─── Fence ────────────────────────────────────── */
  "Fence Installer": "Fence Repair / Installer",
  "Fence Repair": "Fence Repair / Installer",

  /* ─── Pool / Spa ───────────────────────────────── */
  "Pool Technician": "Pool & Spa Technician",
  "Spa Technician": "Pool & Spa Technician",
  "Pool Service": "Pool & Spa Technician",

  /* ─── Contractor ───────────────────────────────── */
  "Remodeler": "General Contractor / Remodeler",
  "Contractor": "General Contractor / Remodeler",

  /* ─── Auto / Roadside ──────────────────────────── */
  "Car Mechanic (General)": "Car Mechanic (general)",
  "Car Detailing (Mobile)": "Car Detailing (mobile)",
  "Tow Truck": "Tow Truck / Roadside Assistance",
  "Roadside Assistance": "Tow Truck / Roadside Assistance",
  "Auto Glass": "Auto Glass Repair/Replacement",
  "Auto Glass Repair": "Auto Glass Repair/Replacement",
  "Auto Glass Replacement": "Auto Glass Repair/Replacement",

  /* ─── Misc ─────────────────────────────────────── */
  "Arborist": "Tree Service / Arborist",
};

// Unified resolver
// export const resolveService = (svc) => SERVICE_ALIASES[svc] || svc;


// /** Helper to normalize any input service name */
// // const resolveService = (svc) => SERVICE_ALIASES[svc] || svc;


// ===== NAICS 2017 codes per service =====
const SPV2_NAICS_BY_SERVICE = {
  // Existing
  "Burst or Leaking Pipes": "238220", // Plumbing
  "Sewer Backups or Clogged Drains": "238220",
  "Water Heater Failure": "238220",
  "HVAC System Failure": "238220",
  "Gas Leaks": "238220",
  "Roof Leaks or Storm Damage": "238160", // Roofing
  "Select Electrical Issues Below": "238210", // Electrical
  "Drywall Repair": "238310", // Drywall
  "Broken Windows or Doors": "238350", // Carpentry/finish
  "Appliance Failures": "811412", // Appliance repair
  "Mold or Water Damage Remediation": "562910", // Remediation

  // New
  "Handyman (general fixes)": "236118", // Residential remodel/handyman
  "Cleaner / Housekeeper": "561720", // Janitorial/cleaning
  "Locksmith": "561622", // Locksmiths
  "Landscaper / Lawn Care": "561730", // Landscaping
  "Painter (interior/exterior)": "238320", // Painting contractors
  "Pest Control / Exterminator": "561710", // Pest control
  "Carpenter (doors/trim/cabinets)": "238350", // Carpentry
  "Garage Door Technician": "238290", // Other building equipment
  "Window & Glass Repair": "238150", // Glass & glazing
  "Gutter Cleaning / Repair": "238170", // Siding/gutter contractors
  "Irrigation / Sprinkler Tech": "561730", // Landscaping/Irrigation
  "Tile & Grout Specialist": "238340", // Tile contractors
  "Flooring Installer / Repair": "238330", // Flooring contractors
  "Smart-home / Low-voltage Installer": "238210", // Electrical low-voltage
  "Security System Installer": "561621", // Security systems
  "IT / Wi-Fi Setup (Home Networking)": "541512", // Computer systems design
  "TV Mounting / Home Theater Installer": "238210", // Electrical/AV install
  "Moving Help (Labor-only)": "484210", // Moving & storage
  "Junk Removal / Hauling": "562111", // Waste collection
  "Pressure Washing": "561790", // Building exterior cleaning
  "Fence Repair / Installer": "238990", // All other specialty trade
  "Masonry / Concrete": "238140", // Masonry
  "Insulation / Weatherization Tech": "238310", // Insulation
  "Chimney Sweep & Masonry": "238140", // Masonry
  "Water Damage Mitigation": "562910", // Remediation
  "Basement Waterproofing": "238190", // Foundation/waterproofing
  "Tree Service / Arborist": "561730", // Landscaping/tree
  "Pool & Spa Technician": "238990", // Pool contractors
  "Deck/Patio Repair & Build": "238990", // Decking
  "Window/Door Replacement (Glazier)": "238150", // Glazing
  "Solar Installer": "238220", // Solar contractors (can also map 238290)
  "General Contractor / Remodeler": "236118", // Residential remodel
  "Radon Mitigation / Environmental": "562910", // Environmental remediation
  "Car Mechanic (general)": "811111", // General auto repair
  "Mobile Mechanic": "811111", // Same category
  "Tow Truck / Roadside Assistance": "488410", // Towing
  "Auto Glass Repair/Replacement": "811122", // Auto glass
  "Car Detailing (mobile)": "811192", // Car wash/detail
  "Mobile Tire Service": "811198", // Other auto repair/tire
  "Barber / Hairdresser": "812111", // Barber shops
};

// const SPV2_CFG = {
//   location: { rppAlpha: 0.85, acsAlpha: 0.60, clamp: [0.80, 1.30] },
//   competition: { beta: 0.15, clamp: [0.85, 1.15] },
//   severityMult: { minor: 1.0, moderate: 1.25, severe: 1.6 },
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

//     // === New Services ===
//     "Handyman (general fixes)": [95, 595],
//     "Cleaner / Housekeeper": [95, 495],
//     "Locksmith": [125, 695],
//     "Landscaper / Lawn Care": [125, 895],
//     "Painter (interior/exterior)": [250, 2995],
//     "Pest Control / Exterminator": [125, 795],
//     "Carpenter (doors/trim/cabinets)": [150, 1295],
//     "Garage Door Technician": [200, 1195],
//     "Window & Glass Repair": [150, 1295],
//     "Gutter Cleaning / Repair": [125, 695],
//     "Irrigation / Sprinkler Tech": [150, 895],
//     "Tile & Grout Specialist": [150, 995],
//     "Flooring Installer / Repair": [250, 1995],
//     "Smart-home / Low-voltage Installer": [150, 895],
//     "Security System Installer": [200, 1295],
//     "IT / Wi-Fi Setup (Home Networking)": [95, 495],
//     "TV Mounting / Home Theater Installer": [125, 695],
//     "Moving Help (Labor-only)": [95, 595],
//     "Junk Removal / Hauling": [125, 995],
//     "Pressure Washing": [95, 495],
//     "Fence Repair / Installer": [200, 1495],
//     "Masonry / Concrete": [250, 1995],
//     "Insulation / Weatherization Tech": [200, 1295],
//     "Chimney Sweep & Masonry": [200, 1295],
//     "Water Damage Mitigation": [500, 2995],
//     "Basement Waterproofing": [750, 3995],
//     "Tree Service / Arborist": [300, 1995],
//     "Pool & Spa Technician": [200, 1295],
//     "Deck/Patio Repair & Build": [300, 2495],
//     "Window/Door Replacement (Glazier)": [250, 1995],
//     "Solar Installer": [500, 4995],
//     "General Contractor / Remodeler": [750, 4995],
//     "Radon Mitigation / Environmental": [300, 1995],
//     "Car Mechanic (general)": [125, 995],
//     "Mobile Mechanic": [125, 795],
//     "Tow Truck / Roadside Assistance": [95, 495],
//     "Auto Glass Repair/Replacement": [125, 795],
//     "Car Detailing (mobile)": [95, 395],
//     "Mobile Tire Service": [125, 695],
//     "Barber / Hairdresser": [25, 195],
//   },
//   roundTo: 5,
//   cacheTTLms: 10 * 60 * 1000,
// };

const SPV2_CFG = {
  location: { rppAlpha: 0.85, acsAlpha: 0.60, clamp: [0.80, 1.30] },
  competition: { beta: 0.15, clamp: [0.85, 1.15] },
  severityMult: { minor: 1.0, moderate: 1.25, severe: 1.6 },
  addOnFees: {
    urgent: 30,
    chemicalAttempt: 20,
    noShutoffAccess: 15,
    roofSteep: 35,
    securityEmergency: 75,
    paintMatch: 125,
  },
  rails: {
    // Defaults
    default: [95, 4995],

    // Already done
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

    // New Handyman / related
    "Handyman (General Fixes)": [95, 695],
    "Locksmith": [95, 595],
    "Carpenter (Doors/Trim/Cabinets)": [150, 1295],
    "Garage Door Technician": [200, 1495],
    "Window & Glass Repair": [150, 1295],
    "Gutter Cleaning/Repair": [95, 795],
    "Fence Repair/Installer": [200, 1995],
    "Deck/Patio Repair & Build": [300, 2995],

    // Cleaning / Maintenance
    "Cleaner/Housekeeper": [95, 495],
    "Landscaper / Lawn Care": [95, 995],
    "Painter (Interior/Exterior)": [250, 2495],
    "Pest Control / Exterminator": [150, 995],
    "Irrigation/Sprinkler Tech": [150, 1195],
    "Tile & Grout Specialist": [150, 1195],
    "Flooring Installer/Repair": [250, 2995],
    "Pressure Washing": [95, 795],
    "Insulation / Weatherization Tech": [200, 1995],
    "Chimney Sweep & Masonry": [150, 1295],
    "Basement Waterproofing": [750, 4995],
    "Water Damage Mitigation": [500, 3995],

    // Tech / Smart Home
    "Smart-home / Low-voltage Installer": [150, 1295],
    "Security System Installer": [200, 1995],
    "IT / Wi-Fi Setup (Home Networking)": [95, 495],
    "TV Mounting / Home Theater Installer": [95, 695],
    "Solar Installer": [1000, 9995],
    "General Contractor / Remodeler": [750, 9995],
    "Radon Mitigation / Environmental": [750, 4995],

    // Outdoor
    "Masonry / Concrete (Steps, Walkways)": [300, 3995],
    "Tree Service / Arborist": [250, 2495],
    "Pool & Spa Technician": [200, 1495],

    // Auto & Personal
    "Car Mechanic (General)": [95, 695],
    "Mobile Mechanic": [95, 895],
    "Tow Truck / Roadside Assistance": [75, 495],
    "Auto Glass Repair/Replacement": [95, 695],
    "Car Detailing (Mobile)": [75, 495],
    "Mobile Tire Service": [95, 695],
    "Barber / Hairdresser": [25, 195],
  },
  roundTo: 5,
  cacheTTLms: 10 * 60 * 1000,
};


const FEE_RATE = 0.07;   // 7% BlinqFix fee
const RUSH_FEE = 100;    // Always included

// ===== Cache & helpers =====
const _spv2_cache = new Map();
const _spv2_get = (k) => {
  const v = _spv2_cache.get(k);
  if (!v) return null;
  if (Date.now() - v.t > SPV2_CFG.cacheTTLms) {
    _spv2_cache.delete(k);
    return null;
  }
  return v.v;
};
const _spv2_set = (k, v) => _spv2_cache.set(k, { v, t: Date.now() });

const _spv2_clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
const _spv2_roundTo = (x, step) => Math.round(x / step) * step;
const _spv2_bumpSeverity = (cur, to) => {
  const order = ["minor", "moderate", "severe"];
  return order[Math.max(order.indexOf(cur), order.indexOf(to))];
};

async function _spv2_fetchJson(url, label = "req") {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`${label} ${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(to);
  }
}

// ===== Free public datasets =====
async function _spv2_geocodeToFips(addressLine) {
  const key = `geocode:${addressLine}`;
  const hit = _spv2_get(key); if (hit) return hit;
  const base = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";
  const url = `${base}?address=${encodeURIComponent(addressLine)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
  const json = await _spv2_fetchJson(url, "census-geocoder");
  const match = json?.result?.addressMatches?.[0];
  const county = match?.geographies?.Counties?.[0];
  if (!match || !county?.STATE || !county?.COUNTY) throw new Error("Address not found or FIPS missing");
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
  const vars = "B19013_001E,B11001_001E";
  const countyURL = `https://api.census.gov/data/2023/acs/acs5?get=NAME,${vars}&for=county:${countyFIPS}&in=state:${stateFIPS}`;
  const usURL = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=us:*`;
  const [cArr, uArr] = await Promise.all([
    _spv2_fetchJson(countyURL, "acs-county"),
    _spv2_fetchJson(usURL, "acs-us"),
  ]);
  const c = cArr?.[1]; const u = uArr?.[1];
  const out = {
    county: { name: c?.[0], medianIncome: Number(c?.[1]), households: Number(c?.[2]) },
    us:     { medianIncome: Number(u?.[0]), households: Number(u?.[1]) },
  };
  if (!out.county.medianIncome || !out.us.medianIncome) throw new Error("ACS income unavailable");
  _spv2_set(key, out);
  return out;
}

async function _spv2_getCBPByNAICS(stateFIPS, countyFIPS, naics) {
  const key = `cbp:${stateFIPS}:${countyFIPS}:${naics}`;
  const hit = _spv2_get(key); if (hit) return hit;
  const countyURL = `https://api.census.gov/data/2023/cbp?get=ESTAB,NAME&for=county:${countyFIPS}&in=state:${stateFIPS}&NAICS2017=${naics}`;
  const usURL = `https://api.census.gov/data/2023/cbp?get=ESTAB&for=us:*&NAICS2017=${naics}`;
  const [cArr, uArr] = await Promise.all([
    _spv2_fetchJson(countyURL, "cbp-county"),
    _spv2_fetchJson(usURL, "cbp-us"),
  ]);
  const countyEst = Number(cArr?.[1]?.[0]);
  const usEst = Number(uArr?.[1]?.[0]);
  const out = {
    ok: Number.isFinite(countyEst) && Number.isFinite(usEst),
    county: { name: cArr?.[1]?.[1], establishments: countyEst },
    us:     { establishments: usEst },
    naics,
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
    const json = await _spv2_fetchJson(url, "bea-rpp");
    const v = Number(json?.BEAAPI?.Results?.Data?.[0]?.DataValue);
    if (!v) return null;
    const out = { rppIndex: v, multiplier: v / 100 };
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
  const usPer10k = (usEstab / Math.max(1, usHH)) * 10000;
  const ratio = (countyPer10k || 0.0001) / (usPer10k || 0.0001);
  const m = Math.pow(ratio, -SPV2_CFG.competition.beta);
  return _spv2_clamp(m, SPV2_CFG.competition.clamp);
}

// ===== Questionnaire → severity/multipliers/add-ons =====
// function _spv2_computeQuestionnaire(service, details = {}) {
//   const norm = (x = "") => String(x).toLowerCase();
//   const entries = Object.entries(details).map(([q, a]) => [norm(q), norm(a)]);
//   const seen = (pred) => entries.some(([q, a]) => pred(q, a));
//   let severity = "moderate";
//   let mult = 1.0;
//   let addOns = 0;
//   const mul = (x) => { mult *= x; };
//   const add = (x) => { addOns += x; };

//   switch (service) {
//     case "Burst or Leaking Pipes": {
//       if (seen((q, a) => q.includes("exposed") && (a.includes("behind") || a.includes("ceiling") || a.includes("floor") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("how long") && (a.includes("6+") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("still") && a.includes("yes"))) add(SPV2_CFG.addOnFees.urgent);
//       if (seen((q, a) => q.includes("damage") && (a.includes("water-stained") || a.includes("sagging") || a.includes("minor stain")))) mul(1.12);
//       if (seen((q, a) => a.includes("unknown"))) mul(1.06);
//       break;
//     }
//     case "Sewer Backups or Clogged Drains": {
//       if (seen((q, a) => q.includes("area") && (a.includes("entire") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("overflow") && (a.includes("sewage") || a.includes("toilet") || a.includes("sink")))) mul(1.15);
//       if (seen((q, a) => q.includes("cleanout") && (a.includes("no") || a.includes("maybe") || a.includes("not sure")))) mul(1.10);
//       if (seen((q, a) => q.includes("used") && (a.includes("liquid") || a.includes("snaked")))) add(SPV2_CFG.addOnFees.chemicalAttempt);
//       break;
//     }
//     case "Roof Leaks or Storm Damage": {
//       if (seen((q, a) => q.includes("where") && (a.includes("ceiling drip") || a.includes("skylight") || a.includes("multiple") || a.includes("unknown")))) severity = _spv2_bumpSeverity(severity, "severe");
//       if (seen((q, a) => q.includes("type of roof") && (a.includes("tile") || a.includes("metal") || a.includes("flat")))) mul(1.10);
//       if (seen((q, a) => q.includes("steep") && (a.includes("steep") || a.includes("moderate")))) add(SPV2_CFG.addOnFees.roofSteep);
//       if (seen((q, a) => q.includes("isolated") && (a.includes("multiple") || a.includes("whole")))) mul(1.15);
//       if (seen((q, a) => q.includes("interior damage") && (a.includes("sagging") || a.includes("furniture") || a.includes("stain")))) mul(1.10);
//       break;
//     }
//     // ... include all other cases you had before ...
//     default: {
//       if (seen((q, a) => a.includes("unknown") || a.includes("not sure"))) mul(1.05);
//     }
//   }

//   const sevFactor = SPV2_CFG.severityMult[severity] || 1.25;
//   mult *= sevFactor;
//   return { severity, multiplier: Number(mult.toFixed(3)), addOns };
// }
function _spv2_computeQuestionnaire(service, details = {}) {
  const norm = (x = "") => String(x).toLowerCase();
  const entries = Object.entries(details).map(([q, a]) => [norm(q), norm(a)]);
  const seen = (pred) => entries.some(([q, a]) => pred(q, a));

  let severity = "moderate";
  let mult = 1.0;
  let addOns = 0;
  const mul = (x) => { mult *= x; };
  const add = (x) => { addOns += x; };

  switch (service) {
    /* ─── Existing Cases ───────────────────────────────────── */
    case "Burst or Leaking Pipes": {
      if (seen((q, a) => q.includes("exposed") && (a.includes("behind") || a.includes("ceiling") || a.includes("floor") || a.includes("unknown")))) 
        severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => q.includes("how long") && (a.includes("6+") || a.includes("unknown")))) 
        severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => q.includes("still") && a.includes("yes"))) 
        add(SPV2_CFG.addOnFees.urgent);
      if (seen((q, a) => q.includes("damage") && (a.includes("water-stained") || a.includes("sagging") || a.includes("minor stain")))) 
        mul(1.12);
      if (seen((q, a) => a.includes("unknown"))) mul(1.06);
      break;
    }
    case "Sewer Backups or Clogged Drains": {
      if (seen((q, a) => q.includes("area") && (a.includes("entire") || a.includes("unknown")))) 
        severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => q.includes("overflow") && (a.includes("sewage") || a.includes("toilet") || a.includes("sink")))) 
        mul(1.15);
      if (seen((q, a) => q.includes("cleanout") && (a.includes("no") || a.includes("maybe") || a.includes("not sure")))) 
        mul(1.10);
      if (seen((q, a) => q.includes("used") && (a.includes("liquid") || a.includes("snaked")))) 
        add(SPV2_CFG.addOnFees.chemicalAttempt);
      break;
    }
    case "Roof Leaks or Storm Damage": {
      if (seen((q, a) => q.includes("where") && (a.includes("ceiling drip") || a.includes("skylight") || a.includes("multiple") || a.includes("unknown")))) 
        severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => q.includes("type of roof") && (a.includes("tile") || a.includes("metal") || a.includes("flat")))) 
        mul(1.10);
      if (seen((q, a) => q.includes("steep") && (a.includes("steep") || a.includes("moderate")))) 
        add(SPV2_CFG.addOnFees.roofSteep);
      if (seen((q, a) => q.includes("isolated") && (a.includes("multiple") || a.includes("whole")))) 
        mul(1.15);
      if (seen((q, a) => q.includes("interior damage") && (a.includes("sagging") || a.includes("furniture") || a.includes("stain")))) 
        mul(1.10);
      break;
    }

    /* ─── New Services ─────────────────────────────────────── */
    case "Handyman (general fixes)": {
      if (seen((q, a) => q.includes("issue") && a.includes("multiple"))) mul(1.15);
      if (seen((q, a) => a.includes("urgent"))) add(SPV2_CFG.addOnFees.urgent);
      break;
    }
    case "Cleaner / Housekeeper": {
      if (seen((q, a) => q.includes("frequency") && a.includes("deep"))) mul(1.25);
      if (seen((q, a) => q.includes("sqft") && (a.includes("3000") || a.includes("large")))) mul(1.20);
      break;
    }
    case "Locksmith": {
      if (seen((q, a) => a.includes("locked out"))) add(SPV2_CFG.addOnFees.urgent);
      if (seen((q, a) => a.includes("car"))) mul(1.15);
      break;
    }
    case "Appliance Failures": {
      if (seen((q, a) => q.includes("issue") && a.includes("spark"))) severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => q.includes("age") && (a.includes("10+") || a.includes("unknown")))) mul(1.15);
      break;
    }
    case "Painter (interior/exterior)": {
      if (seen((q, a) => q.includes("sqft") && a.includes("large"))) severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => a.includes("paint match"))) add(SPV2_CFG.addOnFees.paintMatch);
      break;
    }
    case "Pest Control / Exterminator": {
      if (seen((q, a) => q.includes("type") && a.includes("termites"))) severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => a.includes("whole home"))) mul(1.20);
      break;
    }
    case "Carpenter (doors/trim/cabinets)": {
      if (seen((q, a) => q.includes("repair") && a.includes("custom"))) mul(1.25);
      break;
    }
    case "Garage Door Technician": {
      if (seen((q, a) => a.includes("spring"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Window & Glass Repair": {
      if (seen((q, a) => a.includes("large") || a.includes("tempered"))) mul(1.20);
      break;
    }
    case "Gutter Cleaning / Repair": {
      if (seen((q, a) => q.includes("story") && a.includes("2"))) add(SPV2_CFG.addOnFees.roofSteep);
      break;
    }
    case "Tile & Grout Specialist": {
      if (seen((q, a) => a.includes("mold") || a.includes("water"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Flooring Installer / Repair": {
      if (seen((q, a) => q.includes("sqft") && a.includes("1000+"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Smart-home / Low-voltage Installer": {
      if (seen((q, a) => a.includes("multi-room"))) mul(1.20);
      break;
    }
    case "Security System Installer": {
      if (seen((q, a) => a.includes("whole home"))) mul(1.25);
      break;
    }
    case "IT / Wi-Fi Setup (Home Networking)": {
      if (seen((q, a) => a.includes("enterprise") || a.includes("mesh"))) mul(1.20);
      break;
    }
    case "TV Mounting / Home Theater Installer": {
      if (seen((q, a) => a.includes("over fireplace") || a.includes("large"))) mul(1.20);
      break;
    }
    case "Moving Help (Labor-only)": {
      if (seen((q, a) => a.includes("stairs"))) mul(1.15);
      if (seen((q, a) => a.includes("urgent"))) add(SPV2_CFG.addOnFees.urgent);
      break;
    }
    case "Junk Removal / Hauling": {
      if (seen((q, a) => a.includes("truckloads") || a.includes("multiple"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Pressure Washing": {
      if (seen((q, a) => a.includes("roof"))) add(SPV2_CFG.addOnFees.roofSteep);
      break;
    }
    case "Fence Repair / Installer": {
      if (seen((q, a) => a.includes("linear feet") && a.includes("100+"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Masonry / Concrete": {
      if (seen((q, a) => a.includes("steps") || a.includes("foundation"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Insulation / Weatherization Tech": {
      if (seen((q, a) => a.includes("attic"))) mul(1.20);
      break;
    }
    case "Chimney Sweep & Masonry": {
      if (seen((q, a) => a.includes("structural"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Water Damage Mitigation": {
      severity = _spv2_bumpSeverity(severity, "severe");
      if (seen((q, a) => a.includes("mold"))) mul(1.20);
      break;
    }
    case "Basement Waterproofing": {
      severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Tree Service / Arborist": {
      if (seen((q, a) => a.includes("large") || a.includes("near power"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Pool & Spa Technician": {
      if (seen((q, a) => a.includes("pump") || a.includes("heater"))) mul(1.25);
      break;
    }
    case "Deck/Patio Repair & Build": {
      if (seen((q, a) => a.includes("new build"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Window/Door Replacement (Glazier)": {
      if (seen((q, a) => a.includes("double pane") || a.includes("storm"))) mul(1.20);
      break;
    }
    case "Solar Installer": {
      severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "General Contractor / Remodeler": {
      severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Radon Mitigation / Environmental": {
      severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Car Mechanic (general)":
    case "Mobile Mechanic": {
      if (seen((q, a) => a.includes("engine") || a.includes("transmission"))) severity = _spv2_bumpSeverity(severity, "severe");
      break;
    }
    case "Tow Truck / Roadside Assistance": {
      if (seen((q, a) => a.includes("after hours"))) add(SPV2_CFG.addOnFees.urgent);
      break;
    }
    case "Auto Glass Repair/Replacement": {
      if (seen((q, a) => a.includes("windshield"))) mul(1.20);
      break;
    }
    case "Car Detailing (mobile)": {
      if (seen((q, a) => a.includes("full interior"))) mul(1.15);
      break;
    }
    case "Mobile Tire Service": {
      if (seen((q, a) => a.includes("all four"))) mul(1.25);
      break;
    }
    case "Barber / Hairdresser": {
      if (seen((q, a) => a.includes("wedding") || a.includes("event"))) mul(1.20);
      break;
    }

    /* ─── Default ─────────────────────────────────────────── */
    default: {
      if (seen((q, a) => a.includes("unknown") || a.includes("not sure"))) mul(1.05);
    }
  }

  const sevFactor = SPV2_CFG.severityMult[severity] || 1.25;
  mult *= sevFactor;
  return { severity, multiplier: Number(mult.toFixed(3)), addOns };
}


// ===== Final & rails =====
function _spv2_finalize(service, x) {
  const rails = SPV2_CFG.rails[service] || SPV2_CFG.rails.default;
  const clamped = _spv2_clamp(x, rails);
  return _spv2_roundTo(clamped, SPV2_CFG.roundTo);
}

function resolveService(input) {
  if (!input) return input;
  // Direct match
  if (SPV2_SERVICE_ANCHORS[input]) return input;
  // Alias match
  if (SERVICE_ALIASES[input]) return SERVICE_ALIASES[input];
  // Fallback: try case-insensitive match
  const lower = input.toLowerCase();
  const foundKey = Object.keys(SPV2_SERVICE_ANCHORS).find(
    (k) => k.toLowerCase() === lower
  );
  return foundKey || input;
}


// ===== Unified handler =====
const estimateHandler = async (req, res) => {
  try {
    let { service, address, city, zipcode, details = {} } = req.body || {};

    // normalize
    service = resolveService(service);

    if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
      return res.status(400).json({ ok: false, error: "Unknown or missing service" });
    }
    
        const addrLine = `${address || ""}${city ? ", " + city : ""}${zipcode ? " " + zipcode : ""}`.trim();
        if (!addrLine) return res.status(400).json({ ok: false, error: "Address required" });
    // const { service, address, city, zipcode, details = {} } = req.body || {};
    // if (!service || !(service in SPV2_SERVICE_ANCHORS)) {
    //   return res.status(400).json({ ok: false, error: "Unknown or missing service" });
    // }
    // const addrLine = `${address || ""}${city ? ", " + city : ""}${zipcode ? " " + zipcode : ""}`.trim();
    // if (!addrLine) return res.status(400).json({ ok: false, error: "Address required" });

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

    // 4) Anchor → price
    const base = SPV2_SERVICE_ANCHORS[service];
    const raw = base * locM * compM * q.multiplier + q.addOns;
    const priceUSD = _spv2_finalize(service, raw);

    // 5) Rush Fee (always $100)
    const serviceFeeUSD = RUSH_FEE;

    // 6) Fees & totals
    const subtotal = priceUSD + serviceFeeUSD;
    const convenienceFee = Number((subtotal * FEE_RATE).toFixed(2));
    const grandTotal = subtotal + convenienceFee;

    res.json({
      ok: true,
      service,
      priceUSD,
      serviceFeeUSD,
      convenienceFee,
      estimatedTotal: grandTotal,
      address: geo.normalizedAddress,
      lat: geo.lat,
      lon: geo.lon,
    });
  } catch (err) {
    console.error("[SmartPriceV2]", err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
};

router.post("/v2/estimate", estimateHandler);
router.post("/estimate", estimateHandler);

export default router;
