// // utils/serviceMatrix.js ___ working old with test
// const MATRIX = [
//   // {
//   //   Service: "Select Electrical Issues Below",
//   //   Question: `Test $1 Service": "Developer test checkout: fixed $1, no other fees.`,
//   //   Option: "Kitchen",
//   //   Adjustment: 0,
//   // },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Kitchen",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Bathroom wall",
//     Adjustment: 75,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Laundry",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Outdoors",
//     Adjustment: 65,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Unknown",
//     Adjustment: 100,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Exposed",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Behind wall",
//     Adjustment: 100,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Ceiling/Floor",
//     Adjustment: 125,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Unknown",
//     Adjustment: 125,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is water still flowing?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is water still flowing?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is water still flowing?",
//     Option: "I can’t locate shutoff",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "<1 hr",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "1–6 hrs",
//     Adjustment: 25,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "6+ hrs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "Unknown",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Has this pipe leaked before?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Has this pipe leaked before?",
//     Option: "Yes",
//     Adjustment: 40,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Has this pipe leaked before?",
//     Option: "Not sure",
//     Adjustment: 20,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "Minor stain",
//     Adjustment: 40,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "Water-stained",
//     Adjustment: 80,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "Sagging ceiling",
//     Adjustment: 100,
//   },

//   /* ─── Roof Leaks or Storm Damage ───────────────────────────────────── */
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "One stain",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Multiple stains",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Ceiling drip",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Skylight/Wall",
//     Adjustment: 200,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Unknown",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Shingle",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Tile",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Metal",
//     Adjustment: 200,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Flat",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Not sure",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Walkable",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Moderate",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Steep",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Not sure",
//     Adjustment: 75,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "One area",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "Multiple",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "Whole side",
//     Adjustment: 250,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "Not sure",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Today",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Few days",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Week ago",
//     Adjustment: 75,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Recurring",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "Minor stain",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "Sagging ceiling",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "Furniture/floor damage",
//     Adjustment: 150,
//   },

//   /* ─── HVAC System Failure ──────────────────────────────────────────── */
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "No cool air",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "No power",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Water leak",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Breaker trip",
//     Adjustment: 100,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Smell/noise",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Central A/C",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Rooftop",
//     Adjustment: 100,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Mini-split",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Heat pump",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Not sure",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "Today",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "1–2 days",
//     Adjustment: 25,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "3+",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "Ongoing",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Which unit is affected?",
//     Option: "Indoor",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Which unit is affected?",
//     Option: "Outdoor",
//     Adjustment: 25,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Which unit is affected?",
//     Option: "Both",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "System serviced recently?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "System serviced recently?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "System serviced recently?",
//     Option: "Never",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "Minor",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "Stained ceiling",
//     Adjustment: 100,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "Mold",
//     Adjustment: 150,
//   },

//   /* ─── Sewer Backups / Clogged Drains ──────────────────────────────── */
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "One drain",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Toilet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Entire home",
//     Adjustment: 150,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Outside cleanout",
//     Adjustment: 100,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Unknown",
//     Adjustment: 125,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "Today",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "1–2 days",
//     Adjustment: 25,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "3+",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "Ongoing",
//     Adjustment: 75,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "Toilet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "Sink tub",
//     Adjustment: 75,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "Sewage drain",
//     Adjustment: 100,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "Maybe",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "No",
//     Adjustment: 75,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "Plunger",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "Liquid cleaner",
//     Adjustment: 40,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "Snaked",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "Bad smell",
//     Adjustment: 25,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "Drain flies",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "Sewage smell",
//     Adjustment: 75,
//   },

//   /* ─── Electrical Panel Issues or Outages ──────────────────────────── */
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "No power at all in the entire house",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "No power in some areas",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "No power in one room",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "Power is flickering",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "Burning smell",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "Sparks or smoke",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Bedroom",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Kitchen",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Bathroom",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Living room",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Not sure",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Please describe the issue in your own words",
//     Option: "Click other below",
//     Adjustment: 0,
//     AllowFreeText: true,
//   },

//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Entire home lost power",
//   //   Adjustment: 100,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Partial outage",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Tripping breakers",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Burning smell",
//   //   Adjustment: 100,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Flickering",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Not sure",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Square D, Siemens, Eaton",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Zinsco/FPE",
//   //   Adjustment: 150,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Other",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Not sure",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "Visible damage?",
//   //   Option: "None",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "Visible damage?",
//   //   Option: "Rust",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Visible damage?",
//   //   Option: "Burn marks",
//   //   Adjustment: 100,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Visible damage?",
//   //   Option: "Missing breakers",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Panel serviced in last 5 years?",
//   //   Option: "Yes",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Panel serviced in last 5 years?",
//   //   Option: "5+ years ago",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Panel serviced in last 5 years?",
//   //   Option: "Never/Not sure",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "No",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "Fridge/AC",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "Washer/Dryer/Oven",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "Multiple",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "None",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "Storm",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "Surge",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "Remodel",
//   //   Adjustment: 50,
//   // },

//   /* ─── Water Heater Failure ────────────────────────────────────────── */
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "No hot water",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Leaking",
//     Adjustment: 100,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Noise",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Breaker trip",
//     Adjustment: 75,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Electric",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Gas",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Tankless",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "30–40 gal",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "50–60 gal",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "75+ gal",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "<5 yrs",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "5–10 yrs",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "10+ yrs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "Minor",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "Pooled",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "Mold nearby",
//     Adjustment: 75,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Long ago",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Never",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },

//   /* ─── Mold / Water Damage Remediation ─────────────────────────────── */
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Bathroom",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Bedroom",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Kitchen",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Multiple rooms",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Not sure",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "No",
//     Adjustment: 25,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "Just smell",
//     Adjustment: 40,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "Not sure",
//     Adjustment: 40,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Cause?",
//     Option: "Leak",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Cause?",
//     Option: "Flood",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Cause?",
//     Option: "Unknown",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "<24 hrs",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "2–3 days",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "3+ days",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "Unknown",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "Fully cleaned",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "Partial",
//     Adjustment: 25,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "None",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "Respiratory",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "Immuno-compromised",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },

//   /* ─── Broken Windows or Doors ─────────────────────────────────────── */
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Glass",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Lock",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Full door",
//     Adjustment: 100,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Sliding door",
//     Adjustment: 100,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Frame",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Storm",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Burglary",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Accident",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Partially",
//     Adjustment: 25,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Not secure",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "Ground",
//     Adjustment: 0,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "2nd floor",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "Balcony",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "Basement",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is this a security emergency?",
//     Option: "Yes – open",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is this a security emergency?",
//     Option: "Yes – unsafe",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is this a security emergency?",
//     Option: "No",
//     Adjustment: 0,
//   },

//   /* ─── Gas Leaks ───────────────────────────────────────────────────── */
//   {
//     Service: "Gas Leaks",
//     Question: "Smell type?",
//     Option: "Mild",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Smell type?",
//     Option: "Strong/rotten egg",
//     Adjustment: 100,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Kitchen",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Utility room",
//     Adjustment: 25,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Outside",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Whole home",
//     Adjustment: 75,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Shut off gas?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Shut off gas?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Shut off gas?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Detector/alarm?",
//     Option: "Yes",
//     Adjustment: 75,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Detector/alarm?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Detector/alarm?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "New appliance?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "New appliance?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "New appliance?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Contacted gas company?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Contacted gas company?",
//     Option: "No",
//     Adjustment: 50,
//   },

//   /* ─── Drywall Repairs ──────────────────────────────────────────── */
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: 'Small (less than 6")',
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: 'Medium (between 6 and 12")',
//     Adjustment: 25,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: "Large (between 1 and 3 ft)",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: "Multiple or greater than 3 ft",
//     Adjustment: 100,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What caused the damage?",
//     Option: "Impact or wear",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What caused the damage?",
//     Option: "Water damage",
//     Adjustment: 150,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the surface textured?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the surface textured?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the damage on a ceiling?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the damage on a ceiling?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is paint matching required?",
//     Option: "Yes",
//     Adjustment: 125,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is paint matching required?",
//     Option: "No – white or provided",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the area obstructed?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the area obstructed?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   /* ─── Appliance Failures ──────────────────────────────────────────── */
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Fridge",
//     Adjustment: 75,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Washer",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Dryer",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Oven",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Dishwasher",
//     Adjustment: 40,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "AC",
//     Adjustment: 100,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Won’t turn on",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Leaking",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Noise",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Spark/Burn",
//     Adjustment: 75,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "<5 yrs",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "5–10 yrs",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "10+ yrs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "Unknown",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Recently moved/installed?",
//     Option: "Yes",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Recently moved/installed?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Recently moved/installed?",
//     Option: "Not sure",
//     Adjustment: 10,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
// ];

// export const coveredDescriptions = {
//   "Burst or Leaking Pipes":
//     "Leak detection, up to 10ft pipe replacement (PEX/PVC/Copper), minor drywall cuts, fittings, clamps, sealants",
//   "Roof Leaks or Storm Damage":
//     "Patch or shingle/tile repair up to 50 sqft, sealant, flashing fix, roof inspection",
//   "HVAC System Failure":
//     "Diagnosis, minor component repair (capacitor, thermostat), refrigerant top-off (limit), coil cleaning",
//   "Sewer Backups or Clogged Drains":
//     "Snaking, basic drain clearing, visual inspection, hydro-jetting (if noted)",
//   // "Electrical Panel Issues or Outages":
//   //   "Breaker replacement, fuse testing, panel servicing, electrical diagnostics",
//   "Select Electrical Issues Below":
//     "Troubleshoot and diagnose power outage issue. Includes minor repairs that can be completed within 1 hour without additional parts. Visual inspection of panel and breakers. \n\n Not included: Major rewiring, Permit-related work, Fixture or device installation.",
//   "Water Heater Failure":
//     "Diagnostics, standard water heater replacement (40–50 gal), reconnection to water/gas lines",
//   "Mold or Water Damage Remediation":
//     "Basic mold cleanup (up to 100 sqft), drying fans, HEPA vacuum, disinfection",
//   "Broken Windows or Doors":
//     "Window glass replacement, basic lock or hinge fix, weather stripping, minor door frame repair",
//   "Gas Leaks":
//     "Leak location, pipe sealing/replacement (up to 10 ft), pressure testing, valve checks",
//   "Appliance Failures":
//     "Basic part replacements (thermostat, igniter, valve), diagnosis, labor",
//   Cleaning:
//     "Dusting, sweeping, vacuuming, mopping, kitchen wipe down, bathroom sanitation, trash removal, surface disinfection, bedroom and living room tidying",
//   "Drywall Repair":
//     "Patching and repair of damaged drywall, includes drywall material, joint compound, sanding supplies, paint supplies, and all necessary materials for finishing and cleanup.",
// };

// const BASE_PRICE = {
//   "Burst or Leaking Pipes": 350,
//   "Roof Leaks or Storm Damage": 750,
//   "HVAC System Failure": 650,
//   "Sewer Backups or Clogged Drains": 300,
//   "Select Electrical Issues Below": 250,
//   // "Electrical Panel Issues or Outages": 550,
//   "Water Heater Failure": 800,
//   "Mold or Water Damage Remediation": 2500,
//   "Broken Windows or Doors": 400,
//   "Gas Leaks": 500,
//   "Appliance Failures": 275,
//   "Drywall Repair": 200,
//   "Test $1 Service Developer test checkout: fixed $1, no other fees.": 1,
// };

// const RUSH_FEE = 100; // Global rush fee

// // Exported functions
// export const getBasePrice = (service) => BASE_PRICE[service] ?? 0;

// export function getCoveredDescription(serviceKey) {
//   return coveredDescriptions[serviceKey] || "";
// }

// export const getRushFee = () => RUSH_FEE;

// const SERVICE_TO_CATEGORY = {
//   // Mappings
//   "Test $1 Service Developer test checkout: fixed $1, no other fees.": "Electrician",
//   "Burst or Leaking Pipes": "Plumbing",
//   "Sewer Backups or Clogged Drains": "Plumbing",
//   "Water Heater Failure": "Plumbing",
//   "Gas Leaks": "Plumbing",
//   "Roof Leaks or Storm Damage": "Roofing",
//   "HVAC System Failure": "HVAC",
//   "Select Electrical Issues Below": "Electrician",
//   // "Electrical Panel Issues or Outages": "Electrician",
//   "Mold or Water Damage Remediation": "Water_and_Mold_Remediation",
//   "Broken Windows or Doors": "Handyman",
//   "Appliance Failures": "Handyman",
//   "Drywall Repair": "Handyman",
// };

// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd_Jobs";
//   if (!categoryServices[cat]) categoryServices[cat] = new Set();
//   categoryServices[cat].add(Service);
// }

// const questions = {};
// const pricing = {};

// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: 1,
//       question: `Which ${cat
//         .replace(/_/g, " ")
//         .toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet),
//     },
//   ];
// }

// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   if (!questions[Service]) questions[Service] = [];
//   if (!pricing[Service]) pricing[Service] = {};

//   let qObj = questions[Service].find((q) => q.question === Question);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }
//   if (!qObj.options.find((o) => o.value === Option)) {
//     qObj.options.push({ value: Option, adjustment: Adjustment });
//   }

//   if (!pricing[Service][Question]) pricing[Service][Question] = {};
//   pricing[Service][Question][Option] = Adjustment;
// }

// export const getAdjustment = (service, question, option) =>
//   pricing?.[service]?.[question]?.[option] ?? 0;

// export const estimateTotal = (service, answers = {}) => {
//   let total = 0;
//   for (const [question, option] of Object.entries(answers)) {
//     total += getAdjustment(service, question, option);
//   }
//   return total + RUSH_FEE;
// };

// export default {
//   questions,
//   pricing,
//   getCoveredDescription,
//   coveredDescriptions,
//   getRushFee,
// };

//new

// utils/serviceMatrix.js ___ working new with test

//_______________________________________________________________________
//_______________________________________________________________________
//_______________________________________________________________________

//working backup
// const MATRIX = [
//   // {
//   //   Service: "Select Electrical Issues Below",
//   //   Question: `Test $1 Service": "Developer test checkout: fixed $1, no other fees.`,
//   //   Option: "Kitchen",
//   //   Adjustment: 0,
//   // },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Kitchen",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Bathroom wall",
//     Adjustment: 75,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Laundry",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Outdoors",
//     Adjustment: 65,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Unknown",
//     Adjustment: 100,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Exposed",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Behind wall",
//     Adjustment: 100,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Ceiling/Floor",
//     Adjustment: 125,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is the leak exposed or concealed?",
//     Option: "Unknown",
//     Adjustment: 125,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is water still flowing?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is water still flowing?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is water still flowing?",
//     Option: "I can’t locate shutoff",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "<1 hr",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "1–6 hrs",
//     Adjustment: 25,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "6+ hrs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "How long has the leak been active?",
//     Option: "Unknown",
//     Adjustment: 50,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Has this pipe leaked before?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Has this pipe leaked before?",
//     Option: "Yes",
//     Adjustment: 40,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Has this pipe leaked before?",
//     Option: "Not sure",
//     Adjustment: 20,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "Minor stain",
//     Adjustment: 40,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "Water-stained",
//     Adjustment: 80,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Is there damage to drywall/floor/ceiling?",
//     Option: "Sagging ceiling",
//     Adjustment: 100,
//   },

//   /* ─── Roof Leaks or Storm Damage ───────────────────────────────────── */
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "One stain",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Multiple stains",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Ceiling drip",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Skylight/Wall",
//     Adjustment: 200,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Where is the leak coming from?",
//     Option: "Unknown",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Shingle",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Tile",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Metal",
//     Adjustment: 200,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Flat",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "What type of roof?",
//     Option: "Not sure",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Walkable",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Moderate",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Steep",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "How steep is your roof?",
//     Option: "Not sure",
//     Adjustment: 75,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "One area",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "Multiple",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "Whole side",
//     Adjustment: 250,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Is damage isolated or widespread?",
//     Option: "Not sure",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Today",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Few days",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Week ago",
//     Adjustment: 75,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "When did the issue start?",
//     Option: "Recurring",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "Minor stain",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "Sagging ceiling",
//     Adjustment: 100,
//   },
//   {
//     Service: "Roof Leaks or Storm Damage",
//     Question: "Interior damage?",
//     Option: "Furniture/floor damage",
//     Adjustment: 150,
//   },

//   /* ─── HVAC System Failure ──────────────────────────────────────────── */
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "No cool air",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "No power",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Water leak",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Breaker trip",
//     Adjustment: 100,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Smell/noise",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "What is the issue?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Central A/C",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Rooftop",
//     Adjustment: 100,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Mini-split",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Heat pump",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Type of system?",
//     Option: "Not sure",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "Today",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "1–2 days",
//     Adjustment: 25,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "3+",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "When did issue begin?",
//     Option: "Ongoing",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Which unit is affected?",
//     Option: "Indoor",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Which unit is affected?",
//     Option: "Outdoor",
//     Adjustment: 25,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Which unit is affected?",
//     Option: "Both",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "System serviced recently?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "System serviced recently?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "System serviced recently?",
//     Option: "Never",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "Minor",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "Stained ceiling",
//     Adjustment: 100,
//   },
//   {
//     Service: "HVAC System Failure",
//     Question: "Water or mold damage?",
//     Option: "Mold",
//     Adjustment: 150,
//   },

//   /* ─── Sewer Backups / Clogged Drains ──────────────────────────────── */
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "One drain",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Toilet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Entire home",
//     Adjustment: 150,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Outside cleanout",
//     Adjustment: 100,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "What area is affected?",
//     Option: "Unknown",
//     Adjustment: 125,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "Today",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "1–2 days",
//     Adjustment: 25,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "3+",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Duration of issue?",
//     Option: "Ongoing",
//     Adjustment: 75,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "Toilet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "Sink tub",
//     Adjustment: 75,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Overflow present?",
//     Option: "Sewage drain",
//     Adjustment: 100,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "Maybe",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "No",
//     Adjustment: 75,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Do you have a cleanout?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "Plunger",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "Liquid cleaner",
//     Adjustment: 40,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Used chemicals or tools?",
//     Option: "Snaked",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "Bad smell",
//     Adjustment: 25,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "Drain flies",
//     Adjustment: 50,
//   },
//   {
//     Service: "Sewer Backups or Clogged Drains",
//     Question: "Foul smells or insects?",
//     Option: "Sewage smell",
//     Adjustment: 75,
//   },

//   /* ─── Electrical Panel Issues or Outages ──────────────────────────── */
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "No power at all in the entire house",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "No power in some areas",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "No power in one room",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "Power is flickering",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "Burning smell",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "What best describes the issue?",
//     Option: "Sparks or smoke",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Bedroom",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Kitchen",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Bathroom",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Living room",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Where is the outage occurring?",
//     Option: "Not sure",
//     Adjustment: 0,
//   },
//   {
//     Service: "Select Electrical Issues Below",
//     Question: "Please describe the issue in your own words",
//     Option: "Click other below",
//     Adjustment: 0,
//     AllowFreeText: true,
//   },

//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Entire home lost power",
//   //   Adjustment: 100,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Partial outage",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Tripping breakers",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Burning smell",
//   //   Adjustment: 100,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Flickering",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What issue are you experiencing?",
//   //   Option: "Not sure",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Square D, Siemens, Eaton",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Zinsco/FPE",
//   //   Adjustment: 150,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Other",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "What type of panel?",
//   //   Option: "Not sure",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "Visible damage?",
//   //   Option: "None",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "Electrical Panel Issues or Outages",
//   //   Question: "Visible damage?",
//   //   Option: "Rust",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Visible damage?",
//   //   Option: "Burn marks",
//   //   Adjustment: 100,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Visible damage?",
//   //   Option: "Missing breakers",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Panel serviced in last 5 years?",
//   //   Option: "Yes",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Panel serviced in last 5 years?",
//   //   Option: "5+ years ago",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Panel serviced in last 5 years?",
//   //   Option: "Never/Not sure",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "No",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "Fridge/AC",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "Washer/Dryer/Oven",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Major appliances affected?",
//   //   Option: "Multiple",
//   //   Adjustment: 75,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "None",
//   //   Adjustment: 0,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "Storm",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "Surge",
//   //   Adjustment: 50,
//   // },
//   // {
//   //   Service: "See All Electrical Issues",
//   //   Question: "Any surges, storms, remodeling?",
//   //   Option: "Remodel",
//   //   Adjustment: 50,
//   // },

//   /* ─── Water Heater Failure ────────────────────────────────────────── */
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "No hot water",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Leaking",
//     Adjustment: 100,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Noise",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Breaker trip",
//     Adjustment: 75,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "What issue?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Electric",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Gas",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Tankless",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Type?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "30–40 gal",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "50–60 gal",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "75+ gal",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Size?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "<5 yrs",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "5–10 yrs",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "10+ yrs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Age?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "Minor",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "Pooled",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Visible water damage?",
//     Option: "Mold nearby",
//     Adjustment: 75,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Long ago",
//     Adjustment: 25,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Never",
//     Adjustment: 50,
//   },
//   {
//     Service: "Water Heater Failure",
//     Question: "Serviced before?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },

//   /* ─── Mold / Water Damage Remediation ─────────────────────────────── */
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Bathroom",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Bedroom",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Kitchen",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Multiple rooms",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Area affected?",
//     Option: "Not sure",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "No",
//     Adjustment: 25,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "Just smell",
//     Adjustment: 40,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Visible mold?",
//     Option: "Not sure",
//     Adjustment: 40,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Cause?",
//     Option: "Leak",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Cause?",
//     Option: "Flood",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Cause?",
//     Option: "Unknown",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "<24 hrs",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "2–3 days",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "3+ days",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "When started?",
//     Option: "Unknown",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "Fully cleaned",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "Partial",
//     Adjustment: 25,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "None",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Any cleaning attempts?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "None",
//     Adjustment: 0,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "Respiratory",
//     Adjustment: 50,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "Immuno-compromised",
//     Adjustment: 75,
//   },
//   {
//     Service: "Mold or Water Damage Remediation",
//     Question: "Health concerns?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },

//   /* ─── Broken Windows or Doors ─────────────────────────────────────── */
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Glass",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Lock",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Full door",
//     Adjustment: 100,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Sliding door",
//     Adjustment: 100,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What is broken?",
//     Option: "Frame",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Storm",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Burglary",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Accident",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "What caused it?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Partially",
//     Adjustment: 25,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Not secure",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is it secure?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "Ground",
//     Adjustment: 0,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "2nd floor",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "Balcony",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Location?",
//     Option: "Basement",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is this a security emergency?",
//     Option: "Yes – open",
//     Adjustment: 75,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is this a security emergency?",
//     Option: "Yes – unsafe",
//     Adjustment: 50,
//   },
//   {
//     Service: "Broken Windows or Doors",
//     Question: "Is this a security emergency?",
//     Option: "No",
//     Adjustment: 0,
//   },

//   /* ─── Gas Leaks ───────────────────────────────────────────────────── */
//   {
//     Service: "Gas Leaks",
//     Question: "Smell type?",
//     Option: "Mild",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Smell type?",
//     Option: "Strong/rotten egg",
//     Adjustment: 100,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Kitchen",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Utility room",
//     Adjustment: 25,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Outside",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Odor location?",
//     Option: "Whole home",
//     Adjustment: 75,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Shut off gas?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Shut off gas?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Shut off gas?",
//     Option: "Not sure",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Detector/alarm?",
//     Option: "Yes",
//     Adjustment: 75,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Detector/alarm?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Detector/alarm?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "New appliance?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "New appliance?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "New appliance?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Contacted gas company?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Gas Leaks",
//     Question: "Contacted gas company?",
//     Option: "No",
//     Adjustment: 50,
//   },

//   /* ─── Drywall Repairs ──────────────────────────────────────────── */
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: 'Small (less than 6")',
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: 'Medium (between 6 and 12")',
//     Adjustment: 25,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: "Large (between 1 and 3 ft)",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What size is the damaged area?",
//     Option: "Multiple or greater than 3 ft",
//     Adjustment: 100,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What caused the damage?",
//     Option: "Impact or wear",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "What caused the damage?",
//     Option: "Water damage",
//     Adjustment: 150,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the surface textured?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the surface textured?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the damage on a ceiling?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the damage on a ceiling?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is paint matching required?",
//     Option: "Yes",
//     Adjustment: 125,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is paint matching required?",
//     Option: "No – white or provided",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the area obstructed?",
//     Option: "Yes",
//     Adjustment: 50,
//   },
//   {
//     Service: "Drywall Repair",
//     Question: "Is the area obstructed?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   /* ─── Appliance Failures ──────────────────────────────────────────── */
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Fridge",
//     Adjustment: 75,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Washer",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Dryer",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Oven",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "Dishwasher",
//     Adjustment: 40,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Appliance type?",
//     Option: "AC",
//     Adjustment: 100,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Won’t turn on",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Leaking",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Noise",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Issue?",
//     Option: "Spark/Burn",
//     Adjustment: 75,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "<5 yrs",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "5–10 yrs",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "10+ yrs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Age?",
//     Option: "Unknown",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Recently moved/installed?",
//     Option: "Yes",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Recently moved/installed?",
//     Option: "No",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Recently moved/installed?",
//     Option: "Not sure",
//     Adjustment: 10,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "Yes",
//     Adjustment: 0,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "No",
//     Adjustment: 50,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
//   {
//     Service: "Appliance Failures",
//     Question: "Warranty?",
//     Option: "Not sure",
//     Adjustment: 25,
//   },
// ];

// /* ========================================================================== */
// /* COVERED DESCRIPTIONS                                                       */
// /* ========================================================================== */
// export const coveredDescriptions = {
//   "Burst or Leaking Pipes":
//     "Leak detection, up to 10ft pipe replacement (PEX/PVC/Copper), minor drywall cuts, fittings, clamps, sealants",
//   "Roof Leaks or Storm Damage":
//     "Patch or shingle/tile repair up to 50 sqft, sealant, flashing fix, roof inspection",
//   "HVAC System Failure":
//     "Diagnosis, minor component repair (capacitor, thermostat), refrigerant top-off (limit), coil cleaning",
//   "Sewer Backups or Clogged Drains":
//     "Snaking, basic drain clearing, visual inspection, hydro-jetting (if noted)",
//   "Select Electrical Issues Below":
//     "Troubleshoot and diagnose power outage issue. Includes minor repairs that can be completed within 1 hour without additional parts. Visual inspection of panel and breakers.\n\nNot included: Major rewiring, Permit-related work, Fixture or device installation.",
//   "Water Heater Failure":
//     "Diagnostics, standard water heater replacement (40–50 gal), reconnection to water/gas lines",
//   "Mold or Water Damage Remediation":
//     "Basic mold cleanup (up to 100 sqft), drying fans, HEPA vacuum, disinfection",
//   "Broken Windows or Doors":
//     "Window glass replacement, basic lock or hinge fix, weather stripping, minor door frame repair",
//   "Gas Leaks":
//     "Leak location, pipe sealing/replacement (up to 10 ft), pressure testing, valve checks",
//   "Appliance Failures":
//     "Basic part replacements (thermostat, igniter, valve), diagnosis, labor",
//   "Drywall Repair":
//     "Patching and repair of damaged drywall, includes drywall material, joint compound, sanding supplies, paint supplies, and all necessary materials for finishing and cleanup.",
// };

// /* ========================================================================== */
// /* BASE PRICES                                                                */
// /* ========================================================================== */
// const BASE_PRICE = {
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

// // 🔧 Dev-only test service: add conditionally
// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] = "Developer test checkout: fixed $1, no other fees.";
// }

// /* ========================================================================== */
// /* FEES                                                                       */
// /* ========================================================================== */
// const RUSH_FEE = 100; // Global rush fee

// export const getBasePrice = (service) => BASE_PRICE[service] ?? 0;
// export const getCoveredDescription = (serviceKey) => coveredDescriptions[serviceKey] || "";
// export const getRushFee = () => RUSH_FEE;

// /* ========================================================================== */
// /* CATEGORY MAPPINGS                                                          */
// /* ========================================================================== */
// const SERVICE_TO_CATEGORY = {
//   "Burst or Leaking Pipes": "Plumbing",
//   "Sewer Backups or Clogged Drains": "Plumbing",
//   "Water Heater Failure": "Plumbing",
//   "Gas Leaks": "Plumbing",
//   "Roof Leaks or Storm Damage": "Roofing",
//   "HVAC System Failure": "HVAC",
//   "Select Electrical Issues Below": "Electrician",
//   "Mold or Water Damage Remediation": "Water_and_Mold_Remediation",
//   "Broken Windows or Doors": "Handyman",
//   "Appliance Failures": "Handyman",
//   "Drywall Repair": "Handyman",
// };

// // 🔧 Dev-only test service → Electrician
// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   SERVICE_TO_CATEGORY["Test: $1 Flat (No Fees)"] = "Electrician";
// }

// /* ========================================================================== */
// /* BUILD QUESTIONS + PRICING                                                  */
// /* ========================================================================== */
// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd_Jobs";
//   if (!categoryServices[cat]) categoryServices[cat] = new Set();
//   categoryServices[cat].add(Service);
// }

// const questions = {};
// const pricing = {};

// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: 1,
//       question: `Which ${cat.replace(/_/g, " ").toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet),
//     },
//   ];
// }

// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   if (!questions[Service]) questions[Service] = [];
//   if (!pricing[Service]) pricing[Service] = {};

//   let qObj = questions[Service].find((q) => q.question === Question);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }
//   if (!qObj.options.find((o) => o.value === Option)) {
//     qObj.options.push({ value: Option, adjustment: Adjustment });
//   }

//   if (!pricing[Service][Question]) pricing[Service][Question] = {};
//   pricing[Service][Question][Option] = Adjustment;
// }

// /* ========================================================================== */
// /* EXPORTS                                                                    */
// /* ========================================================================== */
// export const getAdjustment = (service, question, option) =>
//   pricing?.[service]?.[question]?.[option] ?? 0;

// export const estimateTotal = (service, answers = {}) => {
//   let total = 0;
//   for (const [question, option] of Object.entries(answers)) {
//     total += getAdjustment(service, question, option);
//   }
//   return total + RUSH_FEE;
// };

// export default {
//   questions,
//   pricing,
//   getCoveredDescription,
//   coveredDescriptions,
//   getRushFee,
// };

//__________________________//
//adding all categories test mode

// const MATRIX = [
//   /* ─── Burst or Leaking Pipes ───────────────────────────────────── */
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Kitchen",
//     Adjustment: 0,
//   },
//   {
//     Service: "Burst or Leaking Pipes",
//     Question: "Where is the leak located?",
//     Option: "Bathroom wall",
//     Adjustment: 75,
//   },
//   // ... [keep all your existing detailed rows here exactly as-is]

//   /* ─── Handyman ──────────────────────────────────────────────── */
//   {
//     Service: "Handyman",
//     Question: "What type of job?",
//     Option: "Minor repair (1 hr or less)",
//     Adjustment: 0,
//   },
//   {
//     Service: "Handyman",
//     Question: "What type of job?",
//     Option: "Assembly (furniture, shelves)",
//     Adjustment: 50,
//   },
//   {
//     Service: "Handyman",
//     Question: "What type of job?",
//     Option: "Installation (fixtures, doors)",
//     Adjustment: 100,
//   },

//   /* ─── Cleaning ──────────────────────────────────────────────── */
//   {
//     Service: "Cleaning",
//     Question: "What type of cleaning?",
//     Option: "Standard house cleaning",
//     Adjustment: 0,
//   },
//   {
//     Service: "Cleaning",
//     Question: "What type of cleaning?",
//     Option: "Deep clean",
//     Adjustment: 100,
//   },
//   {
//     Service: "Cleaning",
//     Question: "What type of cleaning?",
//     Option: "Move in/out",
//     Adjustment: 150,
//   },

//   /* ─── Auto ──────────────────────────────────────────────── */
//   {
//     Service: "Auto",
//     Question: "What’s the issue?",
//     Option: "Dead battery",
//     Adjustment: 75,
//   },
//   {
//     Service: "Auto",
//     Question: "What’s the issue?",
//     Option: "Flat tire",
//     Adjustment: 50,
//   },
//   {
//     Service: "Auto",
//     Question: "What’s the issue?",
//     Option: "Engine won’t start",
//     Adjustment: 200,
//   },

//   /* ─── Pest Control ──────────────────────────────────────────────── */
//   {
//     Service: "Pest Control",
//     Question: "What type of pest?",
//     Option: "Ants",
//     Adjustment: 50,
//   },
//   {
//     Service: "Pest Control",
//     Question: "What type of pest?",
//     Option: "Rodents",
//     Adjustment: 150,
//   },
//   {
//     Service: "Pest Control",
//     Question: "What type of pest?",
//     Option: "Termites",
//     Adjustment: 300,
//   },

//   /* ─── Painting ──────────────────────────────────────────────── */
//   {
//     Service: "Painting",
//     Question: "What area do you need painted?",
//     Option: "Single room",
//     Adjustment: 100,
//   },
//   {
//     Service: "Painting",
//     Question: "What area do you need painted?",
//     Option: "Multiple rooms",
//     Adjustment: 250,
//   },
//   {
//     Service: "Painting",
//     Question: "What area do you need painted?",
//     Option: "Exterior",
//     Adjustment: 400,
//   },

//   /* ─── Flooring ──────────────────────────────────────────────── */
//   {
//     Service: "Flooring",
//     Question: "What type of flooring?",
//     Option: "Tile",
//     Adjustment: 200,
//   },
//   {
//     Service: "Flooring",
//     Question: "What type of flooring?",
//     Option: "Wood",
//     Adjustment: 300,
//   },
//   {
//     Service: "Flooring",
//     Question: "What type of flooring?",
//     Option: "Carpet",
//     Adjustment: 150,
//   },

//   /* ─── Landscaping ──────────────────────────────────────────────── */
//   {
//     Service: "Landscaping",
//     Question: "What service do you need?",
//     Option: "Lawn mowing",
//     Adjustment: 50,
//   },
//   {
//     Service: "Landscaping",
//     Question: "What service do you need?",
//     Option: "Tree trimming",
//     Adjustment: 150,
//   },
//   {
//     Service: "Landscaping",
//     Question: "What service do you need?",
//     Option: "Sod installation",
//     Adjustment: 300,
//   },

//   /* ─── Smart Home ──────────────────────────────────────────────── */
//   {
//     Service: "Smart Home",
//     Question: "What device?",
//     Option: "Smart lock",
//     Adjustment: 75,
//   },
//   {
//     Service: "Smart Home",
//     Question: "What device?",
//     Option: "Security camera",
//     Adjustment: 150,
//   },
//   {
//     Service: "Smart Home",
//     Question: "What device?",
//     Option: "Thermostat",
//     Adjustment: 100,
//   },

//   /* ─── IT Services ──────────────────────────────────────────────── */
//   {
//     Service: "IT Services",
//     Question: "What’s the issue?",
//     Option: "WiFi setup/troubleshoot",
//     Adjustment: 50,
//   },
//   {
//     Service: "IT Services",
//     Question: "What’s the issue?",
//     Option: "Computer repair",
//     Adjustment: 150,
//   },
//   {
//     Service: "IT Services",
//     Question: "What’s the issue?",
//     Option: "Virus removal",
//     Adjustment: 200,
//   },

//   /* ─── Environmental ──────────────────────────────────────────────── */
//   {
//     Service: "Environmental",
//     Question: "What issue are you dealing with?",
//     Option: "Asbestos",
//     Adjustment: 250,
//   },
//   {
//     Service: "Environmental",
//     Question: "What issue are you dealing with?",
//     Option: "Lead paint",
//     Adjustment: 200,
//   },
//   {
//     Service: "Environmental",
//     Question: "What issue are you dealing with?",
//     Option: "Radon",
//     Adjustment: 300,
//   },

//   /* ─── Remodeling ──────────────────────────────────────────────── */
//   {
//     Service: "Remodeling",
//     Question: "What area are you remodeling?",
//     Option: "Kitchen",
//     Adjustment: 500,
//   },
//   {
//     Service: "Remodeling",
//     Question: "What area are you remodeling?",
//     Option: "Bathroom",
//     Adjustment: 400,
//   },
//   {
//     Service: "Remodeling",
//     Question: "What area are you remodeling?",
//     Option: "Whole home",
//     Adjustment: 1500,
//   },
// ];

/* ========================================================================== */
/* COVERED DESCRIPTIONS                                                       */
/* ========================================================================== */
// const coveredDescriptions = {
//   // Plumbing
//   "Burst or Leaking Pipes":
//     "Leak detection, up to 10ft pipe replacement (PEX/PVC/Copper), minor drywall cuts, fittings, clamps, sealants.",
//   "Sewer Backups or Clogged Drains":
//     "Snaking, basic drain clearing, visual inspection, hydro-jetting (if required).",
//   "Water Heater Failure":
//     "Diagnostics, standard water heater replacement (40–50 gal), reconnection to water/gas lines.",
//   "Gas Leaks":
//     "Leak location, pipe sealing/replacement (up to 10 ft), pressure testing, valve checks.",

//   // Roofing
//   "Roof Leaks or Storm Damage":
//     "Patch or shingle/tile repair up to 50 sqft, sealant, flashing fix, roof inspection.",

//   // HVAC
//   "HVAC System Failure":
//     "Diagnosis, minor component repair (capacitor, thermostat), refrigerant top-off (limit), coil cleaning.",

//   // Electrical
//   "Select Electrical Issues Below":
//     "Troubleshoot and diagnose power outage issues. Includes minor repairs within 1 hr. Visual inspection of panel and breakers. Excludes major rewiring or permit-required work.",

//   // Mold & Water
//   "Mold or Water Damage Remediation":
//     "Basic mold cleanup (up to 100 sqft), drying fans, HEPA vacuum, disinfection. Excludes large-scale abatement.",

//   // Handyman
//   "Drywall Repair":
//     "Patching and repair of damaged drywall, includes materials, finishing, paint match, and cleanup.",
//   "Appliance Failures":
//     "Basic part replacements (thermostat, igniter, valve), diagnosis, and labor.",
//   "Broken Windows or Doors":
//     "Window glass replacement, basic lock or hinge fix, weather stripping, minor frame repair.",
//   Handyman:
//     "General handyman services including minor repairs, installations, assemblies, and household fixes.",

//   // Cleaning
//   Cleaning:
//     "Dusting, sweeping, vacuuming, mopping, kitchen wipe down, bathroom sanitation, trash removal, surface disinfection.",

//   // Auto
//   Auto:
//     "On-site auto help including jump starts, tire changes, lockouts, and light diagnostics (non-tow).",

//   // Pest Control
//   "Pest Control":
//     "Treatment for ants, roaches, rodents, or termites. Includes inspection and application of safe pest control solutions.",

//   // Painting
//   Painting:
//     "Interior and exterior painting. Includes prep, priming, and paint application. Excludes specialty finishes.",

//   // Flooring
//   Flooring:
//     "Installation or repair of tile, wood, laminate, or carpet. Includes removal of old flooring if required.",

//   // Landscaping
//   Landscaping:
//     "Lawn mowing, edging, trimming, hedge/tree care, planting, sod installation.",

//   // Smart Home
//   "Smart Home":
//     "Installation and setup of smart locks, cameras, thermostats, and other IoT devices.",

//   // IT Services
//   "IT Services":
//     "Computer troubleshooting, WiFi setup, virus removal, and general IT support.",

//   // Environmental
//   Environmental:
//     "Environmental hazard services including asbestos, lead paint, or radon testing/mitigation.",

//   // Remodeling
//   Remodeling:
//     "Kitchen, bathroom, or whole-home remodeling. Includes demolition, installation, and finishing work.",

//   // Dev test service
//   "Test $1 Service Developer test checkout: fixed $1, no other fees.":
//     "Developer test checkout: fixed $1, no other fees.",
// };

/* ========================================================================== */
/* BASE PRICE ANCHORS                                                         */
/* ========================================================================== */
// const BASE_PRICE = {
//   // Plumbing
//   "Burst or Leaking Pipes": 350,
//   "Sewer Backups or Clogged Drains": 300,
//   "Water Heater Failure": 800,
//   "Gas Leaks": 500,

//   // Roofing
//   "Roof Leaks or Storm Damage": 750,

//   // HVAC
//   "HVAC System Failure": 650,

//   // Electrical
//   "Select Electrical Issues Below": 250,
//   // "Electrical Panel Issues or Outages": 550, // optional if added later

//   // Mold & Water
//   "Mold or Water Damage Remediation": 2500,

//   // Handyman
//   "Drywall Repair": 200,
//   "Appliance Failures": 275,
//   "Broken Windows or Doors": 400,
//   "Handyman": 150,

//   // Cleaning
//   "Cleaning": 125,

//   // Auto
//   "Auto": 175,

//   // Pest Control
//   "Pest Control": 225,

//   // Painting
//   "Painting": 300,

//   // Flooring
//   "Flooring": 400,

//   // Landscaping
//   "Landscaping": 200,

//   // Smart Home
//   "Smart Home": 175,

//   // IT Services
//   "IT Services": 150,

//   // Environmental
//   "Environmental": 750,

//   // Remodeling
//   "Remodeling": 1200,

//   // Dev test service
//   "Test $1 Service Developer test checkout: fixed $1, no other fees.": 1,
// };

// Dev-only
// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] =
//     "Developer test checkout: fixed $1, no other fees.";
// }

/* ========================================================================== */
/* FEES + HELPERS                                                             */
/* ========================================================================== */
// const RUSH_FEE = 100;

// export const getBasePrice = (serviceOrCategory) => {
//   // Allow category or service; be robust against 0 values
//   if (Object.prototype.hasOwnProperty.call(BASE_PRICE, serviceOrCategory)) {
//     return BASE_PRICE[serviceOrCategory];
//   }
//   const cat = SERVICE_TO_CATEGORY[serviceOrCategory];
//   return cat && Object.prototype.hasOwnProperty.call(BASE_PRICE, cat)
//     ? BASE_PRICE[cat]
//     : 0;
// };

// export const getCoveredDescription = (serviceKey) =>
//   coveredDescriptions[serviceKey] || "";

// export const getRushFee = () => RUSH_FEE;

// /* ========================================================================== */
// /* CATEGORY MAPPINGS                                                          */
// /* ========================================================================== */
// const SERVICE_TO_CATEGORY = {
//   // Core trades
//   Plumbing: "Plumbing",
//   Roofing: "Roofing",
//   HVAC: "HVAC",
//   Electrician: "Electrician",

//   // Handyman family
//   "Handyman (general fixes)": "Handyman",
//   "Carpenter (doors/trim/cabinets)": "Handyman",
//   "Garage Door Technician": "Handyman",
//   "Window & Glass Repair": "Handyman",
//   "Gutter Cleaning / Repair": "Handyman",
//   "Moving Help (Labor-only)": "Handyman",
//   "Junk Removal / Hauling": "Handyman",
//   "Pressure Washing": "Handyman",
//   "Fence Repair / Installer": "Handyman",
//   "Pool & Spa Technician": "Handyman",
//   "Window/Door Replacement (Glazier)": "Handyman",
//   "Barber / Hairdresser": "Handyman", // or Personal Services

//   // Cleaning
//   "Cleaner / Housekeeper": "Cleaning",

//   // Locksmith
//   Locksmith: "Locksmith",

//   // Appliances
//   "Appliance Repair Tech": "Handyman", // or Appliances

//   // Landscaping
//   "Landscaper / Lawn Care": "Landscaping",
//   "Tree Service / Arborist": "Landscaping",
//   "Irrigation / Sprinkler Tech": "Landscaping",

//   // Painting
//   "Painter (interior/exterior)": "Painting",

//   // Pest Control
//   "Pest Control / Exterminator": "Pest Control",

//   // Flooring
//   "Tile & Grout Specialist": "Flooring",
//   "Flooring Installer / Repair": "Flooring",

//   // Smart Home & IT
//   "Smart-home / Low-voltage Installer": "Smart Home",
//   "Security System Installer": "Smart Home",
//   "TV Mounting / Home Theater Installer": "Smart Home",
//   "IT / Wi-Fi Setup (Home Networking)": "IT Services",

//   // Water & Mold
//   "Water Damage Mitigation": "Water & Mold Remediation",
//   "Basement Waterproofing": "Water & Mold Remediation",

//   // Remodeling
//   "Masonry / Concrete": "Remodeling",
//   "Deck/Patio Repair & Build": "Remodeling",
//   "Solar Installer": "Remodeling",
//   "General Contractor / Remodeler": "Remodeling",

//   // Environmental
//   "Insulation / Weatherization Tech": "Environmental",
//   "Chimney Sweep & Masonry": "Environmental",
//   "Radon Mitigation / Environmental": "Environmental",

//   // Auto family
//   "Car Mechanic (general)": "Auto",
//   "Mobile Mechanic": "Auto",
//   "Tow Truck / Roadside Assistance": "Auto",
//   "Auto Glass Repair/Replacement": "Auto",
//   "Car Detailing (mobile)": "Auto",
//   "Mobile Tire Service": "Auto",
// };

// // Dev-only
// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   SERVICE_TO_CATEGORY["Test: $1 Flat (No Fees)"] = "Electrician";
// }

// /* ========================================================================== */
// /* BUILD QUESTIONS + PRICING                                                  */
// /* ========================================================================== */
// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd Jobs";
//   if (!categoryServices[cat]) categoryServices[cat] = new Set();
//   categoryServices[cat].add(Service);
// }

// const questions = {};
// const pricing = {};

// // Category-level (options = plain strings, as before)
// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: 1,
//       question: `Which ${cat.replace(/_/g, " ").toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet), // <-- plain strings (service names)
//     },
//   ];
// }

// // Service-level (options = { value, adjustment }, as before)
// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   if (!questions[Service]) questions[Service] = [];
//   if (!pricing[Service]) pricing[Service] = {};

//   let qObj = questions[Service].find((q) => q.question === Question);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }

//   const optionValue = String(Option).trim();
//   if (!qObj.options.find((o) => o.value === optionValue)) {
//     qObj.options.push({ value: optionValue, adjustment: Adjustment });
//   }

//   if (!pricing[Service][Question]) pricing[Service][Question] = {};
//   pricing[Service][Question][optionValue] = Adjustment;
// }

// /* ========================================================================== */
// /* EXPORTS                                                                    */
// /* ========================================================================== */
// // Match original working API: no guessing, just return the bucket.
// export const getQuestions = (serviceOrCategory) => questions[serviceOrCategory] || [];

// export const getAdjustment = (service, question, option) =>
//   pricing?.[service]?.[question]?.[option] ?? 0;

// // Compute strictly for the provided key (service or category).
// // In your flow, call this with the **service** after the user selects it.
// export const estimateTotal = (serviceOrCategory, answers = {}) => {
//   let total = getBasePrice(serviceOrCategory);

//   for (const [question, option] of Object.entries(answers)) {
//     total += getAdjustment(serviceOrCategory, question, option);
//   }

//   return total + RUSH_FEE;
// };

// export default {
//   questions,
//   pricing,
//   getBasePrice,
//   getCoveredDescription,
//   getRushFee,
//   getQuestions,
//   getAdjustment,
//   estimateTotal,
// };

//current working
// /* ========================================================================== */
// /* MATRIX: All services, questions, options, adjustments                      */
// /* ========================================================================== */

//   // backend/config/adjustments.js -- NEW STYLE
//  export const MATRIX = [
//   // backend/config/adjustments.js

//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   // { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//   // { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 75 },
//   { Service: "Plumbing", Question: "where located", Option: "kitchen", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom", Adjustment: 75 },
//   // { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//   // { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 200 },
//   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 200 },
//   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 150 },
//   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 150 },

//   // Roofing
//   { Service: "Roofing", Question: "roof material", Option: "shingles", Adjustment: 50 },
//   { Service: "Roofing", Question: "roof material", Option: "tile", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof material", Option: "metal", Adjustment: 150 },
//   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },
//   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },

//   // HVAC
//   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 100 },
//   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 150 },
//   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 150 },
//   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 150 },
//   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 100 },
//   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 100 },
//   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 200 },

//   // Electrician
//   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 75 },
//   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 125 },
//   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "multiple circuits", Adjustment: 200 },
//   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//   { Service: "Electrician", Question: "accessibility", Option: "panel work", Adjustment: 150 },
//   { Service: "Electrician", Question: "accessibility", Option: "attic work", Adjustment: 150 },

//   /* ================== OTHER CATEGORIES ================== */
//   // Handyman
//   { Service: "Handyman (general fixes)", Question: "repair type", Option: "furniture", Adjustment: 50 },
//   { Service: "Handyman (general fixes)", Question: "repair type", Option: "fixtures", Adjustment: 50 },
//   { Service: "Handyman (general fixes)", Question: "repair type", Option: "doors", Adjustment: 100 },
//   { Service: "Handyman (general fixes)", Question: "repair type", Option: "windows", Adjustment: 100 },
//   { Service: "Handyman (general fixes)", Question: "size of job", Option: "small under 1 hour", Adjustment: 0 },
//   { Service: "Handyman (general fixes)", Question: "size of job", Option: "larger 2+ hours", Adjustment: 150 },

//   // Locksmith
//   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
//   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
//   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },

//   // Cleaning
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning", Adjustment: 100 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out", Adjustment: 150 },
//   { Service: "Cleaner / Housekeeper", Question: "home size", Option: "small under 1000 sqft", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "home size", Option: "large over 2500 sqft", Adjustment: 200 },

//   // Auto (Mobile Mechanic)
//   { Service: "Mobile Mechanic", Question: "issue", Option: "battery", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "starter", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "engine", Adjustment: 300 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "transmission", Adjustment: 300 },
//   { Service: "Mobile Mechanic", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//   { Service: "Mobile Mechanic", Question: "vehicle location", Option: "highway", Adjustment: 200 },
//   { Service: "Mobile Mechanic", Question: "vehicle location", Option: "remote", Adjustment: 200 },

//   // Pest Control
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 150 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 300 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 300 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 250 },

//   // Painting
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "single room", Adjustment: 100 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "entire house", Adjustment: 500 },

//   // Flooring
//   { Service: "Flooring Installer / Repair", Question: "floor type", Option: "carpet", Adjustment: 50 },
//   { Service: "Flooring Installer / Repair", Question: "floor type", Option: "tile", Adjustment: 150 },
//   { Service: "Flooring Installer / Repair", Question: "floor type", Option: "hardwood", Adjustment: 150 },
//   { Service: "Flooring Installer / Repair", Question: "job size", Option: "small under 200 sqft", Adjustment: 75 },
//   { Service: "Flooring Installer / Repair", Question: "job size", Option: "large over 1000 sqft", Adjustment: 400 },

//   // Landscaping
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 300 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "acreage", Adjustment: 300 },

//   // Smart Home (TV / Theater)
//   { Service: "TV Mounting / Home Theater Installer", Question: "service type", Option: "tv mount", Adjustment: 100 },
//   { Service: "TV Mounting / Home Theater Installer", Question: "service type", Option: "home theater", Adjustment: 300 },
//   { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "drywall", Adjustment: 0 },
//   { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "brick", Adjustment: 150 },
//   { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "concrete", Adjustment: 150 },

//   // IT Services
//   { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "issue type", Option: "wi-fi setup", Adjustment: 50 },
//   { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "issue type", Option: "network troubleshooting", Adjustment: 100 },
//   { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "issue type", Option: "smart device integration", Adjustment: 150 },

//   // Water & Mold
//   { Service: "Water Damage Mitigation", Question: "where located", Option: "basement", Adjustment: 150 },
//   { Service: "Water Damage Mitigation", Question: "where located", Option: "bathroom", Adjustment: 100 },
//   { Service: "Water Damage Mitigation", Question: "where located", Option: "kitchen", Adjustment: 100 },
//   { Service: "Water Damage Mitigation", Question: "severity", Option: "minor", Adjustment: 0 },
//   { Service: "Water Damage Mitigation", Question: "severity", Option: "major flooding", Adjustment: 400 },

//   // Remodeling
//   { Service: "General Contractor / Remodeler", Question: "remodel type", Option: "kitchen", Adjustment: 500 },
//   { Service: "General Contractor / Remodeler", Question: "remodel type", Option: "bathroom", Adjustment: 400 },
//   { Service: "General Contractor / Remodeler", Question: "remodel size", Option: "small project", Adjustment: 0 },
//   { Service: "General Contractor / Remodeler", Question: "remodel size", Option: "full house", Adjustment: 2000 },

//   // Environmental
//   { Service: "Insulation / Weatherization Tech", Question: "service type", Option: "attic insulation", Adjustment: 200 },
//   { Service: "Insulation / Weatherization Tech", Question: "service type", Option: "wall insulation", Adjustment: 300 },
//   { Service: "Insulation / Weatherization Tech", Question: "home size", Option: "small under 1500 sqft", Adjustment: 0 },
//   { Service: "Insulation / Weatherization Tech", Question: "home size", Option: "large over 2500 sqft", Adjustment: 400 },

// /* ================== MORE CATEGORIES (HARDENED) ================== */

// // Gutter Cleaning / Repair
// { Service: "Gutter Cleaning / Repair", Question: "work type", Option: "cleaning", Adjustment: 0 },
// { Service: "Gutter Cleaning / Repair", Question: "work type", Option: "repair", Adjustment: 100 },
// { Service: "Gutter Cleaning / Repair", Question: "home height", Option: "single story", Adjustment: 0 },
// { Service: "Gutter Cleaning / Repair", Question: "home height", Option: "two story", Adjustment: 100 },
// { Service: "Gutter Cleaning / Repair", Question: "home height", Option: "three story", Adjustment: 175 },
// { Service: "Gutter Cleaning / Repair", Question: "gutter guards", Option: "has guards", Adjustment: 75 },

// // Tile & Grout Specialist
// { Service: "Tile & Grout Specialist", Question: "area", Option: "shower", Adjustment: 125 },
// { Service: "Tile & Grout Specialist", Question: "area", Option: "floor", Adjustment: 75 },
// { Service: "Tile & Grout Specialist", Question: "issue", Option: "regrout", Adjustment: 100 },
// { Service: "Tile & Grout Specialist", Question: "issue", Option: "replace tiles", Adjustment: 150 },
// { Service: "Tile & Grout Specialist", Question: "condition", Option: "mold", Adjustment: 125 },

// // Security System Installer
// { Service: "Security System Installer", Question: "system size", Option: "whole home", Adjustment: 200 },
// { Service: "Security System Installer", Question: "system size", Option: "single area", Adjustment: 75 },
// { Service: "Security System Installer", Question: "devices", Option: "4+ cameras", Adjustment: 150 },
// { Service: "Security System Installer", Question: "devices", Option: "2-3 cameras", Adjustment: 75 },

// // Irrigation / Sprinkler Tech
// { Service: "Irrigation / Sprinkler Tech", Question: "work type", Option: "start up", Adjustment: 50 },
// { Service: "Irrigation / Sprinkler Tech", Question: "work type", Option: "winterize", Adjustment: 75 },
// { Service: "Irrigation / Sprinkler Tech", Question: "work type", Option: "repair leak", Adjustment: 125 },
// { Service: "Irrigation / Sprinkler Tech", Question: "zones", Option: "5+ zones", Adjustment: 100 },

// // Carpenter (Doors/Trim/Cabinets)
// { Service: "Carpenter (doors/trim/cabinets)", Question: "scope", Option: "door install", Adjustment: 150 },
// { Service: "Carpenter (doors/trim/cabinets)", Question: "scope", Option: "trim/baseboard", Adjustment: 75 },
// { Service: "Carpenter (doors/trim/cabinets)", Question: "scope", Option: "cabinet repair", Adjustment: 125 },
// { Service: "Carpenter (doors/trim/cabinets)", Question: "material", Option: "custom", Adjustment: 150 },

// // Garage Door Technician
// { Service: "Garage Door Technician", Question: "issue", Option: "spring", Adjustment: 175 },
// { Service: "Garage Door Technician", Question: "issue", Option: "opener", Adjustment: 125 },
// { Service: "Garage Door Technician", Question: "issue", Option: "cables/rollers", Adjustment: 100 },
// { Service: "Garage Door Technician", Question: "door size", Option: "double", Adjustment: 75 },

// // Window & Glass Repair
// { Service: "Window & Glass Repair", Question: "glass type", Option: "tempered", Adjustment: 125 },
// { Service: "Window & Glass Repair", Question: "glass type", Option: "double pane", Adjustment: 150 },
// { Service: "Window & Glass Repair", Question: "size", Option: "large", Adjustment: 100 },

// // Pressure Washing
// { Service: "Pressure Washing", Question: "surface", Option: "driveway", Adjustment: 50 },
// { Service: "Pressure Washing", Question: "surface", Option: "house siding", Adjustment: 100 },
// { Service: "Pressure Washing", Question: "surface", Option: "roof", Adjustment: 150 },
// { Service: "Pressure Washing", Question: "size", Option: "large", Adjustment: 100 },

// // Fence Repair / Installer
// { Service: "Fence Repair / Installer", Question: "material", Option: "wood", Adjustment: 50 },
// { Service: "Fence Repair / Installer", Question: "material", Option: "vinyl", Adjustment: 75 },
// { Service: "Fence Repair / Installer", Question: "material", Option: "metal", Adjustment: 100 },
// { Service: "Fence Repair / Installer", Question: "length", Option: "over 100 linear feet", Adjustment: 200 },

// // Masonry / Concrete
// { Service: "Masonry / Concrete", Question: "project", Option: "steps", Adjustment: 150 },
// { Service: "Masonry / Concrete", Question: "project", Option: "walkway", Adjustment: 175 },
// { Service: "Masonry / Concrete", Question: "project", Option: "foundation", Adjustment: 250 },

// // Pool & Spa Technician
// { Service: "Pool & Spa Technician", Question: "equipment", Option: "pump", Adjustment: 125 },
// { Service: "Pool & Spa Technician", Question: "equipment", Option: "heater", Adjustment: 150 },
// { Service: "Pool & Spa Technician", Question: "service", Option: "leak detection", Adjustment: 175 },

// // Tree Service / Arborist
// { Service: "Tree Service / Arborist", Question: "tree size", Option: "large", Adjustment: 250 },
// { Service: "Tree Service / Arborist", Question: "risk", Option: "near power lines", Adjustment: 200 },
// { Service: "Tree Service / Arborist", Question: "access", Option: "limited access", Adjustment: 150 },

// // Window/Door Replacement (Glazier)
// { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "window replacement", Adjustment: 150 },
// { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "door replacement", Adjustment: 175 },
// { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "double pane", Adjustment: 125 },
// { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "storm", Adjustment: 150 },

// // Auto Glass Repair/Replacement
// { Service: "Auto Glass Repair/Replacement", Question: "glass location", Option: "windshield", Adjustment: 125 },
// { Service: "Auto Glass Repair/Replacement", Question: "glass location", Option: "rear", Adjustment: 100 },
// { Service: "Auto Glass Repair/Replacement", Question: "glass location", Option: "side", Adjustment: 75 },

// // Tow Truck / Roadside Assistance
// { Service: "Tow Truck / Roadside Assistance", Question: "situation", Option: "after hours", Adjustment: 75 },
// { Service: "Tow Truck / Roadside Assistance", Question: "situation", Option: "winch out", Adjustment: 100 },
// { Service: "Tow Truck / Roadside Assistance", Question: "distance", Option: "long distance", Adjustment: 150 },

// // Car Detailing (Mobile)
// { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 75 },
// { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 75 },
// { Service: "Car Detailing (mobile)", Question: "package", Option: "full interior", Adjustment: 125 },
// { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 50 },

// // Mobile Tire Service
// { Service: "Mobile Tire Service", Question: "count", Option: "all four", Adjustment: 125 },
// { Service: "Mobile Tire Service", Question: "count", Option: "single tire", Adjustment: 50 },
// { Service: "Mobile Tire Service", Question: "location", Option: "roadside", Adjustment: 75 },

// /* ================== SMART-HOME / LOW-VOLTAGE ================== */
// { Service: "Smart-home / Low-voltage Installer", Question: "scope", Option: "multi-room", Adjustment: 150 },
// { Service: "Smart-home / Low-voltage Installer", Question: "scope", Option: "single room", Adjustment: 75 },
// { Service: "Smart-home / Low-voltage Installer", Question: "devices", Option: "6+ devices", Adjustment: 150 },
// { Service: "Smart-home / Low-voltage Installer", Question: "devices", Option: "3-5 devices", Adjustment: 100 },

// /* ================== SECURITY ================== */
// { Service: "Security System Installer", Question: "system size", Option: "whole home", Adjustment: 200 },
// { Service: "Security System Installer", Question: "system size", Option: "single area", Adjustment: 75 },
// { Service: "Security System Installer", Question: "devices", Option: "4+ cameras", Adjustment: 150 },
// { Service: "Security System Installer", Question: "devices", Option: "2-3 cameras", Adjustment: 75 },

// /* ================== TV / HOME THEATER ================== */
// { Service: "TV Mounting / Home Theater Installer", Question: "mounting location", Option: "over fireplace", Adjustment: 125 },
// { Service: "TV Mounting / Home Theater Installer", Question: "tv size", Option: "75+", Adjustment: 100 },
// { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "brick", Adjustment: 150 },
// { Service: "TV Mounting / Home Theater Installer", Question: "wall type", Option: "concrete", Adjustment: 150 },

// /* ================== DECK / PATIO ================== */
// { Service: "Deck/Patio Repair & Build", Question: "project", Option: "new build", Adjustment: 400 },
// { Service: "Deck/Patio Repair & Build", Question: "project", Option: "repair", Adjustment: 150 },
// { Service: "Deck/Patio Repair & Build", Question: "material", Option: "composite", Adjustment: 200 },
// { Service: "Deck/Patio Repair & Build", Question: "size", Option: "large", Adjustment: 300 },

// /* ================== INSULATION / WEATHERIZATION ================== */
// { Service: "Insulation / Weatherization Tech", Question: "area", Option: "attic", Adjustment: 150 },
// { Service: "Insulation / Weatherization Tech", Question: "area", Option: "crawlspace", Adjustment: 125 },
// { Service: "Insulation / Weatherization Tech", Question: "material", Option: "spray foam", Adjustment: 250 },
// { Service: "Insulation / Weatherization Tech", Question: "home size", Option: "large", Adjustment: 300 },

// /* ================== CHIMNEY ================== */
// { Service: "Chimney Sweep & Masonry", Question: "service", Option: "sweep only", Adjustment: 0 },
// { Service: "Chimney Sweep & Masonry", Question: "service", Option: "cap/crown repair", Adjustment: 150 },
// { Service: "Chimney Sweep & Masonry", Question: "service", Option: "reline", Adjustment: 300 },
// { Service: "Chimney Sweep & Masonry", Question: "condition", Option: "structural", Adjustment: 250 },

// /* ================== WATER DAMAGE ================== */
// { Service: "Water Damage Mitigation", Question: "area", Option: "basement", Adjustment: 150 },
// { Service: "Water Damage Mitigation", Question: "area", Option: "kitchen", Adjustment: 100 },
// { Service: "Water Damage Mitigation", Question: "severity", Option: "major flooding", Adjustment: 400 },
// { Service: "Water Damage Mitigation", Question: "condition", Option: "mold", Adjustment: 150 },

// /* ================== BASEMENT WATERPROOFING ================== */
// { Service: "Basement Waterproofing", Question: "solution", Option: "interior drain", Adjustment: 400 },
// { Service: "Basement Waterproofing", Question: "solution", Option: "sump pump", Adjustment: 250 },
// { Service: "Basement Waterproofing", Question: "solution", Option: "exterior waterproofing", Adjustment: 600 },
// { Service: "Basement Waterproofing", Question: "severity", Option: "severe", Adjustment: 300 },

// /* ================== SOLAR ================== */
// { Service: "Solar Installer", Question: "project", Option: "full system", Adjustment: 750 },
// { Service: "Solar Installer", Question: "project", Option: "panel repair", Adjustment: 200 },
// { Service: "Solar Installer", Question: "extras", Option: "battery", Adjustment: 500 },
// { Service: "Solar Installer", Question: "roof", Option: "tile/metal", Adjustment: 200 },

// /* ================== GENERAL CONTRACTOR ================== */
// { Service: "General Contractor / Remodeler", Question: "scope", Option: "kitchen", Adjustment: 500 },
// { Service: "General Contractor / Remodeler", Question: "scope", Option: "bathroom", Adjustment: 400 },
// { Service: "General Contractor / Remodeler", Question: "scope", Option: "additions", Adjustment: 1000 },
// { Service: "General Contractor / Remodeler", Question: "size", Option: "full house", Adjustment: 2000 },

// /* ================== RADON MITIGATION ================== */
// { Service: "Radon Mitigation / Environmental", Question: "home size", Option: "large", Adjustment: 250 },
// { Service: "Radon Mitigation / Environmental", Question: "foundation", Option: "crawlspace + basement", Adjustment: 200 },
// { Service: "Radon Mitigation / Environmental", Question: "testing", Option: "post-mitigation test", Adjustment: 125 },

// /* ================== WINDOW / DOOR REPLACEMENT ================== */
// { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "door replacement", Adjustment: 175 },
// { Service: "Window/Door Replacement (Glazier)", Question: "unit type", Option: "window replacement", Adjustment: 150 },
// { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "double pane", Adjustment: 125 },
// { Service: "Window/Door Replacement (Glazier)", Question: "glass", Option: "storm", Adjustment: 150 },

// /* ================== LANDSCAPER (extra coverage) ================== */
// { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mulch / beds", Adjustment: 100 },
// { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal", Adjustment: 250 },
// { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large", Adjustment: 300 },

// /* ================== FLOORING (extra coverage) ================== */
// { Service: "Flooring Installer / Repair", Question: "room count", Option: "3+ rooms", Adjustment: 200 },
// { Service: "Flooring Installer / Repair", Question: "prep", Option: "remove old flooring", Adjustment: 150 },

// /* ================== APPLIANCE FAILURES (extra coverage) ================== */
// { Service: "Appliance Failures", Question: "appliance", Option: "built-in", Adjustment: 125 },
// { Service: "Appliance Failures", Question: "age", Option: "10+ years", Adjustment: 75 },

// /* ================== CAR MECHANIC (general) ================== */
// { Service: "Car Mechanic (general)", Question: "issue", Option: "engine", Adjustment: 250 },
// { Service: "Car Mechanic (general)", Question: "issue", Option: "transmission", Adjustment: 300 },
// { Service: "Car Mechanic (general)", Question: "vehicle", Option: "large suv/truck", Adjustment: 75 },

// /* ================== BARBER / HAIRDRESSER ================== */
// { Service: "Barber / Hairdresser", Question: "service", Option: "wedding / event", Adjustment: 50 },
// { Service: "Barber / Hairdresser", Question: "service", Option: "house call", Adjustment: 40 },

//  ]

// // export const MATRIX = [
// //   /* ================== CORE TRADES ================== */
// //   // Plumbing
// //   { Service: "Plumbing", Question: "Where is the plumbing issue located?", Option: "Kitchen", Adjustment: 50 },
// //   { Service: "Plumbing", Question: "Where is the plumbing issue located?", Option: "Bathroom", Adjustment: 75 },
// //   { Service: "Plumbing", Question: "Severity of the issue?", Option: "Minor leak/drip", Adjustment: 0 },
// //   { Service: "Plumbing", Question: "Severity of the issue?", Option: "Major leak/flooding", Adjustment: 200 },
// //   { Service: "Plumbing", Question: "Accessibility of repair area?", Option: "Easy access", Adjustment: 0 },
// //   { Service: "Plumbing", Question: "Accessibility of repair area?", Option: "Behind wall/ceiling", Adjustment: 150 },

// //   // Roofing
// //   { Service: "Roofing", Question: "Type of roofing material?", Option: "Shingles", Adjustment: 50 },
// //   { Service: "Roofing", Question: "Type of roofing material?", Option: "Tile/Metal", Adjustment: 150 },
// //   { Service: "Roofing", Question: "Size of damaged area?", Option: "Small patch (<5 ft²)", Adjustment: 75 },
// //   { Service: "Roofing", Question: "Size of damaged area?", Option: "Large section (>20 ft²)", Adjustment: 300 },
// //   { Service: "Roofing", Question: "Is roof easily accessible?", Option: "Yes, single story", Adjustment: 0 },
// //   { Service: "Roofing", Question: "Is roof easily accessible?", Option: "Difficult access (steep/2nd story)", Adjustment: 200 },

// //   // HVAC
// //   { Service: "HVAC", Question: "System type?", Option: "Central AC", Adjustment: 100 },
// //   { Service: "HVAC", Question: "System type?", Option: "Heating/Furnace", Adjustment: 150 },
// //   { Service: "HVAC", Question: "What’s the problem?", Option: "Not cooling/heating", Adjustment: 150 },
// //   { Service: "HVAC", Question: "What’s the problem?", Option: "Strange noises/smell", Adjustment: 100 },
// //   { Service: "HVAC", Question: "Urgency of repair?", Option: "Comfort issue", Adjustment: 0 },
// //   { Service: "HVAC", Question: "Urgency of repair?", Option: "System completely down", Adjustment: 200 },

// //   // Electrician
// //   { Service: "Electrician", Question: "Type of issue?", Option: "Outlet not working", Adjustment: 75 },
// //   { Service: "Electrician", Question: "Type of issue?", Option: "Breaker tripping", Adjustment: 125 },
// //   { Service: "Electrician", Question: "Scope of work?", Option: "Single outlet/fixture", Adjustment: 50 },
// //   { Service: "Electrician", Question: "Scope of work?", Option: "Multiple circuits", Adjustment: 200 },
// //   { Service: "Electrician", Question: "Accessibility?", Option: "Easy access", Adjustment: 0 },
// //   { Service: "Electrician", Question: "Accessibility?", Option: "Panel or attic work", Adjustment: 150 },

// //   /* ================== OTHER CATEGORIES ================== */
// //   // Handyman
// //   { Service: "Handyman (general fixes)", Question: "What type of repair?", Option: "Furniture/fixtures", Adjustment: 50 },
// //   { Service: "Handyman (general fixes)", Question: "What type of repair?", Option: "Doors/windows", Adjustment: 100 },
// //   { Service: "Handyman (general fixes)", Question: "Size of job?", Option: "Small (under 1 hour)", Adjustment: 0 },
// //   { Service: "Handyman (general fixes)", Question: "Size of job?", Option: "Larger project (2+ hours)", Adjustment: 150 },

// //   // Locksmith
// //   { Service: "Locksmith", Question: "Lockout situation?", Option: "Home lockout", Adjustment: 100 },
// //   { Service: "Locksmith", Question: "Lockout situation?", Option: "Car lockout", Adjustment: 120 },
// //   { Service: "Locksmith", Question: "Lock type?", Option: "Standard lock", Adjustment: 0 },
// //   { Service: "Locksmith", Question: "Lock type?", Option: "High-security/Smart lock", Adjustment: 100 },

// //   // Cleaning
// //   { Service: "Cleaner / Housekeeper", Question: "Type of cleaning needed?", Option: "Basic home cleaning", Adjustment: 0 },
// //   { Service: "Cleaner / Housekeeper", Question: "Type of cleaning needed?", Option: "Deep cleaning", Adjustment: 100 },
// //   { Service: "Cleaner / Housekeeper", Question: "Type of cleaning needed?", Option: "Move-out/Move-in cleaning", Adjustment: 150 },
// //   { Service: "Cleaner / Housekeeper", Question: "Size of home?", Option: "Small (<1000 sqft)", Adjustment: 0 },
// //   { Service: "Cleaner / Housekeeper", Question: "Size of home?", Option: "Large (>2500 sqft)", Adjustment: 200 },

// //   // Auto
// //   { Service: "Mobile Mechanic", Question: "What’s the issue?", Option: "Battery/Starter", Adjustment: 100 },
// //   { Service: "Mobile Mechanic", Question: "What’s the issue?", Option: "Engine/Transmission", Adjustment: 300 },
// //   { Service: "Mobile Mechanic", Question: "Vehicle location?", Option: "Home driveway", Adjustment: 0 },
// //   { Service: "Mobile Mechanic", Question: "Vehicle location?", Option: "Highway/remote", Adjustment: 200 },

// //   // Pest Control
// //   { Service: "Pest Control / Exterminator", Question: "Type of pest?", Option: "Ants/Roaches", Adjustment: 50 },
// //   { Service: "Pest Control / Exterminator", Question: "Type of pest?", Option: "Rodents", Adjustment: 150 },
// //   { Service: "Pest Control / Exterminator", Question: "Type of pest?", Option: "Termites/Bedbugs", Adjustment: 300 },
// //   { Service: "Pest Control / Exterminator", Question: "Severity?", Option: "Mild infestation", Adjustment: 0 },
// //   { Service: "Pest Control / Exterminator", Question: "Severity?", Option: "Severe infestation", Adjustment: 250 },

// //   // Painting
// //   { Service: "Painter (interior/exterior)", Question: "Type of painting?", Option: "Interior", Adjustment: 50 },
// //   { Service: "Painter (interior/exterior)", Question: "Type of painting?", Option: "Exterior", Adjustment: 150 },
// //   { Service: "Painter (interior/exterior)", Question: "Size of job?", Option: "Single room", Adjustment: 100 },
// //   { Service: "Painter (interior/exterior)", Question: "Size of job?", Option: "Entire house", Adjustment: 500 },

// //   // Flooring
// //   { Service: "Flooring Installer / Repair", Question: "Type of flooring?", Option: "Carpet", Adjustment: 50 },
// //   { Service: "Flooring Installer / Repair", Question: "Type of flooring?", Option: "Tile/Hardwood", Adjustment: 150 },
// //   { Service: "Flooring Installer / Repair", Question: "Size of job?", Option: "Small (<200 sqft)", Adjustment: 75 },
// //   { Service: "Flooring Installer / Repair", Question: "Size of job?", Option: "Large (>1000 sqft)", Adjustment: 400 },

// //   // Landscaping
// //   { Service: "Landscaper / Lawn Care", Question: "Type of work?", Option: "Mowing/Trimming", Adjustment: 50 },
// //   { Service: "Landscaper / Lawn Care", Question: "Type of work?", Option: "Tree/hedge removal", Adjustment: 200 },
// //   { Service: "Landscaper / Lawn Care", Question: "Property size?", Option: "Small yard", Adjustment: 0 },
// //   { Service: "Landscaper / Lawn Care", Question: "Property size?", Option: "Large property/acreage", Adjustment: 300 },

// //   // Smart Home
// //   { Service: "TV Mounting / Home Theater Installer", Question: "Service type?", Option: "TV wall mount", Adjustment: 100 },
// //   { Service: "TV Mounting / Home Theater Installer", Question: "Service type?", Option: "Home theater setup", Adjustment: 300 },
// //   { Service: "TV Mounting / Home Theater Installer", Question: "Wall type?", Option: "Drywall", Adjustment: 0 },
// //   { Service: "TV Mounting / Home Theater Installer", Question: "Wall type?", Option: "Brick/Concrete", Adjustment: 150 },

// //   // IT Services
// //   { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "Issue type?", Option: "Wi-Fi setup", Adjustment: 50 },
// //   { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "Issue type?", Option: "Network troubleshooting", Adjustment: 100 },
// //   { Service: "IT / Wi-Fi Setup (Home Networking)", Question: "Issue type?", Option: "Smart device integration", Adjustment: 150 },

// //   // Water & Mold
// //   { Service: "Water Damage Mitigation", Question: "Where is the water damage?", Option: "Basement", Adjustment: 150 },
// //   { Service: "Water Damage Mitigation", Question: "Where is the water damage?", Option: "Bathroom/Kitchen", Adjustment: 100 },
// //   { Service: "Water Damage Mitigation", Question: "Severity?", Option: "Minor leak/dampness", Adjustment: 0 },
// //   { Service: "Water Damage Mitigation", Question: "Severity?", Option: "Major flooding", Adjustment: 400 },

// //   // Remodeling
// //   { Service: "General Contractor / Remodeler", Question: "Type of remodel?", Option: "Kitchen", Adjustment: 500 },
// //   { Service: "General Contractor / Remodeler", Question: "Type of remodel?", Option: "Bathroom", Adjustment: 400 },
// //   { Service: "General Contractor / Remodeler", Question: "Size of remodel?", Option: "Small project", Adjustment: 0 },
// //   { Service: "General Contractor / Remodeler", Question: "Size of remodel?", Option: "Full house", Adjustment: 2000 },

// //   // Environmental
// //   { Service: "Insulation / Weatherization Tech", Question: "Service type?", Option: "Attic insulation", Adjustment: 200 },
// //   { Service: "Insulation / Weatherization Tech", Question: "Service type?", Option: "Wall insulation", Adjustment: 300 },
// //   { Service: "Insulation / Weatherization Tech", Question: "Home size?", Option: "Small (<1500 sqft)", Adjustment: 0 },
// //   { Service: "Insulation / Weatherization Tech", Question: "Home size?", Option: "Large (>2500 sqft)", Adjustment: 400 },
// // ];

// /* ========================================================================== */
// /* COVERED DESCRIPTIONS (category-level, from your expanded set)              */
// /* ========================================================================== */
// export const coveredDescriptions = {
//   "Plumbing":
//     "Covers leaks, burst pipes, clogs, and other emergency plumbing issues. Parts replacement and specialty work may incur additional charges.",
//   "Roofing":
//     "Covers patching leaks, replacing damaged shingles/tiles, and temporary weatherproofing. Full roof replacements not included.",
//   "HVAC":
//     "Covers repair of central AC or heating systems. Includes diagnostics and emergency fixes. Replacement units not included.",
//   "Electrician":
//     "Covers outlet, breaker, and wiring issues. Complex rewiring or panel upgrades may require additional estimates.",
//   "Handyman (general fixes)":
//     "Covers small household repairs like furniture, doors, or windows. Larger remodel jobs may require contractor services.",
//   "Locksmith":
//     "Covers standard home and auto lockouts. Specialty locks, smart locks, or rekeying may add extra costs.",
//   "Cleaner / Housekeeper":
//     "Covers basic, deep, or move-in/out home cleaning. Supplies and equipment included. Specialty cleaning may cost extra.",
//   "Mobile Mechanic":
//     "Covers on-site diagnostics, battery/starter replacements, and minor engine fixes. Major repairs may require a shop.",
//   "Pest Control / Exterminator":
//     "Covers inspection and treatment for ants, roaches, rodents, termites, and bedbugs. Severe infestations may need follow-up visits.",
//   "Painter (interior/exterior)":
//     "Covers surface prep, painting walls, ceilings, or exterior siding. Specialty finishes or large areas may increase price.",
//   "Flooring Installer / Repair":
//     "Covers small repairs, carpet, tile, or hardwood installs. Full flooring replacement may require additional estimate.",
//   "Landscaper / Lawn Care":
//     "Covers mowing, trimming, yard cleanup, and small tree/hedge work. Large-scale landscaping or tree removal is extra.",
//   "TV Mounting / Home Theater Installer":
//     "Covers mounting TVs, installing brackets, and basic home theater setup. Specialty wiring or wall reinforcement may cost extra.",
//   "IT / Wi-Fi Setup (Home Networking)":
//     "Covers router setup, Wi-Fi troubleshooting, and device integration. Advanced enterprise networking excluded.",
//   "Water Damage Mitigation":
//     "Covers emergency water removal, drying, and minor mold prevention. Full restoration/remodel may be extra.",
//   "General Contractor / Remodeler":
//     "Covers small to large remodels like kitchens and bathrooms. Includes design consultation and estimates.",
//   "Insulation / Weatherization Tech":
//     "Covers insulation installation in attic, walls, or crawlspaces. Specialty materials may increase costs.",
// };

// /* ========================================================================== */
// /* BASE PRICE ANCHORS (category-level)                                        */
// /* ========================================================================== */
// export const BASE_PRICE = {
//   "Plumbing": 175,
//   "Roofing": 250,
//   "HVAC": 200,
//   "Electrician": 150,
//   "Handyman (general fixes)": 125,
//   "Locksmith": 120,
//   "Cleaner / Housekeeper": 125,
//   "Mobile Mechanic": 175,
//   "Pest Control / Exterminator": 150,
//   "Painter (interior/exterior)": 200,
//   "Flooring Installer / Repair": 250,
//   "Landscaper / Lawn Care": 150,
//   "TV Mounting / Home Theater Installer": 175,
//   "IT / Wi-Fi Setup (Home Networking)": 150,
//   "Water Damage Mitigation": 300,
//   "General Contractor / Remodeler": 500,
//   "Insulation / Weatherization Tech": 200,
// };

// // Dev-only test
// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] =
//     "Developer test checkout: fixed $1, no other fees.";
// }

// /* ========================================================================== */
// /* FEES + HELPERS                                                             */
// /* ========================================================================== */
// /* ========================================================================== */
// /* FEES + HELPERS (keep your existing MATRIX / coveredDescriptions / BASE_PRICE) */
// /* ========================================================================== */

// const RUSH_FEE = 100; // same as before

// // export const getBasePrice = (service) => BASE_PRICE?.[service] ?? 0;
// // export const getCoveredDescription = (serviceKey) => coveredDescriptions?.[serviceKey] || "";
// export const getRushFee = () => RUSH_FEE;

// /* ========================================================================== */
// //new to help with adjustments
// // Canonicalize "labels" coming from UI → keys used in pricing tables
// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")        // collapse internal spaces
//     .replace(/[^a-z0-9]+/g, "_") // non-alphanum → _
//     .replace(/^_+|_+$/g, "");    // trim _

// // Map categories/aliases → canonical service used by pricing/base price
// const resolveToService = (serviceOrCategory, answers = {}) => {
//   const raw = String(serviceOrCategory || "");
//   // If this is already a service key present in pricing, keep it
//   if (pricing[raw]) return raw;

//   // Try alias map (same as backend)
//   if (SERVICE_ALIASES && SERVICE_ALIASES[raw]) {
//     const mapped = SERVICE_ALIASES[raw];
//     if (pricing[mapped]) return mapped;
//   }

//   // If a category was passed, prefer the specific service the user picked
//   // (assumes answers.service or answers.selectedService exists in your wizard state)
//   const picked =
//     answers.service ||
//     answers.selectedService ||
//     answers.scope ||
//     null;

//   if (picked && pricing[picked]) return picked;

//   // Last chance: if the category contains services, pick the first one we have pricing for
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY || {}).filter(
//     (svc) => (SERVICE_TO_CATEGORY || {})[svc] === raw
//   );
//   const found = servicesInCategory.find((svc) => pricing[svc]);
//   return found || raw; // may still miss, but we tried
// };

// /* ========================================================================== */
// /* CATEGORY MAPPINGS (service -> category)                                    */
// /* NOTE: Only map actual SERVICE NAMES that exist in MATRIX rows.             */
// /*       Do NOT put bare category names here.                                 */
// /* ========================================================================== */

// export const SERVICE_TO_CATEGORY = {
//   "Plumbing": "Plumbing",
//   "Roofing": "Roofing",
//   "HVAC": "HVAC",
//   "Electrician": "Electrician",

//   "Handyman (general fixes)": "Handyman",
//   "Locksmith": "Locksmith",
//   "Cleaner / Housekeeper": "Cleaning",
//   "Mobile Mechanic": "Auto",
//   "Pest Control / Exterminator": "Pest Control",
//   "Painter (interior/exterior)": "Painting",
//   "Flooring Installer / Repair": "Flooring",
//   "Landscaper / Lawn Care": "Landscaping",
//   "TV Mounting / Home Theater Installer": "Smart Home",
//   "IT / Wi-Fi Setup (Home Networking)": "IT Services",
//   "Water Damage Mitigation": "Water & Mold Remediation",
//   "General Contractor / Remodeler": "Remodeling",
//   "Insulation / Weatherization Tech": "Environmental",
// };

// /* ========================================================================== */
// /* BUILD CATEGORY -> SERVICES, QUESTIONS, PRICING                             */
// /* ========================================================================== */

// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd Jobs";
//   if (!categoryServices[cat]) categoryServices[cat] = new Set();
//   categoryServices[cat].add(Service);
// }

// export const questions = {};
// export const pricing = {};

// // Category-level
// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: 1,
//       question: `Select ${cat.replace(/_/g, " ").toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet).map((svc) => ({
//         value: svc,
//         label: String(svc),
//       })),
//     },
//   ];
// }

// // 2) Service-level questions (options are OBJECTS { value, adjustment })
// // Service-level
// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   if (!questions[Service]) questions[Service] = [];
//   if (!pricing[Service]) pricing[Service] = {};

//   let qObj = questions[Service].find((q) => q.question === Question);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }

//   const optionLabel = String(Option).trim();
//   if (!qObj.options.find((o) => o.value === optionLabel)) {
//     qObj.options.push({ value: optionLabel, label: optionLabel });
//   }

//   if (!pricing[Service][Question]) pricing[Service][Question] = {};
//   pricing[Service][Question][optionLabel] = Adjustment;
// }

// /* ========================================================================== */
// /* EXPORTS                                                                     */
// /* ========================================================================== */

// /**
//  * getQuestions(input)
//  * - If input is a CATEGORY (e.g., "Plumbing"), returns the category service-picker question.
//  * - If input is a SERVICE (e.g., "Burst or Leaking Pipes"), returns the service-level questions.
//  * - If input is a category that has no services in MATRIX (dev/config error), returns [] instead of crashing.
//  */
// export const getBasePrice = (serviceOrCategory) => {
//   if (BASE_PRICE[serviceOrCategory]) return BASE_PRICE[serviceOrCategory];
//   const cat = SERVICE_TO_CATEGORY[serviceOrCategory];
//   return cat && BASE_PRICE[cat] ? BASE_PRICE[cat] : 0;
// };

// export const getCoveredDescription = (serviceKey) =>
//   coveredDescriptions[serviceKey] || "";

// export const getQuestions = (serviceOrCategory) => {
//   if (questions[serviceOrCategory]) return questions[serviceOrCategory];

//   const mappedCategory = SERVICE_TO_CATEGORY[serviceOrCategory];
//   if (mappedCategory && questions[mappedCategory]) {
//     return questions[mappedCategory];
//   }

//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY).filter(
//     (svc) => SERVICE_TO_CATEGORY[svc] === serviceOrCategory
//   );
//   if (servicesInCategory.length > 0) {
//     return servicesInCategory.flatMap((svc) => questions[svc] || []);
//   }

//   console.warn("⚠️ No questions found for:", serviceOrCategory);
//   return [];
// };
// //old working function
// // export const getAdjustment = (service, question, option) =>
// //   pricing?.[service]?.[question]?.[option] ?? 0;

// export const getAdjustment = (serviceOrCategory, question, option, answers = {}) => {
//   const service = resolveToService(serviceOrCategory, answers);
//   const svc = pricing[service] ? service : (SERVICE_ALIASES?.[service] || service);

//   const qKey = slug(question);
//   const oKey = slug(option);

//   const value = pricing?.[svc]?.[qKey]?.[oKey];

//   if (value == null) {
//     // helpful dev log without being noisy in prod
//     if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//       // show what we tried and what keys are available
//       const qAvail = Object.keys(pricing?.[svc] || {});
//       console.debug("[pricing miss]", { svc, qKey, oKey, availableQuestions: qAvail });
//     }
//     return 0;
//   }
//   return value;
// };

// /**
//  * estimateTotal(serviceOrCategory, answers)
//  * - Backward-compatible:
//  *   If you pass a SERVICE (old behavior), it sums adjustments + RUSH_FEE (no base).
//  *   If you accidentally pass a CATEGORY, we try to resolve the chosen service
//  *   from the category’s service-picker answer in `answers` and then compute.
//  *
//  * UI should still compute final like before:
//  *   final = getBasePrice(selectedService) + estimateTotal(selectedService, answers)
//  */

// //old working function
// // export const estimateTotal = (serviceOrCategory, answers = {}) => {
// //   // If a service key exists in pricing, use it directly (original path)
// //   const isService = !!pricing?.[serviceOrCategory];

// //   // If category passed by mistake, try to resolve to a service the user picked
// //   let resolvedService = serviceOrCategory;
// //   if (!isService) {
// //     const cat = serviceOrCategory;
// //     const catQs = questions[cat]?.[0]?.question;
// //     const pickedService =
// //       catQs && typeof answers[catQs] === "string" ? answers[catQs] : null;

// //     if (pickedService && pricing[pickedService]) {
// //       resolvedService = pickedService;
// //     }
// //   }

// //   let total = 0;
// //   const table = pricing?.[resolvedService] || {};

// //   for (const [question, option] of Object.entries(answers)) {
// //     const adj = table?.[question]?.[option];
// //     if (typeof adj === "number") total += adj;
// //   }

// //   return total + RUSH_FEE;
// // };

// export const estimateTotal = (serviceOrCategory, answers = {}) => {
//   const selectedService = resolveToService(serviceOrCategory, answers);
//   const base = getBasePrice(selectedService);

//   // however you iterate over the Q/A:
//   const adjustments = Object.entries(answers).reduce((sum, [question, option]) => {
//     // handle multi-select arrays too
//     if (Array.isArray(option)) {
//       return sum + option.reduce(
//         (acc, opt) => acc + getAdjustment(selectedService, question, opt, answers),
//         0
//       );
//     }
//     return sum + getAdjustment(selectedService, question, option, answers);
//   }, 0);

//   return base + adjustments;
// };

// export default {
//   questions,
//   pricing,
//   getBasePrice,
//   getCoveredDescription,
//   getRushFee,
//   getQuestions,
//   getAdjustment,
//   estimateTotal,
// };

//testing new/* ========================================================================== */
/* MATRIX + PRICING (UPDATED)                                                 */
/* ========================================================================== */
// Notes:
// - Normalized quote characters and fixed typos from the provided upgrade list.
// - Consolidated service names to match BASE_PRICE and SERVICE_TO_CATEGORY.
// - Service-level PRICING now stores SLUGGED keys so getAdjustment() lookups work.
// - Handyman service renamed to "Handyman" (formerly "Handyman (general fixes)").
// - Added new services: Roadside Service, Car Detailing (mobile).
// - Keep using resolveToService/SERVICE_ALIASES if available upstream.

/* ========================================================================== */
/* MATRIX: All services, questions, options, adjustments                      */
/* ========================================================================== */

// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
//   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
//   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },

//   // Roofing
//   { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
//   { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
//   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
//   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
//   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },

//   // Electrician
//   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
//   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
//   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//   { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },

//   // Handyman
//   { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
//   { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
//   { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
//   { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
//   { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
//   { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },

//   // Locksmith
//   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
//   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
//   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },

//   // Cleaning
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },

//   // Painting
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },

//   // Landscaping
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },

//   // Car Detailing (Mobile)
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },

//   // Roadside Service
//   { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
//   { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },

//   // Mobile Mechanic
//   { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },

//   // Pest Control
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 75 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 100 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 0 },

//   // General Contractor (Consulting/Estimating)
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 0 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
// ];

// /* ========================================================================== */
// /* COVERED DESCRIPTIONS                                                       */
// /* ========================================================================== */
// export const coveredDescriptions = {
//   "Plumbing":
//     "Covers leaks, burst pipes, clogs, and other emergency plumbing issues. Parts replacement and specialty work may incur additional charges.",
//   "Roofing":
//     "Covers patching leaks, replacing damaged shingles/tiles, and temporary weatherproofing. Full roof replacements not included.",
//   "HVAC":
//     "Covers repair of central AC or heating systems. Includes diagnostics and emergency fixes. Replacement units not included.",
//   "Electrician":
//     "Covers outlet, breaker, and wiring issues. Complex rewiring or panel upgrades may require additional estimates.",
//   "Handyman":
//     "Covers small household projects and repairs. Larger remodel or specialty work may require contractor services.",
//   "Locksmith":
//     "Covers standard home and auto lockouts. Specialty locks, smart locks, or rekeying may add extra costs.",
//   "Cleaner / Housekeeper":
//     "Covers basic, deep, or move-in/out home cleaning. Supplies and equipment included. Specialty cleaning may cost extra.",
//   "Mobile Mechanic":
//     "Covers on-site diagnostics and light repairs. Major repairs may require a shop.",
//   "Pest Control / Exterminator":
//     "Covers inspection and treatment for ants, roaches, rodents, termites, and bedbugs.",
//   "Painter (interior/exterior)":
//     "Covers surface prep and painting of walls/ceilings or exterior siding.",
//   "Landscaper / Lawn Care":
//     "Covers mowing, trimming, yard cleanup, and small tree/hedge work.",
//   "Car Detailing (mobile)":
//     "Covers mobile detailing packages and add-ons.",
//   "Roadside Service":
//     "Covers basic roadside assistance such as battery jumps, tire changes, or short tows.",
//   "General Contractor (Consulting/Estimating)":
//     "Covers onsite consulting/estimating time blocks only.",
// };

// /* ========================================================================== */
// /* BASE PRICE ANCHORS (category-level)                                        */
// /* ========================================================================== */
// export const BASE_PRICE = {
//   "Plumbing": 175,
//   "Roofing": 250,
//   "HVAC": 200,
//   "Electrician": 150,
//   "Handyman": 125,
//   "Locksmith": 120,
//   "Cleaner / Housekeeper": 125,
//   "Roadside Service": 100,
//   "Mobile Mechanic": 125, // normalized (was "Mechanic" in draft)
//   "Pest Control / Exterminator": 150,
//   "Painter (interior/exterior)": 200,
//   "Landscaper / Lawn Care": 50,
//   "General Contractor (Consulting/Estimating)": 0, // consult base handled by scope tiers
//   "Car Detailing (mobile)": 50,
// };

// // Dev-only test hook
// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] = "Developer test checkout: fixed $1, no other fees.";
// }

// /* ========================================================================== */
// /* FEES + HELPERS                                                             */
// /* ========================================================================== */
// const RUSH_FEE = 100; // unchanged
// export const getRushFee = () => RUSH_FEE;

// // Canonicalize labels → keys used in pricing tables
// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// /* ========================================================================== */
// /* CATEGORY MAPPINGS (service -> category)                                    */
// /* NOTE: Map actual SERVICE NAMES that exist in MATRIX rows.                  */
// /* ========================================================================== */
// export const SERVICE_TO_CATEGORY = {
//   "Plumbing": "Plumbing",
//   "Roofing": "Roofing",
//   "HVAC": "HVAC",
//   "Electrician": "Electrician",
//   "Handyman": "Handyman",
//   "Locksmith": "Locksmith",
//   "Cleaner / Housekeeper": "Cleaning",
//   "Mobile Mechanic": "Auto",
//   "Pest Control / Exterminator": "Pest Control",
//   "Painter (interior/exterior)": "Painting",
//   "Landscaper / Lawn Care": "Landscaping",
//   "Car Detailing (mobile)": "Auto",
//   "Roadside Service": "Auto",
//   "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
// };

// /* ========================================================================== */
// /* BUILD CATEGORY -> SERVICES, QUESTIONS, PRICING                             */
// /* ========================================================================== */
// export const questions = {};
// export const pricing = {};

// // 1) derive category → services
// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd Jobs";
//   if (!categoryServices[cat]) categoryServices[cat] = new Set();
//   categoryServices[cat].add(Service);
// }

// // 2) Category-level service picker
// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: 1,
//       question: `Which ${cat.replace(/_/g, " ").toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet).map((svc) => ({ value: svc, label: String(svc) })),
//     },
//   ];
// }

// // 3) Service-level questions (store SLUGGED keys)
// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   if (!questions[Service]) questions[Service] = [];
//   if (!pricing[Service]) pricing[Service] = {};

//   const qKey = slug(Question);
//   const oKey = slug(Option);

//   let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }

//   if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//     qObj.options.push({ value: Option, label: String(Option) });
//   }

//   if (!pricing[Service][qKey]) pricing[Service][qKey] = {};
//   pricing[Service][qKey][oKey] = Adjustment;
// }

// /* ========================================================================== */
// /* EXPORTED HELPERS                                                           */
// /* ========================================================================== */
// export const getBasePrice = (serviceOrCategory) => {
//   if (BASE_PRICE[serviceOrCategory] != null) return BASE_PRICE[serviceOrCategory];
//   const cat = SERVICE_TO_CATEGORY[serviceOrCategory];
//   return cat && BASE_PRICE[cat] ? BASE_PRICE[cat] : 0;
// };

// export const getCoveredDescription = (serviceKey) => coveredDescriptions[serviceKey] || "";

// // If SERVICE_ALIASES/resolveToService exists elsewhere, it can still be used. Minimal re-impl:
// const resolveToService = (serviceOrCategory, answers = {}) => {
//   const raw = String(serviceOrCategory || "");
//   if (pricing[raw]) return raw;
//   const picked = answers.service || answers.selectedService || answers.scope || null;
//   if (picked && pricing[picked]) return picked;
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY || {}).filter(
//     (svc) => (SERVICE_TO_CATEGORY || {})[svc] === raw
//   );
//   const found = servicesInCategory.find((svc) => pricing[svc]);
//   return found || raw;
// };

// export const getQuestions = (serviceOrCategory) => {
//   if (questions[serviceOrCategory]) return questions[serviceOrCategory];
//   const mappedCategory = SERVICE_TO_CATEGORY[serviceOrCategory];
//   if (mappedCategory && questions[mappedCategory]) return questions[mappedCategory];
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY).filter(
//     (svc) => SERVICE_TO_CATEGORY[svc] === serviceOrCategory
//   );
//   if (servicesInCategory.length > 0) return servicesInCategory.flatMap((svc) => questions[svc] || []);
//   console.warn("⚠️ No questions found for:", serviceOrCategory);
//   return [];
// };

// export const getAdjustment = (serviceOrCategory, question, option, answers = {}) => {
//   const service = resolveToService(serviceOrCategory, answers);
//   const qKey = slug(question);
//   const oKey = slug(option);
//   const value = pricing?.[service]?.[qKey]?.[oKey];
//   if (value == null) {
//     if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//       const qAvail = Object.keys(pricing?.[service] || {});
//       console.debug("[pricing miss]", { service, qKey, oKey, availableQuestions: qAvail });
//     }
//     return 0;
//   }
//   return value;
// };

// export const estimateTotal = (serviceOrCategory, answers = {}) => {
//   const selectedService = resolveToService(serviceOrCategory, answers);
//   const base = getBasePrice(selectedService);
//   const adjustments = Object.entries(answers).reduce((sum, [question, option]) => {
//     if (Array.isArray(option)) {
//       return sum + option.reduce((acc, opt) => acc + getAdjustment(selectedService, question, opt, answers), 0);
//     }
//     return sum + getAdjustment(selectedService, question, option, answers);
//   }, 0);
//   return base + adjustments; // base included here (avoid adding it again elsewhere)
// };

// export default {
//   MATRIX,
//   questions,
//   pricing,
//   coveredDescriptions,
//   BASE_PRICE,
//   getBasePrice,
//   getCoveredDescription,
//   getRushFee,
//   getQuestions,
//   getAdjustment,
//   estimateTotal,
// };

/* ========================================================================== */
/* MATRIX + PRICING (UPDATED & FIXED)                                         */
/* ========================================================================== */

// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
//   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
//   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },

//   // Roofing
//   { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
//   { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
//   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
//   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
//   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },

//   // Electrician
//   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
//   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
//   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//   { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },

//   // Handyman
//   { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
//   { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
//   { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
//   { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
//   { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
//   { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },

//   // Locksmith
//   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
//   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
//   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },

//   // Cleaning
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },

//   // Painting
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },

//   // Landscaping
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },

//   // Car Detailing (Mobile)  (updated values + sizes: car/suv)
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },

//   // Roadside Service
//   { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
//   { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },

//   // Mobile Mechanic
//   { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },

//   // Pest Control
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 75 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 100 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 0 },

//   // General Contractor (Consulting/Estimating)
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 0 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
// ];

// /* ========================================================================== */
// /* COVERED DESCRIPTIONS                                                       */
// /* ========================================================================== */
// export const coveredDescriptions = {
//   "Plumbing":
//     "Covers leaks, burst pipes, clogs, and other emergency plumbing issues. Parts replacement and specialty work may incur additional charges.",
//   "Roofing":
//     "Covers patching leaks, replacing damaged shingles/tiles, and temporary weatherproofing. Full roof replacements not included.",
//   "HVAC":
//     "Covers repair of central AC or heating systems. Includes diagnostics and emergency fixes. Replacement units not included.",
//   "Electrician":
//     "Covers outlet, breaker, and wiring issues. Complex rewiring or panel upgrades may require additional estimates.",
//   "Handyman":
//     "Covers small household projects and repairs. Larger remodel or specialty work may require contractor services.",
//   "Locksmith":
//     "Covers standard home and auto lockouts. Specialty locks, smart locks, or rekeying may add extra costs.",
//   "Cleaner / Housekeeper":
//     "Covers basic, deep, or move-in/out home cleaning. Supplies and equipment included. Specialty cleaning may cost extra.",
//   "Mobile Mechanic":
//     "Covers on-site diagnostics and light repairs. Major repairs may require a shop.",
//   "Pest Control / Exterminator":
//     "Covers inspection and treatment for ants, roaches, rodents, termites, and bedbugs.",
//   "Painter (interior/exterior)":
//     "Covers surface prep and painting of walls/ceilings or exterior siding.",
//   "Landscaper / Lawn Care":
//     "Covers mowing, trimming, yard cleanup, and small tree/hedge work.",
//   "Car Detailing (mobile)":
//     "Covers mobile detailing packages and add-ons.",
//   "Roadside Service":
//     "Covers basic roadside assistance such as battery jumps, tire changes, or short tows.",
//   "General Contractor (Consulting/Estimating)":
//     "Covers onsite consulting/estimating time blocks only.",
// };

// /* ========================================================================== */
// /* BASE PRICE ANCHORS                                                         */
// /* ========================================================================== */
// export const BASE_PRICE = {
//   "Plumbing": 175,
//   "Roofing": 250,
//   "HVAC": 200,
//   "Electrician": 150,
//   "Handyman": 125,
//   "Locksmith": 120,
//   "Cleaner / Housekeeper": 125,
//   "Roadside Service": 100,
//   "Mobile Mechanic": 125,
//   "Pest Control / Exterminator": 150,
//   "Painter (interior/exterior)": 200,
//   "Landscaper / Lawn Care": 50,
//   "General Contractor (Consulting/Estimating)": 0,
//   "Car Detailing (mobile)": 50,
// };

// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] =
//     "Developer test checkout: fixed $1, no other fees.";
// }

// /* ========================================================================== */
// /* HELPERS                                                                    */
// /* ========================================================================== */
// const RUSH_FEE = 100;
// export const getRushFee = () => RUSH_FEE;

// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// /* ========================================================================== */
// /* CATEGORY MAPPINGS (service -> category)                                    */
// /* ========================================================================== */
// export const SERVICE_TO_CATEGORY = {
//   "Plumbing": "Plumbing",
//   "Roofing": "Roofing",
//   "HVAC": "HVAC",
//   "Electrician": "Electrician",
//   "Handyman": "Handyman",
//   "Locksmith": "Locksmith",
//   "Cleaner / Housekeeper": "Cleaning",
//   "Mobile Mechanic": "Auto",
//   "Pest Control / Exterminator": "Pest Control",
//   "Painter (interior/exterior)": "Painting",
//   "Landscaper / Lawn Care": "Landscaping",
//   "Car Detailing (mobile)": "Auto",
//   "Roadside Service": "Auto",
//   "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
// };

// /* ========================================================================== */
// /* BUILD CATEGORY -> SERVICES, QUESTIONS, PRICING                             */
// /* ========================================================================== */
// export const questions = {};
// export const pricing = {};

// // 1) category → services
// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd Jobs";
//   (categoryServices[cat] ??= new Set()).add(Service);
// }

// // 2) Category-level service picker (✅ give it a UNIQUE, non-numeric id)
// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: "__service_picker__", // <— avoids id collision with service questions
//       question: `Which ${cat.replace(/_/g, " ").toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet).map((svc) => ({ value: svc, label: String(svc) })),
//     },
//   ];
// }

// // 3) Service-level questions (store SLUGGED keys)
// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   questions[Service] ??= [];
//   pricing[Service] ??= {};

//   const qKey = slug(Question);
//   const oKey = slug(Option);

//   let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1, // starts at 1 per service group (OK now that picker id is unique)
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }
//   if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//     qObj.options.push({ value: Option, label: String(Option) });
//   }

//   (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
// }

// /* ========================================================================== */
// /* EXPORTED HELPERS                                                           */
// /* ========================================================================== */
// export const getBasePrice = (serviceOrCategory) => {
//   if (BASE_PRICE[serviceOrCategory] != null) return BASE_PRICE[serviceOrCategory];
//   const cat = SERVICE_TO_CATEGORY[serviceOrCategory];
//   return cat && BASE_PRICE[cat] ? BASE_PRICE[cat] : 0;
// };

// export const getCoveredDescription = (serviceKey) =>
//   coveredDescriptions[serviceKey] || "";

// const resolveToService = (serviceOrCategory, answers = {}) => {
//   const raw = String(serviceOrCategory || "");
//   if (pricing[raw]) return raw;
//   const picked = answers.service || answers.selectedService || answers.scope || null;
//   if (picked && pricing[picked]) return picked;
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY || {}).filter(
//     (svc) => (SERVICE_TO_CATEGORY || {})[svc] === raw
//   );
//   const found = servicesInCategory.find((svc) => pricing[svc]);
//   return found || raw;
// };

// export const getQuestions = (serviceOrCategory) => {
//   if (questions[serviceOrCategory]) return questions[serviceOrCategory];
//   const mappedCategory = SERVICE_TO_CATEGORY[serviceOrCategory];
//   if (mappedCategory && questions[mappedCategory]) return questions[mappedCategory];
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY).filter(
//     (svc) => SERVICE_TO_CATEGORY[svc] === serviceOrCategory
//   );
//   if (servicesInCategory.length > 0)
//     return servicesInCategory.flatMap((svc) => questions[svc] || []);
//   console.warn("⚠️ No questions found for:", serviceOrCategory);
//   return [];
// };

// export const getAdjustment = (serviceOrCategory, question, option, answers = {}) => {
//   const service = resolveToService(serviceOrCategory, answers);
//   const qKey = slug(question);
//   const oKey = slug(option);
//   const value = pricing?.[service]?.[qKey]?.[oKey];
//   if (value == null) {
//     if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//       const qAvail = Object.keys(pricing?.[service] || {});
//       console.debug("[pricing miss]", { service, qKey, oKey, availableQuestions: qAvail });
//     }
//     return 0;
//   }
//   return value;
// };

// export const estimateTotal = (serviceOrCategory, answers = {}) => {
//   const selectedService = resolveToService(serviceOrCategory, answers);
//   const base = getBasePrice(selectedService);
//   const adjustments = Object.entries(answers).reduce((sum, [question, option]) => {
//     if (Array.isArray(option)) {
//       return sum + option.reduce((acc, opt) => acc + getAdjustment(selectedService, question, opt, answers), 0);
//     }
//     return sum + getAdjustment(selectedService, question, option, answers);
//   }, 0);
//   return base + adjustments;
// };

// export default {
//   MATRIX,
//   questions,
//   pricing,
//   coveredDescriptions,
//   BASE_PRICE,
//   getBasePrice,
//   getCoveredDescription,
//   getRushFee,
//   getQuestions,
//   getAdjustment,
//   estimateTotal,
// };

/* ========================================================================== */
/* MATRIX + PRICING (FINAL)                                                   */
/* ========================================================================== */

// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   {
//     Service: "Plumbing",
//     Question: "leak or clog",
//     Option: "leak",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "leak or clog",
//     Option: "clogged",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "kitchen sink",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom sink",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom toilet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom shower",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom bathtub",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "minor leak",
//     Adjustment: 0,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "major leak",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "minor clog",
//     Adjustment: 0,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "major clog",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "access",
//     Option: "easy access",
//     Adjustment: 0,
//   },
//   {
//     Service: "Plumbing",
//     Question: "access",
//     Option: "behind wall",
//     Adjustment: 75,
//   },
//   {
//     Service: "Plumbing",
//     Question: "access",
//     Option: "behind ceiling",
//     Adjustment: 75,
//   },

//   // Roofing
//   {
//     Service: "Roofing",
//     Question: "roof type",
//     Option: "shingles",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roofing",
//     Question: "roof type",
//     Option: "tile",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roofing",
//     Question: "roof type",
//     Option: "metal",
//     Adjustment: 150,
//   },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   {
//     Service: "Roofing",
//     Question: "damaged area",
//     Option: "small patch",
//     Adjustment: 75,
//   },
//   {
//     Service: "Roofing",
//     Question: "damaged area",
//     Option: "large section",
//     Adjustment: 300,
//   },
//   {
//     Service: "Roofing",
//     Question: "access",
//     Option: "single story",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roofing",
//     Question: "access",
//     Option: "second story",
//     Adjustment: 200,
//   },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   {
//     Service: "HVAC",
//     Question: "system type",
//     Option: "central ac",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC",
//     Question: "system type",
//     Option: "heating",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "not cooling",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "not heating",
//     Adjustment: 75,
//   },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "strange noise",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "strange smell",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC",
//     Question: "urgency",
//     Option: "comfort issue",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC",
//     Question: "urgency",
//     Option: "system down",
//     Adjustment: 75,
//   },

//   // Electrician
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "outlet not working",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "light switch not working",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "light flickering",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "breaker tripping",
//     Adjustment: 75,
//   },
//   {
//     Service: "Electrician",
//     Question: "scope of work",
//     Option: "single outlet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "scope of work",
//     Option: "single fixture",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "scope of work",
//     Option: "single switch",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "accessibility",
//     Option: "easy access",
//     Adjustment: 0,
//   },
//   {
//     Service: "Electrician",
//     Question: "accessibility",
//     Option: "high ceiling",
//     Adjustment: 75,
//   },

//   // Handyman
//   {
//     Service: "Handyman",
//     Question: "project length",
//     Option: "up to 3 hours",
//     Adjustment: 50,
//   },
//   {
//     Service: "Handyman",
//     Question: "project length",
//     Option: "up to 5 hours",
//     Adjustment: 75,
//   },
//   {
//     Service: "Handyman",
//     Question: "project length",
//     Option: "up to 8 hours",
//     Adjustment: 100,
//   },
//   {
//     Service: "Handyman",
//     Question: "project type",
//     Option: "maintenance",
//     Adjustment: 25,
//   },
//   {
//     Service: "Handyman",
//     Question: "project type",
//     Option: "installation",
//     Adjustment: 50,
//   },
//   {
//     Service: "Handyman",
//     Question: "project type",
//     Option: "repair",
//     Adjustment: 35,
//   },

//   // Locksmith
//   {
//     Service: "Locksmith",
//     Question: "lockout",
//     Option: "home lockout",
//     Adjustment: 100,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lockout",
//     Option: "car lockout",
//     Adjustment: 120,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lock type",
//     Option: "standard",
//     Adjustment: 0,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lock type",
//     Option: "high security",
//     Adjustment: 100,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lock type",
//     Option: "smart lock",
//     Adjustment: 100,
//   },

//   // Cleaning
//   {
//     Service: "Cleaner / Housekeeper",
//     Question: "cleaning type",
//     Option: "basic (up to 3 hours)",
//     Adjustment: 0,
//   },
//   {
//     Service: "Cleaner / Housekeeper",
//     Question: "cleaning type",
//     Option: "deep cleaning (up to 5 hours)",
//     Adjustment: 100,
//   },
//   {
//     Service: "Cleaner / Housekeeper",
//     Question: "cleaning type",
//     Option: "move out (up to 8 hours)",
//     Adjustment: 150,
//   },

//   // Painting
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "painting type",
//     Option: "interior",
//     Adjustment: 50,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "painting type",
//     Option: "exterior",
//     Adjustment: 150,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "up to 500 sqft",
//     Adjustment: 150,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "500 to 1000 sqft",
//     Adjustment: 450,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "1000 to 1500 sqft",
//     Adjustment: 750,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "1500 to 2000 sqft",
//     Adjustment: 1200,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "ceiling height",
//     Option: "up to 8 feet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "ceiling height",
//     Option: "up to 10 feet",
//     Adjustment: 100,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "ceiling height",
//     Option: "up to 12 feet",
//     Adjustment: 200,
//   },

//   // Landscaping
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "mowing",
//     Adjustment: 0,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "trimming",
//     Adjustment: 25,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "tree removal (less than 6 inch diameter)",
//     Adjustment: 200,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "hedge removal",
//     Adjustment: 200,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "property size",
//     Option: "small yard",
//     Adjustment: 0,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "property size",
//     Option: "large property",
//     Adjustment: 50,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "property size",
//     Option: "extra large",
//     Adjustment: 100,
//   },

//   /* ================== AUTO ================== */
//   // Car Detailing (Mobile)
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "package",
//     Option: "interior only",
//     Adjustment: 30,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "package",
//     Option: "exterior only",
//     Adjustment: 0,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "package",
//     Option: "interior and exterior",
//     Adjustment: 55,
//   },

//   {
//     Service: "Car Detailing (mobile)",
//     Question: "vehicle size",
//     Option: "car",
//     Adjustment: 5,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "vehicle size",
//     Option: "suv",
//     Adjustment: 25,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "vehicle size",
//     Option: "large suv",
//     Adjustment: 35,
//   },

//   // Roadside Service
//   {
//     Service: "Roadside Service",
//     Question: "issue",
//     Option: "battery",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "issue",
//     Option: "tire",
//     Adjustment: 25,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "issue",
//     Option: "tow",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "vehicle location",
//     Option: "home driveway",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "vehicle location",
//     Option: "highway",
//     Adjustment: 70,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "vehicle location",
//     Option: "remote",
//     Adjustment: 100,
//   },

//   // Mobile Mechanic
//   {
//     Service: "Mobile Mechanic",
//     Question: "issue",
//     Option: "car does not start",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mobile Mechanic",
//     Question: "issue",
//     Option: "oil change",
//     Adjustment: 40,
//   },
//   {
//     Service: "Mobile Mechanic",
//     Question: "issue",
//     Option: "brake replacement",
//     Adjustment: 100,
//   },

//   // Pest Control
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "ants",
//     Adjustment: 50,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "roaches",
//     Adjustment: 75,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "rodents",
//     Adjustment: 100,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "termites",
//     Adjustment: 50,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "bedbugs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "severity",
//     Option: "mild",
//     Adjustment: 0,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "severity",
//     Option: "severe",
//     Adjustment: 0,
//   },

//   // General Contractor (Consulting/Estimating)
//   {
//     Service: "General Contractor (Consulting/Estimating)",
//     Question: "scope",
//     Option: "up to 3 hours",
//     Adjustment: 0,
//   },
//   {
//     Service: "General Contractor (Consulting/Estimating)",
//     Question: "scope",
//     Option: "up to 5 hours",
//     Adjustment: 300,
//   },
//   {
//     Service: "General Contractor (Consulting/Estimating)",
//     Question: "scope",
//     Option: "up to 8 hours",
//     Adjustment: 500,
//   },
// ];

// /* ========================================================================== */
// /* COVERED DESCRIPTIONS                                                       */
// /* ========================================================================== */
// export const coveredDescriptions = {
//   "Plumbing":
//     "Covers leaks, burst pipes, clogs, and other emergency plumbing issues. Parts replacement and specialty work may incur additional charges.",
//   "Roofing":
//     "Covers patching leaks, replacing damaged shingles/tiles, and temporary weatherproofing. Full roof replacements not included.",
//   "HVAC": "Covers repair of central AC or heating systems. Includes diagnostics and emergency fixes. Replacement units not included.",
//   "Electrician":
//     "Covers outlet, breaker, and wiring issues. Complex rewiring or panel upgrades may require additional estimates.",
//   "Handyman":
//     "Covers small household projects and repairs. Larger remodel or specialty work may require contractor services.",
//   "Locksmith":
//     "Covers standard home and auto lockouts. Specialty locks, smart locks, or rekeying may add extra costs.",
//   "Cleaner / Housekeeper":
//     "Covers basic, deep, or move-in/out home cleaning. Supplies and equipment included. Specialty cleaning may cost extra.",
//   "Mobile Mechanic":
//     "Covers on-site diagnostics and light repairs. Major repairs may require a shop.",
//   "Pest Control / Exterminator":
//     "Covers inspection and treatment for ants, roaches, rodents, termites, and bedbugs.",
//   "Painter (interior/exterior)":
//     "Covers surface prep and painting of walls/ceilings or exterior siding.",
//   "Landscaper / Lawn Care":
//     "Covers mowing, trimming, yard cleanup, and small tree/hedge work.",
//   "Car Detailing (mobile)": "Covers mobile detailing packages and add-ons.",
//   "Roadside Service":
//     "Covers basic roadside assistance such as battery jumps, tire changes, or short tows.",
//   "General Contractor (Consulting/Estimating)":
//     "Covers onsite consulting/estimating time blocks only.",
// };

// /* ========================================================================== */
// /* BASE PRICE ANCHORS                                                         */
// /* ========================================================================== */
// export const BASE_PRICE = {
//   "Plumbing": 175,
//   "Roofing": 250,
//   "HVAC": 200,
//   "Electrician": 150,
//   "Handyman": 125,
//   "Locksmith": 120,
//   "Cleaner / Housekeeper": 125,
//   "Roadside Service": 100,
//   "Mobile Mechanic": 125,
//   "Pest Control / Exterminator": 150,
//   "Painter (interior/exterior)": 200,
//   "Landscaper / Lawn Care": 50,
//   "General Contractor (Consulting/Estimating)": 0,
//   "Car Detailing (mobile)": 50,
// };

// if (
//   typeof __DEV__ !== "undefined"
//     ? __DEV__
//     : process.env.NODE_ENV !== "production"
// ) {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] =
//     "Developer test checkout: fixed $1, no other fees.";
// }

// /* ========================================================================== */
// /* HELPERS                                                                    */
// /* ========================================================================== */
// const RUSH_FEE = 100;
// export const getRushFee = () => RUSH_FEE;

// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// /* ========================================================================== */
// /* CATEGORY MAPPINGS (service -> category)                                    */
// /* ========================================================================== */
// export const SERVICE_TO_CATEGORY = {
//   "Plumbing": "Plumbing",
//   "Roofing": "Roofing",
//   "HVAC": "HVAC",
//   "Electrician": "Electrician",
//   "Handyman": "Handyman",
//   "Locksmith": "Locksmith",
//   "Cleaner / Housekeeper": "Cleaning",
//   "Mobile Mechanic": "Auto",
//   "Pest Control / Exterminator": "Pest Control",
//   "Painter (interior/exterior)": "Painting",
//   "Landscaper / Lawn Care": "Landscaping",
//   "Car Detailing (mobile)": "Auto",
//   "Roadside Service": "Auto",
//   "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
// };

// /* ========================================================================== */
// /* BUILD CATEGORY -> SERVICES, QUESTIONS, PRICING                             */
// /* ========================================================================== */
// export const questions = {};
// export const pricing = {};

// // 1) category → services
// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd Jobs";
//   (categoryServices[cat] ??= new Set()).add(Service);
// }

// // 2) Category-level service picker (unique id avoids conflicts)
// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: "__service_picker__",
//       question: `Which ${cat
//         .replace(/_/g, " ")
//         .toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet).map((svc) => ({
//         value: svc,
//         label: String(svc),
//       })),
//     },
//   ];
// }

// // 3) Service-level questions (slug keys)
// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   questions[Service] ??= [];
//   pricing[Service] ??= {};

//   const qKey = slug(Question);
//   const oKey = slug(Option);

//   let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }

//   if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//     qObj.options.push({ value: Option, label: String(Option) });
//   }

//   (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
// }

// /* ========================================================================== */
// /* EXPORTED HELPERS                                                           */
// /* ========================================================================== */
// export const getBasePrice = (serviceOrCategory) => {
//   if (BASE_PRICE[serviceOrCategory] != null)
//     return BASE_PRICE[serviceOrCategory];
//   const cat = SERVICE_TO_CATEGORY[serviceOrCategory];
//   return cat && BASE_PRICE[cat] ? BASE_PRICE[cat] : 0;
// };

// export const getCoveredDescription = (serviceKey) =>
//   coveredDescriptions[serviceKey] || "";

//   const resolveToService = (serviceOrCategory, answers = {}) => {
//     const raw = String(serviceOrCategory || "");

//     // If caller already passed a concrete service, just use it.
//     if (pricing[raw]) return raw;

//     // 1) Explicit picks if your UI set them.
//     const directKeys = ["service", "selectedService", "scope"];
//     for (const k of directKeys) {
//       const v = answers?.[k];
//       if (v && pricing[String(v)]) return String(v);
//     }

//     // 2) If `raw` is a category, scan the *values* of answers for a service name
//     //    (this catches the category-level picker that stores the chosen service
//     //    under the question text like "Which auto issue...").
//     const inCategory = Object.keys(SERVICE_TO_CATEGORY || {}).filter(
//       (svc) => (SERVICE_TO_CATEGORY || {})[svc] === raw
//     );
//     if (inCategory.length) {
//       // flatten all answer values to strings
//       const vals = [];
//       for (const v of Object.values(answers || {})) {
//         if (Array.isArray(v)) vals.push(...v.map(String));
//         else vals.push(String(v));
//       }
//       // exact service match wins
//       const picked = inCategory.find((svc) => vals.includes(svc));
//       if (picked && pricing[picked]) return picked;

//       // fall back to first service in category (stable)
//       const first = inCategory.find((svc) => pricing[svc]);
//       if (first) return first;
//     }

//     // 3) Last resort: return raw (keeps previous behavior)
//     return raw;
//   };

// // const resolveToService = (serviceOrCategory, answers = {}) => {
// //   const raw = String(serviceOrCategory || "");
// //   if (pricing[raw]) return raw;
// //   const picked =
// //     answers.service || answers.selectedService || answers.scope || null;
// //   if (picked && pricing[picked]) return picked;
// //   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY || {}).filter(
// //     (svc) => (SERVICE_TO_CATEGORY || {})[svc] === raw
// //   );
// //   const found = servicesInCategory.find((svc) => pricing[svc]);
// //   return found || raw;
// // };

// export const getQuestions = (serviceOrCategory) => {
//   if (questions[serviceOrCategory]) return questions[serviceOrCategory];
//   const mappedCategory = SERVICE_TO_CATEGORY[serviceOrCategory];
//   if (mappedCategory && questions[mappedCategory])
//     return questions[mappedCategory];
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY).filter(
//     (svc) => SERVICE_TO_CATEGORY[svc] === serviceOrCategory
//   );
//   if (servicesInCategory.length > 0)
//     return servicesInCategory.flatMap((svc) => questions[svc] || []);
//   console.warn("⚠️ No questions found for:", serviceOrCategory);
//   return [];
// };

// export const getAdjustment = (
//   serviceOrCategory,
//   question,
//   option,
//   answers = {}
// ) => {
//   const service = resolveToService(serviceOrCategory, answers);
//   const qKey = slug(question);
//   const oKey = slug(option);
//   const value = pricing?.[service]?.[qKey]?.[oKey];
//   if (value == null) {
//     if (
//       typeof __DEV__ !== "undefined"
//         ? __DEV__
//         : process.env.NODE_ENV !== "production"
//     ) {
//       const qAvail = Object.keys(pricing?.[service] || {});
//       console.debug("[pricing miss]", {
//         service,
//         qKey,
//         oKey,
//         availableQuestions: qAvail,
//       });
//     }
//     return 0;
//   }
//   return value;
// };

// export const estimateTotal = (serviceOrCategory, answers = {}) => {
//   const selectedService = resolveToService(serviceOrCategory, answers);
//   const base = getBasePrice(selectedService);
//   const adjustments = Object.entries(answers).reduce(
//     (sum, [question, option]) => {
//       if (Array.isArray(option)) {
//         return (
//           sum +
//           option.reduce(
//             (acc, opt) =>
//               acc + getAdjustment(selectedService, question, opt, answers),
//             0
//           )
//         );
//       }
//       return sum + getAdjustment(selectedService, question, option, answers);
//     },
//     0
//   );
//   return base + adjustments;
// };

// export default {
//   MATRIX,
//   questions,
//   pricing,
//   coveredDescriptions,
//   BASE_PRICE,
//   getBasePrice,
//   getCoveredDescription,
//   getRushFee,
//   getQuestions,
//   getAdjustment,
//   estimateTotal,
// };

/* ========================================================================== */
/* MATRIX + PRICING                                                           */
/* ========================================================================== */

// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   {
//     Service: "Plumbing",
//     Question: "leak or clog",
//     Option: "leak",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "leak or clog",
//     Option: "clogged",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "kitchen sink",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom sink",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom toilet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom shower",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "where located",
//     Option: "bathroom bathtub",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "minor leak",
//     Adjustment: 0,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "major leak",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "minor clog",
//     Adjustment: 0,
//   },
//   {
//     Service: "Plumbing",
//     Question: "severity",
//     Option: "major clog",
//     Adjustment: 50,
//   },
//   {
//     Service: "Plumbing",
//     Question: "access",
//     Option: "easy access",
//     Adjustment: 0,
//   },
//   {
//     Service: "Plumbing",
//     Question: "access",
//     Option: "behind wall",
//     Adjustment: 75,
//   },
//   {
//     Service: "Plumbing",
//     Question: "access",
//     Option: "behind ceiling",
//     Adjustment: 75,
//   },

//   // Roofing
//   {
//     Service: "Roofing",
//     Question: "roof type",
//     Option: "shingles",
//     Adjustment: 50,
//   },
//   {
//     Service: "Roofing",
//     Question: "roof type",
//     Option: "tile",
//     Adjustment: 150,
//   },
//   {
//     Service: "Roofing",
//     Question: "roof type",
//     Option: "metal",
//     Adjustment: 150,
//   },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   {
//     Service: "Roofing",
//     Question: "damaged area",
//     Option: "small patch",
//     Adjustment: 75,
//   },
//   {
//     Service: "Roofing",
//     Question: "damaged area",
//     Option: "large section",
//     Adjustment: 300,
//   },
//   {
//     Service: "Roofing",
//     Question: "access",
//     Option: "single story",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roofing",
//     Question: "access",
//     Option: "second story",
//     Adjustment: 200,
//   },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   {
//     Service: "HVAC",
//     Question: "system type",
//     Option: "central ac",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC",
//     Question: "system type",
//     Option: "heating",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "not cooling",
//     Adjustment: 75,
//   },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "not heating",
//     Adjustment: 75,
//   },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "strange noise",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC",
//     Question: "problem",
//     Option: "strange smell",
//     Adjustment: 50,
//   },
//   {
//     Service: "HVAC",
//     Question: "urgency",
//     Option: "comfort issue",
//     Adjustment: 0,
//   },
//   {
//     Service: "HVAC",
//     Question: "urgency",
//     Option: "system down",
//     Adjustment: 75,
//   },

//   // Electrician
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "outlet not working",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "light switch not working",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "light flickering",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "type of issue",
//     Option: "breaker tripping",
//     Adjustment: 75,
//   },
//   {
//     Service: "Electrician",
//     Question: "scope of work",
//     Option: "single outlet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "scope of work",
//     Option: "single fixture",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "scope of work",
//     Option: "single switch",
//     Adjustment: 50,
//   },
//   {
//     Service: "Electrician",
//     Question: "accessibility",
//     Option: "easy access",
//     Adjustment: 0,
//   },
//   {
//     Service: "Electrician",
//     Question: "accessibility",
//     Option: "high ceiling",
//     Adjustment: 75,
//   },

//   // Handyman
//   {
//     Service: "Handyman",
//     Question: "project type",
//     Option: "maintenance",
//     Adjustment: 25,
//   },
//   {
//     Service: "Handyman",
//     Question: "project type",
//     Option: "installation",
//     Adjustment: 50,
//   },
//   {
//     Service: "Handyman",
//     Question: "project type",
//     Option: "repair",
//     Adjustment: 35,
//   },
//   {
//     Service: "Handyman",
//     Question: "project length",
//     Option: "up to 3 hours",
//     Adjustment: 50,
//   },
//   {
//     Service: "Handyman",
//     Question: "project length",
//     Option: "up to 5 hours",
//     Adjustment: 75,
//   },
//   {
//     Service: "Handyman",
//     Question: "project length",
//     Option: "up to 8 hours",
//     Adjustment: 100,
//   },

//   // Locksmith
//   {
//     Service: "Locksmith",
//     Question: "lockout",
//     Option: "home lockout",
//     Adjustment: 100,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lockout",
//     Option: "car lockout",
//     Adjustment: 120,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lock type",
//     Option: "standard",
//     Adjustment: 0,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lock type",
//     Option: "high security",
//     Adjustment: 100,
//   },
//   {
//     Service: "Locksmith",
//     Question: "lock type",
//     Option: "smart lock",
//     Adjustment: 100,
//   },

//   // Cleaning
//   {
//     Service: "Cleaner / Housekeeper",
//     Question: "cleaning type",
//     Option: "basic (up to 3 hours)",
//     Adjustment: 0,
//   },
//   {
//     Service: "Cleaner / Housekeeper",
//     Question: "cleaning type",
//     Option: "deep cleaning (up to 5 hours)",
//     Adjustment: 100,
//   },
//   {
//     Service: "Cleaner / Housekeeper",
//     Question: "cleaning type",
//     Option: "move out (up to 8 hours)",
//     Adjustment: 150,
//   },

//   // Painting
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "painting type",
//     Option: "interior",
//     Adjustment: 50,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "painting type",
//     Option: "exterior",
//     Adjustment: 150,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "up to 500 sqft",
//     Adjustment: 150,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "500 to 1000 sqft",
//     Adjustment: 450,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "1000 to 1500 sqft",
//     Adjustment: 750,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "job size",
//     Option: "1500 to 2000 sqft",
//     Adjustment: 1200,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "ceiling height",
//     Option: "up to 8 feet",
//     Adjustment: 50,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "ceiling height",
//     Option: "up to 10 feet",
//     Adjustment: 100,
//   },
//   {
//     Service: "Painter (interior/exterior)",
//     Question: "ceiling height",
//     Option: "up to 12 feet",
//     Adjustment: 200,
//   },

//   // Landscaping
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "mowing",
//     Adjustment: 0,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "trimming",
//     Adjustment: 25,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "tree removal (less than 6 inch diameter)",
//     Adjustment: 200,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "work type",
//     Option: "hedge removal",
//     Adjustment: 200,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "property size",
//     Option: "small yard",
//     Adjustment: 0,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "property size",
//     Option: "large property",
//     Adjustment: 50,
//   },
//   {
//     Service: "Landscaper / Lawn Care",
//     Question: "property size",
//     Option: "extra large",
//     Adjustment: 100,
//   },

//   /* ================== AUTO ================== */


//   // Car Detailing (Mobile)
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "package",
//     Option: "interior only",
//     Adjustment: 30,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "package",
//     Option: "exterior only",
//     Adjustment: 0,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "package",
//     Option: "interior and exterior",
//     Adjustment: 55,
//   },

//   {
//     Service: "Car Detailing (mobile)",
//     Question: "vehicle size",
//     Option: "car",
//     Adjustment: 5,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "vehicle size",
//     Option: "suv",
//     Adjustment: 25,
//   },
//   {
//     Service: "Car Detailing (mobile)",
//     Question: "vehicle size",
//     Option: "large suv",
//     Adjustment: 35,
//   },

//   // Roadside Service
//   {
//     Service: "Roadside Service",
//     Question: "issue",
//     Option: "battery",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "issue",
//     Option: "tire",
//     Adjustment: 25,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "issue",
//     Option: "tow",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "vehicle location",
//     Option: "home driveway",
//     Adjustment: 0,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "vehicle location",
//     Option: "highway",
//     Adjustment: 70,
//   },
//   {
//     Service: "Roadside Service",
//     Question: "vehicle location",
//     Option: "remote",
//     Adjustment: 100,
//   },

//   // Mobile Mechanic
//   {
//     Service: "Mobile Mechanic",
//     Question: "issue",
//     Option: "car does not start",
//     Adjustment: 100,
//   },
//   {
//     Service: "Mobile Mechanic",
//     Question: "issue",
//     Option: "oil change",
//     Adjustment: 40,
//   },
//   {
//     Service: "Mobile Mechanic",
//     Question: "issue",
//     Option: "brake replacement",
//     Adjustment: 100,
//   },

//   // Pest Control
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "ants",
//     Adjustment: 50,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "roaches",
//     Adjustment: 75,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "rodents",
//     Adjustment: 100,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "termites",
//     Adjustment: 50,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "pest type",
//     Option: "bedbugs",
//     Adjustment: 50,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "severity",
//     Option: "mild",
//     Adjustment: 0,
//   },
//   {
//     Service: "Pest Control / Exterminator",
//     Question: "severity",
//     Option: "severe",
//     Adjustment: 0,
//   },

//   // General Contractor (Consulting/Estimating)
//   {
//     Service: "General Contractor (Consulting/Estimating)",
//     Question: "scope",
//     Option: "up to 3 hours",
//     Adjustment: 0,
//   },
//   {
//     Service: "General Contractor (Consulting/Estimating)",
//     Question: "scope",
//     Option: "up to 5 hours",
//     Adjustment: 300,
//   },
//   {
//     Service: "General Contractor (Consulting/Estimating)",
//     Question: "scope",
//     Option: "up to 8 hours",
//     Adjustment: 500,
//   },
// ];

// /* ========================================================================== */
// /* COVERED DESCRIPTIONS                                                       */
// /* ========================================================================== */
// export const coveredDescriptions = {
//   Plumbing:
//     "Covers leaks, burst pipes, clogs, and other emergency plumbing issues. Parts replacement and specialty work may incur additional charges.",
//   Roofing:
//     "Covers patching leaks, replacing damaged shingles/tiles, and temporary weatherproofing. Full roof replacements not included.",
//   HVAC: "Covers repair of central AC or heating systems. Includes diagnostics and emergency fixes. Replacement units not included.",
//   Electrician:
//     "Covers outlet, breaker, and wiring issues. Complex rewiring or panel upgrades may require additional estimates.",
//   Handyman:
//     "Covers small household projects and repairs. Larger remodel or specialty work may require contractor services.",
//   Locksmith:
//     "Covers standard home and auto lockouts. Specialty locks, smart locks, or rekeying may add extra costs.",
//   "Cleaner / Housekeeper":
//     "Covers basic, deep, or move-in/out home cleaning. Supplies and equipment included. Specialty cleaning may cost extra.",
//   "Mobile Mechanic":
//     "Covers on-site diagnostics and light repairs. Major repairs may require a shop.",
//   "Pest Control / Exterminator":
//     "Covers inspection and treatment for ants, roaches, rodents, termites, and bedbugs.",
//   "Painter (interior/exterior)":
//     "Covers surface prep and painting of walls/ceilings or exterior siding.",
//   "Landscaper / Lawn Care":
//     "Covers mowing, trimming, yard cleanup, and small tree/hedge work.",
//   "Car Detailing (mobile)": "Covers mobile detailing packages and add-ons.",
//   "Roadside Service":
//     "Covers basic roadside assistance such as battery jumps, tire changes, or short tows.",
//   "General Contractor (Consulting/Estimating)":
//     "Covers onsite consulting/estimating time blocks only.",
// };

// /* ========================================================================== */
// /* BASE PRICE ANCHORS                                                         */
// /* ========================================================================== */
// export const BASE_PRICE = {
//   Plumbing: 175,
//   Roofing: 250,
//   HVAC: 200,
//   Electrician: 150,
//   Handyman: 125,
//   Locksmith: 120,
//   "Cleaner / Housekeeper": 125,
//   "Roadside Service": 100,
//   "Mobile Mechanic": 125,
//   "Pest Control / Exterminator": 150,
//   "Painter (interior/exterior)": 200,
//   "Landscaper / Lawn Care": 50,
//   "General Contractor (Consulting/Estimating)": 0,
//   "Car Detailing (mobile)": 50,
// };

// if (
//   typeof __DEV__ !== "undefined"
//     ? __DEV__
//     : process.env.NODE_ENV !== "production"
// ) {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] =
//     "Developer test checkout: fixed $1, no other fees.";
// }

// /* ========================================================================== */
// /* HELPERS                                                                    */
// /* ========================================================================== */
// const RUSH_FEE = 100;
// export const getRushFee = () => RUSH_FEE;

// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// /* ========================================================================== */
// /* CATEGORY MAPPINGS (service -> category)                                    */
// /* ========================================================================== */
// export const SERVICE_TO_CATEGORY = {
//   Plumbing: "Plumbing",
//   Roofing: "Roofing",
//   HVAC: "HVAC",
//   Electrician: "Electrician",
//   Handyman: "Handyman",
//   Locksmith: "Locksmith",
//   "Cleaner / Housekeeper": "Cleaning",
//   "Mobile Mechanic": "Auto",
//   "Pest Control / Exterminator": "Pest Control",
//   "Painter (interior/exterior)": "Painting",
//   "Landscaper / Lawn Care": "Landscaping",
//   "Car Detailing (mobile)": "Auto",
//   "Roadside Service": "Auto",
//   "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
// };

// /* ========================================================================== */
// /* BUILD CATEGORY -> SERVICES, QUESTIONS, PRICING                             */
// /* ========================================================================== */
// export const questions = {};
// export const pricing = {};

// // 1) category → services
// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd Jobs";
//   (categoryServices[cat] ??= new Set()).add(Service);
// }

// // 2) Category-level service picker
// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: "__service_picker__",
//       question: `Which ${cat
//         .replace(/_/g, " ")
//         .toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet).map((svc) => ({
//         value: svc,
//         label: String(svc),
//       })),
//     },
//   ];
// }

// // 3) Service-level questions (slug keys)
// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   questions[Service] ??= [];
//   pricing[Service] ??= {};

//   const qKey = slug(Question);
//   const oKey = slug(Option);

//   let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }

//   if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//     qObj.options.push({ value: Option, label: String(Option) });
//   }

//   (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
// }

// /* ========================================================================== */
// /* EXPORTED HELPERS                                                           */
// /* ========================================================================== */
// export const getBasePrice = (serviceOrCategory) => {
//   if (BASE_PRICE[serviceOrCategory] != null)
//     return BASE_PRICE[serviceOrCategory];
//   const cat = SERVICE_TO_CATEGORY[serviceOrCategory];
//   return cat && BASE_PRICE[cat] ? BASE_PRICE[cat] : 0;
// };

// export const getCoveredDescription = (serviceKey) =>
//   coveredDescriptions[serviceKey] || "";

// /* === robust resolveToService: handles category pick stored under question text === */
// export const resolveToService = (serviceOrCategory, answers = {}) => {
//   const raw = String(serviceOrCategory || "");
//   if (pricing[raw]) return raw;

//   // explicit picks if UI set them
//   const directKeys = ["service", "selectedService", "scope"];
//   for (const k of directKeys) {
//     const v = answers?.[k];
//     if (v && pricing[String(v)]) return String(v);
//   }

//   // if raw is a category, scan all answer values for a concrete service name
//   const inCategory = Object.keys(SERVICE_TO_CATEGORY || {}).filter(
//     (svc) => (SERVICE_TO_CATEGORY || {})[svc] === raw
//   );
//   if (inCategory.length) {
//     const vals = [];
//     for (const v of Object.values(answers || {})) {
//       if (Array.isArray(v)) vals.push(...v.map(String));
//       else if (v && typeof v === "object" && "value" in v)
//         vals.push(String(v.value));
//       else vals.push(String(v));
//     }
//     const picked = inCategory.find((svc) => vals.includes(svc));
//     if (picked && pricing[picked]) return picked;

//     const first = inCategory.find((svc) => pricing[svc]);
//     if (first) return first;
//   }

//   return raw;
// };

// // unwrap {label,value} → value (or pass-through for strings)
// const valueOf = (opt) =>
//   typeof opt === "object" && opt && "value" in opt ? opt.value : opt;

// export const getAdjustment = (
//   serviceOrCategory,
//   question,
//   option,
//   answers = {}
// ) => {
//   const service = resolveToService(serviceOrCategory, answers);
//   const qKey = slug(question);
//   const oKey = slug(valueOf(option));
//   const value = pricing?.[service]?.[qKey]?.[oKey];
//   if (value == null) {
//     if (
//       typeof __DEV__ !== "undefined"
//         ? __DEV__
//         : process.env.NODE_ENV !== "production"
//     ) {
//       const qAvail = Object.keys(pricing?.[service] || {});
//       console.debug("[pricing miss]", {
//         service,
//         qKey,
//         oKey,
//         availableQuestions: qAvail,
//       });
//     }
//     return 0;
//   }
//   return value;
// };

// export const estimateTotal = (serviceOrCategory, answers = {}) => {
//   const selectedService = resolveToService(serviceOrCategory, answers);
//   const base = getBasePrice(selectedService);
//   const adjustments = Object.entries(answers).reduce(
//     (sum, [question, option]) => {
//       if (Array.isArray(option)) {
//         return (
//           sum +
//           option.reduce(
//             (acc, opt) =>
//               acc + getAdjustment(selectedService, question, opt, answers),
//             0
//           )
//         );
//       }
//       return sum + getAdjustment(selectedService, question, option, answers);
//     },
//     0
//   );
//   return base + adjustments;
// };

// export default {
//   MATRIX,
//   questions,
//   pricing,
//   coveredDescriptions,
//   BASE_PRICE,
//   getBasePrice,
//   getCoveredDescription,
//   getRushFee,
//   getQuestions: (serviceOrCategory) => {
//     if (questions[serviceOrCategory]) return questions[serviceOrCategory];
//     const mappedCategory = SERVICE_TO_CATEGORY[serviceOrCategory];
//     if (mappedCategory && questions[mappedCategory])
//       return questions[mappedCategory];
//     const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY).filter(
//       (svc) => SERVICE_TO_CATEGORY[svc] === serviceOrCategory
//     );
//     if (servicesInCategory.length > 0)
//       return servicesInCategory.flatMap((svc) => questions[svc] || []);
//     console.warn("⚠️ No questions found for:", serviceOrCategory);
//     return [];
//   },
//   getAdjustment,
//   estimateTotal,
// };


/* ========================================================================== */
/* MATRIX + PRICING (CORRECTED)                                               */
/* ========================================================================== */

// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
//   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
//   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },

//   // Roofing
//   { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
//   { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
//   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
//   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
//   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },

//   // Electrician
//   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
//   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
//   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//   { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },

//   // Handyman
//   { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
//   { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
//   { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
//   { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
//   { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
//   { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },

//   // Locksmith
//   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
//   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
//   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },

//   // Cleaning
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },

//   // Painting
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },

//   // Landscaping
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },

//   /* ================== AUTO ================== */
//   // Car Detailing (mobile) — ensure BOTH > exterior only
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },

//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 35 },

//   // Roadside Service
//   { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
//   { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },

//   // Mobile Mechanic
//   { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },

//   // Pest Control
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 75 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 100 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 0 },

//   // General Contractor (Consulting/Estimating)
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 0 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
// ];

// /* ========================================================================== */
// /* COVERED DESCRIPTIONS                                                       */
// /* ========================================================================== */
// export const coveredDescriptions = {
//   "Plumbing":
//     "Covers leaks, burst pipes, clogs, and other emergency plumbing issues. Parts replacement and specialty work may incur additional charges.",
//   "Roofing":
//     "Covers patching leaks, replacing damaged shingles/tiles, and temporary weatherproofing. Full roof replacements not included.",
//   "HVAC":
//     "Covers repair of central AC or heating systems. Includes diagnostics and emergency fixes. Replacement units not included.",
//   "Electrician":
//     "Covers outlet, breaker, and wiring issues. Complex rewiring or panel upgrades may require additional estimates.",
//   "Handyman":
//     "Covers small household projects and repairs. Larger remodel or specialty work may require contractor services.",
//   "Locksmith":
//     "Covers standard home and auto lockouts. Specialty locks, smart locks, or rekeying may add extra costs.",
//   "Cleaner / Housekeeper":
//     "Covers basic, deep, or move-in/out home cleaning. Supplies and equipment included. Specialty cleaning may cost extra.",
//   "Mobile Mechanic":
//     "Covers on-site diagnostics and light repairs. Major repairs may require a shop.",
//   "Pest Control / Exterminator":
//     "Covers inspection and treatment for ants, roaches, rodents, termites, and bedbugs.",
//   "Painter (interior/exterior)":
//     "Covers surface prep and painting of walls/ceilings or exterior siding.",
//   "Landscaper / Lawn Care":
//     "Covers mowing, trimming, yard cleanup, and small tree/hedge work.",
//   "Car Detailing (mobile)":
//     "Covers mobile detailing packages and add-ons.",
//   "Roadside Service":
//     "Covers basic roadside assistance such as battery jumps, tire changes, or short tows.",
//   "General Contractor (Consulting/Estimating)":
//     "Covers onsite consulting/estimating time blocks only.",
// };

// /* ========================================================================== */
// /* BASE PRICE ANCHORS                                                         */
// /* ========================================================================== */
// export const BASE_PRICE = {
//   "Plumbing": 175,
//   "Roofing": 250,
//   "HVAC": 200,
//   "Electrician": 250,
//   "Handyman": 125,
//   "Locksmith": 120,
//   "Cleaner / Housekeeper": 125,
//   "Roadside Service": 100,
//   "Mobile Mechanic": 125,
//   "Pest Control / Exterminator": 150,
//   "Painter (interior/exterior)": 200,
//   "Landscaper / Lawn Care": 50,
//   "General Contractor (Consulting/Estimating)": 0,
//   "Car Detailing (mobile)": 50,
// };

// // Dev-only test hook
// if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//   BASE_PRICE["Test: $1 Flat (No Fees)"] = 1;
//   coveredDescriptions["Test: $1 Flat (No Fees)"] =
//     "Developer test checkout: fixed $1, no other fees.";
// }

// /* ========================================================================== */
// /* HELPERS + CATEGORY MAP                                                     */
// /* ========================================================================== */
// const RUSH_FEE = 0;
// export const getRushFee = () => RUSH_FEE;

// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// export const SERVICE_TO_CATEGORY = {
//   "Plumbing": "Plumbing",
//   "Roofing": "Roofing",
//   "HVAC": "HVAC",
//   "Electrician": "Electrician",
//   "Handyman": "Handyman",
//   "Locksmith": "Locksmith",
//   "Cleaner / Housekeeper": "Cleaning",
//   "Mobile Mechanic": "Auto",
//   "Pest Control / Exterminator": "Pest Control",
//   "Painter (interior/exterior)": "Painting",
//   "Landscaper / Lawn Care": "Landscaping",
//   "Car Detailing (mobile)": "Auto",
//   "Roadside Service": "Auto",
//   "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
// };

// /* ========================================================================== */
// /* BUILD CATEGORY -> SERVICES, QUESTIONS, PRICING                             */
// /* ========================================================================== */
// export const questions = {};
// export const pricing = {};

// // 1) category → services
// const categoryServices = {};
// for (const { Service } of MATRIX) {
//   const cat = SERVICE_TO_CATEGORY[Service] || "Odd Jobs";
//   (categoryServices[cat] ??= new Set()).add(Service);
// }

// // 2) Category-level service picker
// for (const [cat, svcSet] of Object.entries(categoryServices)) {
//   questions[cat] = [
//     {
//       id: "__service_picker__",
//       question: `Which ${cat.replace(/_/g, " ").toLowerCase()} issue are you experiencing?`,
//       type: "multiple",
//       options: Array.from(svcSet).map((svc) => ({ value: svc, label: String(svc) })),
//     },
//   ];
// }

// // 3) Service-level questions (slug keys)
// for (const row of MATRIX) {
//   const { Service, Question, Option, Adjustment } = row;
//   questions[Service] ??= [];
//   pricing[Service] ??= {};

//   const qKey = slug(Question);
//   const oKey = slug(Option);

//   let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//   if (!qObj) {
//     qObj = {
//       id: questions[Service].length + 1,
//       question: Question,
//       type: "multiple",
//       options: [],
//     };
//     questions[Service].push(qObj);
//   }

//   if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//     qObj.options.push({ value: Option, label: String(Option) });
//   }

//   (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
// }

// /* ========================================================================== */
// /* EXPORTED HELPERS                                                           */
// /* ========================================================================== */
// export const getBasePrice = (serviceOrCategory) => {
//   if (BASE_PRICE[serviceOrCategory] != null)
//     return BASE_PRICE[serviceOrCategory];
//   const cat = SERVICE_TO_CATEGORY[serviceOrCategory];
//   return cat && BASE_PRICE[cat] ? BASE_PRICE[cat] : 0;
// };

// export const getCoveredDescription = (serviceKey) =>
//   coveredDescriptions[serviceKey] || "";

// /* Robust resolve: detects chosen concrete service inside category answers */
// // Local service aliases so we resolve to MATRIX service names
// const SERVICE_ALIAS_LOCAL = {
//   "Handyman (general fixes)": "Handyman",
//   "Tow Truck / Roadside Assistance": "Roadside Service",
//   "Car Mechanic (general)": "Mobile Mechanic",
//   "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
// };

// // Robust resolve: detects chosen concrete service inside category answers
// export const resolveToService = (serviceOrCategory, answers = {}) => {
//   const raw = String(serviceOrCategory || "");
//   const aliased = SERVICE_ALIAS_LOCAL[raw] || raw;

//   // 1) direct service hit (after alias)
//   if (pricing[aliased]) return aliased;

//   // 2) try selection from answers (handles category screens that capture service)
//   const picked =
//     SERVICE_ALIAS_LOCAL[answers.service] ||
//     SERVICE_ALIAS_LOCAL[answers.selectedService] ||
//     answers.service ||
//     answers.selectedService ||
//     answers.scope ||
//     null;

//   if (picked && pricing[SERVICE_ALIAS_LOCAL[picked] || picked]) {
//     return SERVICE_ALIAS_LOCAL[picked] || picked;
//   }

//   // 3) treat input as category → find any service in that category that we price
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY || {}).filter(
//     (svc) => (SERVICE_TO_CATEGORY || {})[svc] === aliased
//   );
//   const found = servicesInCategory.find((svc) => pricing[svc]);
//   return found || aliased;
// };


// // unwrap {label,value} → value for client lookups
// const valueOf = (opt) =>
//   typeof opt === "object" && opt && "value" in opt ? opt.value : opt;

// export const getQuestions = (serviceOrCategory) => {
//   if (questions[serviceOrCategory]) return questions[serviceOrCategory];
//   const mappedCategory = SERVICE_TO_CATEGORY[serviceOrCategory];
//   if (mappedCategory && questions[mappedCategory])
//     return questions[mappedCategory];
//   const servicesInCategory = Object.keys(SERVICE_TO_CATEGORY).filter(
//     (svc) => SERVICE_TO_CATEGORY[svc] === serviceOrCategory
//   );
//   if (servicesInCategory.length > 0)
//     return servicesInCategory.flatMap((svc) => questions[svc] || []);
//   console.warn("⚠️ No questions found for:", serviceOrCategory);
//   return [];
// };

// export const getAdjustment = (serviceOrCategory, question, option, answers = {}) => {
//   const service = resolveToService(serviceOrCategory, answers);
//   const qRaw = String(question || "");
//   const oRaw = String(option || "");

//   const qSlug = _slug(qRaw);
//   const oSlug = _slug(oRaw);

//   // 1) direct lookup with what was passed
//   let v = pricing?.[service]?.[qSlug]?.[oSlug];
//   if (v != null) return v;

//   // 2) try mirroring canonical keys (e.g., job.length -> "project length")
//   const mirroredQ = mirrorToMatrixQKey(service, qRaw);
//   if (mirroredQ) {
//     v = pricing?.[service]?.[mirroredQ]?.[oSlug];
//     if (v != null) return v;
//   }

//   // 3) very forgiving: if option came through in plain lowercase (not slug),
//   // also try that form (some UIs pass exact label already)
//   const oPlain = oRaw.toLowerCase().trim();
//   if (oPlain && oPlain !== oSlug) {
//     v = pricing?.[service]?.[qSlug]?.[_slug(oPlain)];
//     if (v != null) return v;
//     if (mirroredQ) {
//       v = pricing?.[service]?.[mirroredQ]?.[_slug(oPlain)];
//       if (v != null) return v;
//     }
//   }

//   // dev hint
//   if (typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production") {
//     const qAvail = Object.keys(pricing?.[service] || {});
//     console.debug("[pricing miss]", {
//       service,
//       tried: { qSlug, mirroredQ, oSlug, oPlain: _slug(oPlain) },
//       availableQuestions: qAvail,
//     });
//   }
//   return 0;
// };


// export const estimateTotal = (serviceOrCategory, answers = {}) => {
//   const selectedService = resolveToService(serviceOrCategory, answers);
//   const base = getBasePrice(selectedService);
//   const adjustments = Object.entries(answers).reduce((sum, [question, option]) => {
//     if (Array.isArray(option)) {
//       return sum + option.reduce((acc, opt) => acc + getAdjustment(selectedService, question, opt, answers), 0);
//     }
//     return sum + getAdjustment(selectedService, question, option, answers);
//   }, 0);
//   return base + adjustments;
// };

// export default {
//   MATRIX,
//   questions,
//   pricing,
//   coveredDescriptions,
//   BASE_PRICE,
//   getBasePrice,
//   getCoveredDescription,
//   getRushFee,
//   getQuestions,
//   getAdjustment,
//   resolveToService,
//   estimateTotal,
// };


/* ========================================================================== */
/* MATRIX (canonical) + derived artifacts                                     */
/* ========================================================================== */

// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
//   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
//   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },

//   // Roofing
//   { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
//   { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
//   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
//   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
//   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },

//   // Electrician
//   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
//   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
//   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//   { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },

//   // Handyman
//   { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
//   { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
//   { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
//   { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
//   { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
//   { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },

//   // Locksmith
//   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
//   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
//   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },

//   // Cleaning
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },

//   // Painting
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },

//   // Landscaping
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },

//   /* ================== AUTO ================== */
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 35 },

//   { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
//   { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },

//   { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },

//   // Pest
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 75 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 100 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 0 },

//   // Consulting / Estimating
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 0 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
// ];

// /* ---------- helpers ---------- */
// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// /* Build all artifacts from MATRIX */
// export function buildArtifacts(matrix = MATRIX) {
//   const questions = {};
//   const pricing = {};
//   const serviceAlias = {
//     // cross-service renames (UI → MATRIX)
//     "Handyman (general fixes)": "Handyman",
//     "Tow Truck / Roadside Assistance": "Roadside Service",
//     "Car Mechanic (general)": "Mobile Mechanic",
//     "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
//   };

//   // identity-map all services to themselves
//   for (const row of matrix) {
//     if (row.Service && !(row.Service in serviceAlias)) {
//       serviceAlias[row.Service] = row.Service;
//     }
//   }

//   // questions/pricing
//   for (const row of matrix) {
//     const { Service, Question, Option, Adjustment } = row;

//     questions[Service] ??= [];
//     pricing[Service] ??= {};

//     const qKey = slug(Question);
//     const oKey = slug(Option);

//     let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//     if (!qObj) {
//       qObj = {
//         id: questions[Service].length + 1,
//         question: Question,
//         type: "multiple",
//         options: [],
//       };
//       questions[Service].push(qObj);
//     }
//     if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//       qObj.options.push({ value: Option, label: String(Option) });
//     }
//     (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
//   }

//   // categories (simple, editable)
//   const serviceToCategory = {
//     "Plumbing": "Plumbing",
//     "Roofing": "Roofing",
//     "HVAC": "HVAC",
//     "Electrician": "Electrician",
//     "Handyman": "Handyman",
//     "Locksmith": "Locksmith",
//     "Cleaner / Housekeeper": "Cleaning",
//     "Mobile Mechanic": "Auto",
//     "Pest Control / Exterminator": "Pest Control",
//     "Painter (interior/exterior)": "Painting",
//     "Landscaper / Lawn Care": "Landscaping",
//     "Car Detailing (mobile)": "Auto",
//     "Roadside Service": "Auto",
//     "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
//   };

//   // base price anchors used by FE previews (server can have its own)
//   const basePrice = {
//     "Plumbing": 175,
//     "Roofing": 250,
//     "HVAC": 200,
//     "Electrician": 250,
//     "Handyman": 125,
//     "Locksmith": 120,
//     "Cleaner / Housekeeper": 125,
//     "Roadside Service": 100,
//     "Mobile Mechanic": 125,
//     "Pest Control / Exterminator": 150,
//     "Painter (interior/exterior)": 200,
//     "Landscaper / Lawn Care": 50,
//     "General Contractor (Consulting/Estimating)": 0,
//     "Car Detailing (mobile)": 50,
//   };

//   return { questions, pricing, serviceAlias, serviceToCategory, basePrice };
// }

// /* Prebuilt artifacts (most callers can just import these) */
// export const ART = buildArtifacts(MATRIX);
// export const questions = ART.questions;
// export const pricing = ART.pricing;
// export const serviceAlias = ART.serviceAlias;
// export const SERVICE_TO_CATEGORY = ART.serviceToCategory;
// export const BASE_PRICE = ART.basePrice;


/* ==========================================================================
   SERVICE MATRIX — SINGLE SOURCE OF TRUTH
   - Export the raw MATRIX rows
   - Build questions/pricing/categories/base price from MATRIX
   - Provide helpers used by both FE & BE (resolveToService, getQuestions, etc.)
   ========================================================================== */
/* ==========================================================================
   SERVICE MATRIX — SINGLE SOURCE OF TRUTH (Frontend copy)
   Keep this file byte-identical to backend/utils/serviceMatrix.js
   ========================================================================== */

  //  export const MATRIX = [
  //   /* ================== CORE TRADES ================== */
  //   // Plumbing
  //   { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
  //   { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
  //   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
  //   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
  //   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
  //   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },
  
  //   // Roofing
  //   { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
  //   { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
  //   { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
  //   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
  //   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
  //   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
  //   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
  //   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
  //   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },
  
  //   // HVAC
  //   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
  //   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
  //   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
  //   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
  //   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
  //   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
  //   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
  //   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
  //   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
  //   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },
  
  //   // Electrician
  //   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
  //   { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
  //   { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
  //   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
  //   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 50 },
  //   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
  //   { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
  //   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
  //   { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },
  
  //   // Handyman
  //   { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
  //   { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
  //   { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
  //   { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
  //   { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
  //   { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },
  
  //   // Locksmith
  //   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
  //   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
  //   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
  //   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
  //   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },
  
  //   // Cleaning
  //   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
  //   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
  //   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },
  
  //   // Painting
  //   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
  //   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
  //   { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
  //   { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
  //   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
  //   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
  //   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
  //   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
  //   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },
  
  //   // Landscaping
  //   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
  //   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
  //   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
  //   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
  //   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
  //   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
  //   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },
  
  //   /* ================== AUTO ================== */
  //   // Car Detailing (mobile)
  //   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
  //   { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
  //   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
  //   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
  //   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },
  //   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 35 },
  
  //   // Roadside Service
  //   { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
  //   { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
  //   { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
  //   { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
  //   { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
  //   { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },
  
  //   // Mobile Mechanic
  //   { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
  //   { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
  //   { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },
  
  //   // Pest Control
  //   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
  //   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 75 },
  //   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 100 },
  //   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 50 },
  //   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 50 },
  //   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
  //   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 0 },
  
  //   // Consulting / Estimating
  //   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 0 },
  //   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
  //   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
  // ];
  
  // /* ---------- helpers ---------- */
  // const slug = (s) =>
  //   String(s || "")
  //     .trim()
  //     .toLowerCase()
  //     .replace(/\s+/g, " ")
  //     .replace(/[^a-z0-9]+/g, "_")
  //     .replace(/^_+|_+$/g, "");
  
  // /* Build all artifacts from MATRIX */
  // export function buildArtifacts(matrix = MATRIX) {
  //   const questions = {};
  //   const pricing = {};
  
  //   const serviceAlias = {
  //     "Handyman (general fixes)": "Handyman",
  //     "Tow Truck / Roadside Assistance": "Roadside Service",
  //     "Car Mechanic (general)": "Mobile Mechanic",
  //     "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
  //   };
  
  //   for (const row of matrix) {
  //     const svc = row?.Service;
  //     if (svc && !(svc in serviceAlias)) serviceAlias[svc] = svc;
  //   }
  
  //   for (const row of matrix) {
  //     const { Service, Question, Option, Adjustment } = row;
  
  //     questions[Service] ??= [];
  //     pricing[Service] ??= {};
  
  //     const qKey = slug(Question);
  //     const oKey = slug(Option);
  
  //     let qObj = questions[Service].find((q) => slug(q.question) === qKey);
  //     if (!qObj) {
  //       qObj = {
  //         id: questions[Service].length + 1,
  //         question: Question,
  //         type: "multiple",
  //         options: [],
  //       };
  //       questions[Service].push(qObj);
  //     }
  
  //     if (!qObj.options.find((o) => slug(o.value) === oKey)) {
  //       qObj.options.push({ value: Option, label: String(Option) });
  //     }
  
  //     (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
  //   }
  
  //   const serviceToCategory = {
  //     "Plumbing": "Plumbing",
  //     "Roofing": "Roofing",
  //     "HVAC": "HVAC",
  //     "Electrician": "Electrician",
  //     "Handyman": "Handyman",
  //     "Locksmith": "Locksmith",
  //     "Cleaner / Housekeeper": "Cleaning",
  //     "Mobile Mechanic": "Auto",
  //     "Pest Control / Exterminator": "Pest Control",
  //     "Painter (interior/exterior)": "Painting",
  //     "Landscaper / Lawn Care": "Landscaping",
  //     "Car Detailing (mobile)": "Auto",
  //     "Roadside Service": "Auto",
  //     "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
  //   };
  
  //   const basePrice = {
  //     "Plumbing": 175,
  //     "Roofing": 250,
  //     "HVAC": 200,
  //     "Electrician": 250,
  //     "Handyman": 125,
  //     "Locksmith": 120,
  //     "Cleaner / Housekeeper": 125,
  //     "Roadside Service": 100,
  //     "Mobile Mechanic": 125,
  //     "Pest Control / Exterminator": 150,
  //     "Painter (interior/exterior)": 200,
  //     "Landscaper / Lawn Care": 50,
  //     "General Contractor (Consulting/Estimating)": 0,
  //     "Car Detailing (mobile)": 50,
  //   };
  
  //   return { questions, pricing, serviceAlias, serviceToCategory, basePrice };
  // }
  
  // /* Prebuilt artifacts */
  // export const ART = buildArtifacts(MATRIX);
  // export const questions = ART.questions;
  // export const pricing = ART.pricing;
  // export const serviceAlias = ART.serviceAlias;
  // export const SERVICE_TO_CATEGORY = ART.serviceToCategory;
  // export const BASE_PRICE = ART.basePrice;
  
  // /* Safe getters the UI can call without blowing up */
  // export const getQuestionsSafe = (key) => {
  //   return (questions && questions[key]) ? questions[key] : [];
  // };
  // export const getCategoryPicker = (category) => {
  //   // Category rows were added under questions[category] with id="__service_picker__"
  //   const arr = getQuestionsSafe(category);
  //   return Array.isArray(arr) ? arr.find(q => q.id === "__service_picker__") || arr[0] || null : null;
  // };
  
  // /* Keep a predictable default export so `import matrix from ...` works */
  // const matrixModule = {
  //   MATRIX,
  //   questions,
  //   pricing,
  //   serviceAlias,
  //   SERVICE_TO_CATEGORY,
  //   BASE_PRICE,
  //   buildArtifacts,
  //   getQuestionsSafe,
  //   getCategoryPicker,
  // };
  // export default matrixModule;
  

  /* =============================================================================
   serviceMatrix.js  (FRONTEND)
   - Single source for MATRIX-driven questions/pricing + helpers
   - Exposes named exports and a default namespace to avoid import shape breakage
============================================================================= */

/* ============================== MATRIX ==================================== */
// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
//   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
//   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },

//   // Roofing
//   { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
//   { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
//   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
//   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
//   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },

//   // Electrician
//   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
//   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 0 },
//   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
//   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//   { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },

//   // Handyman
//   { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
//   { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
//   { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
//   { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
//   { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
//   { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },

//   // Locksmith
//   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 120 },
//   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 0 },
//   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 100 },
//   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 100 },

//   // Cleaning
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },

//   // Painting
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },

//   // Landscaping
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },

//   /* ================== AUTO ================== */
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 35 },

//   { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
//   { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },

//   { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },

//   // Pest
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 75 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 100 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 50 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 0 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 0 },

//   // Consulting / Estimating
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 0 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
// ];

// /* ---------- helpers ---------- */
// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// /* Build all artifacts from MATRIX */
// export function buildArtifacts(matrix = MATRIX) {
//   const questions = {};
//   const pricing = {};
//   const serviceAlias = {
//     // cross-service renames (UI → MATRIX)
//     "Handyman (general fixes)": "Handyman",
//     "Tow Truck / Roadside Assistance": "Roadside Service",
//     "Car Mechanic (general)": "Mobile Mechanic",
//     "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
//   };

//   // identity-map all services to themselves
//   for (const row of matrix) {
//     if (row.Service && !(row.Service in serviceAlias)) {
//       serviceAlias[row.Service] = row.Service;
//     }
//   }

//   // questions/pricing
//   for (const row of matrix) {
//     const { Service, Question, Option, Adjustment } = row;

//     questions[Service] ??= [];
//     pricing[Service] ??= {};

//     const qKey = slug(Question);
//     const oKey = slug(Option);

//     let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//     if (!qObj) {
//       qObj = {
//         id: questions[Service].length + 1,
//         question: Question,
//         type: "multiple",
//         options: [],
//       };
//       questions[Service].push(qObj);
//     }
//     if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//       qObj.options.push({ value: Option, label: String(Option) });
//     }
//     (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
//   }

//   // categories (simple, editable)
//   const serviceToCategory = {
//     "Plumbing": "Plumbing",
//     "Roofing": "Roofing",
//     "HVAC": "HVAC",
//     "Electrician": "Electrician",
//     "Handyman": "Handyman",
//     "Locksmith": "Locksmith",
//     "Cleaner / Housekeeper": "Cleaning",
//     "Mobile Mechanic": "Auto",
//     "Pest Control / Exterminator": "Pest Control",
//     "Painter (interior/exterior)": "Painting",
//     "Landscaper / Lawn Care": "Landscaping",
//     "Car Detailing (mobile)": "Auto",
//     "Roadside Service": "Auto",
//     "General Contractor (Consulting/Estimating)": "Consulting/Estimating",
//   };

//   // base price anchors used by FE previews (server can have its own)
//   const basePrice = {
//     "Plumbing": 0,
//     "Roofing": 0,
//     "HVAC": 0,
//     "Electrician": 0,
//     "Handyman": 0,
//     "Locksmith": 0,
//     "Cleaner / Housekeeper": 0,
//     "Roadside Service": 0,
//     "Mobile Mechanic": 0,
//     "Pest Control / Exterminator": 0,
//     "Painter (interior/exterior)": 0,
//     "Landscaper / Lawn Care": 0,
//     "General Contractor (Consulting/Estimating)": 0,
//     "Car Detailing (mobile)": 0,
//   };
//   // const basePrice = {
//   //   "Plumbing": 175,
//   //   "Roofing": 250,
//   //   "HVAC": 200,
//   //   "Electrician": 200,
//   //   "Handyman": 125,
//   //   "Locksmith": 120,
//   //   "Cleaner / Housekeeper": 125,
//   //   "Roadside Service": 100,
//   //   "Mobile Mechanic": 125,
//   //   "Pest Control / Exterminator": 150,
//   //   "Painter (interior/exterior)": 200,
//   //   "Landscaper / Lawn Care": 50,
//   //   "General Contractor (Consulting/Estimating)": 0,
//   //   "Car Detailing (mobile)": 50,
//   // };

//   return { questions, pricing, serviceAlias, serviceToCategory, basePrice };
// }

// /* Prebuilt artifacts (most callers can just import these) */
// export const ART = buildArtifacts(MATRIX);
// export const questions = ART.questions;
// export const pricing = ART.pricing;
// export const serviceAlias = ART.serviceAlias;
// export const SERVICE_TO_CATEGORY = ART.serviceToCategory;
// export const BASE_PRICE = ART.basePrice;



// export const MATRIX = [
//   /* ================== CORE TRADES ================== */
//   // Plumbing
//   { Service: "Plumbing", Question: "leak or clog", Option: "leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "leak or clog", Option: "clogged", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "kitchen sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom sink", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom toilet", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom shower", Adjustment: 50 },
//   { Service: "Plumbing", Question: "where located", Option: "bathroom bathtub", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor leak", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major leak", Adjustment: 50 },
//   { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 0 },
//   { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 50 },
//   { Service: "Plumbing", Question: "access", Option: "easy access", Adjustment: 0 },
//   { Service: "Plumbing", Question: "access", Option: "behind wall", Adjustment: 75 },
//   { Service: "Plumbing", Question: "access", Option: "behind ceiling", Adjustment: 75 },

//   // Roofing
//   { Service: "Roofing", Question: "roof type", Option: "shingles", Adjustment: 50 },
//   { Service: "Roofing", Question: "roof type", Option: "tile", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "metal", Adjustment: 150 },
//   { Service: "Roofing", Question: "roof type", Option: "flat", Adjustment: 0 },
//   { Service: "Roofing", Question: "damaged area", Option: "small patch", Adjustment: 75 },
//   { Service: "Roofing", Question: "damaged area", Option: "large section", Adjustment: 300 },
//   { Service: "Roofing", Question: "access", Option: "single story", Adjustment: 0 },
//   { Service: "Roofing", Question: "access", Option: "second story", Adjustment: 200 },
//   { Service: "Roofing", Question: "access", Option: "steep", Adjustment: 200 },

//   // HVAC
//   { Service: "HVAC", Question: "system type", Option: "central ac", Adjustment: 50 },
//   { Service: "HVAC", Question: "system type", Option: "heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not cooling", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "not heating", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "freezing", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "leaking", Adjustment: 75 },
//   { Service: "HVAC", Question: "problem", Option: "strange noise", Adjustment: 50 },
//   { Service: "HVAC", Question: "problem", Option: "strange smell", Adjustment: 50 },
//   { Service: "HVAC", Question: "urgency", Option: "comfort issue", Adjustment: 0 },
//   { Service: "HVAC", Question: "urgency", Option: "system down", Adjustment: 75 },

//   // Electrician
//   { Service: "Electrician", Question: "type of issue", Option: "outlet not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light switch not working", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "light flickering", Adjustment: 50 },
//   { Service: "Electrician", Question: "type of issue", Option: "breaker tripping", Adjustment: 75 },
//   { Service: "Electrician", Question: "scope of work", Option: "single outlet", Adjustment: 0 },
//   { Service: "Electrician", Question: "scope of work", Option: "single fixture", Adjustment: 50 },
//   { Service: "Electrician", Question: "scope of work", Option: "single switch", Adjustment: 50 },
//   { Service: "Electrician", Question: "accessibility", Option: "easy access", Adjustment: 0 },
//   { Service: "Electrician", Question: "accessibility", Option: "high ceiling", Adjustment: 75 },

//   // Handyman
//   { Service: "Handyman", Question: "project length", Option: "up to 3 hours", Adjustment: 50 },
//   { Service: "Handyman", Question: "project length", Option: "up to 5 hours", Adjustment: 75 },
//   { Service: "Handyman", Question: "project length", Option: "up to 8 hours", Adjustment: 100 },
//   { Service: "Handyman", Question: "project type", Option: "maintenance", Adjustment: 25 },
//   { Service: "Handyman", Question: "project type", Option: "installation", Adjustment: 50 },
//   { Service: "Handyman", Question: "project type", Option: "repair", Adjustment: 35 },

//   // Locksmith
//   { Service: "Locksmith", Question: "lockout", Option: "home lockout", Adjustment: 10 },
//   { Service: "Locksmith", Question: "lockout", Option: "car lockout", Adjustment: 5 },
//   { Service: "Locksmith", Question: "lock type", Option: "standard", Adjustment: 5 },
//   { Service: "Locksmith", Question: "lock type", Option: "high security", Adjustment: 10 },
//   { Service: "Locksmith", Question: "lock type", Option: "smart lock", Adjustment: 15 },

//   // Cleaning
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "basic (up to 3 hours)", Adjustment: 0 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "deep cleaning (up to 5 hours)", Adjustment: 100 },
//   { Service: "Cleaner / Housekeeper", Question: "cleaning type", Option: "move out (up to 8 hours)", Adjustment: 150 },

//   // Painting
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "interior", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "painting type", Option: "exterior", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "up to 500 sqft", Adjustment: 150 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "500 to 1000 sqft", Adjustment: 450 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1000 to 1500 sqft", Adjustment: 750 },
//   { Service: "Painter (interior/exterior)", Question: "job size", Option: "1500 to 2000 sqft", Adjustment: 1200 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 8 feet", Adjustment: 50 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 10 feet", Adjustment: 100 },
//   { Service: "Painter (interior/exterior)", Question: "ceiling height", Option: "up to 12 feet", Adjustment: 200 },

//   // Landscaping
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "mowing", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "trimming", Adjustment: 25 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "tree removal (less than 6 inch diameter)", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "work type", Option: "hedge removal", Adjustment: 200 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "small yard", Adjustment: 0 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "large property", Adjustment: 50 },
//   { Service: "Landscaper / Lawn Care", Question: "property size", Option: "extra large", Adjustment: 100 },

//   /* ================== AUTO ================== */
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior only", Adjustment: 30 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "exterior only", Adjustment: 0 },
//   { Service: "Car Detailing (mobile)", Question: "package", Option: "interior and exterior", Adjustment: 55 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "car", Adjustment: 5 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "suv", Adjustment: 25 },
//   { Service: "Car Detailing (mobile)", Question: "vehicle size", Option: "large suv", Adjustment: 35 },

//   { Service: "Roadside Service", Question: "issue", Option: "battery", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "issue", Option: "tire", Adjustment: 25 },
//   { Service: "Roadside Service", Question: "issue", Option: "tow", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "home driveway", Adjustment: 0 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "highway", Adjustment: 70 },
//   { Service: "Roadside Service", Question: "vehicle location", Option: "remote", Adjustment: 100 },

//   { Service: "Mobile Mechanic", Question: "issue", Option: "car does not start", Adjustment: 100 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "oil change", Adjustment: 40 },
//   { Service: "Mobile Mechanic", Question: "issue", Option: "brake replacement", Adjustment: 100 },

//   // Pest
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "ants", Adjustment: 5 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "roaches", Adjustment: 15 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "rodents", Adjustment: 15 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "termites", Adjustment: 10 },
//   { Service: "Pest Control / Exterminator", Question: "pest type", Option: "bedbugs", Adjustment: 10 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "mild", Adjustment: 5 },
//   { Service: "Pest Control / Exterminator", Question: "severity", Option: "severe", Adjustment: 10 },

//   // Consulting / Estimating
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 200 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
//   { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
// ];

// /* ---------- helpers ---------- */
// const slug = (s) =>
//   String(s || "")
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^a-z0-9]+/g, "_")
//     .replace(/^_+|_+$/g, "");

// /* Build all artifacts from MATRIX */
// export function buildArtifacts(matrix = MATRIX) {
//   const questions = {};
//   const pricing = {};
//   const serviceAlias = {
//     // cross-service renames (UI → MATRIX)
//     "Handyman (general fixes)": "Handyman",
//     "Tow Truck / Roadside Assistance": "Roadside Service",
//     "Car Mechanic (general)": "Mobile Mechanic",
//     "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
//   };

//   // identity-map all services to themselves
//   for (const row of matrix) {
//     if (row.Service && !(row.Service in serviceAlias)) {
//       serviceAlias[row.Service] = row.Service;
//     }
//     // case-insensitive convenience
//     if (row.Service && !(row.Service.toLowerCase() in serviceAlias)) {
//       serviceAlias[row.Service.toLowerCase()] = row.Service;
//     }
//   }

//   // questions/pricing (service-level)
//   for (const row of matrix) {
//     const { Service, Question, Option, Adjustment } = row;

//     questions[Service] ??= [];
//     pricing[Service] ??= {};

//     const qKey = slug(Question);
//     const oKey = slug(Option);

//     let qObj = questions[Service].find((q) => slug(q.question) === qKey);
//     if (!qObj) {
//       qObj = {
//         id: questions[Service].length + 1,
//         question: Question,
//         type: "multiple",
//         options: [],
//       };
//       questions[Service].push(qObj);
//     }
//     if (!qObj.options.find((o) => slug(o.value) === oKey)) {
//       qObj.options.push({ value: Option, label: String(Option) });
//     }
//     (pricing[Service][qKey] ??= {})[oKey] = Number(Adjustment) || 0;
//   }

//   // categories (simple, editable)
//   const serviceToCategory = {
//     "Plumbing": "Plumbing",
//     "Roofing": "Roofing",
//     "HVAC": "HVAC",
//     "Electrician": "Electrician",
//     "Handyman": "Handyman",
//     "Locksmith": "Locksmith",
//     "Cleaner / Housekeeper": "Cleaning",
//     "Mobile Mechanic": "Auto",
//     "Pest Control / Exterminator": "Pest Control",
//     "Painter (interior/exterior)": "Painting",
//     "Landscaper / Lawn Care": "Landscaping",
//     "Car Detailing (mobile)": "Auto",
//     "Roadside Service": "Auto",
//     "General Contractor (Consulting/Estimating)":"General Contractor (Consulting/Estimating)",
//   };

//   // Build category → services map
//   const categoryServices = {};
//   for (const { Service } of matrix) {
//     const cat = serviceToCategory[Service] || "Other";
//     categoryServices[cat] ??= new Set();
//     categoryServices[cat].add(Service);
//   }

//   // Inject a “chooser” question under each CATEGORY key
//   for (const [cat, svcs] of Object.entries(categoryServices)) {
//     questions[cat] = [
//       {
//         id: 1,
//         question: `Which ${cat.toLowerCase()} issue are you experiencing?`,
//         type: "multiple",
//         options: Array.from(svcs).map((svc) => ({
//           value: svc,
//           label: String(svc),
//         })),
//         isServiceChooser: true,
//       },
//     ];
//   }

//   // base price anchors used by FE previews (server can have its own)
//   const basePrice = {
//     "Plumbing": 0,
//     "Roofing": 0,
//     "HVAC": 0,
//     "Electrician": 0,
//     "Handyman": 0,
//     "Locksmith": 0,
//     "Cleaner / Housekeeper": 0,
//     "Roadside Service": 0,
//     "Mobile Mechanic": 0,
//     "Pest Control / Exterminator": 0,
//     "Painter (interior/exterior)": 0,
//     "Landscaper / Lawn Care": 0,
//     "General Contractor (Consulting/Estimating)": 0,
//     "Car Detailing (mobile)": 0,
//   };


// //     // const basePrice = {
// //     //   "Plumbing": 175,
// //     //   "Roofing": 250,
// //     //   "HVAC": 200,
// //     //   "Electrician": 200,
// //     //   "Handyman": 125,
// //     //   "Locksmith": 120,
// //     //   "Cleaner / Housekeeper": 125,
// //     //   "Roadside Service": 100,
// //     //   "Mobile Mechanic": 125,
// //     //   "Pest Control / Exterminator": 150,
// //     //   "Painter (interior/exterior)": 200,
// //     //   "Landscaper / Lawn Care": 50,
// //     //   "General Contractor (Consulting/Estimating)": 0,
// //     //   "Car Detailing (mobile)": 50,
// //     // };


//   return { questions, pricing, serviceAlias, serviceToCategory, basePrice };
// }

// /* Prebuilt artifacts (keeps your current imports working) */
// export const ART = buildArtifacts(MATRIX);
// export const questions = ART.questions;
// export const pricing = ART.pricing;
// export const serviceAlias = ART.serviceAlias;
// export const SERVICE_TO_CATEGORY = ART.serviceToCategory;
// export const BASE_PRICE = ART.basePrice;

// /* ---------------------- What's Covered (new, non-breaking) ----------------- */
// const COVERED_FALLBACK =
//   "Includes basic on-site diagnosis and labor for the selected service. Parts, materials, or specialty equipment may incur additional charges.";

// const COVERED_MAP = {
//   "Plumbing":
//     "Covers leaks, clogs, and fixture issues (sinks, toilets, showers). Behind-wall repairs may need additional approval.",
//   "Roofing":
//     "Covers leak patches and small repairs. Full replacements and permits not included.",
//   "HVAC":
//     "Covers AC/heating diagnosis and common fixes. New unit installs quoted separately.",
//   "Electrician":
//     "Covers outlets, switches, fixtures, and breaker issues. Panel upgrades quoted separately.",
//   "Handyman":
//     "Covers small home repairs/installs. Large remodels not included.",
//   "Locksmith":
//     "Covers standard home/auto lockouts; specialty/high-security locks may add cost.",
//   "Cleaner / Housekeeper":
//     "Covers standard, deep, or move-out cleaning tasks; specialty cleaning extra.",
//   "Painter (interior/exterior)":
//     "Covers standard interior/exterior painting; major repairs or scaffolding extra.",
//   "Landscaper / Lawn Care":
//     "Covers mowing, trimming, small removals; heavy tree work quoted separately.",
//   "Car Detailing (mobile)":
//     "Covers the selected detailing package performed at your location.",
//   "Roadside Service":
//     "Covers jump starts, tire changes, and short tows; long tows may cost extra.",
//   "Mobile Mechanic":
//     "Covers on-site diagnosis and light repairs; major repairs may need a shop.",
//   "Pest Control / Exterminator":
//     "Covers inspection and treatment for common pests; severe infestations may need follow-ups.",
//   "General Contractor (Consulting/Estimating)":
//     "Covers on-site consult/estimate time only.",
// };

// export const getCoveredDescription = (service) =>
//   COVERED_MAP[service] || COVERED_FALLBACK;

// /* -------------------- Default export (back-compat sugar) ------------------- */
// const DEFAULT = {
//   MATRIX,
//   questions,
//   pricing,
//   serviceAlias,
//   SERVICE_TO_CATEGORY,
//   BASE_PRICE,
//   getCoveredDescription,
// };
// export default DEFAULT;

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
  { Service: "Plumbing", Question: "severity", Option: "minor clog", Adjustment: 150 },
  { Service: "Plumbing", Question: "severity", Option: "major clog", Adjustment: 250 },
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

  // Locksmith (values as you provided)
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

  // Consulting / Estimating (canonical)
  { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 3 hours", Adjustment: 200 },
  { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 5 hours", Adjustment: 300 },
  { Service: "General Contractor (Consulting/Estimating)", Question: "scope", Option: "up to 8 hours", Adjustment: 500 },
];

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */
const slug = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/* ========================================================================== */
/* Aliases (UI → MATRIX canonical)                                            */
/* ========================================================================== */
// Add any UI label you show to users here to resolve to the canonical MATRIX key.
export const SERVICE_ALIAS = {
  "Handyman (general fixes)": "Handyman",
  "Tow Truck / Roadside Assistance": "Roadside Service",
  "Car Mechanic (general)": "Mobile Mechanic",
  "Consulting / Estimating": "General Contractor (Consulting/Estimating)",
  "General Contractor": "General Contractor (Consulting/Estimating)", // <-- important
};
// case-insensitive convenience
Object.keys({ ...SERVICE_ALIAS }).forEach((k) => {
  const v = SERVICE_ALIAS[k];
  SERVICE_ALIAS[k.toLowerCase()] = v;
});

export const aliasService = (s) => {
  const k = String(s || "");
  return SERVICE_ALIAS[k] || SERVICE_ALIAS[k.toLowerCase?.()] || k;
};

/* ========================================================================== */
/* Build artifacts from MATRIX                                                */
/* ========================================================================== */
export function buildArtifacts(matrix = MATRIX) {
  const questions = {};
  const pricing = {};
  const serviceAlias = { ...SERVICE_ALIAS };

  // identity-map every service in MATRIX (and lowercase)
  for (const row of matrix) {
    const svc = row.Service;
    if (!serviceAlias[svc]) serviceAlias[svc] = svc;
    if (!serviceAlias[svc.toLowerCase?.()]) serviceAlias[svc.toLowerCase()] = svc;
  }

  // categories (choose labels that you want to show in the category picker)
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
    // Show category label as “General Contractor” on the dashboard:
    "General Contractor (Consulting/Estimating)": "General Contractor",
  };

  // Build category → services
  const categoryServices = {};
  for (const { Service } of matrix) {
    const cat = serviceToCategory[Service] || "Other";
    (categoryServices[cat] ??= new Set()).add(Service);
  }

  // Inject a service chooser under each CATEGORY key
  for (const [cat, svcs] of Object.entries(categoryServices)) {
    questions[cat] = [
      {
        id: 1,
        question: `Which ${cat.toLowerCase()} issue are you experiencing?`,
        type: "multiple",
        options: Array.from(svcs).map((svc) => ({ value: svc, label: String(svc) })),
        isServiceChooser: true,
      },
    ];
  }

  // Service-level questions + pricing (slug keys)
  for (const row of matrix) {
    const { Service, Question, Option, Adjustment } = row;

    (questions[Service] ??= []);
    (pricing[Service] ??= {});

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

  // Base prices (all zero for your testing)
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

  /* ---------------- mirror alias keys (bullet-proof lookups) --------------- */
  const mirrorAliasKeys = (obj) => {
    Object.entries(serviceAlias).forEach(([alias, canonical]) => {
      if (obj[canonical] != null && obj[alias] == null) {
        obj[alias] = obj[canonical];
      }
    });
  };
  mirrorAliasKeys(questions);
  mirrorAliasKeys(pricing);
  mirrorAliasKeys(basePrice);
  mirrorAliasKeys(serviceToCategory);

  return { questions, pricing, serviceAlias, serviceToCategory, basePrice };
}

/* ========================================================================== */
/* Prebuilt artifacts (keeps your current imports working)                    */
/* ========================================================================== */
export const ART = buildArtifacts(MATRIX);
export const questions = ART.questions;
export const pricing = ART.pricing;
export const serviceAlias = ART.serviceAlias;
export const SERVICE_TO_CATEGORY = ART.serviceToCategory;
export const BASE_PRICE = ART.basePrice;

/* ========================================================================== */
/* What's Covered                                                             */
/* ========================================================================== */
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
  // Keep canonical key, alias mirrors will make “General Contractor” work:
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
  aliasService,
};
export default DEFAULT;
