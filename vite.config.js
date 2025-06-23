import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // This is CRUCIAL for GitHub Pages when your repository name is not
  // in the format 'username.github.io'.
  // It MUST be the exact name of your GitHub repository,
  // surrounded by forward slashes.
  // Your repository name: Shankar_Portifolio
  base: '/Shankar_Portifolio/',
  plugins: [react()],
});
