// import { Config } from 'tailwindcss' // Type import removed for JS compatibility

const config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'laundry-blue': {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
        },
        'laundry-teal': {
          '50': '#f0fdfa',
          '100': '#ccfbf1',
          '200': '#99f6e4',
          '300': '#5eead4',
          '400': '#2dd4bf',
          '500': '#14b8a6',
          '600': '#0d9488',
          '700': '#0f766e',
          '800': '#115e59',
          '900': '#134e4a',
        },
      },
      animation: {
        'toast-in': 'toast-in-right 0.5s ease-out forwards',
        'slide-down': 'slide-down 0.25s ease-out forwards',
        'fade-in': 'fade-in 0.15s ease-out forwards',
      },
      keyframes: {
        'toast-in-right': {
          from: {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slide-down': {
          from: {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(-4px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-100', 'text-blue-800', 'border-blue-300',
    'bg-green-100', 'text-emerald-800', 'border-emerald-300',
    'bg-violet-100', 'text-violet-800', 'border-violet-300',
    'bg-orange-100', 'text-orange-800', 'border-orange-300',
    'bg-cyan-100', 'text-cyan-800', 'border-cyan-300',
    'bg-pink-100', 'text-pink-800', 'border-pink-300',
    'bg-yellow-100', 'text-yellow-800', 'border-yellow-300',
    'bg-slate-200', 'text-slate-800', 'border-slate-400',
  ],
}
export default config