module.exports = {
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['node_modules', 'dist', '.eslintrc.js'],
  rules: {
    'max-len': ['error', { code: 150 }],
    'object-curly-newline': ['error', { consistent: true }],
  }
};
