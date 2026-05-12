/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        lumina: {
          50:  '#f0effe',
          100: '#e4e2fd',
          200: '#ccc8fb',
          300: '#aba4f8',
          400: '#8876f3',
          500: '#6f52ed',
          600: '#6131e2',
          700: '#5226ca',
          800: '#4421a4',
          900: '#391e84',
          950: '#22115a',
        },
        space: {
          50:  '#f5f5ff',
          100: '#ededfe',
          200: '#d4d3fd',
          300: '#b0adfb',
          400: '#8681f7',
          500: '#6360f1',
          600: '#4d4ae6',
          700: '#3f3dcb',
          800: '#3434a5',
          900: '#2e2e83',
          950: '#1c1c4d',
        },
        dark: {
          base:    '#09090f',
          surface: '#0f0f1a',
          card:    '#141420',
          elevated:'#1a1a2e',
          border:  'rgba(255,255,255,0.06)',
          hover:   'rgba(255,255,255,0.04)',
        },
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'glow-purple': 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'glow-violet': 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        'gradient-card': 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        'cinematic': 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
      },
      boxShadow: {
        'glass':      '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow':       '0 0 30px rgba(99,102,241,0.3)',
        'glow-sm':    '0 0 12px rgba(99,102,241,0.2)',
        'card':       '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backdropBlur: {
        'xs': '4px',
        'glass': '20px',
        'heavy': '40px',
      },
      animation: {
        'float':           'float 6s ease-in-out infinite',
        'pulse-glow':      'pulseGlow 2s ease-in-out infinite',
        'shimmer':         'shimmer 2s linear infinite',
        'slide-up':        'slideUp 0.3s ease-out',
        'slide-down':      'slideDown 0.3s ease-out',
        'fade-in':         'fadeIn 0.4s ease-out',
        'scale-in':        'scaleIn 0.2s ease-out',
        'spin-slow':       'spin 3s linear infinite',
        'scan-line':       'scanLine 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scanLine: {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snap':   'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
}
