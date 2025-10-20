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
          secure: false, // HTTPS 인증서가 self-signed일 경우 필요
          rewrite: (path) => path.replace(/^\/api/, ''),
        },

        '/ws': {
          target: env.VITE_WS_URL,
          ws: true,
          changeOrigin: true,
          secure: false,
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
