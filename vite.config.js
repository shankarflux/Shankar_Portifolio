import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages.
  // This MUST match your GitHub repository name, surrounded by slashes.
  base: '/Shankar_Portifolio/',
  plugins: [react()],
  build: {
    outDir: 'docs', // <-- This tells Vite to output to a 'docs' folder
  },
});