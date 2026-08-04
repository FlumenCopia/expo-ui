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
        bg: '#F8FAFC',
        panel: '#FFFFFF',
        panel2: '#F1F5F9',
        panel3: '#E2E8F0',
        border: '#E2E8F0',
        border2: '#CBD5E1',
        txt: '#0F172A',
        txt2: '#475569',
        txt3: '#64748B',
        gold: '#0F172A',
        goldD: '#334155',
        cyan: '#0284C7',
        green: '#16A34A',
        amber: '#D97706',
        red: '#DC2626',
        purple: '#9333EA',
        pink: '#DB2777',
        blue: '#2563EB',
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
