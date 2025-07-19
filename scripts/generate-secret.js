// Run this script to generate a secure NextAuth secret
const crypto = require("crypto")

// Generate a 32-byte random string and convert to base64
const secret = crypto.randomBytes(32).toString("base64")

console.log("Generated NextAuth Secret:")
console.log(secret)
console.log("\nAdd this to your .env.local file:")
console.log(`NEXTAUTH_SECRET=${secret}`)
