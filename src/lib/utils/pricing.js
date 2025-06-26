// src/lib/utils/pricing.js


export function formatPrice(price, currency = 'EUR', locale = 'it-IT') {
    if (price === null || price === undefined) {
        return '';
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
        return String(price); 
    }
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericPrice);
}