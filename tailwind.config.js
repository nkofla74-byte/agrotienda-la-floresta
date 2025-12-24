/** @type {import('tailwindcss').Config} */
export default {
  // Esta línea es la magia que te falta:
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aquí re-definimos tus colores personalizados para que Tailwind los entienda
        'agro-primary': '#166534', // green-800
        'agro-dark': '#064e3b',    // green-900
        'agro-light': '#dcfce7',   // green-100
        'agro-accent': '#f59e0b',  // amber-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scroll': 'scroll 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}