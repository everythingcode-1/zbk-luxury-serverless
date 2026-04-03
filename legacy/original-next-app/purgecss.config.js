const purgecss = require('@purgecss/purgecss');

module.exports = {
  plugins: [
    purgecss({
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/app/**/*.{js,ts,jsx,tsx}',
      ],
      defaultExtractor: (content) => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s]+/gi) || [];
        const innerMatches = content.match(/[^<>"'`\s.(){}[^<>"'`\s]+/gi) || [];
        return broadMatches.concat(innerMatches);
      },
      safelist: {
        standard: [
          'react',
          'next',
          'tailwind',
          'dark',
          'light',
        ],
        deep: [
          /^bg-/,
          /^text-/,
          /^border-/,
          /^flex/,
          /^grid/,
          /^block/,
          /^inline-/,
          /^hidden/,
          /^visible/,
        ],
      },
      css: ['./src/app/globals.css'],
      output: './public/styles/purged.css',
    }),
  ],
};
