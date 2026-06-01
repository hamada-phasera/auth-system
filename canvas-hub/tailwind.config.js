/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#1a1a2e',
          grid: '#2a2a4a',
        },
        sticky: {
          yellow: '#fef08a',
          pink: '#fda4af',
          blue: '#93c5fd',
          green: '#86efac',
          purple: '#c4b5fd',
          orange: '#fed7aa',
        },
      },
    },
  },
  plugins: [],
};
