/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Deep pool blue for trust and expertise
        'primary': '#1e40af', // blue-800
        'primary-50': '#eff6ff', // blue-50
        'primary-100': '#dbeafe', // blue-100
        'primary-200': '#bfdbfe', // blue-200
        'primary-300': '#93c5fd', // blue-300
        'primary-400': '#60a5fa', // blue-400
        'primary-500': '#3b82f6', // blue-500
        'primary-600': '#2563eb', // blue-600
        'primary-700': '#1d4ed8', // blue-700
        'primary-800': '#1e40af', // blue-800
        'primary-900': '#1e3a8a', // blue-900
        'primary-950': '#172554', // blue-950
        'primary-foreground': '#ffffff', // white

        // Secondary Colors - Lighter blue for interactive elements
        'secondary': '#3b82f6', // blue-500
        'secondary-50': '#eff6ff', // blue-50
        'secondary-100': '#dbeafe', // blue-100
        'secondary-200': '#bfdbfe', // blue-200
        'secondary-300': '#93c5fd', // blue-300
        'secondary-400': '#60a5fa', // blue-400
        'secondary-500': '#3b82f6', // blue-500
        'secondary-600': '#2563eb', // blue-600
        'secondary-700': '#1d4ed8', // blue-700
        'secondary-800': '#1e40af', // blue-800
        'secondary-900': '#1e3a8a', // blue-900
        'secondary-foreground': '#ffffff', // white

        // Accent Colors - Warm amber for family moments
        'accent': '#f59e0b', // amber-500
        'accent-50': '#fffbeb', // amber-50
        'accent-100': '#fef3c7', // amber-100
        'accent-200': '#fde68a', // amber-200
        'accent-300': '#fcd34d', // amber-300
        'accent-400': '#fbbf24', // amber-400
        'accent-500': '#f59e0b', // amber-500
        'accent-600': '#d97706', // amber-600
        'accent-700': '#b45309', // amber-700
        'accent-800': '#92400e', // amber-800
        'accent-900': '#78350f', // amber-900
        'accent-foreground': '#ffffff', // white

        // Background Colors
        'background': '#ffffff', // white
        'surface': '#f8fafc', // slate-50
        'surface-100': '#f1f5f9', // slate-100
        'surface-200': '#e2e8f0', // slate-200
        'surface-300': '#cbd5e1', // slate-300

        // Text Colors
        'text-primary': '#1f2937', // gray-800
        'text-secondary': '#6b7280', // gray-500
        'text-muted': '#9ca3af', // gray-400
        'text-inverse': '#ffffff', // white

        // Status Colors
        'success': '#10b981', // emerald-500
        'success-50': '#ecfdf5', // emerald-50
        'success-100': '#d1fae5', // emerald-100
        'success-200': '#a7f3d0', // emerald-200
        'success-300': '#6ee7b7', // emerald-300
        'success-400': '#34d399', // emerald-400
        'success-500': '#10b981', // emerald-500
        'success-600': '#059669', // emerald-600
        'success-700': '#047857', // emerald-700
        'success-800': '#065f46', // emerald-800
        'success-900': '#064e3b', // emerald-900
        'success-foreground': '#ffffff', // white

        'warning': '#f59e0b', // amber-500
        'warning-50': '#fffbeb', // amber-50
        'warning-100': '#fef3c7', // amber-100
        'warning-200': '#fde68a', // amber-200
        'warning-300': '#fcd34d', // amber-300
        'warning-400': '#fbbf24', // amber-400
        'warning-500': '#f59e0b', // amber-500
        'warning-600': '#d97706', // amber-600
        'warning-700': '#b45309', // amber-700
        'warning-800': '#92400e', // amber-800
        'warning-900': '#78350f', // amber-900
        'warning-foreground': '#ffffff', // white

        'error': '#ef4444', // red-500
        'error-50': '#fef2f2', // red-50
        'error-100': '#fee2e2', // red-100
        'error-200': '#fecaca', // red-200
        'error-300': '#fca5a5', // red-300
        'error-400': '#f87171', // red-400
        'error-500': '#ef4444', // red-500
        'error-600': '#dc2626', // red-600
        'error-700': '#b91c1c', // red-700
        'error-800': '#991b1b', // red-800
        'error-900': '#7f1d1d', // red-900
        'error-foreground': '#ffffff', // white

        // Border Colors
        'border': '#e2e8f0', // slate-200
        'border-light': '#f1f5f9', // slate-100
        'border-dark': '#cbd5e1', // slate-300
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'poppins': ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'emergency': '0 0 20px rgba(239, 68, 68, 0.3)',
        'pool': '0 8px 32px rgba(30, 64, 175, 0.12)',
        'family': '0 8px 32px rgba(245, 158, 11, 0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s linear',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '10px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
}