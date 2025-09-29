// utils/serviceResolver.js

/**
 * Normalize a service name to its canonical anchor
 * Works with both aliases and direct service anchors
 */
export const resolveService = (input, anchors = {}, aliases = {}) => {
    if (!input) return input;
  
    // Direct anchor match
    if (anchors[input]) return input;
  
    // Alias mapping
    if (aliases[input]) return aliases[input];
  
    // Case-insensitive fallback
    const lower = input.toLowerCase();
    const foundKey = Object.keys(anchors).find(
      (k) => k.toLowerCase() === lower
    );
    return foundKey || input;
  };
  