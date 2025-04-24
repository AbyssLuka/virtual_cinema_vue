import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),glsl()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
