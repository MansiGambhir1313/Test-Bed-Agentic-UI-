import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Primary accent - Refined Gold/Champagne
        accent: {
          50: '#FDF9F3',
          100: '#F9EFE0',
          200: '#F2DFC1',
          300: '#E8C896',
          400: '#E8B35A',  // refined: more luminous
          500: '#D4A048',  // refined: richer
          600: '#A67A36',
          700: '#8A632D',
          800: '#6E4E24',
          900: '#52391A',
        },

        // Secondary accent - Rose Gold
        rose: {
          400: '#E8A4A0',
          500: '#D4857F',
          600: '#C06B64',
        },

        // Deep dark backgrounds with depth
        luxury: {
          900: '#0A0A0B',
          850: '#0F0F11',
          800: '#141416',
          750: '#1A1A1D',
          700: '#202024',
          600: '#2A2A2F',
          500: '#3A3A40',
          400: '#505058',  // refined: better contrast
          300: '#74747F',  // refined: better contrast
          200: '#A5A5B2',  // refined: better contrast
          100: '#CCCCD8',
          50: '#EEEEF4',
        },

        // Status colors refined
        status: {
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#60A5FA',
        },

        // Keep primary for backward compatibility (refined blue)
        primary: '#6B8AFB',
        'primary-hover': '#8BA3FC',

        // Legacy dark colors (for gradual migration)
        dark: {
          100: '#3a3a3c',
          200: '#2d2d2d',
          300: '#1e1e1e',
          400: '#121212',
        },
      },
      animation: {
        // Refined existing animations
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        expand: 'expandModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-ring': 'pulse-ring 2s infinite',
        'widget-in': 'widgetIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'timeline-pulse': 'timelinePulse 2s infinite',

        // New luxury animations
        shimmer: 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'stagger-1': 'staggerFade 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.05s forwards',
        'stagger-2': 'staggerFade 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards',
        'stagger-3': 'staggerFade 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards',
        'stagger-4': 'staggerFade 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards',
        'stagger-5': 'staggerFade 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.25s forwards',
        skeleton: 'skeleton 1.5s ease-in-out infinite',
        'success-pop': 'successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'spin-slow': 'spin 2s linear infinite',
        // Minimalist animations
        'breathe': 'breathe 4s ease-in-out infinite',
        'ping-slow': 'pingSlow 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'subtle-pulse': 'subtlePulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(-16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        expandModal: {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(107, 138, 251, 0.7)' },
          '70%': { boxShadow: '0 0 0 6px rgba(107, 138, 251, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(107, 138, 251, 0)' },
        },
        widgetIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        timelinePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(212, 166, 90, 0.2)' },
          '50%': { boxShadow: '0 0 30px -4px rgba(212, 166, 90, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        staggerFade: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        skeleton: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        successPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Minimalist keyframes
        breathe: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        pingSlow: {
          '0%': { transform: 'scale(1)', opacity: '0.15' },
          '50%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '0.15' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
