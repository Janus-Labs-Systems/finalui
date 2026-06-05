import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            '@mui/material',
            '@mui/icons-material',
          ],
          'vendor-emotion': [
            '@emotion/react',
            '@emotion/styled',
          ],
          'vendor-tabulator': [
            'tabulator-tables',
            'react-tabulator',
          ],
          'vendor-axios': [
            'axios',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
