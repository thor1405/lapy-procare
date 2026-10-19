/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          borderHover: '#CBD5E1',
          indigo: '#4F46E5',
          blue: '#3B82F6',
          teal: '#14B8A6',
          heading: '#111827',
          body: '#475569',
          muted: '#64748B',
          softIndigo: '#EEF2FF',
          softBlue: '#EFF6FF',
          softTeal: '#F0FDFA',
          accent: '#4F46E5',
          electric: '#3B82F6',
          cyan: '#14B8A6',
          text: '#111827',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sora: ['Sora', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(100deg, #4F46E5 0%, #3B82F6 52%, #14B8A6 100%)',
        'soft-glow': 'radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.06) 0%, rgba(20, 184, 166, 0.04) 50%, transparent 80%)',
        'lavender-glow': 'radial-gradient(circle at 80% 20%, rgba(238, 242, 255, 0.8) 0%, transparent 60%)',
        'mint-glow': 'radial-gradient(circle at 20% 40%, rgba(240, 253, 250, 0.9) 0%, transparent 60%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(79, 70, 229, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'premium': '0 20px 40px -15px rgba(79, 70, 229, 0.12)',
        'float': '0 14px 28px rgba(0, 0, 0, 0.06), 0 10px 10px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
