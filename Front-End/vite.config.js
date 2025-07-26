import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    optimizeDeps: {
      include: ['pdfjs-dist/build/pdf.worker.min.js'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          pdf: ['pdfjs-dist/build/pdf.worker.min.js'],
          // You can add more groupings here
        },
      },
    },
    chunkSizeWarningLimit: 1000, // (optional) increase chunk size warning
  },
});
