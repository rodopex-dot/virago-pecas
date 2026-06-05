import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,tsx}',
  ],
  safelist: [
    // Cores dos botões de plataforma (usadas dinamicamente via PLATFORM_BUTTON)
    'bg-amber-400',  'hover:bg-amber-500',  'border-amber-500',
    'bg-yellow-400', 'hover:bg-yellow-500', 'border-yellow-500',
    'bg-orange-500', 'hover:bg-orange-600', 'border-orange-600',
    'bg-red-500',    'hover:bg-red-600',    'border-red-600',
    'bg-blue-500',   'hover:bg-blue-600',   'border-blue-600',
    'bg-zinc-600',   'hover:bg-zinc-700',   'border-zinc-700',
    'text-zinc-900', 'text-white',
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
