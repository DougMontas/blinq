// backend/utils/matrix.js
// Legacy barrel so existing imports keep working.
// Canonical source of truth is backend/utils/serviceMatrix.js

// backend/utils/matrix.js
// export * from "../../frontend/utils/serviceMatrix.js";
// import { MATRIX } from "../../frontend/utils/serviceMatrix.js";
// export default MATRIX;

export * from "./matrix.js";

// Keep default import compatibility (some places do `import MATRIX from ...`)
import { MATRIX } from "./matrix.js";
export default MATRIX;
