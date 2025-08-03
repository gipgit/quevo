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

export function adjustColor(hex, lightPercentage, darkPercentage = 0.1, almostWhiteThreshold = 0.5) {
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
        // For light colors, create a much more perceivable difference
        let brighteningFactor = lightPercentage * 3.0; // Much more perceivable for light colors
        
        // For super bright colors, make the difference even more perceivable
        if (luminance > 0.95) {
            brighteningFactor = lightPercentage * 4.0; // Super perceivable for very bright colors
        } else if (luminance > 0.80) {
            brighteningFactor = lightPercentage * 3.5; // Very perceivable for bright colors
        }
        
        newR = Math.min(255, r + Math.round((255 - r) * brighteningFactor));
        newG = Math.min(255, g + Math.round((255 - g) * brighteningFactor));
        newB = Math.min(255, b + Math.round((255 - b) * brighteningFactor));
    } else {
        // For dark colors, make them brighter but slightly more perceivable
        const lighteningFactor = darkPercentage * 0.6; // Slightly more perceivable for dark colors
        newR = Math.min(255, r + Math.round((255 - r) * lighteningFactor));
        newG = Math.min(255, g + Math.round((255 - g) * lighteningFactor));
        newB = Math.min(255, b + Math.round((255 - b) * lighteningFactor));
    }
    
    return "#" +
           ((1 << 24) + (newR << 16) + (newG << 8) + newB)
           .toString(16).slice(1).toUpperCase();
}

// Test function to debug the issue
export function testAdjustColor() {
    const testColor = '#E0E0E0';
    const result1 = adjustColor(testColor, 0.15, 0.055, 0.99);
    const result2 = adjustColor(testColor, 0.4, 0.015, 0.99);
    
    console.log('Test color:', testColor);
    console.log('Result with 0.15:', result1);
    console.log('Result with 0.4:', result2);
    
    return { original: testColor, result1, result2 };
}
