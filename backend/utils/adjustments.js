// utils/adjustments.js
import  { MATRIX }  from "../config/matrix.js"; // or wherever you stored the array

function* normalizeAnswers(details) {
  // supports either { "Question": "Option", ... } OR [{question, option}, ...]
  if (Array.isArray(details)) {
    for (const a of details) {
      yield { q: String(a.question || "").toLowerCase(), o: String(a.option || "").toLowerCase() };
    }
  } else if (details && typeof details === "object") {
    for (const [question, option] of Object.entries(details)) {
      yield { q: String(question).toLowerCase(), o: String(option).toLowerCase() };
    }
  }
}

/** Return the sum of all matching adjustments for the given service + answers */
export function getAdjustments(service, details) {
  if (!service) return 0;
  const svc = String(service).toLowerCase();

  let total = 0;
  for (const { q, o } of normalizeAnswers(details)) {
    // find all MATRIX rows that match this service & (question, option)
    for (const row of MATRIX) {
      if (!row?.Service || row.Adjustment == null) continue;

      const svcMatch = String(row.Service).toLowerCase() === svc;
      if (!svcMatch) continue;

      const rowQ = String(row.Question || "").toLowerCase();
      const rowO = String(row.Option || "").toLowerCase();

      // tolerant contains-match for both question & option
      if (q.includes(rowQ) && o.includes(rowO)) {
        total += Number(row.Adjustment) || 0;
      }
    }
  }
  return total;
}
