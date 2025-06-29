// src/lib/utils/colors.js
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null; // Or return an empty array [] or default [0,0,0]

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  // CORRECTED: Return an array of numbers
  return result ?
    [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] :
    null; // Return null if parsing fails, or an appropriate fallback like [0, 0, 0]
}