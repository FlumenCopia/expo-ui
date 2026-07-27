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
        bg: '#0B0E14',
        panel: '#12161F',
        panel2: '#171C27',
        panel3: '#1D2331',
        border: '#242C3B',
        border2: '#2E3849',
        txt: '#E8EDF5',
        txt2: '#94A3B8',
        txt3: '#64748B',
        gold: '#F5A623',
        goldD: '#C8850D',
        cyan: '#22D3EE',
        green: '#10B981',
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
