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

export function adjustColor(hex, percentage, darkenFactor , almostWhiteThreshold) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
        return hex;
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    let newR = r;
    let newG = g;
    let newB = b;

    if (luminance > almostWhiteThreshold) {
        newR = Math.max(0, r - Math.round(r * darkenFactor));
        newG = Math.max(0, g - Math.round(g * darkenFactor));
        newB = Math.max(0, b - Math.round(b * darkenFactor));
    } else {
        const lighteningFactor = luminance < 0.5 ? percentage * (1 - luminance) : percentage * luminance;
        newR = Math.min(255, r + Math.round((255 - r) * lighteningFactor));
        newG = Math.min(255, g + Math.round((255 - g) * lighteningFactor));
        newB = Math.min(255, b + Math.round((255 - b) * lighteningFactor));
    }
    
    return "#" +
           ((1 << 24) + (newR << 16) + (newG << 8) + newB)
           .toString(16).slice(1).toUpperCase();
}
