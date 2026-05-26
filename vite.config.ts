import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  base: '/monthly-meeting/',
  plugins: [
    tailwindcss(),
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
}));
