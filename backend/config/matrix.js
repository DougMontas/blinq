export const MATRIX = [
    // backend/config/adjustments.js
  
    /* ================== CORE TRADES ================== */
    // Plumbing
    { Service: "Plumbing", Question: "where located", Option: "kitchen", Adjustment: 50 },
    { Service: "Plumbing", Question: "where located", Option: "bathroom", Adjustment: 75 },
    { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
    { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 200 },
    { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
    { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 150 },
    { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 150 },
  
    // Roofing
    { Service: "Roofing", Question: "roof material", Option: "shingles", Adjustment: 50 },
    { Service: "Roofing", Question: "roof material", Option: "tile", Adjustment: 150 },
    { Service: "Roofing", Question: "roof material", Option: "metal", Adjustment: 150 },
    { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
    { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
    { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
    { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },
    { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
  
    // HVAC
    { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 100 },
    { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 150 },
    { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 150 },
    { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 150 },
    { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 100 },
    { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 100 },
    { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
    { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 200 },
  
    // Electrician
    { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 75 },
    { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 125 },
    { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 50 },
    { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
    { Service: "Electrician", Question: "scope of work", Option: "multiple circuits", Adjustment: 200 },
    { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
    { Service: "Electrician", Question: "accessibility", Option: "panel work", Adjustment: 150 },
    { Service: "Electrician", Question: "accessibility", Option: "attic work", Adjustment: 150 },
  
    /* ================== OTHER CATEGORIES ================== */
    // Handyman
    { Service: "Handyman (general fixes)", Question: "repair type", Option: "furniture", Adjustment: 50 },
    { Service: "Handyman (general fixes)", Question: "repair type", Option: "fixtures", Adjustment: 50 },
    { Service: "Handyman (general fixes)", Question: "repair type", Option: "doors", Adjustment: 100 },
    { Service: "Handyman (general fixes)", Question: "repair type", Option: "windows", Adjustment: 100 },
    { Service: "Handyman (general fixes)", Question: "size of job", Option: "small under 1 hour", Adjustment: 0 },
    { Service: "Handyman (general fixes)", Question: "size of job", Option: "larger 2+ hours", Adjustment: 150 },
  
    // Locksmith
    { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
    { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
    { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
    { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
    { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },
  
    // Cleaning
    { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic", Adjustment: 0 },
    { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning", Adjustment: 100 },
    { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out", Adjustment: 150 },
    { Service: "Cleaner / Housekeeper", Question: "home size", Option: "small under 1000 sqft", Adjustment: 0 },
    { Service: "Cleaner / Housekeeper", Question: "home size", Option: "large over 2500 sqft", Adjustment: 200 },
  
    // Auto (Mobile Mechanic)
    { Service: "Mobile Mechanic", Question: "issue", Option: "battery", Adjustment: 100 },
    { Service: "Mobile Mechanic", Question: "issue", Option: "starter", Adjustment: 100 },
    { Service: "Mobile Mechanic", Question: "issue", Option: "engine", Adjustment: 300 },
    { Service: "Mobile Mechanic", Question: "issue", Option: "transmission", Adjustment: 300 },
    { Service: "Mobile Mechanic", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
    { Service: "Mobile Mechanic", Question: "vehicle location", Option: "highway", Adjustment: 200 },
    { Service: "Mobile Mechanic", Question: "vehicle location", Option: "remote", Adjustment: 200 },
  
    // Pest Control
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 50 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 150 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 300 },
    { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 300 },
    { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
    { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 250 },
  
    // Painting
    { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
    { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
    { Service: "Painter (interior/exterior)", Question: "job size", Option: "single room", Adjustment: 100 },
    { Service: "Painter (interior/exterior)", Question: "job size", Option: "entire house", Adjustment: 500 },
  
    // Flooring
    { Service: "Flooring Installer / Repair", Question: "floor type", Option: "carpet", Adjustment: 50 },
    { Service: "Flooring Installer / Repair", Question: "floor type", Option: "tile", Adjustment: 150 },
    { Service: "Flooring Installer / Repair", Question: "floor type", Option: "hardwood", Adjustment: 150 },
    { Service: "Flooring Installer / Repair", Question: "job size", Option: "small under 200 sqft", Adjustment: 75 },
    { Service: "Flooring Installer / Repair", Question: "job size", Option: "large over 1000 sqft", Adjustment: 400 },
  
    // Landscaping
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 50 },
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 50 },
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal", Adjustment: 200 },
    { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
    { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
    { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 300 },
    { Service: "Landscaper / Lawn Care", Question: "property size", Option: "acreage", Adjustment: 300 },
  
    // Smart Home (TV / Theater)
    { Service: "TV Mounting / Home Theater Installer", Question: "service type", Option: "tv mount", Adjustment: 100 },
    { Service: "TV Mounting / Home Theater Installer", Question: "service type", Option: "home theater", Adjustment: 300 },
    { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "drywall", Adjustment: 0 },
    { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "brick", Adjustment: 150 },
    { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "concrete", Adjustment: 150 },
  
    // IT Services
    { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "issue type", Option: "wi-fi setup", Adjustment: 50 },
    { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "issue type", Option: "network troubleshooting", Adjustment: 100 },
    { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "issue type", Option: "smart device integration", Adjustment: 150 },
  
    // Water & Mold
    { Service: "Water Damage Mitigation", Question: "where located", Option: "basement", Adjustment: 150 },
    { Service: "Water Damage Mitigation", Question: "where located", Option: "bathroom", Adjustment: 100 },
    { Service: "Water Damage Mitigation", Question: "where located", Option: "kitchen", Adjustment: 100 },
    { Service: "Water Damage Mitigation", Question: "severity", Option: "minor", Adjustment: 0 },
    { Service: "Water Damage Mitigation", Question: "severity", Option: "major flooding", Adjustment: 400 },
  
    // Remodeling
    { Service: "General Contractor / Remodeler", Question: "remodel type", Option: "kitchen", Adjustment: 500 },
    { Service: "General Contractor / Remodeler", Question: "remodel type", Option: "bathroom", Adjustment: 400 },
    { Service: "General Contractor / Remodeler", Question: "remodel size", Option: "small project", Adjustment: 0 },
    { Service: "General Contractor / Remodeler", Question: "remodel size", Option: "full house", Adjustment: 2000 },
  
    // Environmental
    { Service: "Insulation / Weatherization Tech", Question: "service type", Option: "attic insulation", Adjustment: 200 },
    { Service: "Insulation / Weatherization Tech", Question: "service type", Option: "wall insulation", Adjustment: 300 },
    { Service: "Insulation / Weatherization Tech", Question: "home size", Option: "small under 1500 sqft", Adjustment: 0 },
    { Service: "Insulation / Weatherization Tech", Question: "home size", Option: "large over 2500 sqft", Adjustment: 400 },
  
  /* ================== MORE CATEGORIES (HARDENED) ================== */
  
  // Gutter Cleaning / Repair
  { Service: "Gutter Cleaning / Repair", Question: "work type", Option: "cleaning", Adjustment: 0 },
  { Service: "Gutter Cleaning / Repair", Question: "work type", Option: "repair", Adjustment: 100 },
  { Service: "Gutter Cleaning / Repair", Question: "home height", Option: "single story", Adjustment: 0 },
  { Service: "Gutter Cleaning / Repair", Question: "home height", Option: "two story", Adjustment: 100 },
  { Service: "Gutter Cleaning / Repair", Question: "home height", Option: "three story", Adjustment: 175 },
  { Service: "Gutter Cleaning / Repair", Question: "gutter guards", Option: "has guards", Adjustment: 75 },
  
  // Tile & Grout Specialist
  { Service: "Tile & Grout Specialist", Question: "area", Option: "shower", Adjustment: 125 },
  { Service: "Tile & Grout Specialist", Question: "area", Option: "floor", Adjustment: 75 },
  { Service: "Tile & Grout Specialist", Question: "issue", Option: "regrout", Adjustment: 100 },
  { Service: "Tile & Grout Specialist", Question: "issue", Option: "replace tiles", Adjustment: 150 },
  { Service: "Tile & Grout Specialist", Question: "condition", Option: "mold", Adjustment: 125 },
  
  // Security System Installer
  { Service: "Security System Installer", Question: "system size", Option: "whole home", Adjustment: 200 },
  { Service: "Security System Installer", Question: "system size", Option: "single area", Adjustment: 75 },
  { Service: "Security System Installer", Question: "devices", Option: "4+ cameras", Adjustment: 150 },
  { Service: "Security System Installer", Question: "devices", Option: "2-3 cameras", Adjustment: 75 },
  
  // Irrigation / Sprinkler Tech
  { Service: "Irrigation / Sprinkler Tech", Question: "work type", Option: "start up", Adjustment: 50 },
  { Service: "Irrigation / Sprinkler Tech", Question: "work type", Option: "winterize", Adjustment: 75 },
  { Service: "Irrigation / Sprinkler Tech", Question: "work type", Option: "repair leak", Adjustment: 125 },
  { Service: "Irrigation / Sprinkler Tech", Question: "zones", Option: "5+ zones", Adjustment: 100 },
  
  // Carpenter (Doors/Trim/Cabinets)
  { Service: "Carpenter (doors/trim/cabinets)", Question: "scope", Option: "door install", Adjustment: 150 },
  { Service: "Carpenter (doors/trim/cabinets)", Question: "scope", Option: "trim/baseboard", Adjustment: 75 },
  { Service: "Carpenter (doors/trim/cabinets)", Question: "scope", Option: "cabinet repair", Adjustment: 125 },
  { Service: "Carpenter (doors/trim/cabinets)", Question: "material", Option: "custom", Adjustment: 150 },
  
  // Garage Door Technician
  { Service: "Garage Door Technician", Question: "issue", Option: "spring", Adjustment: 175 },
  { Service: "Garage Door Technician", Question: "issue", Option: "opener", Adjustment: 125 },
  { Service: "Garage Door Technician", Question: "issue", Option: "cables/rollers", Adjustment: 100 },
  { Service: "Garage Door Technician", Question: "door size", Option: "double", Adjustment: 75 },
  
  // Window & Glass Repair
  { Service: "Window & Glass Repair", Question: "glass type", Option: "tempered", Adjustment: 125 },
  { Service: "Window & Glass Repair", Question: "glass type", Option: "double pane", Adjustment: 150 },
  { Service: "Window & Glass Repair", Question: "size", Option: "large", Adjustment: 100 },
  
  // Pressure Washing
  { Service: "Pressure Washing", Question: "surface", Option: "driveway", Adjustment: 50 },
  { Service: "Pressure Washing", Question: "surface", Option: "house siding", Adjustment: 100 },
  { Service: "Pressure Washing", Question: "surface", Option: "roof", Adjustment: 150 },
  { Service: "Pressure Washing", Question: "size", Option: "large", Adjustment: 100 },
  
  // Fence Repair / Installer
  { Service: "Fence Repair / Installer", Question: "material", Option: "wood", Adjustment: 50 },
  { Service: "Fence Repair / Installer", Question: "material", Option: "vinyl", Adjustment: 75 },
  { Service: "Fence Repair / Installer", Question: "material", Option: "metal", Adjustment: 100 },
  { Service: "Fence Repair / Installer", Question: "length", Option: "over 100 linear feet", Adjustment: 200 },
  
  // Masonry / Concrete
  { Service: "Masonry / Concrete", Question: "project", Option: "steps", Adjustment: 150 },
  { Service: "Masonry / Concrete", Question: "project", Option: "walkway", Adjustment: 175 },
  { Service: "Masonry / Concrete", Question: "project", Option: "foundation", Adjustment: 250 },
  
  // Pool & Spa Technician
  { Service: "Pool & Spa Technician", Question: "equipment", Option: "pump", Adjustment: 125 },
  { Service: "Pool & Spa Technician", Question: "equipment", Option: "heater", Adjustment: 150 },
  { Service: "Pool & Spa Technician", Question: "service", Option: "leak detection", Adjustment: 175 },
  
  // Tree Service / Arborist
  { Service: "Tree Service / Arborist", Question: "tree size", Option: "large", Adjustment: 250 },
  { Service: "Tree Service / Arborist", Question: "risk", Option: "near power lines", Adjustment: 200 },
  { Service: "Tree Service / Arborist", Question: "access", Option: "limited access", Adjustment: 150 },
  
  // Window/Door Replacement (Glazier)
  { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "window replacement", Adjustment: 150 },
  { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "door replacement", Adjustment: 175 },
  { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "double pane", Adjustment: 125 },
  { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "storm", Adjustment: 150 },
  
  // Auto Glass Repair/Replacement
  { Service: "Auto Glass Repair/Replacement", Question: "glass location", Option: "windshield", Adjustment: 125 },
  { Service: "Auto Glass Repair/Replacement", Question: "glass location", Option: "rear", Adjustment: 100 },
  { Service: "Auto Glass Repair/Replacement", Question: "glass location", Option: "side", Adjustment: 75 },
  
  // Tow Truck / Roadside Assistance
  { Service: "Tow Truck / Roadside Assistance", Question: "situation", Option: "after hours", Adjustment: 75 },
  { Service: "Tow Truck / Roadside Assistance", Question: "situation", Option: "winch out", Adjustment: 100 },
  { Service: "Tow Truck / Roadside Assistance", Question: "distance", Option: "long distance", Adjustment: 150 },
  
  // Car Detailing (Mobile)
  { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 75 },
  { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 75 },
  { Service: "Car Detailing (mobile)", Question: "package", Option: "full interior", Adjustment: 125 },
  { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 50 },
  
  // Mobile Tire Service
  { Service: "Mobile Tire Service", Question: "count", Option: "all four", Adjustment: 125 },
  { Service: "Mobile Tire Service", Question: "count", Option: "single tire", Adjustment: 50 },
  { Service: "Mobile Tire Service", Question: "location", Option: "roadside", Adjustment: 75 },
  
  /* ================== SMART-HOME / LOW-VOLTAGE ================== */
  { Service: "Smart-home / Low-voltage Installer", Question: "scope", Option: "multi-room", Adjustment: 150 },
  { Service: "Smart-home / Low-voltage Installer", Question: "scope", Option: "single room", Adjustment: 75 },
  { Service: "Smart-home / Low-voltage Installer", Question: "devices", Option: "6+ devices", Adjustment: 150 },
  { Service: "Smart-home / Low-voltage Installer", Question: "devices", Option: "3-5 devices", Adjustment: 100 },
  
  /* ================== SECURITY ================== */
  { Service: "Security System Installer", Question: "system size", Option: "whole home", Adjustment: 200 },
  { Service: "Security System Installer", Question: "system size", Option: "single area", Adjustment: 75 },
  { Service: "Security System Installer", Question: "devices", Option: "4+ cameras", Adjustment: 150 },
  { Service: "Security System Installer", Question: "devices", Option: "2-3 cameras", Adjustment: 75 },
  
  /* ================== TV / HOME THEATER ================== */
  { Service: "TV Mounting / Home Theater Installer", Question: "mounting location", Option: "over fireplace", Adjustment: 125 },
  { Service: "TV Mounting / Home Theater Installer", Question: "tv size", Option: "75+", Adjustment: 100 },
  { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "brick", Adjustment: 150 },
  { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "concrete", Adjustment: 150 },
  
  /* ================== DECK / PATIO ================== */
  { Service: "Deck/Patio Repair & Build", Question: "project", Option: "new build", Adjustment: 400 },
  { Service: "Deck/Patio Repair & Build", Question: "project", Option: "repair", Adjustment: 150 },
  { Service: "Deck/Patio Repair & Build", Question: "material", Option: "composite", Adjustment: 200 },
  { Service: "Deck/Patio Repair & Build", Question: "size", Option: "large", Adjustment: 300 },
  
  /* ================== INSULATION / WEATHERIZATION ================== */
  { Service: "Insulation / Weatherization Tech", Question: "area", Option: "attic", Adjustment: 150 },
  { Service: "Insulation / Weatherization Tech", Question: "area", Option: "crawlspace", Adjustment: 125 },
  { Service: "Insulation / Weatherization Tech", Question: "material", Option: "spray foam", Adjustment: 250 },
  { Service: "Insulation / Weatherization Tech", Question: "home size", Option: "large", Adjustment: 300 },
  
  /* ================== CHIMNEY ================== */
  { Service: "Chimney Sweep & Masonry", Question: "service", Option: "sweep only", Adjustment: 0 },
  { Service: "Chimney Sweep & Masonry", Question: "service", Option: "cap/crown repair", Adjustment: 150 },
  { Service: "Chimney Sweep & Masonry", Question: "service", Option: "reline", Adjustment: 300 },
  { Service: "Chimney Sweep & Masonry", Question: "condition", Option: "structural", Adjustment: 250 },
  
  /* ================== WATER DAMAGE ================== */
  { Service: "Water Damage Mitigation", Question: "area", Option: "basement", Adjustment: 150 },
  { Service: "Water Damage Mitigation", Question: "area", Option: "kitchen", Adjustment: 100 },
  { Service: "Water Damage Mitigation", Question: "severity", Option: "major flooding", Adjustment: 400 },
  { Service: "Water Damage Mitigation", Question: "condition", Option: "mold", Adjustment: 150 },
  
  /* ================== BASEMENT WATERPROOFING ================== */
  { Service: "Basement Waterproofing", Question: "solution", Option: "interior drain", Adjustment: 400 },
  { Service: "Basement Waterproofing", Question: "solution", Option: "sump pump", Adjustment: 250 },
  { Service: "Basement Waterproofing", Question: "solution", Option: "exterior waterproofing", Adjustment: 600 },
  { Service: "Basement Waterproofing", Question: "severity", Option: "severe", Adjustment: 300 },
  
  /* ================== SOLAR ================== */
  { Service: "Solar Installer", Question: "project", Option: "full system", Adjustment: 750 },
  { Service: "Solar Installer", Question: "project", Option: "panel repair", Adjustment: 200 },
  { Service: "Solar Installer", Question: "extras", Option: "battery", Adjustment: 500 },
  { Service: "Solar Installer", Question: "roof", Option: "tile/metal", Adjustment: 200 },
  
  /* ================== GENERAL CONTRACTOR ================== */
  { Service: "General Contractor / Remodeler", Question: "scope", Option: "kitchen", Adjustment: 500 },
  { Service: "General Contractor / Remodeler", Question: "scope", Option: "bathroom", Adjustment: 400 },
  { Service: "General Contractor / Remodeler", Question: "scope", Option: "additions", Adjustment: 1000 },
  { Service: "General Contractor / Remodeler", Question: "size", Option: "full house", Adjustment: 2000 },
  
  /* ================== RADON MITIGATION ================== */
  { Service: "Radon Mitigation / Environmental", Question: "home size", Option: "large", Adjustment: 250 },
  { Service: "Radon Mitigation / Environmental", Question: "foundation", Option: "crawlspace + basement", Adjustment: 200 },
  { Service: "Radon Mitigation / Environmental", Question: "testing", Option: "post-mitigation test", Adjustment: 125 },
  
  /* ================== WINDOW / DOOR REPLACEMENT ================== */
  { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "door replacement", Adjustment: 175 },
  { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "window replacement", Adjustment: 150 },
  { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "double pane", Adjustment: 125 },
  { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "storm", Adjustment: 150 },
  
  /* ================== LANDSCAPER (extra coverage) ================== */
  { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mulch / beds", Adjustment: 100 },
  { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal", Adjustment: 250 },
  { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large", Adjustment: 300 },
  
  /* ================== FLOORING (extra coverage) ================== */
  { Service: "Flooring Installer / Repair", Question: "room count", Option: "3+ rooms", Adjustment: 200 },
  { Service: "Flooring Installer / Repair", Question: "prep", Option: "remove old flooring", Adjustment: 150 },
  
  /* ================== APPLIANCE FAILURES (extra coverage) ================== */
  { Service: "Appliance Failures", Question: "appliance", Option: "built-in", Adjustment: 125 },
  { Service: "Appliance Failures", Question: "age", Option: "10+ years", Adjustment: 75 },
  
  /* ================== CAR MECHANIC (general) ================== */
  { Service: "Car Mechanic (general)", Question: "issue", Option: "engine", Adjustment: 250 },
  { Service: "Car Mechanic (general)", Question: "issue", Option: "transmission", Adjustment: 300 },
  { Service: "Car Mechanic (general)", Question: "vehicle", Option: "large suv/truck", Adjustment: 75 },
  
  /* ================== BARBER / HAIRDRESSER ================== */
  { Service: "Barber / Hairdresser", Question: "service", Option: "wedding / event", Adjustment: 50 },
  { Service: "Barber / Hairdresser", Question: "service", Option: "house call", Adjustment: 40 },
  
   ]