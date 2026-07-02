/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['Inter', 'SF Pro Text', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#02050d',
          900: '#07101f',
          850: '#091827',
          800: '#0c1d31',
        },
        electric: {
          500: '#1c7dff',
          400: '#37a1ff',
          300: '#76d7ff',
        },
        signal: {
          cyan: '#37f4ff',
          green: '#35d399',
          amber: '#f9b858',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(28, 125, 255, 0.35)',
        'glow-soft': '0 22px 70px rgba(18, 86, 180, 0.24)',
        card: '0 18px 60px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'radial-blue': 'radial-gradient(circle at center, rgba(28,125,255,0.24), transparent 55%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(55,161,255,0.4)' },
          '50%': { boxShadow: '0 0 0 14px rgba(55,161,255,0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '18%': { opacity: '0.5' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(14px, -16px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        scan: 'scan 5s ease-in-out infinite',
        drift: 'drift 11s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
