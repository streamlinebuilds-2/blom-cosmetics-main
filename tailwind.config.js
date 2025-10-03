/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // Completely disable dark mode
  theme: {
    extend: {
      colors: {
        'primary-blue': '#CEE5FF',
        'primary-pink': '#FF74A4',
      },
    },
  },
  plugins: [],
};
