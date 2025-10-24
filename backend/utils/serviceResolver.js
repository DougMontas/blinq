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
// import { SERVICE_ALIASES, SPV2_SERVICE_ANCHORS } from "../config/services.js";

// /** Normalize strings for matching: lowercase, collapse spaces, normalize slashes */
// function norm(s = "") {
//   return String(s)
//     .toLowerCase()
//     .trim()
//     .replace(/\s*\/\s*/g, " / ")  // ensure "a/b" === "a / b"
//     .replace(/\s+/g, " ");        // collapse runs of spaces
// }

// /** Build a canonical map once at module load */
// const CANONICAL_BY_KEY = (() => {
//   const map = new Map();

//   // Anchors map to themselves
//   for (const key of Object.keys(SPV2_SERVICE_ANCHORS)) {
//     map.set(norm(key), key);
//   }

//   // Aliases map to their target anchor
//   for (const [alias, target] of Object.entries(SERVICE_ALIASES)) {
//     const canonical = SPV2_SERVICE_ANCHORS[target] ? target : null;
//     if (canonical) map.set(norm(alias), canonical);
//     // (dev guard) if target is missing in anchors, you can log once here
//     // else console.warn("Alias points to missing anchor:", { alias, target });
//   }

//   return map;
// })();

// /**
//  * Resolve any incoming label (category/service/alias/near-match)
//  * to a canonical anchor key used in pricing maps.
//  * If unknown, returns the original input (so callers can decide to 400).
//  */
// export function resolveService(input) {
//   if (input == null) return input;
//   const hit = CANONICAL_BY_KEY.get(norm(input));
//   return hit || input;
// }

// /** Optional helper: returns null when not resolvable to a known anchor */
// export function resolveServiceOrNull(input) {
//   const hit = resolveService(input);
//   return SPV2_SERVICE_ANCHORS[hit] ? hit : null;
// }


/* ============================================================================
 * resolveService — turns whatever the UI sends into a canonical service
 * used everywhere (anchors, MATRIX-driven normalizer/adjustments, rails).
 * ========================================================================== */

import { SPV2_SERVICE_ANCHORS, SERVICE_ALIASES } from "../config/services.js";

/** Lower-pressure helper: normalize strings safely */
const s = (x) => String(x || "").trim();

/** Try alias map case-sensitively, then case-insensitively */
function aliasLookup(name) {
  if (!name) return "";
  if (SERVICE_ALIASES[name]) return SERVICE_ALIASES[name];
  // case-insensitive fallback
  const entry = Object.keys(SERVICE_ALIASES).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  return entry ? SERVICE_ALIASES[entry] : name;
}

/**
 * Resolve a service or category name, optionally using answer payload hints.
 * Rules:
 *  1) Alias name → canonical.
 *  2) If the result is an anchor key, return it (it's a priced/railed service).
 *  3) If not an anchor, but answers contain a concrete service (possibly aliased), use that.
 *  4) Otherwise return the aliased input as-is (caller may further map it).
 */
export function resolveService(serviceOrCategory, answers = {}) {
  const raw = s(serviceOrCategory);
  const a1 = aliasLookup(raw);

  // 1) direct anchor hit
  if (a1 in SPV2_SERVICE_ANCHORS) return a1;

  // 2) pull a concrete service out of answers when user picked inside a category
  const pick =
    answers?.service ??
    answers?.selectedService ??
    answers?.scope ?? // used by Consulting/Estimating flow
    null;

  if (pick) {
    const a2 = aliasLookup(s(pick));
    if (a2 in SPV2_SERVICE_ANCHORS) return a2;
  }

  // 3) fall back to the aliased value (even if not an anchor; caller can further map)
  return a1;
}

export default { resolveService };
