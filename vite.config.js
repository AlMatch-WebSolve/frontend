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
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
        '/ws': {
          target: env.VITE_WS_URL,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  });
};
