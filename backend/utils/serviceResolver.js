// // utils/serviceResolver.js

// // minimal built-in fallbacks so callers that pass nothing won't crash
// const CORE_FALLBACK_ALIASES = {
//     "Plumbing": "Burst or Leaking Pipes",
//     "Roofing": "Roof Leaks or Storm Damage",
//     "HVAC": "HVAC System Failure",
//     "Electrician": "Select Electrical Issues Below",
//   };
  
//   /**
//    * Normalize a service name to its canonical anchor.
//    * Anchors and aliases are optional; we default to empty objects and
//    * a small core fallback so this function NEVER throws.
//    */
//   export const resolveService = (input, anchors = {}, aliases = {}) => {
//     if (!input) return input;
  
//     // exact anchor match
//     if (anchors[input]) return input;
  
//     // alias match
//     if (aliases[input]) return aliases[input];
  
//     // built-in core fallback (lets calls with no args still work)
//     if (CORE_FALLBACK_ALIASES[input]) return CORE_FALLBACK_ALIASES[input];
  
//     // case-insensitive against provided anchors
//     const lower = String(input).toLowerCase();
//     const anchorKey = Object.keys(anchors).find(k => k.toLowerCase() === lower);
//     if (anchorKey) return anchorKey;
  
//     const aliasKey = Object.keys(aliases).find(k => k.toLowerCase() === lower);
//     if (aliasKey) return aliases[aliasKey];
  
//     // no idea—return original
//     return input;
//   };
  

import { SERVICE_ALIASES, SPV2_SERVICE_ANCHORS } from "../config/services.js";

export function resolveService(input) {
  if (!input) return input;

  // Direct anchor match
  if (SPV2_SERVICE_ANCHORS[input]) return input;

  // Alias match
  if (SERVICE_ALIASES[input]) return SERVICE_ALIASES[input];

  // Case-insensitive fallback
  const lower = input.toLowerCase();
  const foundKey = Object.keys(SPV2_SERVICE_ANCHORS).find(
    (k) => k.toLowerCase() === lower
  );

  return foundKey || input;
}
