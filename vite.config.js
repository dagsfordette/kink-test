import { defineConfig } from 'vite'

export default defineConfig({
  // React 19's automatic JSX runtime works with Vite's built-in esbuild transform;
  // the prototype does not need the React Fast Refresh plugin for production builds.
  esbuild: { jsx: 'automatic' },
  // Relative assets make the prototype work on both user.github.io and
  // user.github.io/repository-name without editing this file.
  base: './',
})
