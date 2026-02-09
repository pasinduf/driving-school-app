/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#d2232a',
            },
            animation: {
                'fade-in-up': 'fadeInUp 1s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
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
