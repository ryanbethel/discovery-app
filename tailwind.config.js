/* eslint-disable filenames/match-regex */
// tailwind.config.js
module.exports = {
  mode: 'jit',
  purge: [
    './public/**/*.html',
    './public/**/*.js',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [
    // eslint-disable-next-line global-require
    require('@tailwindcss/forms') ],
  theme: {
  }
}
