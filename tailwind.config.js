/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // GCalendar color palette - Professional blue and cream
        primary: {
          50: '#F0F8FF',
          100: '#E0F1FF',
          200: '#C1E3FF',
          300: '#91D0FF',
          400: '#5CB8FF',
          500: '#339AFF',
          600: '#1F7FCC',
          700: '#1A6BA8',
          800: '#254D70', // Main primary color
          900: '#1E3F5C',
          950: '#142B3F'
        },
        cream: {
          50: '#FEFEFE',
          100: '#FDFCFA',
          200: '#FAF7F2',
          300: '#F7F2EA',
          400: '#F4EDE2',
          500: '#EFE4D2', // Main cream color
          600: '#E8D7C1',
          700: '#E1CAB0',
          800: '#D4B896',
          900: '#C7A67C',
          950: '#B8936A'
        },
        // Keep some coffee elements as accent colors
        accent: {
          50: '#fdf9f5',
          100: '#f9f0e8',
          200: '#f2ddc4',
          300: '#e8c19c',
          400: '#db9c6d',
          500: '#cf7c4b',
          600: '#c36540',
          700: '#a24f36',
          800: '#834032',
          900: '#6b352c',
          950: '#391a15'
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Open Sans"',
          '"Helvetica Neue"',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
}
