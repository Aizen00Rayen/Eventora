/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C47FF',
          light: '#8B6DFF',
          dark: '#4F2FE0',
        },
        accent: '#00D4AA',
        danger: '#FF5757',
        bg: {
          light: '#F7F6FF',
          dark: '#0F0E17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(108,71,255,0.08)',
        'card-hover': '0 8px 32px rgba(108,71,255,0.16)',
      },
    },
  },
  plugins: [],
};
