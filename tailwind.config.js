/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html'],
  safelist: [
    { pattern: /(bg|text|border)-ios-(blue|green|orange|red|purple|teal|gray|gray2|gray3|label|secondary)/ },
    { pattern: /bg-opacity-(5|10|15|20|40|50)/ },
    { pattern: /border-opacity-(20)/ },
  ],
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-gray': '#F2F2F7',
        'ios-gray2': '#E5E5EA',
        'ios-gray3': '#D1D1D6',
        'ios-label': '#1C1C1E',
        'ios-secondary': '#636366',
        'ios-green': '#34C759',
        'ios-orange': '#FF9500',
        'ios-red': '#FF3B30',
        'ios-purple': '#AF52DE',
        'ios-teal': '#5AC8FA',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'ios': '13px',
        'ios-lg': '20px',
      },
      boxShadow: {
        'ios': '0 2px 20px rgba(0,0,0,0.08)',
        'ios-sm': '0 1px 8px rgba(0,0,0,0.06)',
      },
    },
  },
};
