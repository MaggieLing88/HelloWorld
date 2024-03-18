import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'  
import dotenv from 'dotenv'

dotenv.config() // load env vars from .env

// https://vitejs.dev/config/
export default defineConfig(({command,mode})=>{
  const env = loadEnv(mode, process.cwd(), '');
  return {
      define: {
          'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL)
      },
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
      }
  };
  
  
})
