module.exports = {
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // Prettier와 충돌하는 ESLint 규칙 비활성화
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off', // React 17+ 에서는 import React 안해도 됨
    'react/prop-types': 'off', // JavaScript 프로젝트에서는 꺼두는게 편함
  },
  settings: {
    react: {
      version: 'detect', // 설치된 리액트 버전 자동 감지
    },
  },
};