import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xl-lg': '1650px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      },
      colors: {
        background: '#FBF5EC',
        'black-bg': '#181a1b',
        'softBlack-bg': '#131516',
        orangeDark: '#36250b',
        primary: '#FF7E1D',
        softOrange: '#FFA441',
        gray: '#393938',
        softGray: '#d9d9d9',
        lightGray: '#F5F7FA',
        mdGray: '#B1B1B1',
        lineGray: '#D8DDE2',
        grayWhite: '#f7f7f7',
      },
      width: {
        736: '736px',
        475: '475px',
        container: '1120px',
      },
      minWidth: {
        640: '640px',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
  darkMode: 'class',
}
export default config
