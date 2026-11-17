import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="mailvault-dark"]'],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f0fdf4',
          500: '#10b981',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: [
      {
        'mailvault-light': {
          primary: '#4f46e5', // Indigo 600
          'primary-focus': '#4338ca',
          'primary-content': '#ffffff',
          secondary: '#0ea5e9', // Sky 500
          accent: '#10b981', // Emerald 500
          neutral: '#1e293b', // Slate 800
          'base-100': '#ffffff',
          'base-200': '#f8fafc', // Slate 50
          'base-300': '#f1f5f9', // Slate 100
          'base-content': '#0f172a',
          info: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        'mailvault-dark': {
          primary: '#6366f1', // Indigo 500
          'primary-focus': '#4f46e5',
          'primary-content': '#ffffff',
          secondary: '#38bdf8', // Light sky
          accent: '#34d399', // Emerald
          neutral: '#0f172a', // Slate 900
          'base-100': '#0b0f19', // Deep dark
          'base-200': '#111827', // Slate 900
          'base-300': '#1f2937', // Slate 800
          'base-content': '#f8fafc',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
    defaultTheme: 'mailvault-dark',
  },
};

export default config;
