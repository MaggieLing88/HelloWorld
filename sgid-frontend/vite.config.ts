import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Disable hashes in filenames so the S3
        // bucket in production only ever contains
        // one set of built files
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
  server: {
    host: 'localhost',
  },
})
