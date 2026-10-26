/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FFFDF0',
          yellow: '#FFE600',
          pink: '#FF4365',
          cyan: '#00F0FF',
          purple: '#9B5DE5',
          green: '#00F59B',
          orange: '#FF8800',
          dark: '#121212',
        },
      },
      boxShadow: {
        neo: '4px 4px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-press': '1px 1px 0px 0px #000000',
      },
      borderWidth: {
        3: '3px',
        4: '4px',
        5: '5px',
      },
      fontFamily: {
        display: ['Impact', 'Arial Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
};