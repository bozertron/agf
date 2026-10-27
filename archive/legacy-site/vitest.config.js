import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Default environment for all tests
    environment: 'node',
    include: ['tests/**/*.test.{js,ts}'],
    // Snapshot directory
    snapshotDir: 'tests/__snapshots__',
    // Generous timeout for DB-dependent tests
    testTimeout: 15000,
    // Don't run tests in parallel by default (shared DB state)
    pool: 'forks',
    poolForks: { singleFork: true },
  },
});
