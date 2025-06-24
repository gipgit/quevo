// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // For Next.js App Router pages, layouts, and components within the 'src/app' directory
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // For components located directly in the root 'components' folder (like BusinessProfileHeader.jsx)
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // For Next.js Pages Router (if you are actively using it for some routes)
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    // Add any other specific directories if you're using Tailwind classes elsewhere in your project
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};