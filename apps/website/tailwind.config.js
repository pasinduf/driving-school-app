/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
            colors: {
                // Company accent color (dynamic, set from settings.themeColor via
                // --color-primary). DEFAULT keeps existing bg-primary/text-primary
                // working; tints derive from the same variable so every accent
                // tracks the company brand without hardcoding.
                primary: {
                    DEFAULT: 'var(--color-primary, #d2232a)',
                    50: 'color-mix(in srgb, var(--color-primary, #d2232a) 8%, white)',
                    100: 'color-mix(in srgb, var(--color-primary, #d2232a) 14%, white)',
                    200: 'color-mix(in srgb, var(--color-primary, #d2232a) 28%, white)',
                    300: 'color-mix(in srgb, var(--color-primary, #d2232a) 45%, white)',
                    400: 'color-mix(in srgb, var(--color-primary, #d2232a) 70%, white)',
                    500: 'var(--color-primary, #d2232a)',
                    600: 'var(--color-primary, #d2232a)',
                    700: 'color-mix(in srgb, var(--color-primary, #d2232a) 85%, black)',
                    800: 'color-mix(in srgb, var(--color-primary, #d2232a) 70%, black)',
                },
                // Cool slate/ink-aligned neutral scale — overrides the default
                // warm gray so every existing gray-* usage adopts the Drive Me
                // neutral (pure hue shift, no layout change).
                gray: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#0b1020',
                },
                ink: '#0b1020',
                muted: '#5b6478',
                surface: '#f8fafc',
                line: '#e2e8f0',
            },
            boxShadow: {
                card: '0 1px 2px rgb(16 24 40 / 0.04), 0 12px 32px -12px rgb(16 24 40 / 0.12)',
                soft: '0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px -8px rgb(16 24 40 / 0.1)',
                glow: '0 0 0 1px color-mix(in srgb, var(--color-primary, #d2232a) 16%, transparent), 0 16px 36px -12px color-mix(in srgb, var(--color-primary, #d2232a) 50%, transparent)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 1s ease-out forwards',
                'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
                'float': 'float 7s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
            }
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.clip-hexagon': {
                    'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                },
                '.clip-diamond': {
                    'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                },
                '.clip-octagon': {
                    'clip-path': 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                },
            })
        }
    ],
}
