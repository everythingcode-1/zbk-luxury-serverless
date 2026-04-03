/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'luxury-gold': '#D4AF37',
        'luxury-gold-hover': '#C9A227',
        'luxury-gold-active': '#B8931F',
        'deep-navy': '#111111',
        'off-white': '#1A1A1A',
        
        // Accent Colors
        'charcoal': '#2D3436',
        'light-gray': '#333333',
        'success-green': '#27AE60',
        'alert-red': '#E74C3C',
        'info-blue': '#3498DB',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        'h2': ['36px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        'h3': ['24px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        'h4': ['18px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
      },
      
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      
      borderRadius: {
        'minimal': '2px',
        'compact': '4px',
        'standard': '8px',
        'large': '12px',
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-strong': '0 0 30px rgba(212, 175, 55, 0.4)',
      },
      
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #D4AF37, #E8C547)',
        'gradient-dark': 'linear-gradient(135deg, #111111, #1A1A1A)',
        'gradient-light': 'linear-gradient(135deg, #1A1A1A, #333333)',
      },
      
      transitionTimingFunction: {
        'micro': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'entrance': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      
      transitionDuration: {
        'micro': '150ms',
        'standard': '200ms',
        'entrance': '300ms',
      },
      
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% - 24px))' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.6), 0 0 80px rgba(212, 175, 55, 0.2)' },
        },
        'border-rotate': {
          '0%': { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up-delay': {
          '0%, 20%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      
      animation: {
        'scroll': 'scroll 60s linear infinite',
        'scroll-slow': 'scroll 180s linear infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'border-rotate': 'border-rotate 4s linear infinite',
        'fade-up': 'fade-up 0.8s ease-out forwards',
        'fade-up-delay': 'fade-up-delay 1s ease-out forwards',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            h1: {
              fontWeight: '800',
              fontSize: '2.5rem',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h2: {
              fontWeight: '700',
              fontSize: '2rem',
              marginTop: '1.75rem',
              marginBottom: '0.875rem',
            },
            h3: {
              fontWeight: '600',
              fontSize: '1.5rem',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            },
            a: {
              color: '#D4AF37',
              textDecoration: 'none',
              '&:hover': {
                color: '#C9A227',
                textDecoration: 'underline',
              },
            },
            strong: {
              fontWeight: '700',
              color: '#111827',
            },
            code: {
              backgroundColor: '#F3F4F6',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            table: {
              width: '100%',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            thead: {
              borderBottomWidth: '2px',
              borderBottomColor: '#E5E7EB',
            },
            'thead th': {
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              fontWeight: '600',
              textAlign: 'left',
            },
            'tbody td': {
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: '#F3F4F6',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
