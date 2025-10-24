export * from "./serviceMatrix.js";   // ✅ re-export named exports, including MATRIX

// Keep default import compatibility (some places do `import MATRIX from ...`)
import { MATRIX } from "./serviceMatrix.js";
export default MATRIX;