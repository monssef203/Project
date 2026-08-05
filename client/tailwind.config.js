/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf5',
          100: '#fef9e7',
          200: '#fcf0c3',
          300: '#fae59b',
          400: '#f5d163',
          500: '#f0be3b',
          600: '#d4a028',
          700: '#b07d1f',
          800: '#8f6320',
          900: '#76511d',
        },
        navy: {
          50: '#f0f3f9',
          100: '#dce3f1',
          200: '#bfc9e5',
          300: '#96a7d4',
          400: '#6d82bf',
          500: '#4f65a8',
          600: '#3e508e',
          700: '#354274',
          800: '#2f3961',
          900: '#1a2342',
          950: '#0f1529',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
};
