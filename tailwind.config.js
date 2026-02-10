/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    light: '#4ade80',
                    DEFAULT: '#22c55e',
                    dark: '#16a34a',
                },
            },
        },
    },
    plugins: [],
}
