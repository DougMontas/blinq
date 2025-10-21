// // utils/adjustments.js
// import  { MATRIX }  from "../config/matrix.js"; // or wherever you stored the array

// function* normalizeAnswers(details) {
//   // supports either { "Question": "Option", ... } OR [{question, option}, ...]
//   if (Array.isArray(details)) {
//     for (const a of details) {
//       yield { q: String(a.question || "").toLowerCase(), o: String(a.option || "").toLowerCase() };
//     }
//   } else if (details && typeof details === "object") {
//     for (const [question, option] of Object.entries(details)) {
//       yield { q: String(question).toLowerCase(), o: String(option).toLowerCase() };
//     }
//   }
// }

// /** Return the sum of all matching adjustments for the given service + answers */
// export function getAdjustments(service, details) {
//   if (!service) return 0;
//   const svc = String(service).toLowerCase();

//   let total = 0;
//   for (const { q, o } of normalizeAnswers(details)) {
//     // find all MATRIX rows that match this service & (question, option)
//     for (const row of MATRIX) {
//       if (!row?.Service || row.Adjustment == null) continue;

//       const svcMatch = String(row.Service).toLowerCase() === svc;
//       if (!svcMatch) continue;

//       const rowQ = String(row.Question || "").toLowerCase();
//       const rowO = String(row.Option || "").toLowerCase();

//       // tolerant contains-match for both question & option
//       if (q.includes(rowQ) && o.includes(rowO)) {
//         total += Number(row.Adjustment) || 0;
//       }
//     }
//   }
//   return total;
// }


// backend/utils/adjustments.js current working
// import { MATRIX } from "../config/matrix.js"; // <-- ensure this path points to your backend copy
// import { normalizeQuestion, normalizeAnswer, normalizeDetails } from "./normalizer.js";
// import { resolveService } from "../utils/serviceResolver.js";

// /**
//  * Canonicalize MATRIX rows up front using the SAME normalization rules
//  * you use at runtime. This keeps lookups consistent and robust.
//  */
// const CANON_MATRIX = MATRIX.map((row) => {
//   const svc = resolveService(row.Service); // Title-case anchor (no lowercasing)
//   const q = normalizeQuestion(svc, row.Question);                   // canonical lowercase key
//   const o = normalizeAnswer(svc, q, row.Option);                    // canonical lowercase value
//   return {
//     Service: svc,
//     Question: q,
//     Option: o,
//     Adjustment: Number(row.Adjustment) || 0,
//   };
// });

// /**
//  * Compute total adjustment dollars from MATRIX for a given service + details.
//  * - details: raw object from client (labels can vary); we normalize it first.
//  */
// export function getAdjustments(service, details = {}) {
//   const svc = resolveService(service);               // Title-case anchor
//   const canonDetails = normalizeDetails(svc, details); // { [qKeyLower]: optLower }

//   let total = 0;
//   for (const [q, a] of Object.entries(canonDetails)) {
//     for (const row of CANON_MATRIX) {
//       if (row.Service !== svc) continue;
//       if (row.Question !== q) continue;
//       if (row.Option !== a) continue;
//       total += row.Adjustment;
//     }
//   }
//   return total;
// }


//new testing

// backend/utils/adjustments.js
import { MATRIX } from "../config/matrix.js"; // same source you use server-side
import {
  normalizeQuestion,
  normalizeAnswer,
  normalizeDetails,
} from "./normalizer.js";
import { resolveService } from "../utils/serviceResolver.js";

/* -------------------------- small helpers -------------------------- */
const slug = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const key = (svc, q, o) => `${svc}::${q}::${o}`;

/* -------------------------------------------------------------------
   Build a canonical (and slug-fallback) lookup table ONCE from MATRIX
   using the SAME normalization rules you use at runtime.
-------------------------------------------------------------------- */
const BUILD = (() => {
  const byKey = new Map(); // exact (canonical) matches
  const bySlug = new Map(); // slug fallback

  for (const row of MATRIX) {
    const svc = resolveService(row.Service); // keep title-cased anchor
    const qCanon = normalizeQuestion(svc, row.Question); // e.g., "job.length"
    const oCanon = normalizeAnswer(svc, qCanon, row.Option); // e.g., "up to 5 hours"
    const adj = Number(row.Adjustment) || 0;

    // exact canonical key
    byKey.set(key(svc, qCanon, oCanon), adj);

    // slug fallback key (guards against tiny drift)
    bySlug.set(key(svc, slug(qCanon), slug(oCanon)), adj);
  }

  return { byKey, bySlug };
})();

/* -------------------------------------------------------------------
   Compute total adjustment for a given service + raw details.
   - details are normalized first (so your regex alias maps apply)
   - supports arrays (multi-select)
   - ignores "other" / blank values safely
-------------------------------------------------------------------- */
export function getAdjustments(service, details = {}) {
  const svc = resolveService(service);
  const canonDetails = normalizeDetails(svc, details); // { [canonQ]: canonOpt }

  let total = 0;

  for (const [qRaw, valRaw] of Object.entries(canonDetails)) {
    // Canonical question key in your scheme is already lowercase
    const q = String(qRaw || "").toLowerCase();

    const vals = Array.isArray(valRaw) ? valRaw : [valRaw];
    for (const v0 of vals) {
      const v = String(v0 || "").toLowerCase().trim();
      if (!v || v === "other") continue;

      // 1) exact canonical match
      const k1 = key(svc, q, v);
      if (BUILD.byKey.has(k1)) {
        total += BUILD.byKey.get(k1);
        continue;
      }

      // 2) slug fallback (extra safety)
      const k2 = key(svc, slug(q), slug(v));
      if (BUILD.bySlug.has(k2)) {
        total += BUILD.bySlug.get(k2);
        continue;
      }

      // Optional dev log for misses
      // if (process.env.NODE_ENV !== "production") {
      //   console.debug("[adjustments miss]", { svc, q, v });
      // }
    }
  }

  return total;
}
