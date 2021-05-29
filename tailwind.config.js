/* eslint-disable filenames/match-regex */
// tailwind.config.js
module.exports = {
  mode: 'jit',
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [
    require('@tailwindcss/forms'),
  ],
  theme: {
  }
}
