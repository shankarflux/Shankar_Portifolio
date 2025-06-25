import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 'root' is not explicitly set because index.html is now in the project root.
  // Vite defaults to the current working directory as the root.

  // Configure base for GitHub Pages deployment
  // MUST match your GitHub repository name exactly
  base: '/Shankar_Portifolio/',
  build: {
    // Output directory for the build (default is 'dist')
    outDir: 'dist', // Build output will go into the 'dist' folder at the project root
    emptyOutDir: true, // Empties the output directory before building
  }
});
