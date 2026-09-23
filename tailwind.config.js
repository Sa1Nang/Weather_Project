/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        parchment: 'var(--surface-muted)',
        paper: 'var(--surface)',
        ink: 'var(--ink)',
        inkmuted: 'var(--ink-muted)',
        mist: 'var(--mist)',
        wine: 'var(--wine)',
        royal: 'var(--violet)',
        lilac: 'var(--lilac)',
        lagoon: 'var(--lagoon)',
        obsidian: 'var(--obsidian)',
        abyss: 'var(--abyss)',
        graphite: 'var(--graphite-card)',
        steel: 'var(--steel-hover)',
        silver: 'var(--silver-inverted)',
        iris: 'var(--iris)',
        cyansignal: 'var(--cyan-signal)',
        paleiris: 'var(--pale-iris)',
        deepiris: 'var(--deep-iris)',
        orchid: 'var(--orchid)',
        periwinkle: 'var(--periwinkle)',
        ash: 'var(--ash)',
        cloud: 'var(--cloud)',
      },
      borderRadius: {
        tile: '30px',
      },
    },
  },
  plugins: [],
}
