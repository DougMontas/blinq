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
  
// utils/serviceResolver.js
import { SERVICE_ALIASES, SPV2_SERVICE_ANCHORS } from "../config/services.js";

/** Normalize strings for matching: lowercase, collapse spaces, normalize slashes */
function norm(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/\s*\/\s*/g, " / ")  // ensure "a/b" === "a / b"
    .replace(/\s+/g, " ");        // collapse runs of spaces
}

/** Build a canonical map once at module load */
const CANONICAL_BY_KEY = (() => {
  const map = new Map();

  // Anchors map to themselves
  for (const key of Object.keys(SPV2_SERVICE_ANCHORS)) {
    map.set(norm(key), key);
  }

  // Aliases map to their target anchor
  for (const [alias, target] of Object.entries(SERVICE_ALIASES)) {
    const canonical = SPV2_SERVICE_ANCHORS[target] ? target : null;
    if (canonical) map.set(norm(alias), canonical);
    // (dev guard) if target is missing in anchors, you can log once here
    // else console.warn("Alias points to missing anchor:", { alias, target });
  }

  return map;
})();

/**
 * Resolve any incoming label (category/service/alias/near-match)
 * to a canonical anchor key used in pricing maps.
 * If unknown, returns the original input (so callers can decide to 400).
 */
export function resolveService(input) {
  if (input == null) return input;
  const hit = CANONICAL_BY_KEY.get(norm(input));
  return hit || input;
}

/** Optional helper: returns null when not resolvable to a known anchor */
export function resolveServiceOrNull(input) {
  const hit = resolveService(input);
  return SPV2_SERVICE_ANCHORS[hit] ? hit : null;
}
