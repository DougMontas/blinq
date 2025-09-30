/**
 * Normalize a service name to its canonical anchor
 * @param {string} input - raw service from frontend
 * @param {object} anchors - map of valid anchor services
 * @param {object} aliases - map of alias → anchor
 * @returns {string} canonical service name
 */
export const resolveService = (input, anchors, aliases) => {
    if (!input) return input;
  
    // Exact match
    if (anchors[input]) return input;
  
    // Alias match
    if (aliases[input]) return aliases[input];
  
    // Case-insensitive fallback
    const lower = input.toLowerCase();
    const foundKey = Object.keys(anchors).find(
      (k) => k.toLowerCase() === lower
    );
    return foundKey || input;
  };
  