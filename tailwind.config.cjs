module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent)',
        'primary-2': 'var(--accent-2)',
        brand: 'var(--topbar-bg)'
      }
    }
  },
  plugins: []
};
