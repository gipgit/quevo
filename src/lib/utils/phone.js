// src/lib/utils/phone.js

export function isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return false;
    }
    // Simple regex for numbers, spaces, +, -, ()
    return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(phoneNumber.trim());
}
