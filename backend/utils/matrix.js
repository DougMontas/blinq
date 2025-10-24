// backend/utils/matrix.js
// Barrel that re-exports everything from serviceMatrix.js and also exposes
// a default that is safe even if serviceMatrix.js has no default export.

// Re-export all named exports (e.g. MATRIX, questions, pricing, etc.)
export * from "./serviceMatrix.js";

// Provide a safe default export: the namespace object.
// This avoids runtime errors if serviceMatrix.js has no default export.
import * as MatrixModule from "./serviceMatrix.js";
export default MatrixModule;