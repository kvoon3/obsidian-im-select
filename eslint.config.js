import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  rules: {
 	'no-console': 'off',
	 },
  ignores: [
    'package.json',
    'esbuild.config.mjs',
  ],
})
