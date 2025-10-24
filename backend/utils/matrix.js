// backend/utils/matrix.js
// Re-export everything from the backend copy of serviceMatrix.js
export * from "./serviceMatrix.js";

// Keep default import compatibility
import matrixModule from "./serviceMatrix.js";
export default matrixModule;
