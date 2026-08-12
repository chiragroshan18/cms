/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#e6e8ec',
          surface: '#e6e8ec',
          flat: '#e6e8ec',
          dark: '#1e2229',
          light: '#ffffff',
          text: '#2d3748',
          muted: '#718096',
          primary: '#4f46e5',
          'primary-hover': '#4338ca',
          accent: '#06b6d4',
          danger: '#ef4444',
          success: '#10b981',
          warning: '#f59e0b',
        }
      },
      boxShadow: {
        'neu-flat': '6px 6px 12px #c3c5c8, -6px -6px 12px #ffffff',
        'neu-flat-sm': '3px 3px 6px #c3c5c8, -3px -3px 6px #ffffff',
        'neu-pressed': 'inset 4px 4px 8px #c3c5c8, inset -4px -4px 8px #ffffff',
        'neu-pressed-sm': 'inset 2px 2px 4px #c3c5c8, inset -2px -2px 4px #ffffff',
        'neu-hover': '8px 8px 16px #bcbece, -8px -8px 16px #ffffff',
        'neu-glow': '0 0 15px rgba(79, 70, 229, 0.4)',
      },
      borderRadius: {
        'neu': '1rem',
        'neu-lg': '1.5rem',
        'neu-sm': '0.5rem',
      }
    },
  },
  plugins: [],
}
