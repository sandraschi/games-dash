import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        '**/*.test.js',
        '**/*.spec.js',
        'stockfish/',
        'yaneuraou/',
        'katago/',
        'data/',
        'logs/'
      ]
    },
    include: ['**/*.test.js', '**/*.spec.js'],
    exclude: ['node_modules/', 'dist/', 'coverage/']
  }
});

