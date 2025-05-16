/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Ensure this is 'class'
  theme: {
    extend: { // START extend

      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'primary': {
          'Bg-LightMode': '#E2EDEF',
          'Bg-LightMode2': '#E8FBFF',
          'Bg-DarkMode': '#313636',
          'Bg-DarkMode2': '#425255',

          'Text-LightMode': '#1B4A53',
          'Text-DarkMode': '#c1f7fd',
          'Text-DarkMode1': '#1B4A53',

          'Outline-DarkMode': '#585f5f', 


          'Button-DarkMode':' #1B4A53',
          'Button-DarkMode_Hover':' #437c88',
          'Button1-DarkMode':' #406971',

          'Button1-LightMode': '#1B4A53',
          'Button1-LightMode_Hover': '#437c88',
          'Button2-LightMode': '#E2EDEF',
          'Button2-LightMode_Hover': '#c1f7fd',
        },
        'nav': {
          'icon-light': '#0A2420',
          'icon-dark': '#c1f7fd',
          'text-light-default': '#333333',
          'text-dark-default': '#FFFFFF',
          'active-bg-light': 'rgba(193, 247, 253, 0.7)',
          'active-bg-dark': 'rgba(205, 250, 255, 0.2)',
          'hover-bg-light': 'rgb(217, 249, 252)',
          'hover-bg-dark': 'rgb(101, 119, 120)',
          'wrapper-bg-light': 'rgba(205, 250, 255, 0.3)',
          'wrapper-bg-dark': 'rgba(47, 58, 59, 0.5)',
          'active-text-light': '#0A2420',
          'active-text-dark': '#35b6a2',
        },
        'buttons': {
          'button-bg-light': '#E8FBFF',
          'button-bg-dark': '#374151',
          'button-hover-bg-light': '#437c88',
          'button-hover-bg-dark': '#4b5563',
        },
        'text': {
          'input-bg-light': '#d9f9fc',
          'input-bg-dark': '#1f2937',
        },
      }, // END colors

      // Keyframes section (Slightly larger sizes: 8rem, 11rem, 14rem)
      keyframes: {
         // POSITIONS - Original overlapping layout
         // P1: Top, Smallest (8rem)
         // P2: Mid-Left, Medium (11rem)
         // P3: Mid-Right, Largest (14rem)

        moveCycle1: { // Starts P1
          '0%, 100%': { transform: 'translate(30%, 0%)', width: '8rem', height: '8rem', zIndex: 10, opacity: 0.8 }, /* P1 */
          '33%':      { transform: 'translate(-5%, 35%)', width: '11rem', height: '11rem', zIndex: 20, opacity: 1 },   /* P2 */
          '66%':      { transform: 'translate(55%, 25%)', width: '14rem', height: '14rem', zIndex: 30, opacity: 1 },   /* P3 */
        },
        moveCycle2: { // Starts P2
          '0%, 100%': { transform: 'translate(-5%, 35%)', width: '11rem', height: '11rem', zIndex: 20, opacity: 1 },  /* P2 */
          '33%':      { transform: 'translate(55%, 25%)', width: '14rem', height: '14rem', zIndex: 30, opacity: 1 }, /* P3 */
          '66%':      { transform: 'translate(30%, 0%)', width: '8rem', height: '8rem', zIndex: 10, opacity: 0.8 },   /* P1 */
        },
        moveCycle3: { // Starts P3
          '0%, 100%': { transform: 'translate(55%, 25%)', width: '14rem', height: '14rem', zIndex: 30, opacity: 1 }, /* P3 */
          '33%':      { transform: 'translate(30%, 0%)', width: '8rem', height: '8rem', zIndex: 10, opacity: 0.8 },    /* P1 */
          '66%':      { transform: 'translate(-5%, 35%)', width: '11rem', height: '11rem', zIndex: 20, opacity: 1 },  /* P2 */
        },

      }, // END keyframes

      // Animation section (No changes here)
      animation: {
        'move-1': 'moveCycle1 18s ease-in-out infinite',
        'move-2': 'moveCycle2 18s ease-in-out infinite',
        'move-3': 'moveCycle3 18s ease-in-out infinite',
      }, // END animation

      // Height section (Assuming your existing height config is here)
      height: {
        '18': '4.5rem',
      } // END height

    }, // END extend
  }, // END theme
  plugins: [
    // require('@tailwindcss/forms'), // Useful for form styling, including peer states
  ],
}
