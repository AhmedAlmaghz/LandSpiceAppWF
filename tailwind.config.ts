import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand colors for LandSpice
        brand: {
          primary: '#dc2626', // Red-600
          secondary: '#f97316', // Orange-500
          success: '#16a34a', // Green-600
          warning: '#eab308', // Yellow-500
          error: '#dc2626', // Red-600
          info: '#3b82f6', // Blue-500
        },
        // Custom color palette
        landspace: {
          50: '#fef2f2',
          100: '#fee2e2', 
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Status colors
        status: {
          active: '#16a34a',
          inactive: '#6b7280',
          pending: '#eab308',
          approved: '#16a34a',
          rejected: '#dc2626',
          cancelled: '#6b7280',
          paid: '#16a34a',
          unpaid: '#dc2626',
          overdue: '#dc2626',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'moderate': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'strong': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(220, 38, 38, 0.3)',
        'glow-lg': '0 0 25px rgba(220, 38, 38, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            maxWidth: 'none',
            '[dir="rtl"] &': {
              textAlign: 'right',
            },
          },
        },
      },
    },
  },
  plugins: [
    // Plugin for RTL support
    function({ addUtilities }: any) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.flip-x': {
          transform: 'scaleX(-1)',
        },
        '.text-shadow': {
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};

export default config;
