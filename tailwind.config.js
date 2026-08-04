/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#060D0A',
        panel: '#0C1812',
        panel2: '#112219',
        panel3: '#162C21',
        border: '#193325',
        border2: '#224432',
        txt: '#E2F1E8',
        txt2: '#8AA998',
        txt3: '#587867',
        gold: '#10E784',
        goldD: '#059669',
        cyan: '#14B8A6',
        green: '#10E784',
        amber: '#F59E0B',
        red: '#EF4444',
        purple: '#A78BFA',
        pink: '#F472B6',
        blue: '#3B82F6',
      },
      borderRadius: {
        r: '10px',
        rs: '7px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
