
// export const MATRIX = [
//     /* ================== CORE TRADES ================== */
//     // Plumbing
//     { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//     { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
//     { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
//     { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
//     { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
//     { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
//     { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
//     { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//     { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
//     { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
//     { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
//     { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//     { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
//     { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },
  
//     // Roofing
//     { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
//     { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
//     { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
//     { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//     { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//     { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//     { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//     { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
//     { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },
  
//     // HVAC
//     { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
//     { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
//     { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
//     { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
//     { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//     { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//     { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
//     { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
//     { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//     { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },
  
//     // Electrician
//     { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
//     { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
//     { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
//     { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
//     { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 0 },
//     { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//     { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
//     { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//     { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },
  
//     // Handyman
//     { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
//     { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
//     { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
//     { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
//     { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
//     { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },
  
//     // Locksmith
//     { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
//     { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
//     { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
//     { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
//     { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },
  
//     // Cleaning
//     { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
//     { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
//     { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },
  
//     // Painting
//     { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//     { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//     { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
//     { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
//     { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
//     { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
//     { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
//     { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
//     { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },
  
//     // Landscaping
//     { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
//     { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
//     { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
//     { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//     { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//     { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
//     { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },
  
//     /* ================== AUTO ================== */
//     { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
//     { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
//     { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
//     { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
//     { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },
//     { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 35 },
  
//     { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
//     { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
//     { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
//     { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//     { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
//     { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },
  
//     { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
//     { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
//     { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },
  
//     // Pest
//     { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
//     { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 75 },
//     { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 100 },
//     { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 50 },
//     { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 50 },
//     { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
//     { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 0 },
  
//     // Consulting / Estimating
//     { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 0 },
//     { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
//     { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
//   ];
  
//   /* ---------- helpers ---------- */
//   const slug = (s) =>
//     String(s || "")
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, " ")
//       .replace(/[^a-z0-9]+/g, "_")
//       .replace(/^_+|_+$/g, "");
  
//   /* Build all artifacts from MATRIX */
//   export function buildArtifacts(matrix = MATRIX) {
//     const questions = {};
//     const pricing = {};
//     const serviceAlias = {
//       // cross-service renames (UI → MATRIX)
//       "Handyman (general fixes)": "Handyman",
//       "Tow Truck / Roadside Assistance": "Roadside Service",
//       "Car Mechanic (general)": "Mobile Mechanic",
//       "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
//     };
  
//     // identity-map all services to themselves
//     for (const row of matrix) {
//       if (row.Service && !(row.Service in serviceAlias)) {
//         serviceAlias[row.Service] = row.Service;
//       }
//     }
  
//     // questions/pricing
//     for (const row of matrix) {
//       const { Service, Question, Option, Adjustment } = row;
  
//       questions[Service] ??= [];
//       pricing[Service] ??= {};
  
//       const qKey = slug(Question);
//       const oKey = slug(Option);
  
//       let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//       if (!qObj) {
//         qObj = {
//           id: questions[Service].length + 1,
//           question: Question,
//           type: "multiple",
//           options: [],
//         };
//         questions[Service].push(qObj);
//       }
//       if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//         qObj.options.push({ value: Option, label: String(Option) });
//       }
//       (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
//     }
  
//     // categories (simple, editable)
//     const serviceToCategory = {
//       "Plumbing": "Plumbing",
//       "Roofing": "Roofing",
//       "HVAC": "HVAC",
//       "Electrician": "Electrician",
//       "Handyman": "Handyman",
//       "Locksmith": "Locksmith",
//       "Cleaner / Housekeeper": "Cleaning",
//       "Mobile Mechanic": "Auto",
//       "Pest Control / Exterminator": "Pest Control",
//       "Painter (interior/exterior)": "Painting",
//       "Landscaper / Lawn Care": "Landscaping",
//       "Car Detailing (mobile)": "Auto",
//       "Roadside Service": "Auto",
//       "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
//     };
  
//     // base price anchors used by FE previews (server can have its own)
//     const basePrice = {
//       "Plumbing": 0,
//       "Roofing": 0,
//       "HVAC": 0,
//       "Electrician": 0,
//       "Handyman": 0,
//       "Locksmith": 0,
//       "Cleaner / Housekeeper": 0,
//       "Roadside Service": 0,
//       "Mobile Mechanic": 0,
//       "Pest Control / Exterminator": 0,
//       "Painter (interior/exterior)": 0,
//       "Landscaper / Lawn Care": 0,
//       "General Contractor (Consulting/Estimating)": 0,
//       "Car Detailing (mobile)": 0,
//     };
//     // const basePrice = {
//     //   "Plumbing": 175,
//     //   "Roofing": 250,
//     //   "HVAC": 200,
//     //   "Electrician": 200,
//     //   "Handyman": 125,
//     //   "Locksmith": 120,
//     //   "Cleaner / Housekeeper": 125,
//     //   "Roadside Service": 100,
//     //   "Mobile Mechanic": 125,
//     //   "Pest Control / Exterminator": 150,
//     //   "Painter (interior/exterior)": 200,
//     //   "Landscaper / Lawn Care": 50,
//     //   "General Contractor (Consulting/Estimating)": 0,
//     //   "Car Detailing (mobile)": 50,
//     // };
  
//     return { questions, pricing, serviceAlias, serviceToCategory, basePrice };
//   }
  
//   /* Prebuilt artifacts (most callers can just import these) */
//   export const ART = buildArtifacts(MATRIX);
//   export const questions = ART.questions;
//   export const pricing = ART.pricing;
//   export const serviceAlias = ART.serviceAlias;
//   export const SERVICE_TO_CATEGORY = ART.serviceToCategory;
//   export const BASE_PRICE = ART.basePrice;
  



export const MATRIX = [
    /* ================== CORE TRADES ================== */
    // Plumbing
    { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
    { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
    { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
    { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
    { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
    { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
    { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
    { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
    { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
    { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
    { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
    { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
    { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
    { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },
  
    // Roofing
    { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
    { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
    { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
    { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
    { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
    { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
    { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
    { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
    { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },
  
    // HVAC
    { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
    { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
    { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
    { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
    { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
    { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
    { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
    { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
    { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
    { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },
  
    // Electrician
    { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
    { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
    { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
    { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
    { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 0 },
    { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
    { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
    { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
    { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },
  
    // Handyman
    { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
    { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
    { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
    { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
    { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
    { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },
  
    // Locksmith
    { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 10 },
    { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 5 },
    { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 5 },
    { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 10 },
    { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 15 },
  
    // Cleaning
    { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
    { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
    { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },
  
    // Painting
    { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
    { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
    { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
    { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
    { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
    { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
    { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
    { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
    { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },
  
    // Landscaping
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
    { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
    { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
    { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },
  
    /* ================== AUTO ================== */
    { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
    { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
    { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
    { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
    { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },
    { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 35 },
  
    { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
    { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
    { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
    { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
    { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
    { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },
  
    { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
    { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
    { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },
  
    // Pest
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 5 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 15 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 15 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 10 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 10 },
    { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 5 },
    { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 10 },
  
    // Consulting / Estimating
    { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 200 },
    { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
    { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
  ];
  
  /* ---------- helpers ---------- */
  const slug = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  
  /* Build all artifacts from MATRIX */
  export function buildArtifacts(matrix = MATRIX) {
    const questions = {};
    const pricing = {};
    const serviceAlias = {
      // cross-service renames (UI → MATRIX)
      "Handyman (general fixes)": "Handyman",
      "Tow Truck / Roadside Assistance": "Roadside Service",
      "Car Mechanic (general)": "Mobile Mechanic",
      "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
    };
  
    // identity-map all services to themselves
    for (const row of matrix) {
      if (row.Service && !(row.Service in serviceAlias)) {
        serviceAlias[row.Service] = row.Service;
      }
      // case-insensitive convenience
      if (row.Service && !(row.Service.toLowerCase() in serviceAlias)) {
        serviceAlias[row.Service.toLowerCase()] = row.Service;
      }
    }
  
    // questions/pricing (service-level)
    for (const row of matrix) {
      const { Service, Question, Option, Adjustment } = row;
  
      questions[Service] ??= [];
      pricing[Service] ??= {};
  
      const qKey = slug(Question);
      const oKey = slug(Option);
  
      let qObj = questions[Service].find((q) => slug(q.question) === qKey);
      if (!qObj) {
        qObj = {
          id: questions[Service].length + 1,
          question: Question,
          type: "multiple",
          options: [],
        };
        questions[Service].push(qObj);
      }
      if (!qObj.options.find((o) => slug(o.value) === oKey)) {
        qObj.options.push({ value: Option, label: String(Option) });
      }
      (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
    }
  
    // categories (simple, editable)
    const serviceToCategory = {
      "Plumbing": "Plumbing",
      "Roofing": "Roofing",
      "HVAC": "HVAC",
      "Electrician": "Electrician",
      "Handyman": "Handyman",
      "Locksmith": "Locksmith",
      "Cleaner / Housekeeper": "Cleaning",
      "Mobile Mechanic": "Auto",
      "Pest Control / Exterminator": "Pest Control",
      "Painter (interior/exterior)": "Painting",
      "Landscaper / Lawn Care": "Landscaping",
      "Car Detailing (mobile)": "Auto",
      "Roadside Service": "Auto",
      "General Contractor":"General Contractor (Consulting/Estimating)",
    };
  
    // Build category → services map
    const categoryServices = {};
    for (const { Service } of matrix) {
      const cat = serviceToCategory[Service] || "Other";
      categoryServices[cat] ??= new Set();
      categoryServices[cat].add(Service);
    }
  
    // Inject a “chooser” question under each CATEGORY key
    for (const [cat, svcs] of Object.entries(categoryServices)) {
      questions[cat] = [
        {
          id: 1,
          question: `Which ${cat.toLowerCase()} issue are you experiencing?`,
          type: "multiple",
          options: Array.from(svcs).map((svc) => ({
            value: svc,
            label: String(svc),
          })),
          isServiceChooser: true,
        },
      ];
    }
  
    // base price anchors used by FE previews (server can have its own)
    const basePrice = {
      "Plumbing": 0,
      "Roofing": 0,
      "HVAC": 0,
      "Electrician": 0,
      "Handyman": 0,
      "Locksmith": 0,
      "Cleaner / Housekeeper": 0,
      "Roadside Service": 0,
      "Mobile Mechanic": 0,
      "Pest Control / Exterminator": 0,
      "Painter (interior/exterior)": 0,
      "Landscaper / Lawn Care": 0,
      "General Contractor (Consulting/Estimating)": 0,
      "Car Detailing (mobile)": 0,
    };


//     // const basePrice = {
//     //   "Plumbing": 175,
//     //   "Roofing": 250,
//     //   "HVAC": 200,
//     //   "Electrician": 200,
//     //   "Handyman": 125,
//     //   "Locksmith": 120,
//     //   "Cleaner / Housekeeper": 125,
//     //   "Roadside Service": 100,
//     //   "Mobile Mechanic": 125,
//     //   "Pest Control / Exterminator": 150,
//     //   "Painter (interior/exterior)": 200,
//     //   "Landscaper / Lawn Care": 50,
//     //   "General Contractor (Consulting/Estimating)": 0,
//     //   "Car Detailing (mobile)": 50,
//     // };
  
  
    return { questions, pricing, serviceAlias, serviceToCategory, basePrice };
  }
  
  /* Prebuilt artifacts (keeps your current imports working) */
  export const ART = buildArtifacts(MATRIX);
  export const questions = ART.questions;
  export const pricing = ART.pricing;
  export const serviceAlias = ART.serviceAlias;
  export const SERVICE_TO_CATEGORY = ART.serviceToCategory;
  export const BASE_PRICE = ART.basePrice;
  
  /* ---------------------- What's Covered (new, non-breaking) ----------------- */
  const COVERED_FALLBACK =
    "Includes basic on-site diagnosis and labor for the selected service. Parts, materials, or specialty equipment may incur additional charges.";
  
  const COVERED_MAP = {
    "Plumbing":
      "Covers leaks, clogs, and fixture issues (sinks, toilets, showers). Behind-wall repairs may need additional approval.",
    "Roofing":
      "Covers leak patches and small repairs. Full replacements and permits not included.",
    "HVAC":
      "Covers AC/heating diagnosis and common fixes. New unit installs quoted separately.",
    "Electrician":
      "Covers outlets, switches, fixtures, and breaker issues. Panel upgrades quoted separately.",
    "Handyman":
      "Covers small home repairs/installs. Large remodels not included.",
    "Locksmith":
      "Covers standard home/auto lockouts; specialty/high-security locks may add cost.",
    "Cleaner / Housekeeper":
      "Covers standard, deep, or move-out cleaning tasks; specialty cleaning extra.",
    "Painter (interior/exterior)":
      "Covers standard interior/exterior painting; major repairs or scaffolding extra.",
    "Landscaper / Lawn Care":
      "Covers mowing, trimming, small removals; heavy tree work quoted separately.",
    "Car Detailing (mobile)":
      "Covers the selected detailing package performed at your location.",
    "Roadside Service":
      "Covers jump starts, tire changes, and short tows; long tows may cost extra.",
    "Mobile Mechanic":
      "Covers on-site diagnosis and light repairs; major repairs may need a shop.",
    "Pest Control / Exterminator":
      "Covers inspection and treatment for common pests; severe infestations may need follow-ups.",
    "General Contractor (Consulting/Estimating)":
      "Covers on-site consult/estimate time only.",
  };
  
  export const getCoveredDescription = (service) =>
    COVERED_MAP[service] || COVERED_FALLBACK;
  
  /* -------------------- Default export (back-compat sugar) ------------------- */
  const DEFAULT = {
    MATRIX,
    questions,
    pricing,
    serviceAlias,
    SERVICE_TO_CATEGORY,
    BASE_PRICE,
    getCoveredDescription,
  };
  export default DEFAULT;