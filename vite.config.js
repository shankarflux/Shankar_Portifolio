// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Shankar_Portifolio/', // Keep this as is for your repo name
  plugins: [react()],
  build: {
    outDir: 'docs', // <--- ADD THIS LINE! Vite will now build to ./docs
  },
});