import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Formal neutral navy — replaces vivid blue
        brand: {
          50:  '#F3F6FB',
          100: '#E6EDF7',
          200: '#CDDAEF',
          300: '#A9BFE3',
          400: '#7E9ED2',
          500: '#577DBF',
          600: '#3B5FA8',   // primary actions
          700: '#2D4A85',
          800: '#213667',
          900: '#16254A',
        },
        success: {
          50:  '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          50:  '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        danger: {
          50:  '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        sidebar:       '#111827',   // near-black for clean formal sidebar
        'sidebar-hover': '#1F2937',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"Fira Code"', '"Fira Mono"', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-in-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
