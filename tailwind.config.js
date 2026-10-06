/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFDFB',
          100: '#FBFBF9', // Official site background
          200: '#F5F4EF', // Subtle card / secondary bg
          300: '#ECEAE2', // Border subtle
          400: '#DCD9CE',
          500: '#BEB9A8',
        },
        ink: {
          900: '#111111', // Deep black main text
          800: '#1C1C1E',
          700: '#2C2C2C', // Charcoal
          600: '#4A4A4A',
          500: '#6E6E6E',
          400: '#929292',
          300: '#BDBDBD',
          200: '#E0E0E0',
          100: '#EEEEEE',
        },
        lacquer: {
          DEFAULT: '#6B2727', // Deep understated red-brown
          dark: '#521D1D',
          light: '#883333',
        },
        bronze: {
          DEFAULT: '#9E8160', // Refined aged bronze
          dark: '#7D6549',
          light: '#BA9C7A',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif KR"', 'Batang', 'serif'],
        sans: ['"Pretendard"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.2em',
        ultra: '.25em',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        none: '0',
        xs: '1px',
        sm: '2px',
      },
    },
  },
  plugins: [],
};
