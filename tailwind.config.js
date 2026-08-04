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
        bg: '#09090B',
        panel: '#121215',
        panel2: '#18181B',
        panel3: '#27272A',
        border: '#27272A',
        border2: '#3F3F46',
        txt: '#FAFAFA',
        txt2: '#A1A1AA',
        txt3: '#71717A',
        gold: '#FFFFFF',
        goldD: '#A1A1AA',
        cyan: '#0EA5E9',
        green: '#22C55E',
        amber: '#F59E0B',
        red: '#EF4444',
        purple: '#A855F7',
        pink: '#EC4899',
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
