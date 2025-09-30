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


// backend/utils/adjustments.js
import { MATRIX } from "../config/matrix.js"; // <-- ensure this path points to your backend copy
import { normalizeQuestion, normalizeAnswer, normalizeDetails } from "./normalizer.js";
import { resolveService } from "../utils/serviceResolver.js";

/**
 * Canonicalize MATRIX rows up front using the SAME normalization rules
 * you use at runtime. This keeps lookups consistent and robust.
 */
const CANON_MATRIX = MATRIX.map((row) => {
  const svc = resolveService(row.Service); // Title-case anchor (no lowercasing)
  const q = normalizeQuestion(svc, row.Question);                   // canonical lowercase key
  const o = normalizeAnswer(svc, q, row.Option);                    // canonical lowercase value
  return {
    Service: svc,
    Question: q,
    Option: o,
    Adjustment: Number(row.Adjustment) || 0,
  };
});

/**
 * Compute total adjustment dollars from MATRIX for a given service + details.
 * - details: raw object from client (labels can vary); we normalize it first.
 */
export function getAdjustments(service, details = {}) {
  const svc = resolveService(service);               // Title-case anchor
  const canonDetails = normalizeDetails(svc, details); // { [qKeyLower]: optLower }

  let total = 0;
  for (const [q, a] of Object.entries(canonDetails)) {
    for (const row of CANON_MATRIX) {
      if (row.Service !== svc) continue;
      if (row.Question !== q) continue;
      if (row.Option !== a) continue;
      total += row.Adjustment;
    }
  }
  return total;
}
