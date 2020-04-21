module.exports = {
	parser: '@typescript-eslint/parser',
	extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
	plugins: ['jest', 'prettier'],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'import/order': [
			2,
			{
				groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
				'newlines-between': 'always',
			},
		],
		'no-console': 'warn',
		'no-underscore-dangle': 'off',
		'class-methods-use-this': 'off',
		'no-undef': 'warn',
		'no-restricted-syntax': 'warn',
		'no-plusplus': 'off',
		'@typescript-eslint/camelcase': 'off',
		'import/extensions': 'off',
		'import/no-extraneous-dependencies': [
			'error',
			{
				devDependencies: [
					'**/__test__/*',
					'**/__mocks__/*',
					'**/jest.*.{ts,js,tsx,jsx}',
					'**/*.test.{ts,js,tsx,jsx}',
					'**/*.spec.{ts,js,tsx,jsx}',
				],
			},
		],
		'default-case': 'off',
		'no-param-reassign': 'off',
		'@typescript-eslint/ban-ts-ignore': 'warn',
		'@typescript-eslint/interface-name-prefix': 'off',
		'import/prefer-default-export': 'off',
		'prettier/prettier': 'error',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
			},
		},
	},
	globals: {
		jest: 'readonly',
	},
};
