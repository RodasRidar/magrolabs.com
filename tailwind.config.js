/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Brand colors — fuente única de verdad
        primary: {
          DEFAULT: '#d07d66',   // CTA principal, botones, links activos
          hover: '#d7816a',     // estado hover del primary
          dark: '#b86b56',      // hover en variantes más oscuras
          muted: '#d89785',     // focus rings en formularios
          surface: '#fae8e3',   // badges, chips, fondos muy suaves
          'surface-light': '#ffe8e2', // nav active background
        },
        // Superficies neutras
        surface: {
          DEFAULT: '#f6f6f6',   // cards, secciones
          alt: '#f5f5f0',       // superficie alternativa
        },
        // Accent
        accent: '#6f67eb',      // spinners, indicadores secundarios
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}