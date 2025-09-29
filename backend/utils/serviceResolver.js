export const resolveService = (input, anchors = {}, aliases = {}) => {
    if (!input) return input;
  
    // Direct match
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
  