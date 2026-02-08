/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4FC3F7',
                secondary: '#66BB6A',
                accent: '#F9A8D4',
                aqua: '#26C6DA',
                vista: {
                    50: '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#4FC3F7',
                },
            },
            backgroundImage: {
                'gradient-aero': 'linear-gradient(135deg, #4FC3F7 0%, #66BB6A 50%, #26C6DA 100%)',
                'gradient-vista': 'linear-gradient(to bottom, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
            },
            boxShadow: {
                aero: '0 4px 20px rgba(79, 195, 247, 0.25), 0 0 0 1px rgba(255,255,255,0.5)',
                'aero-lg': '0 8px 30px rgba(79, 195, 247, 0.3), 0 0 0 1px rgba(255,255,255,0.6)',
            },
        },
    },
    plugins: [],
}
