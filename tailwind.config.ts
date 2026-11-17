import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Class strategy, not media: the App Shell set ships a light/dark pair and the
  // preview has to be able to flip between them without touching OS settings.
  darkMode: 'class',
  theme: {
    // Brutalist: hard edges everywhere. Zero radius across the whole scale.
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '0',
    },
    extend: {
      colors: {
        bone: '#ece6d8',
        ink: '#0c0b0e',
        vermilion: {
          DEFAULT: '#ff4d23',
          hover: '#ff5630',
        },
        // Aliases used by the components imported from the Store catalog —
        // same hex values, kept so those files stay diff-able with upstream.
        paper: '#ece6d8',
        // `accent` is var-backed so the imported Scroll Secrets set can override
        // it to warm gold inside `.ss-theme`; everywhere else it stays vermilion.
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb, 255 77 35) / <alpha-value>)',
          hover: '#ff5630',
        },
        // Semantic tokens for the imported "Scroll Secrets" showcase set. These
        // resolve to warm Apple-like values via CSS vars scoped under `.ss-theme`
        // (see styles/index.css); each carries a sensible fallback so utilities
        // never render transparent if used outside that scope.
        background: 'rgb(var(--ss-background, 250 248 245) / <alpha-value>)',
        foreground: 'rgb(var(--ss-foreground, 26 26 26) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--ss-card, 255 255 255) / <alpha-value>)',
          foreground: 'rgb(var(--ss-card-foreground, 26 26 26) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--ss-primary, 58 58 58) / <alpha-value>)',
          foreground: 'rgb(var(--ss-primary-foreground, 250 248 245) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--ss-secondary, 240 236 227) / <alpha-value>)',
          foreground: 'rgb(var(--ss-secondary-foreground, 26 26 26) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--ss-muted, 236 232 223) / <alpha-value>)',
          foreground: 'rgb(var(--ss-muted-foreground, 122 122 122) / <alpha-value>)',
        },
        border: 'rgb(var(--ss-border, 228 223 214) / <alpha-value>)',
        ring: 'rgb(var(--ss-ring, 201 168 76) / <alpha-value>)',
        // "Set II" palette — the navy + five-accent ramp the 20 imported
        // Live-Components-II pieces cycle through. Kept (per the hybrid port)
        // so the colour-driven demos read; shape stays brutalist (radius 0).
        navy: {
          DEFAULT: '#0c394a',
          700: '#11475c',
          900: '#07222c',
          soft: 'rgba(12,57,74,0.58)',
          line: 'rgba(12,57,74,0.14)',
        },
        cream: '#f4f1e8',
        coral: '#ff5a3c',
        moss: '#2f9e7f',
        gold: '#e8a23d',
        violet: '#7b6cf6',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      transitionDuration: {
        // The App Shell set's card curve — 300ms reads twitchy under a 4px lift,
        // 500ms reads slow. Tailwind ships neither.
        400: '400ms',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        blink: {
          '50%': { opacity: '0.25' },
        },
        'cursor-blink': {
          '50%': { opacity: '0' },
        },
        'modal-fade-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // App Shell: the CSS half of the staggered reveal. Rows opt in with
        // opacity-0 + animate-fade-in-up + delay-[Nms]; forwards fill holds the
        // end state so the last row does not flash back out.
        'fade-in-up': {
          from: { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        blink: 'blink 2.4s steps(1) infinite',
        'cursor-blink': 'cursor-blink 0.7s steps(1) infinite',
        'modal-fade-in': 'modal-fade-in 0.3s ease',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
} satisfies Config;
