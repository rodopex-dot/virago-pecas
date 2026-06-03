import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
      },
      colors: {
        brand: {
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      boxShadow: {
        'orange-glow': '0 0 20px rgba(249, 115, 22, 0.3)',
        'orange-glow-sm': '0 0 10px rgba(249, 115, 22, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config
