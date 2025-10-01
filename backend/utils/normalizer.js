// backend/utils/normalizer.js
// const strip = s => String(s || "")
//   .toLowerCase()
//   .replace(/\s+/g, " ")
//   .replace(/[^\w\s/+-]/g, "")
//   .trim();

// /**
//  * Canonical keys for questionnaire fields by service.
//  * left side: regex (lowercased, stripped) that can match any label/wording from UI
//  * right side: canonical key we will use everywhere in pricing logic
//  */
// export const QUESTION_ALIASES = {
//     /* ===================== CORE TRADES ===================== */
  
//     "plumbing": [
//       [/^where.*(plumb|issue).*located/i, "location"],
//       [/^(room|area)$/i, "location"],
//       [/^severity/i, "severity"],
//       [/^access(ibility)?|behind (wall|ceiling)|in wall|in ceiling/i, "access"],
//       [/^leak.*how long|how long.*leak/i, "leak.duration"],
//       [/^still leaking/i, "leak.active"],
//     ],
  
//     "roofing": [
//       [/^which roofing issue|^issue.*roof/i, "roof.issue"],
//       [/^roof material$|^material$/i, "roof.material"],
//       [/^access$|^accessibility|^is roof.*accessible/i, "access"],
//       [/^size.*(damaged|area)|^area size$/i, "area.size"],
//       [/^interior damage$/i, "interior.damage"],
//       [/^roof pitch|steep/i, "roof.pitch"],
//     ],
  
//     "hvac": [
//       [/^system type/i, "system.type"],
//       [/^what.?s the problem|problem type|symptom/i, "problem.type"],
//       [/^urgency|priority/i, "urgency"],
//       [/^age.*system/i, "system.age"],
//     ],
  
//     "electrician": [
//       [/^type of issue/i, "issue.type"],
//       [/^scope of work/i, "scope"],
//       [/^access(ibility)?/i, "access"],
//       [/^panel|attic/i, "access.detail"],
//     ],
  
//     /* ===================== HOME SERVICES ===================== */
  
//     "handyman (general fixes)": [
//       [/^what type of repair|repair type/i, "repair.type"],
//       [/^size of job|job size|hours?/i, "job.size"],
//     ],
  
//     "locksmith": [
//       [/^lockout/i, "lockout.type"],
//       [/^lock type|type of lock/i, "lock.type"],
//     ],
  
//     "cleaner / housekeeper": [
//       [/^type of cleaning/i, "cleaning.type"],
//       [/^size of home|home size|sq.?ft/i, "home.size"],
//       [/^frequency/i, "cleaning.frequency"],
//     ],
  
//     "flooring installer / repair": [
//       [/^type of flooring|floor type/i, "floor.type"],
//       [/^size of job|area size|sq.?ft/i, "job.size"],
//       [/^remove old/i, "tearout"],
//     ],
  
//     "painter (interior/exterior)": [
//       [/^type of painting/i, "painting.type"],
//       [/^size of job|scope|rooms?/i, "job.size"],
//       [/^paint match|color match/i, "paint.match"],
//     ],
  
//     "pest control / exterminator": [
//       [/^type of pest/i, "pest.type"],
//       [/^severity/i, "severity"],
//       [/^area.*affected|whole home/i, "coverage"],
//     ],
  
//     "landscaper / lawn care": [
//       [/^type of work/i, "work.type"],
//       [/^property size|lot size/i, "property.size"],
//     ],
  
//     "tile & grout specialist": [
//       [/^issue type|problem/i, "issue.type"],
//       [/^area size|sq.?ft/i, "area.size"],
//       [/^mold|water/i, "moisture.flag"],
//     ],
  
//     "smart-home / low-voltage installer": [
//       [/^scope|system type|devices?/i, "system.scope"],
//       [/^rooms|multi-?room/i, "rooms.count"],
//     ],
  
//     "security system installer": [
//       [/^system type/i, "system.type"],
//       [/^coverage|whole home/i, "coverage"],
//     ],
  
//     "it / wi-fi setup (home networking)": [
//       [/^issue type|problem/i, "it.issue"],
//       [/^sq.?ft|home size/i, "home.size"],
//       [/^devices? count|how many devices/i, "devices.count"],
//     ],
  
//     "tv mounting / home theater installer": [
//       [/^service type/i, "service.type"],
//       [/^wall type/i, "wall.type"],
//       [/^tv size/i, "tv.size"],
//       [/^over fireplace/i, "mount.over_fireplace"],
//     ],
  
//     "water damage mitigation": [
//       [/^where.*water damage|location/i, "location"],
//       [/^severity/i, "severity"],
//       [/^mold/i, "mold.flag"],
//     ],
  
//     "general contractor / remodeler": [
//       [/^type of remodel/i, "remodel.area"],
//       [/^size of remodel|scope/i, "remodel.size"],
//     ],
  
//     "insulation / weatherization tech": [
//       [/^service type/i, "service.type"],
//       [/^home size|sq.?ft/i, "home.size"],
//       [/^attic|crawl|walls?/i, "insulation.area"],
//     ],
  
//     "masonry / concrete": [
//       [/^work type/i, "work.type"],
//       [/^area|steps|walkways|foundation/i, "work.area"],
//     ],
  
//     "gutter cleaning / repair": [
//       [/^service type/i, "service.type"],
//       [/^stories?|story count/i, "property.stories"],
//     ],
  
//     "window & glass repair": [
//       [/^issue type/i, "issue.type"],
//       [/^glass type|tempered|double pane/i, "glass.type"],
//       [/^size|dimensions/i, "glass.size"],
//     ],
  
//     "broken windows or doors": [
//       [/^issue type/i, "issue.type"],
//       [/^material|glass type/i, "material.type"],
//     ],
  
//     "garage door technician": [
//       [/^issue type/i, "issue.type"],
//       [/^opener|spring/i, "component"],
//     ],
  
//     "carpenter (doors/trim/cabinets)": [
//       [/^work type|repair type/i, "work.type"],
//       [/^custom|built-?in/i, "custom.flag"],
//     ],
  
//     "deck/patio repair & build": [
//       [/^work type/i, "work.type"],
//       [/^new build|repair/i, "job.kind"],
//       [/^size|sq.?ft/i, "area.size"],
//     ],
  
//     "pool & spa technician": [
//       [/^issue type/i, "issue.type"],
//       [/^equipment|pump|heater/i, "equipment.type"],
//     ],
  
//     "tree service / arborist": [
//       [/^tree size|height/i, "tree.size"],
//       [/^near power|proximity/i, "proximity.hazard"],
//     ],
  
//     "basement waterproofing": [
//       [/^severity|water level/i, "severity"],
//       [/^area size|linear feet/i, "area.size"],
//     ],
  
//     "window/door replacement (glazier)": [
//       [/^window|door count|openings/i, "openings.count"],
//       [/^double pane|storm/i, "glass.option"],
//     ],
  
//     "solar": [
//       [/^project type|roof vs ground/i, "project.type"],
//       [/^system size|kw/i, "system.size"],
//     ],
  
//     "drywall": [
//       [/^issue type|holes?|cracks?/i, "issue.type"],
//       [/^area size|sq.?ft/i, "area.size"],
//     ],
  
//     "appliance failures": [
//       [/^appliance type/i, "appliance.type"],
//       [/^symptom|issue/i, "appliance.issue"],
//       [/^age/i, "appliance.age"],
//     ],
  
//     "water & mold remediation": [
//       [/^location/i, "location"],
//       [/^mold/i, "mold.flag"],
//       [/^severity/i, "severity"],
//     ],
  
//     "exterior cleaning": [
//       [/^surface|what to wash/i, "surface.type"],
//       [/^size|sq.?ft/i, "area.size"],
//     ],
  
//     "fencing": [
//       [/^repair or replace|work type/i, "work.type"],
//       [/^linear feet|length/i, "fence.length"],
//     ],
  
//     "moving": [
//       [/^flights|stairs?/i, "stairs"],
//       [/^size|number of items/i, "move.size"],
//     ],
  
//     "junk removal": [
//       [/^truckloads?|volume|how much/i, "volume"],
//       [/^access|stairs?/i, "access"],
//     ],
  
//     /* ===================== AUTO & PERSONAL ===================== */
  
//     "auto": [
//       [/^issue type|what.?s the issue/i, "auto.issue"],
//       [/^location of vehicle|vehicle location/i, "vehicle.location"],
//     ],
  
//     "auto detailing": [
//       [/^package|interior|exterior/i, "detail.package"],
//       [/^size|vehicle type/i, "vehicle.type"],
//     ],
  
//     "tow truck / roadside assistance": [
//       [/^situation|stuck|no start/i, "tow.situation"],
//       [/^location|highway|remote/i, "vehicle.location"],
//     ],
  
//     "auto glass repair/replacement": [
//       [/^glass area|windshield|side|rear/i, "glass.area"],
//       [/^sensor|calibration/i, "adas.calibration"],
//     ],
  
//     "mobile mechanic": [
//       [/^issue type/i, "auto.issue"],
//       [/^vehicle location/i, "vehicle.location"],
//     ],
  
//     "mobile tire service": [
//       [/^how many|all four|tires?/i, "tires.count"],
//       [/^wheel size|rim/i, "wheel.size"],
//     ],
  
//     "barber / hairdresser": [
//       [/^event|wedding/i, "event.type"],
//     ],
  
//     /* ===================== GENERIC / FALLBACK ===================== */
  
//     "generic": [
//       [/^severity/i, "severity"],
//       [/^access(ibility)?/i, "access"],
//       [/^size|sq.?ft/i, "area.size"],
//       [/^location|where/i, "location"],
//       [/^type|issue|problem/i, "issue.type"],
//     ],
//   };

//   export const OPTION_ALIASES = {
//     /* ===================== CORE TRADES ===================== */
  
//     "plumbing": [
//       // location
//       [/^kitchen$/i, "kitchen"],
//       [/^bath(room)?$/i, "bathroom"],
//       [/^(laundry|utility)/i, "laundry"],
//       [/^outside|outdoor/i, "outdoor"],
//       // severity
//       [/^minor( leak| drip)?$/i, "minor leak/drip"],
//       [/^(major|severe).*(leak|flood)/i, "major leak/flooding"],
//       // access
//       [/^easy( access)?$/i, "easy access"],
//       [/^(behind|in) (wall|ceiling)$/i, "behind wall/ceiling"],
//       [/^crawl ?space$/i, "crawl space"],
//       // misc
//       [/^still leaking$/i, "still leaking"],
//       [/^(yes|y)$/i, "yes"],
//       [/^(no|n)$/i, "no"],
//       [/^unknown|not sure$/i, "unknown"],
//     ],
  
//     "roofing": [
//       // issue
//       [/^roof( leaks?)?|leak/i, "roof leak"],
//       [/^storm damage$/i, "storm damage"],
//       // material
//       [/^shingle(s)?$/i, "shingles"],
//       [/^(tile|clay|concrete tile)$/i, "tile"],
//       [/^metal$/i, "metal"],
//       [/^flat$/i, "flat"],
//       // area size
//       [/^small.*(<|under).*(5|5ft|5 ft)/i, "small patch (<5 ft²)"],
//       [/^large.*(>|over).*(20|20ft|20 ft)/i, "large section (>20 ft²)"],
//       // access / stories / pitch
//       [/^yes(,)? single story|^single story$/i, "single story"],
//       [/^(second|2nd) story$/i, "second story"],
//       [/^steep$/i, "steep"],
//       [/^difficult access|steep.*|2(nd)? story/i, "difficult access (steep/2nd story)"],
//       [/^easy access|ground access$/i, "yes, single story"],
//       // interior
//       [/^interior damage$/i, "interior damage"],
//     ],
  
//     "hvac": [
//       // system type
//       [/^central ?a\.?c\.?$|^ac$/i, "central ac"],
//       [/^(heating|furnace|heater)$/i, "heating/furnace"],
//       // problems
//       [/^not (cooling|heating)$/i, "not cooling/heating"],
//       [/^(strange|weird).*noise|smell/i, "strange noises/smell"],
//       // urgency
//       [/^comfort issue$/i, "comfort issue"],
//       [/^(system )?completely down$/i, "system completely down"],
//     ],
  
//     "electrician": [
//       // issue type
//       [/^outlet not working$/i, "outlet not working"],
//       [/^breaker tripp?ing$/i, "breaker tripping"],
//       // scope
//       [/^single (outlet|fixture)$/i, "single outlet/fixture"],
//       [/^multiple circuits?$/i, "multiple circuits"],
//       // access
//       [/^easy access$/i, "easy access"],
//       [/^(panel|attic) work$/i, "panel or attic work"],
//     ],
  
//     /* ===================== HOME SERVICES ===================== */
  
//     "handyman (general fixes)": [
//       [/^(furniture|fixtures?)$/i, "furniture/fixtures"],
//       [/^(doors?|windows?)$/i, "doors/windows"],
//       [/^small.*(under ?1 ?hour)/i, "small (under 1 hour)"],
//       [/^(larger|big).*?(2\+|over 2) hours?/i, "larger project (2+ hours)"],
//     ],
  
//     "locksmith": [
//       [/^home lockout$/i, "home lockout"],
//       [/^car lockout$/i, "car lockout"],
//       [/^standard lock$/i, "standard lock"],
//       [/^(high-?security|smart) lock$/i, "high-security/smart lock"],
//     ],
  
//     "cleaner / housekeeper": [
//       [/^basic( home)? cleaning$/i, "basic home cleaning"],
//       [/^deep cleaning$/i, "deep cleaning"],
//       [/^(move-?out|move-?in) cleaning$/i, "move-out/move-in cleaning"],
//       [/^(small|<\s*1000\s*sq.?ft)$/i, "small (<1000 sqft)"],
//       [/^(large|>\s*2500\s*sq.?ft)$/i, "large (>2500 sqft)"],
//     ],
  
//     "pest control / exterminator": [
//       [/^(ants?|roaches?)$/i, "ants/roaches"],
//       [/^rodents?$/i, "rodents"],
//       [/^(termites?|bed ?bugs?)$/i, "termites/bedbugs"],
//       [/^mild infestation$/i, "mild infestation"],
//       [/^severe infestation$/i, "severe infestation"],
//       [/^whole home$/i, "whole home"],
//     ],
  
//     "painter (interior/exterior)": [
//       [/^interior$/i, "interior"],
//       [/^exterior$/i, "exterior"],
//       [/^single room$/i, "single room"],
//       [/^(entire|whole) house$/i, "entire house"],
//       [/^paint match|color match$/i, "paint match"],
//     ],
  
//     "flooring installer / repair": [
//       [/^carpet$/i, "carpet"],
//       [/^(tile|hard ?wood)$/i, "tile/hardwood"],
//       [/^small.*(<\s*200\s*sq.?ft)/i, "small (<200 sqft)"],
//       [/^large.*(>\s*1000\s*sq.?ft)/i, "large (>1000 sqft)"],
//     ],
  
//     "landscaper / lawn care": [
//       [/^(mowing|trim|trimming|edging)/i, "mowing/trimming"],
//       [/^(tree|hedge).*(remove|removal)/i, "tree/hedge removal"],
//       [/^small yard$/i, "small yard"],
//       [/^large (property|acreage)$/i, "large property/acreage"],
//     ],
  
//     "tv mounting / home theater installer": [
//       [/^tv (wall )?mount$/i, "tv wall mount"],
//       [/^home theater setup$/i, "home theater setup"],
//       [/^drywall$/i, "drywall"],
//       [/^(brick|concrete)$/i, "brick/concrete"],
//       [/^over fireplace$/i, "over fireplace"],
//     ],
  
//     "it / wi-fi setup (home networking)": [
//       [/^(wi-?fi|wifi) setup$/i, "wi-fi setup"],
//       [/^network troubleshooting$/i, "network troubleshooting"],
//       [/^smart device integration$/i, "smart device integration"],
//     ],
  
//     "water damage mitigation": [
//       [/^basement$/i, "basement"],
//       [/^(bathroom|kitchen)$/i, "bathroom/kitchen"],
//       [/^minor (leak|damp(ness)?)$/i, "minor leak/dampness"],
//       [/^major flooding$/i, "major flooding"],
//       [/^mold$/i, "mold"],
//     ],
  
//     "general contractor / remodeler": [
//       [/^kitchen$/i, "kitchen"],
//       [/^bath(room)?$/i, "bathroom"],
//       [/^small project$/i, "small project"],
//       [/^(full|whole) house$/i, "full house"],
//     ],
  
//     "insulation / weatherization tech": [
//       [/^attic insulation$/i, "attic insulation"],
//       [/^wall insulation$/i, "wall insulation"],
//       [/^small.*(<\s*1500\s*sq.?ft)/i, "small (<1500 sqft)"],
//       [/^large.*(>\s*2500\s*sq.?ft)/i, "large (>2500 sqft)"],
//     ],
  
//     "window & glass repair": [
//       [/^(window|door) glass$/i, "glass"],
//       [/^(tempered|double pane)$/i, "tempered/double pane"],
//       [/^large$/i, "large"],
//     ],
  
//     "broken windows or doors": [
//       [/^window$/i, "window"],
//       [/^door$/i, "door"],
//       [/^(glass|wood|metal)$/i, "material"],
//     ],
  
//     "garage door technician": [
//       [/^spring$/i, "spring"],
//       [/^opener$/i, "opener"],
//     ],
  
//     "gutter cleaning / repair": [
//       [/^clean(ing)?$/i, "cleaning"],
//       [/^repair$/i, "repair"],
//       [/^(1|one) story$/i, "1 story"],
//       [/^(2|two|second) story$/i, "2 story"],
//     ],
  
//     "tile & grout specialist": [
//       [/^(shower|floor|wall)$/i, "area"],
//       [/^(mold|water) issue$/i, "mold/water"],
//     ],
  
//     "smart-home / low-voltage installer": [
//       [/^single room$/i, "single room"],
//       [/^multi-?room$/i, "multi-room"],
//     ],
  
//     "security system installer": [
//       [/^whole home$/i, "whole home"],
//       [/^partial|select rooms$/i, "partial"],
//     ],
  
//     "deck/patio repair & build": [
//       [/^new build$/i, "new build"],
//       [/^repair$/i, "repair"],
//       [/^small|<\s*200\s*sq.?ft/i, "small"],
//       [/^large|>\s*500\s*sq.?ft/i, "large"],
//     ],
  
//     "masonry / concrete": [
//       [/^(steps?|walkways?)$/i, "steps/walkways"],
//       [/^foundation$/i, "foundation"],
//     ],
  
//     "tree service / arborist": [
//       [/^(small|medium|large)$/i, (m) => m[0].toLowerCase()],
//       [/^near power( lines?)?$/i, "near power"],
//     ],
  
//     "pool & spa technician": [
//       [/^pump$/i, "pump"],
//       [/^heater$/i, "heater"],
//     ],
  
//     "basement waterproofing": [
//       [/^minor$/i, "minor"],
//       [/^(major|severe)$/i, "severe"],
//       [/^>\s*100\s*linear feet|100\+.*linear/i, "100+ lf"],
//     ],
  
//     "window/door replacement (glazier)": [
//       [/^double pane$/i, "double pane"],
//       [/^storm$/i, "storm"],
//     ],
  
//     "solar": [
//       [/^roof$/i, "roof"],
//       [/^ground$/i, "ground"],
//     ],
  
//     "drywall": [
//       [/^(small|medium|large)$/i, (m) => m[0].toLowerCase()],
//     ],
  
//     "appliance failures": [
//       [/^(fridge|refrigerator)$/i, "refrigerator"],
//       [/^dishwasher$/i, "dishwasher"],
//       [/^washer|washing machine$/i, "washer"],
//       [/^dryer$/i, "dryer"],
//       [/^oven|range|stove$/i, "range"],
//       [/^spark|smoke|burnt smell$/i, "spark"],
//       [/^(new|<\s*3\s*yrs)$/i, "<3 yrs"],
//       [/^(old|>\s*10\s*yrs)$/i, "10+ yrs"],
//     ],
  
//     "exterior cleaning": [
//       [/^driveway|patio|deck$/i, "hardscape"],
//       [/^siding|house$/i, "house siding"],
//     ],
  
//     "fencing": [
//       [/^repair$/i, "repair"],
//       [/^replace$/i, "replace"],
//       [/^\s*(\d+)\s*(lf|linear)/i, "linear feet"], // use numeric separately if you capture it
//     ],
  
//     "moving": [
//       [/^stairs?|flights?$/i, "stairs"],
//       [/^(studio|1br|2br|3br|\d+\s*items?)$/i, "size"],
//     ],
  
//     "junk removal": [
//       [/^(\d+)\s*(truck|load)/i, "truckloads"],
//       [/^single item$/i, "single item"],
//       [/^easy access$/i, "easy access"],
//     ],
  
//     /* ===================== AUTO & PERSONAL ===================== */
  
//     "auto": [
//       [/^battery|starter$/i, "battery/starter"],
//       [/^(engine|transmission)$/i, "engine/transmission"],
//       [/^home (driveway|garage)$/i, "home driveway"],
//       [/^highway|remote$/i, "highway/remote"],
//     ],
  
//     "auto detailing": [
//       [/^interior only$/i, "interior"],
//       [/^exterior only$/i, "exterior"],
//       [/^full (detail|interior)$/i, "full interior"],
//       [/^(sedan|suv|truck)$/i, (m) => m[0].toLowerCase()],
//     ],
  
//     "tow truck / roadside assistance": [
//       [/^no start|stuck$/i, "no start/stuck"],
//       [/^highway|remote$/i, "highway/remote"],
//     ],
  
//     "auto glass repair/replacement": [
//       [/^windshield$/i, "windshield"],
//       [/^side$/i, "side"],
//       [/^rear$/i, "rear"],
//       [/^calibration|required$/i, "adas calibration"],
//     ],
  
//     "mobile mechanic": [
//       [/^battery|starter$/i, "battery/starter"],
//       [/^(engine|transmission)$/i, "engine/transmission"],
//       [/^home driveway$/i, "home driveway"],
//     ],
  
//     "mobile tire service": [
//       [/^all four$/i, "all four"],
//       [/^single(s)?|one tire$/i, "single"],
//     ],
  
//     "barber / hairdresser": [
//       [/^wedding|event$/i, "event"],
//     ],
  
//     /* ===================== GENERIC ===================== */
//     "generic": [
//       [/^unknown|not sure$/i, "unknown"],
//       [/^yes$/i, "yes"],
//       [/^no$/i, "no"],
//     ],
//   };

// /** Build ordered regex maps for a given service */
// function buildQuestionMap(service) {
//     const byService = QUESTION_ALIASES[service] || [];
//     const common = QUESTION_ALIASES.default || [];
//     // Service-specific patterns first, then generic
//     return [...byService, ...common].map(([rx, canon]) => [rx, canon]);
//   }
  
//   /** Normalize ONE question label to its canonical lowercase key */
//   export function normalizeQuestion(service, rawQuestion) {
//     const q = String(rawQuestion || "").trim();
//     const maps = buildQuestionMap(service);
//     for (const [rx, canon] of maps) {
//       if (rx.test(q)) return canon; // already canonical lowercase
//     }
//     // fallback: lowercase plain text
//     return q.toLowerCase();
//   }
  
//   /** Normalize ONE answer/option to its canonical lowercase value */
//   export function normalizeAnswer(_service, canonicalQuestionKey, rawAnswer) {
//     const a = String(rawAnswer || "").trim();
//     const key = String(canonicalQuestionKey || "").toLowerCase();
//     const aliases = OPTION_ALIASES[key];
//     if (aliases) {
//       for (const [rx, canonVal] of aliases) {
//         if (rx.test(a)) return canonVal; // canonical lowercase
//       }
//     }
//     return a.toLowerCase();
//   }
  
//   /** Normalize all incoming details => { [canonicalQuestionKey]: canonicalOptionValue } */
//   export function normalizeDetails(service, details = {}) {
//     const entries = Object.entries(details || {});
//     const maps = buildQuestionMap(service); // array of [regex, canonicalKey]
//     const out = {};
  
//     for (const [rawQ, rawA] of entries) {
//       // map question to canonical key
//       let key = null;
//       for (const [rx, canon] of maps) {
//         if (rx.test(rawQ)) { key = canon; break; }
//       }
//       if (!key) key = String(rawQ || "").trim().toLowerCase();
  
//       // map option to canonical value (if we have aliases)
//       let val = String(rawA || "").trim();
//       const optAliases = OPTION_ALIASES[key];
//       if (optAliases) {
//         for (const [rx, canonVal] of optAliases) {
//           if (rx.test(val)) { val = canonVal; break; }
//         }
//       } else {
//         val = val.toLowerCase();
//       }
//       out[key] = val;
//     }
//     return out;
//   }


  // backend/utils/normalizer.js

// Small helper used for map keys
const strip = s => String(s || "")
.toLowerCase()
.replace(/\s+/g, " ")
.replace(/[^\w\s/+-]/g, "")
.trim();

/* -----------------------------------------------------------
 1) Map resolved services → question groups used below
 ----------------------------------------------------------- */
const SERVICE_TO_QGROUP = {
// Core trades (resolved anchors → groups)
"burst or leaking pipes": "plumbing",
"sewer backups or clogged drains": "plumbing",
"water heater failure": "plumbing",
"gas leaks": "plumbing",

"roof leaks or storm damage": "roofing",
"hvac system failure": "hvac",
"select electrical issues below": "electrician",

// If you pass a group/service name directly, use it as-is:
"plumbing": "plumbing",
"roofing": "roofing",
"hvac": "hvac",
"electrician": "electrician",

// Home services — keys match your QUESTION_ALIASES keys already
"handyman (general fixes)": "handyman (general fixes)",
"locksmith": "locksmith",
"cleaner / housekeeper": "cleaner / housekeeper",
"flooring installer / repair": "flooring installer / repair",
"painter (interior/exterior)": "painter (interior/exterior)",
"pest control / exterminator": "pest control / exterminator",
"landscaper / lawn care": "landscaper / lawn care",
"tile & grout specialist": "tile & grout specialist",
"smart-home / low-voltage installer": "smart-home / low-voltage installer",
"security system installer": "security system installer",
"it / wi-fi setup (home networking)": "it / wi-fi setup (home networking)",
"tv mounting / home theater installer": "tv mounting / home theater installer",
"water damage mitigation": "water damage mitigation",
"general contractor / remodeler": "general contractor / remodeler",
"insulation / weatherization tech": "insulation / weatherization tech",
"masonry / concrete": "masonry / concrete",
"gutter cleaning / repair": "gutter cleaning / repair",
"window & glass repair": "window & glass repair",
"broken windows or doors": "broken windows or doors",
"garage door technician": "garage door technician",
"carpenter (doors/trim/cabinets)": "carpenter (doors/trim/cabinets)",
"deck/patio repair & build": "deck/patio repair & build",
"pool & spa technician": "pool & spa technician",
"tree service / arborist": "tree service / arborist",
"basement waterproofing": "basement waterproofing",
"window/door replacement (glazier)": "window/door replacement (glazier)",
"solar": "solar",
"drywall": "drywall",
"appliance failures": "appliance failures",
"water & mold remediation": "water & mold remediation",
"exterior cleaning": "exterior cleaning",
"fencing": "fencing",
"moving": "moving",
"junk removal": "junk removal",

// Auto & personal
"auto": "auto",
"auto detailing": "auto detailing",
"tow truck / roadside assistance": "tow truck / roadside assistance",
"auto glass repair/replacement": "auto glass repair/replacement",
"mobile mechanic": "mobile mechanic",
"mobile tire service": "mobile tire service",
"barber / hairdresser": "barber / hairdresser",
};

/* -----------------------------------------------------------
 2) Your alias tables (as you provided)
 ----------------------------------------------------------- */
export const QUESTION_ALIASES = {
/* ===================== CORE TRADES ===================== */

"plumbing": [
  [/^where.*(plumb|issue).*located/i, "location"],
  [/^(room|area)$/i, "location"],
  [/^severity/i, "severity"],
  [/^access(ibility)?|behind (wall|ceiling)|in wall|in ceiling/i, "access"],
  [/^leak.*how long|how long.*leak/i, "leak.duration"],
  [/^still leaking/i, "leak.active"],
],

"roofing": [
  [/^which roofing issue|^issue.*roof/i, "roof.issue"],
  [/^roof material$|^material$/i, "roof.material"],
  [/^access$|^accessibility|^is roof.*accessible/i, "access"],
  [/^size.*(damaged|area)|^area size$/i, "area.size"],
  [/^interior damage$/i, "interior.damage"],
  [/^roof pitch|steep/i, "roof.pitch"],
],

"hvac": [
  [/^system type/i, "system.type"],
  [/^what.?s the problem|problem type|symptom/i, "problem.type"],
  [/^urgency|priority/i, "urgency"],
  [/^age.*system/i, "system.age"],
],

"electrician": [
  [/^type of issue/i, "issue.type"],
  [/^scope of work/i, "scope"],
  [/^access(ibility)?/i, "access"],
  [/^panel|attic/i, "access.detail"],
],

/* ===================== HOME SERVICES ===================== */
"handyman (general fixes)": [
  [/^what type of repair|repair type/i, "repair.type"],
  [/^size of job|job size|hours?/i, "job.size"],
],
"locksmith": [
  [/^lockout/i, "lockout.type"],
  [/^lock type|type of lock/i, "lock.type"],
],
"cleaner / housekeeper": [
  [/^type of cleaning/i, "cleaning.type"],
  [/^size of home|home size|sq.?ft/i, "home.size"],
  [/^frequency/i, "cleaning.frequency"],
],
"flooring installer / repair": [
  [/^type of flooring|floor type/i, "floor.type"],
  [/^size of job|area size|sq.?ft/i, "job.size"],
  [/^remove old/i, "tearout"],
],
"painter (interior/exterior)": [
  [/^type of painting/i, "painting.type"],
  [/^size of job|scope|rooms?/i, "job.size"],
  [/^paint match|color match/i, "paint.match"],
],
"pest control / exterminator": [
  [/^type of pest/i, "pest.type"],
  [/^severity/i, "severity"],
  [/^area.*affected|whole home/i, "coverage"],
],
"landscaper / lawn care": [
  [/^type of work/i, "work.type"],
  [/^property size|lot size/i, "property.size"],
],
"tile & grout specialist": [
  [/^issue type|problem/i, "issue.type"],
  [/^area size|sq.?ft/i, "area.size"],
  [/^mold|water/i, "moisture.flag"],
],
"smart-home / low-voltage installer": [
  [/^scope|system type|devices?/i, "system.scope"],
  [/^rooms|multi-?room/i, "rooms.count"],
],
"security system installer": [
  [/^system type/i, "system.type"],
  [/^coverage|whole home/i, "coverage"],
],
"it / wi-fi setup (home networking)": [
  [/^issue type|problem/i, "it.issue"],
  [/^sq.?ft|home size/i, "home.size"],
  [/^devices? count|how many devices/i, "devices.count"],
],
"tv mounting / home theater installer": [
  [/^service type/i, "service.type"],
  [/^wall type/i, "wall.type"],
  [/^tv size/i, "tv.size"],
  [/^over fireplace/i, "mount.over_fireplace"],
],
"water damage mitigation": [
  [/^where.*water damage|location/i, "location"],
  [/^severity/i, "severity"],
  [/^mold/i, "mold.flag"],
],
"general contractor / remodeler": [
  [/^type of remodel/i, "remodel.area"],
  [/^size of remodel|scope/i, "remodel.size"],
],
"insulation / weatherization tech": [
  [/^service type/i, "service.type"],
  [/^home size|sq.?ft/i, "home.size"],
  [/^attic|crawl|walls?/i, "insulation.area"],
],
"masonry / concrete": [
  [/^work type/i, "work.type"],
  [/^area|steps|walkways|foundation/i, "work.area"],
],
"gutter cleaning / repair": [
  [/^service type/i, "service.type"],
  [/^stories?|story count/i, "property.stories"],
],
"window & glass repair": [
  [/^issue type/i, "issue.type"],
  [/^glass type|tempered|double pane/i, "glass.type"],
  [/^size|dimensions/i, "glass.size"],
],
"broken windows or doors": [
  [/^issue type/i, "issue.type"],
  [/^material|glass type/i, "material.type"],
],
"garage door technician": [
  [/^issue type/i, "issue.type"],
  [/^opener|spring/i, "component"],
],
"carpenter (doors/trim/cabinets)": [
  [/^work type|repair type/i, "work.type"],
  [/^custom|built-?in/i, "custom.flag"],
],
"deck/patio repair & build": [
  [/^work type/i, "work.type"],
  [/^new build|repair/i, "job.kind"],
  [/^size|sq.?ft/i, "area.size"],
],
"pool & spa technician": [
  [/^issue type/i, "issue.type"],
  [/^equipment|pump|heater/i, "equipment.type"],
],
"tree service / arborist": [
  [/^tree size|height/i, "tree.size"],
  [/^near power|proximity/i, "proximity.hazard"],
],
"basement waterproofing": [
  [/^severity|water level/i, "severity"],
  [/^area size|linear feet/i, "area.size"],
],
"window/door replacement (glazier)": [
  [/^window|door count|openings/i, "openings.count"],
  [/^double pane|storm/i, "glass.option"],
],
"solar": [
  [/^project type|roof vs ground/i, "project.type"],
  [/^system size|kw/i, "system.size"],
],
"drywall": [
  [/^issue type|holes?|cracks?/i, "issue.type"],
  [/^area size|sq.?ft/i, "area.size"],
],
"appliance failures": [
  [/^appliance type/i, "appliance.type"],
  [/^symptom|issue/i, "appliance.issue"],
  [/^age/i, "appliance.age"],
],
"water & mold remediation": [
  [/^location/i, "location"],
  [/^mold/i, "mold.flag"],
  [/^severity/i, "severity"],
],
"exterior cleaning": [
  [/^surface|what to wash/i, "surface.type"],
  [/^size|sq.?ft/i, "area.size"],
],
"fencing": [
  [/^repair or replace|work type/i, "work.type"],
  [/^linear feet|length/i, "fence.length"],
],
"moving": [
  [/^flights|stairs?/i, "stairs"],
  [/^size|number of items/i, "move.size"],
],
"junk removal": [
  [/^truckloads?|volume|how much/i, "volume"],
  [/^access|stairs?/i, "access"],
],

/* ===================== GENERIC / FALLBACK ===================== */
"generic": [
  [/^severity/i, "severity"],
  [/^access(ibility)?/i, "access"],
  [/^size|sq.?ft/i, "area.size"],
  [/^location|where/i, "location"],
  [/^type|issue|problem/i, "issue.type"],
],
};

export const OPTION_ALIASES = {
    /* ===================== CORE TRADES ===================== */
  
    "plumbing": [
      // location
      [/^kitchen$/i, "kitchen"],
      [/^bath(room)?$/i, "bathroom"],
      [/^(laundry|utility)/i, "laundry"],
      [/^outside|outdoor/i, "outdoor"],
      // severity
      [/^minor( leak| drip)?$/i, "minor leak/drip"],
      [/^(major|severe).*(leak|flood)/i, "major leak/flooding"],
      // access
      [/^easy( access)?$/i, "easy access"],
      [/^(behind|in) (wall|ceiling)$/i, "behind wall/ceiling"],
      [/^crawl ?space$/i, "crawl space"],
      // misc
      [/^still leaking$/i, "still leaking"],
      [/^(yes|y)$/i, "yes"],
      [/^(no|n)$/i, "no"],
      [/^unknown|not sure$/i, "unknown"],
    ],
  
    "roofing": [
      // issue
      [/^roof( leaks?)?|leak/i, "roof leak"],
      [/^storm damage$/i, "storm damage"],
      // material
      [/^shingle(s)?$/i, "shingles"],
      [/^(tile|clay|concrete tile)$/i, "tile"],
      [/^metal$/i, "metal"],
      [/^flat$/i, "flat"],
      // area size
      [/^small.*(<|under).*(5|5ft|5 ft)/i, "small patch (<5 ft²)"],
      [/^large.*(>|over).*(20|20ft|20 ft)/i, "large section (>20 ft²)"],
      // access / stories / pitch
      [/^yes(,)? single story|^single story$/i, "single story"],
      [/^(second|2nd) story$/i, "second story"],
      [/^steep$/i, "steep"],
      [/^difficult access|steep.*|2(nd)? story/i, "difficult access (steep/2nd story)"],
      [/^easy access|ground access$/i, "yes, single story"],
      // interior
      [/^interior damage$/i, "interior damage"],
    ],
  
    "hvac": [
      // system type
      [/^central ?a\.?c\.?$|^ac$/i, "central ac"],
      [/^(heating|furnace|heater)$/i, "heating/furnace"],
      // problems
      [/^not (cooling|heating)$/i, "not cooling/heating"],
      [/^(strange|weird).*noise|smell/i, "strange noises/smell"],
      // urgency
      [/^comfort issue$/i, "comfort issue"],
      [/^(system )?completely down$/i, "system completely down"],
    ],
  
    "electrician": [
      // issue type
      [/^outlet not working$/i, "outlet not working"],
      [/^breaker tripp?ing$/i, "breaker tripping"],
      // scope
      [/^single (outlet|fixture)$/i, "single outlet/fixture"],
      [/^multiple circuits?$/i, "multiple circuits"],
      // access
      [/^easy access$/i, "easy access"],
      [/^(panel|attic) work$/i, "panel or attic work"],
    ],
  
    /* ===================== HOME SERVICES ===================== */
  
    "handyman (general fixes)": [
      [/^(furniture|fixtures?)$/i, "furniture/fixtures"],
      [/^(doors?|windows?)$/i, "doors/windows"],
      [/^small.*(under ?1 ?hour)/i, "small (under 1 hour)"],
      [/^(larger|big).*?(2\+|over 2) hours?/i, "larger project (2+ hours)"],
    ],
  
    "locksmith": [
      [/^home lockout$/i, "home lockout"],
      [/^car lockout$/i, "car lockout"],
      [/^standard lock$/i, "standard lock"],
      [/^(high-?security|smart) lock$/i, "high-security/smart lock"],
    ],
  
    "cleaner / housekeeper": [
      [/^basic( home)? cleaning$/i, "basic home cleaning"],
      [/^deep cleaning$/i, "deep cleaning"],
      [/^(move-?out|move-?in) cleaning$/i, "move-out/move-in cleaning"],
      [/^(small|<\s*1000\s*sq.?ft)$/i, "small (<1000 sqft)"],
      [/^(large|>\s*2500\s*sq.?ft)$/i, "large (>2500 sqft)"],
    ],
  
    "pest control / exterminator": [
      [/^(ants?|roaches?)$/i, "ants/roaches"],
      [/^rodents?$/i, "rodents"],
      [/^(termites?|bed ?bugs?)$/i, "termites/bedbugs"],
      [/^mild infestation$/i, "mild infestation"],
      [/^severe infestation$/i, "severe infestation"],
      [/^whole home$/i, "whole home"],
    ],
  
    "painter (interior/exterior)": [
      [/^interior$/i, "interior"],
      [/^exterior$/i, "exterior"],
      [/^single room$/i, "single room"],
      [/^(entire|whole) house$/i, "entire house"],
      [/^paint match|color match$/i, "paint match"],
    ],
  
    "flooring installer / repair": [
      [/^carpet$/i, "carpet"],
      [/^(tile|hard ?wood)$/i, "tile/hardwood"],
      [/^small.*(<\s*200\s*sq.?ft)/i, "small (<200 sqft)"],
      [/^large.*(>\s*1000\s*sq.?ft)/i, "large (>1000 sqft)"],
    ],
  
    "landscaper / lawn care": [
      [/^(mowing|trim|trimming|edging)/i, "mowing/trimming"],
      [/^(tree|hedge).*(remove|removal)/i, "tree/hedge removal"],
      [/^small yard$/i, "small yard"],
      [/^large (property|acreage)$/i, "large property/acreage"],
    ],
  
    "tv mounting / home theater installer": [
      [/^tv (wall )?mount$/i, "tv wall mount"],
      [/^home theater setup$/i, "home theater setup"],
      [/^drywall$/i, "drywall"],
      [/^(brick|concrete)$/i, "brick/concrete"],
      [/^over fireplace$/i, "over fireplace"],
    ],
  
    "it / wi-fi setup (home networking)": [
      [/^(wi-?fi|wifi) setup$/i, "wi-fi setup"],
      [/^network troubleshooting$/i, "network troubleshooting"],
      [/^smart device integration$/i, "smart device integration"],
    ],
  
    "water damage mitigation": [
      [/^basement$/i, "basement"],
      [/^(bathroom|kitchen)$/i, "bathroom/kitchen"],
      [/^minor (leak|damp(ness)?)$/i, "minor leak/dampness"],
      [/^major flooding$/i, "major flooding"],
      [/^mold$/i, "mold"],
    ],
  
    "general contractor / remodeler": [
      [/^kitchen$/i, "kitchen"],
      [/^bath(room)?$/i, "bathroom"],
      [/^small project$/i, "small project"],
      [/^(full|whole) house$/i, "full house"],
    ],
  
    "insulation / weatherization tech": [
      [/^attic insulation$/i, "attic insulation"],
      [/^wall insulation$/i, "wall insulation"],
      [/^small.*(<\s*1500\s*sq.?ft)/i, "small (<1500 sqft)"],
      [/^large.*(>\s*2500\s*sq.?ft)/i, "large (>2500 sqft)"],
    ],
  
    "window & glass repair": [
      [/^(window|door) glass$/i, "glass"],
      [/^(tempered|double pane)$/i, "tempered/double pane"],
      [/^large$/i, "large"],
    ],
  
    "broken windows or doors": [
      [/^window$/i, "window"],
      [/^door$/i, "door"],
      [/^(glass|wood|metal)$/i, "material"],
    ],
  
    "garage door technician": [
      [/^spring$/i, "spring"],
      [/^opener$/i, "opener"],
    ],
  
    "gutter cleaning / repair": [
      [/^clean(ing)?$/i, "cleaning"],
      [/^repair$/i, "repair"],
      [/^(1|one) story$/i, "1 story"],
      [/^(2|two|second) story$/i, "2 story"],
    ],
  
    "tile & grout specialist": [
      [/^(shower|floor|wall)$/i, "area"],
      [/^(mold|water) issue$/i, "mold/water"],
    ],
  
    "smart-home / low-voltage installer": [
      [/^single room$/i, "single room"],
      [/^multi-?room$/i, "multi-room"],
    ],
  
    "security system installer": [
      [/^whole home$/i, "whole home"],
      [/^partial|select rooms$/i, "partial"],
    ],
  
    "deck/patio repair & build": [
      [/^new build$/i, "new build"],
      [/^repair$/i, "repair"],
      [/^small|<\s*200\s*sq.?ft/i, "small"],
      [/^large|>\s*500\s*sq.?ft/i, "large"],
    ],
  
    "masonry / concrete": [
      [/^(steps?|walkways?)$/i, "steps/walkways"],
      [/^foundation$/i, "foundation"],
    ],
  
    "tree service / arborist": [
      [/^(small|medium|large)$/i, (m) => m[0].toLowerCase()],
      [/^near power( lines?)?$/i, "near power"],
    ],
  
    "pool & spa technician": [
      [/^pump$/i, "pump"],
      [/^heater$/i, "heater"],
    ],
  
    "basement waterproofing": [
      [/^minor$/i, "minor"],
      [/^(major|severe)$/i, "severe"],
      [/^>\s*100\s*linear feet|100\+.*linear/i, "100+ lf"],
    ],
  
    "window/door replacement (glazier)": [
      [/^double pane$/i, "double pane"],
      [/^storm$/i, "storm"],
    ],
  
    "solar": [
      [/^roof$/i, "roof"],
      [/^ground$/i, "ground"],
    ],
  
    "drywall": [
      [/^(small|medium|large)$/i, (m) => m[0].toLowerCase()],
    ],
  
    "appliance failures": [
      [/^(fridge|refrigerator)$/i, "refrigerator"],
      [/^dishwasher$/i, "dishwasher"],
      [/^washer|washing machine$/i, "washer"],
      [/^dryer$/i, "dryer"],
      [/^oven|range|stove$/i, "range"],
      [/^spark|smoke|burnt smell$/i, "spark"],
      [/^(new|<\s*3\s*yrs)$/i, "<3 yrs"],
      [/^(old|>\s*10\s*yrs)$/i, "10+ yrs"],
    ],
  
    "exterior cleaning": [
      [/^driveway|patio|deck$/i, "hardscape"],
      [/^siding|house$/i, "house siding"],
    ],
  
    "fencing": [
      [/^repair$/i, "repair"],
      [/^replace$/i, "replace"],
      [/^\s*(\d+)\s*(lf|linear)/i, "linear feet"], // use numeric separately if you capture it
    ],
  
    "moving": [
      [/^stairs?|flights?$/i, "stairs"],
      [/^(studio|1br|2br|3br|\d+\s*items?)$/i, "size"],
    ],
  
    "junk removal": [
      [/^(\d+)\s*(truck|load)/i, "truckloads"],
      [/^single item$/i, "single item"],
      [/^easy access$/i, "easy access"],
    ],
  
    /* ===================== AUTO & PERSONAL ===================== */
  
    "auto": [
      [/^battery|starter$/i, "battery/starter"],
      [/^(engine|transmission)$/i, "engine/transmission"],
      [/^home (driveway|garage)$/i, "home driveway"],
      [/^highway|remote$/i, "highway/remote"],
    ],
  
    "auto detailing": [
      [/^interior only$/i, "interior"],
      [/^exterior only$/i, "exterior"],
      [/^full (detail|interior)$/i, "full interior"],
      [/^(sedan|suv|truck)$/i, (m) => m[0].toLowerCase()],
    ],
  
    "tow truck / roadside assistance": [
      [/^no start|stuck$/i, "no start/stuck"],
      [/^highway|remote$/i, "highway/remote"],
    ],
  
    "auto glass repair/replacement": [
      [/^windshield$/i, "windshield"],
      [/^side$/i, "side"],
      [/^rear$/i, "rear"],
      [/^calibration|required$/i, "adas calibration"],
    ],
  
    "mobile mechanic": [
      [/^battery|starter$/i, "battery/starter"],
      [/^(engine|transmission)$/i, "engine/transmission"],
      [/^home driveway$/i, "home driveway"],
    ],
  
    "mobile tire service": [
      [/^all four$/i, "all four"],
      [/^single(s)?|one tire$/i, "single"],
    ],
  
    "barber / hairdresser": [
      [/^wedding|event$/i, "event"],
    ],
  
    /* ===================== GENERIC ===================== */
    "generic": [
      [/^unknown|not sure$/i, "unknown"],
      [/^yes$/i, "yes"],
      [/^no$/i, "no"],
    ],
  };

/* -----------------------------------------------------------
 3) Helpers
 ----------------------------------------------------------- */
function serviceToQGroup(service) {
const s = strip(service);
return SERVICE_TO_QGROUP[s] || s || "generic";
}

function buildQuestionMap(service) {
const group = serviceToQGroup(service);
const byService = QUESTION_ALIASES[group] || [];
const common = QUESTION_ALIASES["generic"] || [];   // <- FIXED (not "default")
return [...byService, ...common]; // [ [rx, canon], ... ]
}

/* -----------------------------------------------------------
 4) Public API
 ----------------------------------------------------------- */
export function normalizeQuestion(service, rawQuestion) {
const q = String(rawQuestion || "").trim();
for (const [rx, canon] of buildQuestionMap(service)) {
  if (rx.test(q)) return canon; // canonical (lowercase dot-keys)
}
return q.toLowerCase();
}

export function normalizeAnswer(service, canonicalQuestionKey, rawAnswer) {
const a = String(rawAnswer || "").trim();
const group = serviceToQGroup(service);
const svcAliases = OPTION_ALIASES[group] || [];
const common = OPTION_ALIASES["generic"] || [];

for (const [rx, canonVal] of [...svcAliases, ...common]) {
  if (rx.test(a)) return typeof canonVal === "function" ? canonVal(a.match(rx)) : canonVal;
}
return a.toLowerCase();
}

export function normalizeDetails(service, details = {}) {
const out = {};
for (const [rawQ, rawA] of Object.entries(details || {})) {
  const key = normalizeQuestion(service, rawQ);                // canonical key
  const val = normalizeAnswer(service, key, rawA);             // canonical value
  out[key] = val;
}
return out;
}
