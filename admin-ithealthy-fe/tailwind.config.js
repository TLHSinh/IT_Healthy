/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tùy chọn màu gradient, bạn có thể dùng cho chatbox
        primary: "#2563eb", // xanh dương tươi
        secondary: "#64748b", // xám nhẹ
        accent: "#22d3ee", // xanh ngọc
      },
      boxShadow: {
        'soft': '0 4px 14px rgba(0,0,0,0.1)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(50%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.4s ease-out',
        fadeIn: 'fadeIn 0.5s ease-in',
        pulseSlow: 'pulseSlow 2s ease-in-out infinite',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],

  darkMode: 'class',
};
