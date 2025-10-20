import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // mode에 따라 .env 파일 로드
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    define: {
      global: 'window',
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  });
};
