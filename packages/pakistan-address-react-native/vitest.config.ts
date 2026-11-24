import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      'react-native': path.resolve(import.meta.dirname, 'test/react-native-mock.ts'),
    },
  },
});
