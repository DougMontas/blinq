// backend/config/services.js
// const SPV2_SERVICE_ANCHORS = {
//     // Existing
//     "Burst or Leaking Pipes": 350,
//     "Roof Leaks or Storm Damage": 750,
//     "HVAC System Failure": 650,
//     "Sewer Backups or Clogged Drains": 300,
//     "Select Electrical Issues Below": 250,
//     "Water Heater Failure": 800,
//     "Mold or Water Damage Remediation": 2500,
//     "Broken Windows or Doors": 400,
//     "Gas Leaks": 500,
//     "Appliance Failures": 275,
//     "Drywall Repair": 200,
  
//     // New (mirrors BASE_PRICE)
//     "Handyman (general fixes)": 175,
//     "Cleaner / Housekeeper": 150,
//     "Locksmith": 225,
//     "Landscaper / Lawn Care": 200,
//     "Painter (interior/exterior)": 500,
//     "Pest Control / Exterminator": 250,
//     "Carpenter (doors/trim/cabinets)": 300,
//     "Garage Door Technician": 400,
//     "Window & Glass Repair": 350,
//     "Gutter Cleaning / Repair": 225,
//     "Irrigation / Sprinkler Tech": 275,
//     "Tile & Grout Specialist": 325,
//     "Flooring Installer / Repair": 450,
//     "Smart-home / Low-voltage Installer": 275,
//     "Security System Installer": 400,
//     "IT / Wi-Fi Setup (Home Networking)": 200,
//     "TV Mounting / Home Theater Installer": 250,
//     "Moving Help (Labor-only)": 175,
//     "Junk Removal / Hauling": 250,
//     "Pressure Washing": 200,
//     "Fence Repair / Installer": 350,
//     "Masonry / Concrete": 400,
//     "Insulation / Weatherization Tech": 325,
//     "Chimney Sweep & Masonry": 300,
//     "Water Damage Mitigation": 1000,
//     "Basement Waterproofing": 1200,
//     "Tree Service / Arborist": 600,
//     "Pool & Spa Technician": 350,
//     "Deck/Patio Repair & Build": 550,
//     "Window/Door Replacement (Glazier)": 500,
//     "Solar Installer": 750,
//     "General Contractor / Remodeler": 1000,
//     "Radon Mitigation / Environmental": 600,
//     "Car Mechanic (general)": 250,
//     "Mobile Mechanic": 225,
//     "Tow Truck / Roadside Assistance": 150,
//     "Auto Glass Repair/Replacement": 300,
//     "Car Detailing (mobile)": 175,
//     "Mobile Tire Service": 200,
//     "Barber / Hairdresser": 75,
//   };

//   const SERVICE_ALIASES = {
//     /* ─── Core Trade Mapping ─────────────────────────── */
//     "Plumbing": "Burst or Leaking Pipes",
//     "Roofing": "Roof Leaks or Storm Damage",
//     "HVAC": "HVAC System Failure",
//     "Electrician": "Select Electrical Issues Below",
//     "Electricians": "Select Electrical Issues Below",
//     "Landscaping": "Landscaper / Lawn Care", 
//     "Electrical": "Select Electrical Issues Below",
  
  
//     /* ─── Electrical Sub-Aliases ────────────────────── */
//     "Single outlet/fixture": "Select Electrical Issues Below",
//     "Multiple circuits": "Select Electrical Issues Below",
//     "Panel or attic work": "Select Electrical Issues Below",
  
//     /* ─── Plumbing Sub-Aliases ──────────────────────── */
//     "Leaking faucet": "Burst or Leaking Pipes",
//     "Clogged sink": "Sewer Backups or Clogged Drains",
//     "Water heater issue": "Water Heater Failure",
  
//     /* ─── HVAC Sub-Aliases ──────────────────────────── */
//     "AC not cooling": "HVAC System Failure",
//     "Heater not working": "HVAC System Failure",
  
//     /* ─── Roofing Sub-Aliases ───────────────────────── */
//     "Ceiling leak": "Roof Leaks or Storm Damage",
//     "Missing shingles": "Roof Leaks or Storm Damage",
  
//     /* ─── Locksmith ─────────────────────────────────── */
//     "Locked out": "Locksmith",
//     "Rekey locks": "Locksmith",
  
//     /* ─── Cleaning ──────────────────────────────────── */
//     "Cleaning": "Cleaner / Housekeeper",
//     "Housekeeper": "Cleaner / Housekeeper",
//     "House Cleaning": "Cleaner / Housekeeper",
//     "Janitorial": "Cleaner / Housekeeper",
//     "Home cleaning": "Cleaner / Housekeeper",
//     "Move-out cleaning": "Cleaner / Housekeeper",
//     "Deep cleaning": "Cleaner / Housekeeper",
  
//     /* ─── Handyman / Case Fixes ─────────────────────── */
//     "Handyman (General Fixes)": "Handyman (general fixes)",
//     "Handyman": "Handyman (general fixes)",
  
//     /* ─── Painter / Case Fixes ──────────────────────── */
//     "Painter (Interior/Exterior)": "Painter (interior/exterior)",
  
//     /* ─── Gutter / Flooring / Case Fixes ────────────── */
//     "Gutter Cleaning/Repair": "Gutter Cleaning / Repair",
//     "Flooring Installer/Repair": "Flooring Installer / Repair",
  
//     /* ─── Window/Door Variants ──────────────────────── */
//     "Window/Door Replacement (Glazier)": "Window/Door Replacement (Glazier)",
//     "Window Repair": "Window & Glass Repair",
//     "Glass Repair": "Window & Glass Repair",
  
//     /* ─── Landscaping ───────────────────────────────── */
//     "Landscaper": "Landscaper / Lawn Care",
//     "Lawn Care": "Landscaper / Lawn Care",
  
//     /* ─── Pest Control ──────────────────────────────── */
//     "Exterminator": "Pest Control / Exterminator",
//     "Pest Control": "Pest Control / Exterminator",
  
//     /* ─── Fence ────────────────────────────────────── */
//     "Fence Installer": "Fence Repair / Installer",
//     "Fence Repair": "Fence Repair / Installer",
  
//     /* ─── Pool / Spa ───────────────────────────────── */
//     "Pool Technician": "Pool & Spa Technician",
//     "Spa Technician": "Pool & Spa Technician",
//     "Pool Service": "Pool & Spa Technician",
  
//     /* ─── Contractor ───────────────────────────────── */
//     "Remodeler": "General Contractor / Remodeler",
//     "Contractor": "General Contractor / Remodeler",
  
//     /* ─── Auto / Roadside ──────────────────────────── */
//     "Car Mechanic (General)": "Car Mechanic (general)",
//     "Car Detailing (Mobile)": "Car Detailing (mobile)",
//     "Tow Truck": "Tow Truck / Roadside Assistance",
//     "Roadside Assistance": "Tow Truck / Roadside Assistance",
//     "Auto Glass": "Auto Glass Repair/Replacement",
//     "Auto Glass Repair": "Auto Glass Repair/Replacement",
//     "Auto Glass Replacement": "Auto Glass Repair/Replacement",
  
//     /* ─── Misc ─────────────────────────────────────── */
//     "Arborist": "Tree Service / Arborist",
//   };

//   const SPV2_NAICS_BY_SERVICE = {
//     // Existing
//     "Burst or Leaking Pipes": "238220", // Plumbing
//     "Sewer Backups or Clogged Drains": "238220",
//     "Water Heater Failure": "238220",
//     "HVAC System Failure": "238220",
//     "Gas Leaks": "238220",
//     "Roof Leaks or Storm Damage": "238160", // Roofing
//     "Select Electrical Issues Below": "238210", // Electrical
//     "Drywall Repair": "238310", // Drywall
//     "Broken Windows or Doors": "238350", // Carpentry/finish
//     "Appliance Failures": "811412", // Appliance repair
//     "Mold or Water Damage Remediation": "562910", // Remediation
  
//     // New
//     "Handyman (general fixes)": "236118", // Residential remodel/handyman
//     "Cleaner / Housekeeper": "561720", // Janitorial/cleaning
//     "Locksmith": "561622", // Locksmiths
//     "Landscaper / Lawn Care": "561730", // Landscaping
//     "Painter (interior/exterior)": "238320", // Painting contractors
//     "Pest Control / Exterminator": "561710", // Pest control
//     "Carpenter (doors/trim/cabinets)": "238350", // Carpentry
//     "Garage Door Technician": "238290", // Other building equipment
//     "Window & Glass Repair": "238150", // Glass & glazing
//     "Gutter Cleaning / Repair": "238170", // Siding/gutter contractors
//     "Irrigation / Sprinkler Tech": "561730", // Landscaping/Irrigation
//     "Tile & Grout Specialist": "238340", // Tile contractors
//     "Flooring Installer / Repair": "238330", // Flooring contractors
//     "Smart-home / Low-voltage Installer": "238210", // Electrical low-voltage
//     "Security System Installer": "561621", // Security systems
//     "IT / Wi-Fi Setup (Home Networking)": "541512", // Computer systems design
//     "TV Mounting / Home Theater Installer": "238210", // Electrical/AV install
//     "Moving Help (Labor-only)": "484210", // Moving & storage
//     "Junk Removal / Hauling": "562111", // Waste collection
//     "Pressure Washing": "561790", // Building exterior cleaning
//     "Fence Repair / Installer": "238990", // All other specialty trade
//     "Masonry / Concrete": "238140", // Masonry
//     "Insulation / Weatherization Tech": "238310", // Insulation
//     "Chimney Sweep & Masonry": "238140", // Masonry
//     "Water Damage Mitigation": "562910", // Remediation
//     "Basement Waterproofing": "238190", // Foundation/waterproofing
//     "Tree Service / Arborist": "561730", // Landscaping/tree
//     "Pool & Spa Technician": "238990", // Pool contractors
//     "Deck/Patio Repair & Build": "238990", // Decking
//     "Window/Door Replacement (Glazier)": "238150", // Glazing
//     "Solar Installer": "238220", // Solar contractors (can also map 238290)
//     "General Contractor / Remodeler": "236118", // Residential remodel
//     "Radon Mitigation / Environmental": "562910", // Environmental remediation
//     "Car Mechanic (general)": "811111", // General auto repair
//     "Mobile Mechanic": "811111", // Same category
//     "Tow Truck / Roadside Assistance": "488410", // Towing
//     "Auto Glass Repair/Replacement": "811122", // Auto glass
//     "Car Detailing (mobile)": "811192", // Car wash/detail
//     "Mobile Tire Service": "811198", // Other auto repair/tire
//     "Barber / Hairdresser": "812111", // Barber shops
//   };

//   const SERVICE_TO_CATEGORY = {
//     /* -------- Core emergencies / trades -------- */
//     "Burst or Leaking Pipes": "Plumbing",
//     "Sewer Backups or Clogged Drains": "Plumbing",
//     "Water Heater Failure": "Plumbing",
//     "Gas Leaks": "Plumbing",
//     "HVAC System Failure": "HVAC",
//     "Roof Leaks or Storm Damage": "Roofing",
//     "Select Electrical Issues Below": "Electrician",
  
//     "Drywall Repair": "Drywall",
//     "Broken Windows or Doors": "Windows_Doors",
//     "Appliance Failures": "Appliance_Repair",
//     "Mold or Water Damage Remediation": "Water_Mold_Remediation",
  
//     /* -------- Expanded catalog -------- */
//     "Handyman (general fixes)": "Handyman",
//     "Cleaner / Housekeeper": "Cleaning",
//     "Locksmith": "LockSmith",                   // note the capital S to match enum
//     "Landscaper / Lawn Care": "Landscaping",
//     "Painter (interior/exterior)": "Painting",
//     "Pest Control / Exterminator": "Pest_Control",
//     "Carpenter (doors/trim/cabinets)": "Carpentry",
//     "Garage Door Technician": "Garage_Doors",
//     "Window & Glass Repair": "Windows_Glass",
//     "Gutter Cleaning / Repair": "Gutters",
//     "Irrigation / Sprinkler Tech": "Landscaping",
//     "Tile & Grout Specialist": "Tile_Grout",
//     "Flooring Installer / Repair": "Flooring",
//     "Smart-home / Low-voltage Installer": "Smart_Home",
//     "Security System Installer": "Smart_Home",
//     "IT / Wi-Fi Setup (Home Networking)": "IT_Services",
//     "TV Mounting / Home Theater Installer": "Smart_Home",
  
//     "Moving Help (Labor-only)": "Moving",
//     "Junk Removal / Hauling": "Junk_Removal",
//     "Pressure Washing": "Exterior_Cleaning",
//     "Fence Repair / Installer": "Fencing",
//     "Masonry / Concrete": "Masonry_Concrete",
//     "Insulation / Weatherization Tech": "Environmental",
//     "Chimney Sweep & Masonry": "Chimney",
//     "Water Damage Mitigation": "Water_Mold_Remediation",
//     "Basement Waterproofing": "Water_Mold_Remediation",
//     "Tree Service / Arborist": "Tree_Service",
//     "Pool & Spa Technician": "Pool_Spa",
//     "Deck/Patio Repair & Build": "Deck_Patio",
//     "Window/Door Replacement (Glazier)": "Windows_Doors",
//     "Solar Installer": "Solar",
//     "General Contractor / Remodeler": "Remodeling",
//     "Radon Mitigation / Environmental": "Environmental",
  
//     /* -------- Auto & personal -------- */
//     "Car Mechanic (general)": "Auto",
//     "Mobile Mechanic": "Auto",
//     "Tow Truck / Roadside Assistance": "Auto",
//     "Auto Glass Repair/Replacement": "Auto",
//     "Car Detailing (mobile)": "Auto_Detailing",
//     "Mobile Tire Service": "Auto",
//     "Barber / Hairdresser": "Personal_Services",
//   };
  

//   export { SPV2_SERVICE_ANCHORS, SERVICE_ALIASES, SPV2_NAICS_BY_SERVICE, SERVICE_TO_CATEGORY };

/* =============================================================================
 * services.js  — aligned with MATRIX services, options, and naming
 * ========================================================================== */

/** ---------------------------------------------------------------------------
 * SmartPrice v2 base anchors (service rails “centers”).
 * NOTE:
 * - We keep your original keys.
 * - We add MATRIX-preferred service names where needed (Handyman, Roadside Service, Mobile Mechanic, etc.).
 * - We add General Contractor (Consulting/Estimating) with a base of 0 so price comes from MATRIX scope rows.
 * -------------------------------------------------------------------------- */
export const SPV2_SERVICE_ANCHORS = {
  // Core emergencies / trades
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

  // Catalog (keep originals)
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

  // Auto / personal (keep originals)
  "Car Mechanic (general)": 250,
  "Mobile Mechanic": 225,
  "Tow Truck / Roadside Assistance": 150,
  "Auto Glass Repair/Replacement": 300,
  "Car Detailing (mobile)": 175,
  "Mobile Tire Service": 200,
  "Barber / Hairdresser": 75,

  // ---------- MATRIX-preferred service names (additions) ----------
  // Handyman in MATRIX uses "Handyman" (not "(general fixes)")
  "Handyman": 175,

  // Roadside Service (MATRIX) == Tow Truck / Roadside Assistance
  "Roadside Service": 150,

  // MATRIX already uses Mobile Mechanic / Car Detailing (mobile); kept above

  // Consulting/Estimating is priced by MATRIX scope only → base 0
  "General Contractor (Consulting/Estimating)": 0,

  // Accept category label directly (non-breaking convenience)
  "Consulting / Estimating": 0,
};

/** ---------------------------------------------------------------------------
 * Human-facing aliases → canonical service keys used by anchors/rails.
 * IMPORTANT: These also align with MATRIX service names so normalizer/adjustments match.
 * -------------------------------------------------------------------------- */
export const SERVICE_ALIASES = {
  /* Core trade mapping */
  "Plumbing": "Burst or Leaking Pipes",
  "Roofing": "Roof Leaks or Storm Damage",
  "HVAC": "HVAC System Failure",
  "Electrician": "Select Electrical Issues Below",
  "Electricians": "Select Electrical Issues Below",
  "Electrical": "Select Electrical Issues Below",
  "Landscaping": "Landscaper / Lawn Care",

  /* Electrical sub-aliases */
  "Single outlet/fixture": "Select Electrical Issues Below",
  "Multiple circuits": "Select Electrical Issues Below",
  "Panel or attic work": "Select Electrical Issues Below",

  /* Plumbing sub-aliases */
  "Leaking faucet": "Burst or Leaking Pipes",
  "Clogged sink": "Sewer Backups or Clogged Drains",
  "Water heater issue": "Water Heater Failure",

  /* HVAC sub-aliases */
  "AC not cooling": "HVAC System Failure",
  "Heater not working": "HVAC System Failure",

  /* Roofing sub-aliases */
  "Ceiling leak": "Roof Leaks or Storm Damage",
  "Missing shingles": "Roof Leaks or Storm Damage",

  /* Locksmith */
  "Locked out": "Locksmith",
  "Rekey locks": "Locksmith",

  /* Cleaning */
  "Cleaning": "Cleaner / Housekeeper",
  "Housekeeper": "Cleaner / Housekeeper",
  "House Cleaning": "Cleaner / Housekeeper",
  "Janitorial": "Cleaner / Housekeeper",
  "Home cleaning": "Cleaner / Housekeeper",
  "Move-out cleaning": "Cleaner / Housekeeper",
  "Deep cleaning": "Cleaner / Housekeeper",

  /* Handyman */
  "Handyman (General Fixes)": "Handyman",
  "Handyman": "Handyman",
  "Handyman (general fixes)": "Handyman",

  /* Painter */
  "Painter (Interior/Exterior)": "Painter (interior/exterior)",

  /* Gutter / Flooring case fixes */
  "Gutter Cleaning/Repair": "Gutter Cleaning / Repair",
  "Flooring Installer/Repair": "Flooring Installer / Repair",

  /* Window/Door variants */
  "Window/Door Replacement (Glazier)": "Window/Door Replacement (Glazier)",
  "Window Repair": "Window & Glass Repair",
  "Glass Repair": "Window & Glass Repair",

  /* Landscaping variants */
  "Landscaper": "Landscaper / Lawn Care",
  "Lawn Care": "Landscaper / Lawn Care",

  /* Pest Control */
  "Exterminator": "Pest Control / Exterminator",
  "Pest Control": "Pest Control / Exterminator",

  /* Fence */
  "Fence Installer": "Fence Repair / Installer",
  "Fence Repair": "Fence Repair / Installer",

  /* Pool / Spa */
  "Pool Technician": "Pool & Spa Technician",
  "Spa Technician": "Pool & Spa Technician",
  "Pool Service": "Pool & Spa Technician",

  /* Contractor */
  "Remodeler": "General Contractor / Remodeler",
  "Contractor": "General Contractor / Remodeler",

  /* Auto / Roadside */
  "Car Mechanic (General)": "Mobile Mechanic",
  "Car Mechanic (general)": "Mobile Mechanic",
  "Car Detailing (Mobile)": "Car Detailing (mobile)",
  "Tow Truck": "Roadside Service",
  "Roadside Assistance": "Roadside Service",
  "Tow Truck / Roadside Assistance": "Roadside Service",
  "Auto Glass": "Auto Glass Repair/Replacement",
  "Auto Glass Repair": "Auto Glass Repair/Replacement",
  "Auto Glass Replacement": "Auto Glass Repair/Replacement",

  /* Consulting / Estimating (category label → rails service) */
  "Consulting / Estimating": "General Contractor (Consulting/Estimating)",

  /* Misc */
  "Arborist": "Tree Service / Arborist",
};

/** ---------------------------------------------------------------------------
 * NAICS per service — unchanged where you already had them; added Handyman/Roadside
 * and Consulting/Estimating mappings consistent with MATRIX service names.
 * -------------------------------------------------------------------------- */
export const SPV2_NAICS_BY_SERVICE = {
  // Core
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

  // Catalog (align names)
  "Handyman (general fixes)": "236118",
  "Handyman": "236118",
  "Cleaner / Housekeeper": "561720",
  "Locksmith": "561622",
  "Landscaper / Lawn Care": "561730",
  "Painter (interior/exterior)": "238320",
  "Pest Control / Exterminator": "561710",
  "Carpenter (doors/trim/cabinets)": "238350",
  "Garage Door Technician": "238290",
  "Window & Glass Repair": "238150",
  "Gutter Cleaning / Repair": "238170",
  "Irrigation / Sprinkler Tech": "561730",
  "Tile & Grout Specialist": "238340",
  "Flooring Installer / Repair": "238330",
  "Smart-home / Low-voltage Installer": "238210",
  "Security System Installer": "561621",
  "IT / Wi-Fi Setup (Home Networking)": "541512",
  "TV Mounting / Home Theater Installer": "238210",
  "Moving Help (Labor-only)": "484210",
  "Junk Removal / Hauling": "562111",
  "Pressure Washing": "561790",
  "Fence Repair / Installer": "238990",
  "Masonry / Concrete": "238140",
  "Insulation / Weatherization Tech": "238310",
  "Chimney Sweep & Masonry": "238140",
  "Water Damage Mitigation": "562910",
  "Basement Waterproofing": "238190",
  "Tree Service / Arborist": "561730",
  "Pool & Spa Technician": "238990",
  "Deck/Patio Repair & Build": "238990",
  "Window/Door Replacement (Glazier)": "238150",
  "Solar Installer": "238220",
  "General Contractor / Remodeler": "236118",
  "Radon Mitigation / Environmental": "562910",

  // Auto / personal
  "Car Mechanic (general)": "811111",
  "Mobile Mechanic": "811111",
  "Tow Truck / Roadside Assistance": "488410",
  "Roadside Service": "488410",
  "Auto Glass Repair/Replacement": "811122",
  "Car Detailing (mobile)": "811192",
  "Mobile Tire Service": "811198",
  "Barber / Hairdresser": "812111",

  // Consulting / Estimating
  "General Contractor (Consulting/Estimating)": "236118",
  "Consulting / Estimating": "236118",
};

/** ---------------------------------------------------------------------------
 * Category map (service → category). Uses MATRIX-preferred names.
 * -------------------------------------------------------------------------- */
export const SERVICE_TO_CATEGORY = {
  /* Core emergencies / trades */
  "Burst or Leaking Pipes": "Plumbing",
  "Sewer Backups or Clogged Drains": "Plumbing",
  "Water Heater Failure": "Plumbing",
  "Gas Leaks": "Plumbing",
  "HVAC System Failure": "HVAC",
  "Roof Leaks or Storm Damage": "Roofing",
  "Select Electrical Issues Below": "Electrician",

  "Drywall Repair": "Drywall",
  "Broken Windows or Doors": "Windows_Doors",
  "Appliance Failures": "Appliance_Repair",
  "Mold or Water Damage Remediation": "Water_Mold_Remediation",

  /* Expanded catalog */
  "Handyman": "Handyman",
  "Handyman (general fixes)": "Handyman",
  "Cleaner / Housekeeper": "Cleaning",
  "Locksmith": "LockSmith",
  "Landscaper / Lawn Care": "Landscaping",
  "Painter (interior/exterior)": "Painting",
  "Pest Control / Exterminator": "Pest_Control",
  "Carpenter (doors/trim/cabinets)": "Carpentry",
  "Garage Door Technician": "Garage_Doors",
  "Window & Glass Repair": "Windows_Glass",
  "Gutter Cleaning / Repair": "Gutters",
  "Irrigation / Sprinkler Tech": "Landscaping",
  "Tile & Grout Specialist": "Tile_Grout",
  "Flooring Installer / Repair": "Flooring",
  "Smart-home / Low-voltage Installer": "Smart_Home",
  "Security System Installer": "Smart_Home",
  "IT / Wi-Fi Setup (Home Networking)": "IT_Services",
  "TV Mounting / Home Theater Installer": "Smart_Home",

  "Moving Help (Labor-only)": "Moving",
  "Junk Removal / Hauling": "Junk_Removal",
  "Pressure Washing": "Exterior_Cleaning",
  "Fence Repair / Installer": "Fencing",
  "Masonry / Concrete": "Masonry_Concrete",
  "Insulation / Weatherization Tech": "Environmental",
  "Chimney Sweep & Masonry": "Chimney",
  "Water Damage Mitigation": "Water_Mold_Remediation",
  "Basement Waterproofing": "Water_Mold_Remediation",
  "Tree Service / Arborist": "Tree_Service",
  "Pool & Spa Technician": "Pool_Spa",
  "Deck/Patio Repair & Build": "Deck_Patio",
  "Window/Door Replacement (Glazier)": "Windows_Doors",
  "Solar Installer": "Solar",
  "General Contractor / Remodeler": "Remodeling",
  "Radon Mitigation / Environmental": "Environmental",

  /* Auto & personal */
  "Car Mechanic (general)": "Auto",
  "Mobile Mechanic": "Auto",
  "Tow Truck / Roadside Assistance": "Auto",
  "Roadside Service": "Auto",
  "Auto Glass Repair/Replacement": "Auto",
  "Car Detailing (mobile)": "Auto_Detailing",
  "Mobile Tire Service": "Auto",
  "Barber / Hairdresser": "Personal_Services",

  /* Consulting / Estimating */
  "General Contractor (Consulting/Estimating)": "Consulting_Estimating",
  "Consulting / Estimating": "Consulting_Estimating",
};

export default {
  SPV2_SERVICE_ANCHORS,
  SERVICE_ALIASES,
  SPV2_NAICS_BY_SERVICE,
  SERVICE_TO_CATEGORY,
};
