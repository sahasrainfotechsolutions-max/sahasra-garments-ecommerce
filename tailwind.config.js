/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--brand-50, #fdf8f6)",
          100: "var(--brand-100, #f2e8e5)",
          200: "var(--brand-200, #eaddd7)",
          300: "var(--brand-300, #e0cec7)",
          400: "var(--brand-400, #d2bab0)",
          500: "var(--brand-500, #b45309)",
          600: "var(--brand-600, #92400e)",
          700: "var(--brand-700, #78350f)",
          800: "var(--brand-800, #451a03)",
          900: "var(--brand-900, #290f02)",
          DEFAULT: "var(--brand-primary, #b45309)",
        },
        accent: {
          DEFAULT: "var(--brand-accent, #0f172a)",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
