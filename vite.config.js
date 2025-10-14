import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // 케밥 케이스를 카멜 케이스로 변환하도록 설정
      localsConvention: 'camelCase',
    },
  },
}); 
