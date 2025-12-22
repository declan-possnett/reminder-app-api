import { defineConfig } from 'vite'
import path from 'path'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'node22',
    lib: {
      entry: path.resolve('src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'express',
        'pg',
        'pg-pool',
        'pgpass',
        'bcrypt',
        'jsonwebtoken',
        'crypto',
        'fs',
        'path',
        'os',
        'stream',
        'util',
        'buffer',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: 'src/index.ts',
      exportName: 'DPReminderAppApi',
      reloadAppOnFileChange: true,
    }),
  ],
  cacheDir: './.vite',
})
