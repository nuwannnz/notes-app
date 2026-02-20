/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pastel palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7cc4ff',
          400: '#38bdf8',
          500: '#0c8fff',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          purple: '#c4b5fd',
          rose: '#fda4af',
          mint: '#86efac',
        },
        surface: {
          light: '#ffffff',
          dark: '#1a1a2e',
        },
        muted: {
          light: '#f5f5f7',
          dark: '#2d2d44',
        },
        sidebar: {
          light: '#fafafa',
          dark: '#16162a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'editor-sm': '14px',
        'editor-md': '16px',
        'editor-lg': '18px',
      },
      width: {
        'sidebar': '280px',
        'sidebar-min': '200px',
        'sidebar-max': '400px',
      },
      spacing: {
        'compact': '8px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
