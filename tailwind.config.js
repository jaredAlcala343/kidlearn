/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ['Nunito', 'sans-serif'],
      },
      colors: {
        cream: '#FAF7F0',
        sage: '#8BAF7C',
        'sage-light': '#B8D4AC',
        'sage-dark': '#5E8A4E',
        sky: '#7EB8D4',
        'sky-light': '#B3D9EC',
        peach: '#E8A87C',
        'peach-light': '#F5C9A8',
        lavender: '#A89BC8',
        'lavender-light': '#C9C0E0',
        sand: '#D4B896',
        'sand-light': '#EDD9C4',
        charcoal: '#3D3D3D',
        'charcoal-light': '#6B6B6B',
      },
      animation: {
        'bounce-soft': 'bounce-soft 0.6s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
