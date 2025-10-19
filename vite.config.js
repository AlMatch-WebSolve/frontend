import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api': {
        target:
          'http://ec2-52-78-83-137.ap-northeast-2.compute.amazonaws.com:8080',
        changeOrigin: true,
      },
      '/ws': {
        target:
          'http://ec2-52-78-83-137.ap-northeast-2.compute.amazonaws.com:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  css: {
    modules: {
      // 케밥 케이스를 카멜 케이스로 변환하도록 설정
      localsConvention: 'camelCase',
    },
  },
});
