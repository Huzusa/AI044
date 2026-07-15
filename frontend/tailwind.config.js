/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#ebe8e0',
          200: '#d6d0c1',
          300: '#b9b09b',
          400: '#9a8e75',
          500: '#7e725a',
          600: '#645a47',
          700: '#50483a',
          800: '#433d33',
          900: '#3a352d',
        },
        accent: {
          50: '#fdf4f3',
          100: '#fce8e6',
          200: '#f9d4cf',
          300: '#f4b5ac',
          400: '#ec8b7e',
          500: '#e06556',
          600: '#cb4939',
          700: '#aa3b2d',
          800: '#8c3428',
          900: '#753128',
        },
      },
      fontFamily: {
        sans: ['"Noto Serif SC"', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
