import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target:
          'http://ec2-13-125-245-114.ap-northeast-2.compute.amazonaws.com:8080',
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
