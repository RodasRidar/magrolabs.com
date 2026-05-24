/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Brand colors — fuente única de verdad.
        // Escala base (no exponer directamente, usar los tokens semánticos):
        //   50  #fff4ed   500 #fe5011   900 #7e1c10
        //   100 #ffe6d4   600 #ef3507   950 #440b06
        //   200 #ffcaa8   700 #c62408
        //   300 #ffa571   800 #9d1e0f
        //   400 #ff6f2f  ← CTA principal
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          muted: 'rgb(var(--color-primary-muted) / <alpha-value>)',
          surface: 'rgb(var(--color-primary-surface) / <alpha-value>)',
          'surface-light': 'rgb(var(--color-primary-surface-light) / <alpha-value>)',
        },
        // Superficies neutras del design system
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          alt: 'rgb(var(--color-surface-alt) / <alpha-value>)',
        },
        // Accent
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        // Tokens neutros para texto/fondo/border (reemplazan gray-* hardcoded)
        bg: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          alt: 'rgb(var(--color-bg-alt) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--color-fg) / <alpha-value>)',
          muted: 'rgb(var(--color-fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--color-fg-subtle) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
