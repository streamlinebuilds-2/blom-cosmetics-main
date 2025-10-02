/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
