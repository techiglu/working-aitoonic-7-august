/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: {
          blue: '#0B1437',
          purple: '#1B0B37',
          gold: '#C6A355',
          dark: {
            DEFAULT: '#080B1A',
            card: '#0F1428',
            lighter: '#1A2138'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};