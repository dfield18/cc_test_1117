/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-heading)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(174 72% 40%)',
          light: 'hsl(174 72% 50%)',
        },
        'primary-glow': 'hsl(174 72% 50%)',
        accent: 'hsl(174 72% 40%)',
        gradient: {
          start: 'hsl(195 100% 45%)',
          end: 'hsl(220 90% 60%)',
        },
        purple: {
          light: 'hsl(280 50% 70%)', // Light purple/lavender for gradient
        },
        foreground: '#0F172A', // slate-900
        'card-foreground': '#0F172A', // slate-900 - same as foreground for card text
        'muted-foreground': 'hsl(215 15% 50%)',
        background: 'hsl(210 40% 98%)',
        card: '#FFFFFF', // HSL 0 0% 100% light mode
        input: '#E2E8F0', // HSL 220 13% 91% light mode (slate-200)
        ring: 'hsl(174 72% 40%)', // Primary color for focus ring
        border: '#E2E8F0', // slate-200
        success: '#10B981', // emerald-500
        secondary: 'hsl(174 45% 95%)',
        'secondary-foreground': '#0F172A', // slate-900
        'primary-foreground': '#FFFFFF', // white
        muted: '#F1F5F9', // slate-100
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)', // Light mode
        'elegant': '0 10px 40px -10px hsl(174 72% 40% / 0.15)',
        'card-hover': '0 4px 20px -4px hsl(220 13% 13% / 0.08)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, hsl(195 100% 95%), hsl(220 90% 98%))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
      },
      keyframes: {
        'gradient-xy': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'shimmer': {
          '0%': {
            'background-position': '-200% 0',
          },
          '100%': {
            'background-position': '200% 0',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
      },
      animation: {
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
      backgroundSize: {
        'gradient-xy': '400% 400%',
      },
      transitionProperty: {
        'smooth': 'all',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'smooth': '300ms',
      },
    },
  },
  plugins: [],
}

