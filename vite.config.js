import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative assets make the prototype work on both user.github.io and
  // user.github.io/repository-name without editing this file.
  base: './',
})
