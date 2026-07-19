// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  gitIgnore: true,
  ignores: [
    './src/components/ui/**/*',
    './src/components/diceui/**/*',
    './docs/**/*.mock.js',

  ],
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
    braceStyle: 'stroustrup', // '1tbs', or 'allman'
  },
})
