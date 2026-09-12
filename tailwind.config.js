/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct Semantic Theme Tokens mapped to CSS variables
        'color-bg': 'var(--color-bg)',
        'color-bg-secondary': 'var(--color-bg-secondary)',
        'color-surface': 'var(--color-surface)',
        'color-surface-elevated': 'var(--color-surface-elevated)',
        'color-surface-hover': 'var(--color-surface-hover)',
        'color-text-primary': 'var(--color-text-primary)',
        'color-text-secondary': 'var(--color-text-secondary)',
        'color-text-muted': 'var(--color-text-muted)',
        'color-border': 'var(--color-border)',
        'color-border-strong': 'var(--color-border-strong)',
        'color-accent': 'var(--color-accent)',
        'color-accent-hover': 'var(--color-accent-hover)',
        'color-accent-soft': 'var(--color-accent-soft)',
        'color-secondary': 'var(--color-secondary)',
        'color-secondary-soft': 'var(--color-secondary-soft)',
        'color-highlight': 'var(--color-highlight)',
        'color-highlight-soft': 'var(--color-highlight-soft)',
        'color-success': 'var(--color-success)',
        'color-warning': 'var(--color-warning)',
        'color-error': 'var(--color-error)',

        // Existing and semantic alias tokens
        'bg-primary': 'var(--color-bg)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'surface-card': 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-hover': 'var(--color-surface-hover)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'border-theme': 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        'accent-primary': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        'secondary-accent': 'var(--color-secondary)',
        'secondary-soft': 'var(--color-secondary-soft)',
        'highlight-primary': 'var(--color-highlight)',
        'highlight-soft': 'var(--color-highlight-soft)',
        'status-success': 'var(--color-success)',
        'status-warning': 'var(--color-warning)',
        'status-error': 'var(--color-error)',

        // Nested semantic token groups
        bg: {
          primary: 'var(--color-bg)',
          secondary: 'var(--color-bg-secondary)',
        },
        surface: {
          card: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          hover: 'var(--color-surface-hover)',
        },
        themeText: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        themeBorder: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        accent: {
          primary: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
        },
        themeSecondary: {
          DEFAULT: 'var(--color-secondary)',
          soft: 'var(--color-secondary-soft)',
        },
        themeHighlight: {
          DEFAULT: 'var(--color-highlight)',
          soft: 'var(--color-highlight-soft)',
        },
        status: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          error: 'var(--color-error)',
        },

        // Cream scale (Light cream vs Dark ice tints)
        cream: {
          50: 'var(--cream-50)',
          100: 'var(--cream-100)',
          200: 'var(--cream-200)',
          300: 'var(--cream-300)',
          400: 'var(--cream-400)',
          500: 'var(--cream-500)',
        },

        // Charcoal scale (Dark deep warm in Dark, crisp contrast in Light)
        charcoal: {
          950: 'var(--charcoal-950)',
          900: 'var(--charcoal-900)',
          850: 'var(--charcoal-850)',
          800: 'var(--charcoal-800)',
          700: 'var(--charcoal-700)',
          600: 'var(--charcoal-600)',
          500: 'var(--charcoal-500)',
          400: 'var(--charcoal-400)',
          300: 'var(--charcoal-300)',
        },

        // Spice / Brand Accent scale
        spice: {
          50: 'var(--accent-soft)',
          100: 'var(--spice-100)',
          200: 'var(--spice-200)',
          300: 'var(--spice-300)',
          400: 'var(--accent-hover)',
          500: 'var(--accent-primary)',
          600: 'var(--accent-hover)',
          700: '#D95722',
          800: '#B84517',
          900: '#94330E',
          950: 'var(--spice-950)',
        },

        // Herb / Success scale
        herb: {
          50: 'var(--herb-50)',
          100: 'var(--herb-100)',
          200: 'var(--herb-200)',
          300: 'var(--herb-300)',
          400: 'var(--herb-400)',
          500: 'var(--success)',
          600: 'var(--success)',
          700: 'var(--herb-700)',
          800: 'var(--herb-800)',
          900: 'var(--herb-900)',
          950: 'var(--herb-950)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'soft': 'var(--shadow-card)',
        'lift': 'var(--shadow-elevated)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
