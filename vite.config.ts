
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // গিটহাব পেজেস-এ রিলেটিভ পাথ ঠিক রাখার জন্য
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
