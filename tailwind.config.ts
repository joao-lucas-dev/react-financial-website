import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FBF5EC',
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
  plugins: [],
}
export default config
