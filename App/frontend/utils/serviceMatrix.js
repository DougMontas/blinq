// utils/serviceMatrix.js
const MATRIX = [
  // {
  //   Service: "Select Electrical Issues Below",
  //   Question: `Test $1 Service": "Developer test checkout: fixed $1, no other fees.`,
  //   Option: "Kitchen",
  //   Adjustment: 0,
  // },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Where is the leak located?",
    Option: "Kitchen",
    Adjustment: 0,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Where is the leak located?",
    Option: "Bathroom wall",
    Adjustment: 75,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Where is the leak located?",
    Option: "Laundry",
    Adjustment: 50,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Where is the leak located?",
    Option: "Outdoors",
    Adjustment: 65,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Where is the leak located?",
    Option: "Unknown",
    Adjustment: 100,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is the leak exposed or concealed?",
    Option: "Exposed",
    Adjustment: 0,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is the leak exposed or concealed?",
    Option: "Behind wall",
    Adjustment: 100,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is the leak exposed or concealed?",
    Option: "Ceiling/Floor",
    Adjustment: 125,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is the leak exposed or concealed?",
    Option: "Unknown",
    Adjustment: 125,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is water still flowing?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is water still flowing?",
    Option: "No",
    Adjustment: 50,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is water still flowing?",
    Option: "I can’t locate shutoff",
    Adjustment: 50,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "How long has the leak been active?",
    Option: "<1 hr",
    Adjustment: 0,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "How long has the leak been active?",
    Option: "1–6 hrs",
    Adjustment: 25,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "How long has the leak been active?",
    Option: "6+ hrs",
    Adjustment: 50,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "How long has the leak been active?",
    Option: "Unknown",
    Adjustment: 50,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Has this pipe leaked before?",
    Option: "No",
    Adjustment: 0,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Has this pipe leaked before?",
    Option: "Yes",
    Adjustment: 40,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Has this pipe leaked before?",
    Option: "Not sure",
    Adjustment: 20,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is there damage to drywall/floor/ceiling?",
    Option: "None",
    Adjustment: 0,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is there damage to drywall/floor/ceiling?",
    Option: "Minor stain",
    Adjustment: 40,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is there damage to drywall/floor/ceiling?",
    Option: "Water-stained",
    Adjustment: 80,
  },
  {
    Service: "Burst or Leaking Pipes",
    Question: "Is there damage to drywall/floor/ceiling?",
    Option: "Sagging ceiling",
    Adjustment: 100,
  },

  /* ─── Roof Leaks or Storm Damage ───────────────────────────────────── */
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Where is the leak coming from?",
    Option: "One stain",
    Adjustment: 0,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Where is the leak coming from?",
    Option: "Multiple stains",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Where is the leak coming from?",
    Option: "Ceiling drip",
    Adjustment: 150,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Where is the leak coming from?",
    Option: "Skylight/Wall",
    Adjustment: 200,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Where is the leak coming from?",
    Option: "Unknown",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "What type of roof?",
    Option: "Shingle",
    Adjustment: 0,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "What type of roof?",
    Option: "Tile",
    Adjustment: 150,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "What type of roof?",
    Option: "Metal",
    Adjustment: 200,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "What type of roof?",
    Option: "Flat",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "What type of roof?",
    Option: "Not sure",
    Adjustment: 150,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "How steep is your roof?",
    Option: "Walkable",
    Adjustment: 0,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "How steep is your roof?",
    Option: "Moderate",
    Adjustment: 50,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "How steep is your roof?",
    Option: "Steep",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "How steep is your roof?",
    Option: "Not sure",
    Adjustment: 75,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Is damage isolated or widespread?",
    Option: "One area",
    Adjustment: 0,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Is damage isolated or widespread?",
    Option: "Multiple",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Is damage isolated or widespread?",
    Option: "Whole side",
    Adjustment: 250,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Is damage isolated or widespread?",
    Option: "Not sure",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "When did the issue start?",
    Option: "Today",
    Adjustment: 0,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "When did the issue start?",
    Option: "Few days",
    Adjustment: 50,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "When did the issue start?",
    Option: "Week ago",
    Adjustment: 75,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "When did the issue start?",
    Option: "Recurring",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Interior damage?",
    Option: "None",
    Adjustment: 0,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Interior damage?",
    Option: "Minor stain",
    Adjustment: 50,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Interior damage?",
    Option: "Sagging ceiling",
    Adjustment: 100,
  },
  {
    Service: "Roof Leaks or Storm Damage",
    Question: "Interior damage?",
    Option: "Furniture/floor damage",
    Adjustment: 150,
  },

  /* ─── HVAC System Failure ──────────────────────────────────────────── */
  {
    Service: "HVAC System Failure",
    Question: "What is the issue?",
    Option: "No cool air",
    Adjustment: 0,
  },
  {
    Service: "HVAC System Failure",
    Question: "What is the issue?",
    Option: "No power",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "What is the issue?",
    Option: "Water leak",
    Adjustment: 75,
  },
  {
    Service: "HVAC System Failure",
    Question: "What is the issue?",
    Option: "Breaker trip",
    Adjustment: 100,
  },
  {
    Service: "HVAC System Failure",
    Question: "What is the issue?",
    Option: "Smell/noise",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "What is the issue?",
    Option: "Not sure",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "Type of system?",
    Option: "Central A/C",
    Adjustment: 0,
  },
  {
    Service: "HVAC System Failure",
    Question: "Type of system?",
    Option: "Rooftop",
    Adjustment: 100,
  },
  {
    Service: "HVAC System Failure",
    Question: "Type of system?",
    Option: "Mini-split",
    Adjustment: 75,
  },
  {
    Service: "HVAC System Failure",
    Question: "Type of system?",
    Option: "Heat pump",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "Type of system?",
    Option: "Not sure",
    Adjustment: 75,
  },
  {
    Service: "HVAC System Failure",
    Question: "When did issue begin?",
    Option: "Today",
    Adjustment: 0,
  },
  {
    Service: "HVAC System Failure",
    Question: "When did issue begin?",
    Option: "1–2 days",
    Adjustment: 25,
  },
  {
    Service: "HVAC System Failure",
    Question: "When did issue begin?",
    Option: "3+",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "When did issue begin?",
    Option: "Ongoing",
    Adjustment: 75,
  },
  {
    Service: "HVAC System Failure",
    Question: "Which unit is affected?",
    Option: "Indoor",
    Adjustment: 0,
  },
  {
    Service: "HVAC System Failure",
    Question: "Which unit is affected?",
    Option: "Outdoor",
    Adjustment: 25,
  },
  {
    Service: "HVAC System Failure",
    Question: "Which unit is affected?",
    Option: "Both",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "System serviced recently?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "HVAC System Failure",
    Question: "System serviced recently?",
    Option: "No",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "System serviced recently?",
    Option: "Never",
    Adjustment: 75,
  },
  {
    Service: "HVAC System Failure",
    Question: "Water or mold damage?",
    Option: "None",
    Adjustment: 0,
  },
  {
    Service: "HVAC System Failure",
    Question: "Water or mold damage?",
    Option: "Minor",
    Adjustment: 50,
  },
  {
    Service: "HVAC System Failure",
    Question: "Water or mold damage?",
    Option: "Stained ceiling",
    Adjustment: 100,
  },
  {
    Service: "HVAC System Failure",
    Question: "Water or mold damage?",
    Option: "Mold",
    Adjustment: 150,
  },

  /* ─── Sewer Backups / Clogged Drains ──────────────────────────────── */
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "What area is affected?",
    Option: "One drain",
    Adjustment: 0,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "What area is affected?",
    Option: "Toilet",
    Adjustment: 50,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "What area is affected?",
    Option: "Entire home",
    Adjustment: 150,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "What area is affected?",
    Option: "Outside cleanout",
    Adjustment: 100,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "What area is affected?",
    Option: "Unknown",
    Adjustment: 125,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Duration of issue?",
    Option: "Today",
    Adjustment: 0,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Duration of issue?",
    Option: "1–2 days",
    Adjustment: 25,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Duration of issue?",
    Option: "3+",
    Adjustment: 50,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Duration of issue?",
    Option: "Ongoing",
    Adjustment: 75,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Overflow present?",
    Option: "None",
    Adjustment: 0,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Overflow present?",
    Option: "Toilet",
    Adjustment: 50,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Overflow present?",
    Option: "Sink tub",
    Adjustment: 75,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Overflow present?",
    Option: "Sewage drain",
    Adjustment: 100,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Do you have a cleanout?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Do you have a cleanout?",
    Option: "Maybe",
    Adjustment: 50,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Do you have a cleanout?",
    Option: "No",
    Adjustment: 75,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Do you have a cleanout?",
    Option: "Not sure",
    Adjustment: 50,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Used chemicals or tools?",
    Option: "No",
    Adjustment: 0,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Used chemicals or tools?",
    Option: "Plunger",
    Adjustment: 0,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Used chemicals or tools?",
    Option: "Liquid cleaner",
    Adjustment: 40,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Used chemicals or tools?",
    Option: "Snaked",
    Adjustment: 50,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Foul smells or insects?",
    Option: "None",
    Adjustment: 0,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Foul smells or insects?",
    Option: "Bad smell",
    Adjustment: 25,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Foul smells or insects?",
    Option: "Drain flies",
    Adjustment: 50,
  },
  {
    Service: "Sewer Backups or Clogged Drains",
    Question: "Foul smells or insects?",
    Option: "Sewage smell",
    Adjustment: 75,
  },

  /* ─── Electrical Panel Issues or Outages ──────────────────────────── */
  {
    Service: "Select Electrical Issues Below",
    Question: "What best describes the issue?",
    Option: "No power at all in the entire house",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "What best describes the issue?",
    Option: "No power in some areas",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "What best describes the issue?",
    Option: "No power in one room",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "What best describes the issue?",
    Option: "Power is flickering",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "What best describes the issue?",
    Option: "Burning smell",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "What best describes the issue?",
    Option: "Sparks or smoke",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "Where is the outage occurring?",
    Option: "Bedroom",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "Where is the outage occurring?",
    Option: "Kitchen",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "Where is the outage occurring?",
    Option: "Bathroom",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "Where is the outage occurring?",
    Option: "Living room",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "Where is the outage occurring?",
    Option: "Not sure",
    Adjustment: 0,
  },
  {
    Service: "Select Electrical Issues Below",
    Question: "Please describe the issue in your own words",
    Option: "Click other below",
    Adjustment: 0,
    AllowFreeText: true,
  },

  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What issue are you experiencing?",
  //   Option: "Entire home lost power",
  //   Adjustment: 100,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What issue are you experiencing?",
  //   Option: "Partial outage",
  //   Adjustment: 75,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What issue are you experiencing?",
  //   Option: "Tripping breakers",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What issue are you experiencing?",
  //   Option: "Burning smell",
  //   Adjustment: 100,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What issue are you experiencing?",
  //   Option: "Flickering",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What issue are you experiencing?",
  //   Option: "Not sure",
  //   Adjustment: 75,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What type of panel?",
  //   Option: "Square D, Siemens, Eaton",
  //   Adjustment: 0,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What type of panel?",
  //   Option: "Zinsco/FPE",
  //   Adjustment: 150,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What type of panel?",
  //   Option: "Other",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "What type of panel?",
  //   Option: "Not sure",
  //   Adjustment: 75,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "Visible damage?",
  //   Option: "None",
  //   Adjustment: 0,
  // },
  // {
  //   Service: "Electrical Panel Issues or Outages",
  //   Question: "Visible damage?",
  //   Option: "Rust",
  //   Adjustment: 75,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Visible damage?",
  //   Option: "Burn marks",
  //   Adjustment: 100,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Visible damage?",
  //   Option: "Missing breakers",
  //   Adjustment: 75,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Panel serviced in last 5 years?",
  //   Option: "Yes",
  //   Adjustment: 0,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Panel serviced in last 5 years?",
  //   Option: "5+ years ago",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Panel serviced in last 5 years?",
  //   Option: "Never/Not sure",
  //   Adjustment: 75,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Major appliances affected?",
  //   Option: "No",
  //   Adjustment: 0,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Major appliances affected?",
  //   Option: "Fridge/AC",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Major appliances affected?",
  //   Option: "Washer/Dryer/Oven",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Major appliances affected?",
  //   Option: "Multiple",
  //   Adjustment: 75,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Any surges, storms, remodeling?",
  //   Option: "None",
  //   Adjustment: 0,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Any surges, storms, remodeling?",
  //   Option: "Storm",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Any surges, storms, remodeling?",
  //   Option: "Surge",
  //   Adjustment: 50,
  // },
  // {
  //   Service: "See All Electrical Issues",
  //   Question: "Any surges, storms, remodeling?",
  //   Option: "Remodel",
  //   Adjustment: 50,
  // },

  /* ─── Water Heater Failure ────────────────────────────────────────── */
  {
    Service: "Water Heater Failure",
    Question: "What issue?",
    Option: "No hot water",
    Adjustment: 0,
  },
  {
    Service: "Water Heater Failure",
    Question: "What issue?",
    Option: "Leaking",
    Adjustment: 100,
  },
  {
    Service: "Water Heater Failure",
    Question: "What issue?",
    Option: "Noise",
    Adjustment: 50,
  },
  {
    Service: "Water Heater Failure",
    Question: "What issue?",
    Option: "Breaker trip",
    Adjustment: 75,
  },
  {
    Service: "Water Heater Failure",
    Question: "What issue?",
    Option: "Not sure",
    Adjustment: 50,
  },
  {
    Service: "Water Heater Failure",
    Question: "Type?",
    Option: "Electric",
    Adjustment: 0,
  },
  {
    Service: "Water Heater Failure",
    Question: "Type?",
    Option: "Gas",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Type?",
    Option: "Tankless",
    Adjustment: 50,
  },
  {
    Service: "Water Heater Failure",
    Question: "Type?",
    Option: "Not sure",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Size?",
    Option: "30–40 gal",
    Adjustment: 0,
  },
  {
    Service: "Water Heater Failure",
    Question: "Size?",
    Option: "50–60 gal",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Size?",
    Option: "75+ gal",
    Adjustment: 50,
  },
  {
    Service: "Water Heater Failure",
    Question: "Size?",
    Option: "Not sure",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Age?",
    Option: "<5 yrs",
    Adjustment: 0,
  },
  {
    Service: "Water Heater Failure",
    Question: "Age?",
    Option: "5–10 yrs",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Age?",
    Option: "10+ yrs",
    Adjustment: 50,
  },
  {
    Service: "Water Heater Failure",
    Question: "Age?",
    Option: "Not sure",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Visible water damage?",
    Option: "None",
    Adjustment: 0,
  },
  {
    Service: "Water Heater Failure",
    Question: "Visible water damage?",
    Option: "Minor",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Visible water damage?",
    Option: "Pooled",
    Adjustment: 50,
  },
  {
    Service: "Water Heater Failure",
    Question: "Visible water damage?",
    Option: "Mold nearby",
    Adjustment: 75,
  },
  {
    Service: "Water Heater Failure",
    Question: "Serviced before?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "Water Heater Failure",
    Question: "Serviced before?",
    Option: "Long ago",
    Adjustment: 25,
  },
  {
    Service: "Water Heater Failure",
    Question: "Serviced before?",
    Option: "Never",
    Adjustment: 50,
  },
  {
    Service: "Water Heater Failure",
    Question: "Serviced before?",
    Option: "Not sure",
    Adjustment: 25,
  },

  /* ─── Mold / Water Damage Remediation ─────────────────────────────── */
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Area affected?",
    Option: "Bathroom",
    Adjustment: 0,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Area affected?",
    Option: "Bedroom",
    Adjustment: 50,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Area affected?",
    Option: "Kitchen",
    Adjustment: 50,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Area affected?",
    Option: "Multiple rooms",
    Adjustment: 100,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Area affected?",
    Option: "Not sure",
    Adjustment: 75,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Visible mold?",
    Option: "Yes",
    Adjustment: 50,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Visible mold?",
    Option: "No",
    Adjustment: 25,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Visible mold?",
    Option: "Just smell",
    Adjustment: 40,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Visible mold?",
    Option: "Not sure",
    Adjustment: 40,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Cause?",
    Option: "Leak",
    Adjustment: 50,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Cause?",
    Option: "Flood",
    Adjustment: 100,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Cause?",
    Option: "Unknown",
    Adjustment: 75,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "When started?",
    Option: "<24 hrs",
    Adjustment: 0,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "When started?",
    Option: "2–3 days",
    Adjustment: 50,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "When started?",
    Option: "3+ days",
    Adjustment: 100,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "When started?",
    Option: "Unknown",
    Adjustment: 75,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Any cleaning attempts?",
    Option: "Fully cleaned",
    Adjustment: 0,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Any cleaning attempts?",
    Option: "Partial",
    Adjustment: 25,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Any cleaning attempts?",
    Option: "None",
    Adjustment: 50,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Any cleaning attempts?",
    Option: "Not sure",
    Adjustment: 25,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Health concerns?",
    Option: "None",
    Adjustment: 0,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Health concerns?",
    Option: "Respiratory",
    Adjustment: 50,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Health concerns?",
    Option: "Immuno-compromised",
    Adjustment: 75,
  },
  {
    Service: "Mold or Water Damage Remediation",
    Question: "Health concerns?",
    Option: "Not sure",
    Adjustment: 25,
  },

  /* ─── Broken Windows or Doors ─────────────────────────────────────── */
  {
    Service: "Broken Windows or Doors",
    Question: "What is broken?",
    Option: "Glass",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What is broken?",
    Option: "Lock",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What is broken?",
    Option: "Full door",
    Adjustment: 100,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What is broken?",
    Option: "Sliding door",
    Adjustment: 100,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What is broken?",
    Option: "Frame",
    Adjustment: 75,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What caused it?",
    Option: "Storm",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What caused it?",
    Option: "Burglary",
    Adjustment: 75,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What caused it?",
    Option: "Accident",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "What caused it?",
    Option: "Not sure",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Is it secure?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Is it secure?",
    Option: "Partially",
    Adjustment: 25,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Is it secure?",
    Option: "Not secure",
    Adjustment: 75,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Is it secure?",
    Option: "Not sure",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Location?",
    Option: "Ground",
    Adjustment: 0,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Location?",
    Option: "2nd floor",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Location?",
    Option: "Balcony",
    Adjustment: 75,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Location?",
    Option: "Basement",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Is this a security emergency?",
    Option: "Yes – open",
    Adjustment: 75,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Is this a security emergency?",
    Option: "Yes – unsafe",
    Adjustment: 50,
  },
  {
    Service: "Broken Windows or Doors",
    Question: "Is this a security emergency?",
    Option: "No",
    Adjustment: 0,
  },

  /* ─── Gas Leaks ───────────────────────────────────────────────────── */
  {
    Service: "Gas Leaks",
    Question: "Smell type?",
    Option: "Mild",
    Adjustment: 50,
  },
  {
    Service: "Gas Leaks",
    Question: "Smell type?",
    Option: "Strong/rotten egg",
    Adjustment: 100,
  },
  {
    Service: "Gas Leaks",
    Question: "Odor location?",
    Option: "Kitchen",
    Adjustment: 0,
  },
  {
    Service: "Gas Leaks",
    Question: "Odor location?",
    Option: "Utility room",
    Adjustment: 25,
  },
  {
    Service: "Gas Leaks",
    Question: "Odor location?",
    Option: "Outside",
    Adjustment: 50,
  },
  {
    Service: "Gas Leaks",
    Question: "Odor location?",
    Option: "Whole home",
    Adjustment: 75,
  },
  {
    Service: "Gas Leaks",
    Question: "Shut off gas?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "Gas Leaks",
    Question: "Shut off gas?",
    Option: "No",
    Adjustment: 50,
  },
  {
    Service: "Gas Leaks",
    Question: "Shut off gas?",
    Option: "Not sure",
    Adjustment: 50,
  },
  {
    Service: "Gas Leaks",
    Question: "Detector/alarm?",
    Option: "Yes",
    Adjustment: 75,
  },
  {
    Service: "Gas Leaks",
    Question: "Detector/alarm?",
    Option: "No",
    Adjustment: 0,
  },
  {
    Service: "Gas Leaks",
    Question: "Detector/alarm?",
    Option: "Not sure",
    Adjustment: 25,
  },
  {
    Service: "Gas Leaks",
    Question: "New appliance?",
    Option: "Yes",
    Adjustment: 50,
  },
  {
    Service: "Gas Leaks",
    Question: "New appliance?",
    Option: "No",
    Adjustment: 0,
  },
  {
    Service: "Gas Leaks",
    Question: "New appliance?",
    Option: "Not sure",
    Adjustment: 25,
  },
  {
    Service: "Gas Leaks",
    Question: "Contacted gas company?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "Gas Leaks",
    Question: "Contacted gas company?",
    Option: "No",
    Adjustment: 50,
  },

  /* ─── Drywall Repairs ──────────────────────────────────────────── */
  {
    Service: "Drywall Repair",
    Question: "What size is the damaged area?",
    Option: 'Small (less than 6")',
    Adjustment: 50,
  },
  {
    Service: "Drywall Repair",
    Question: "What size is the damaged area?",
    Option: 'Medium (between 6 and 12")',
    Adjustment: 25,
  },
  {
    Service: "Drywall Repair",
    Question: "What size is the damaged area?",
    Option: "Large (between 1 and 3 ft)",
    Adjustment: 0,
  },
  {
    Service: "Drywall Repair",
    Question: "What size is the damaged area?",
    Option: "Multiple or greater than 3 ft",
    Adjustment: 100,
  },
  {
    Service: "Drywall Repair",
    Question: "What caused the damage?",
    Option: "Impact or wear",
    Adjustment: 0,
  },
  {
    Service: "Drywall Repair",
    Question: "What caused the damage?",
    Option: "Water damage",
    Adjustment: 150,
  },
  {
    Service: "Drywall Repair",
    Question: "Is the surface textured?",
    Option: "Yes",
    Adjustment: 50,
  },
  {
    Service: "Drywall Repair",
    Question: "Is the surface textured?",
    Option: "No",
    Adjustment: 0,
  },
  {
    Service: "Drywall Repair",
    Question: "Is the damage on a ceiling?",
    Option: "Yes",
    Adjustment: 50,
  },
  {
    Service: "Drywall Repair",
    Question: "Is the damage on a ceiling?",
    Option: "No",
    Adjustment: 0,
  },
  {
    Service: "Drywall Repair",
    Question: "Is paint matching required?",
    Option: "Yes",
    Adjustment: 125,
  },
  {
    Service: "Drywall Repair",
    Question: "Is paint matching required?",
    Option: "No – white or provided",
    Adjustment: 50,
  },
  {
    Service: "Drywall Repair",
    Question: "Is the area obstructed?",
    Option: "Yes",
    Adjustment: 50,
  },
  {
    Service: "Drywall Repair",
    Question: "Is the area obstructed?",
    Option: "No",
    Adjustment: 0,
  },
  /* ─── Appliance Failures ──────────────────────────────────────────── */
  {
    Service: "Appliance Failures",
    Question: "Appliance type?",
    Option: "Fridge",
    Adjustment: 75,
  },
  {
    Service: "Appliance Failures",
    Question: "Appliance type?",
    Option: "Washer",
    Adjustment: 50,
  },
  {
    Service: "Appliance Failures",
    Question: "Appliance type?",
    Option: "Dryer",
    Adjustment: 50,
  },
  {
    Service: "Appliance Failures",
    Question: "Appliance type?",
    Option: "Oven",
    Adjustment: 50,
  },
  {
    Service: "Appliance Failures",
    Question: "Appliance type?",
    Option: "Dishwasher",
    Adjustment: 40,
  },
  {
    Service: "Appliance Failures",
    Question: "Appliance type?",
    Option: "AC",
    Adjustment: 100,
  },
  {
    Service: "Appliance Failures",
    Question: "Issue?",
    Option: "Won’t turn on",
    Adjustment: 0,
  },
  {
    Service: "Appliance Failures",
    Question: "Issue?",
    Option: "Leaking",
    Adjustment: 50,
  },
  {
    Service: "Appliance Failures",
    Question: "Issue?",
    Option: "Noise",
    Adjustment: 25,
  },
  {
    Service: "Appliance Failures",
    Question: "Issue?",
    Option: "Spark/Burn",
    Adjustment: 75,
  },
  {
    Service: "Appliance Failures",
    Question: "Age?",
    Option: "<5 yrs",
    Adjustment: 0,
  },
  {
    Service: "Appliance Failures",
    Question: "Age?",
    Option: "5–10 yrs",
    Adjustment: 25,
  },
  {
    Service: "Appliance Failures",
    Question: "Age?",
    Option: "10+ yrs",
    Adjustment: 50,
  },
  {
    Service: "Appliance Failures",
    Question: "Age?",
    Option: "Unknown",
    Adjustment: 25,
  },
  {
    Service: "Appliance Failures",
    Question: "Recently moved/installed?",
    Option: "Yes",
    Adjustment: 25,
  },
  {
    Service: "Appliance Failures",
    Question: "Recently moved/installed?",
    Option: "No",
    Adjustment: 0,
  },
  {
    Service: "Appliance Failures",
    Question: "Recently moved/installed?",
    Option: "Not sure",
    Adjustment: 10,
  },
  {
    Service: "Appliance Failures",
    Question: "Warranty?",
    Option: "Yes",
    Adjustment: 0,
  },
  {
    Service: "Appliance Failures",
    Question: "Warranty?",
    Option: "No",
    Adjustment: 50,
  },
  {
    Service: "Appliance Failures",
    Question: "Warranty?",
    Option: "Not sure",
    Adjustment: 25,
  },
  {
    Service: "Appliance Failures",
    Question: "Warranty?",
    Option: "Not sure",
    Adjustment: 25,
  },
];

export const coveredDescriptions = {
  "Burst or Leaking Pipes":
    "Leak detection, up to 10ft pipe replacement (PEX/PVC/Copper), minor drywall cuts, fittings, clamps, sealants",
  "Roof Leaks or Storm Damage":
    "Patch or shingle/tile repair up to 50 sqft, sealant, flashing fix, roof inspection",
  "HVAC System Failure":
    "Diagnosis, minor component repair (capacitor, thermostat), refrigerant top-off (limit), coil cleaning",
  "Sewer Backups or Clogged Drains":
    "Snaking, basic drain clearing, visual inspection, hydro-jetting (if noted)",
  // "Electrical Panel Issues or Outages":
  //   "Breaker replacement, fuse testing, panel servicing, electrical diagnostics",
  "Select Electrical Issues Below":
    "Troubleshoot and diagnose power outage issue. Includes minor repairs that can be completed within 1 hour without additional parts. Visual inspection of panel and breakers. \n\n Not included: Major rewiring, Permit-related work, Fixture or device installation.",
  "Water Heater Failure":
    "Diagnostics, standard water heater replacement (40–50 gal), reconnection to water/gas lines",
  "Mold or Water Damage Remediation":
    "Basic mold cleanup (up to 100 sqft), drying fans, HEPA vacuum, disinfection",
  "Broken Windows or Doors":
    "Window glass replacement, basic lock or hinge fix, weather stripping, minor door frame repair",
  "Gas Leaks":
    "Leak location, pipe sealing/replacement (up to 10 ft), pressure testing, valve checks",
  "Appliance Failures":
    "Basic part replacements (thermostat, igniter, valve), diagnosis, labor",
  Cleaning:
    "Dusting, sweeping, vacuuming, mopping, kitchen wipe down, bathroom sanitation, trash removal, surface disinfection, bedroom and living room tidying",
  "Drywall Repair":
    "Patching and repair of damaged drywall, includes drywall material, joint compound, sanding supplies, paint supplies, and all necessary materials for finishing and cleanup.",
};

const BASE_PRICE = {
  "Burst or Leaking Pipes": 350,
  "Roof Leaks or Storm Damage": 750,
  "HVAC System Failure": 650,
  "Sewer Backups or Clogged Drains": 300,
  "Select Electrical Issues Below": 250,
  // "Electrical Panel Issues or Outages": 550,
  "Water Heater Failure": 800,
  "Mold or Water Damage Remediation": 2500,
  "Broken Windows or Doors": 400,
  "Gas Leaks": 500,
  "Appliance Failures": 275,
  "Drywall Repair": 200,
  "Test $1 Service Developer test checkout: fixed $1, no other fees.": 1,
};

const RUSH_FEE = 100; // Global rush fee

// Exported functions
export const getBasePrice = (service) => BASE_PRICE[service] ?? 0;

export function getCoveredDescription(serviceKey) {
  return coveredDescriptions[serviceKey] || "";
}

export const getRushFee = () => RUSH_FEE;

const SERVICE_TO_CATEGORY = {
  // Mappings
  "Test $1 Service Developer test checkout: fixed $1, no other fees.": "Electrician",
  "Burst or Leaking Pipes": "Plumbing",
  "Sewer Backups or Clogged Drains": "Plumbing",
  "Water Heater Failure": "Plumbing",
  "Gas Leaks": "Plumbing",
  "Roof Leaks or Storm Damage": "Roofing",
  "HVAC System Failure": "HVAC",
  "Select Electrical Issues Below": "Electrician",
  // "Electrical Panel Issues or Outages": "Electrician",
  "Mold or Water Damage Remediation": "Water_and_Mold_Remediation",
  "Broken Windows or Doors": "Handyman",
  "Appliance Failures": "Handyman",
  "Drywall Repair": "Handyman",
};

const categoryServices = {};
for (const { Service } of MATRIX) {
  const cat = SERVICE_TO_CATEGORY[Service] || "Odd_Jobs";
  if (!categoryServices[cat]) categoryServices[cat] = new Set();
  categoryServices[cat].add(Service);
}

const questions = {};
const pricing = {};

for (const [cat, svcSet] of Object.entries(categoryServices)) {
  questions[cat] = [
    {
      id: 1,
      question: `Which ${cat
        .replace(/_/g, " ")
        .toLowerCase()} issue are you experiencing?`,
      type: "multiple",
      options: Array.from(svcSet),
    },
  ];
}

for (const row of MATRIX) {
  const { Service, Question, Option, Adjustment } = row;
  if (!questions[Service]) questions[Service] = [];
  if (!pricing[Service]) pricing[Service] = {};

  let qObj = questions[Service].find((q) => q.question === Question);
  if (!qObj) {
    qObj = {
      id: questions[Service].length + 1,
      question: Question,
      type: "multiple",
      options: [],
    };
    questions[Service].push(qObj);
  }
  if (!qObj.options.find((o) => o.value === Option)) {
    qObj.options.push({ value: Option, adjustment: Adjustment });
  }

  if (!pricing[Service][Question]) pricing[Service][Question] = {};
  pricing[Service][Question][Option] = Adjustment;
}

export const getAdjustment = (service, question, option) =>
  pricing?.[service]?.[question]?.[option] ?? 0;

export const estimateTotal = (service, answers = {}) => {
  let total = 0;
  for (const [question, option] of Object.entries(answers)) {
    total += getAdjustment(service, question, option);
  }
  return total + RUSH_FEE;
};

export default {
  questions,
  pricing,
  getCoveredDescription,
  coveredDescriptions,
  getRushFee,
};
