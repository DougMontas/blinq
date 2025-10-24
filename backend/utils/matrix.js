// backend/utils/matrix.js
// Legacy barrel so existing imports keep working.
// Canonical source of truth is backend/utils/serviceMatrix.js

export * from "./serviceMatrix.js";

// If any callers were using a default import, keep that working too:
import { MATRIX } from "./serviceMatrix.js";
export default MATRIX;