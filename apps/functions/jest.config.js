module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts', '!src/**/index.ts'],
  moduleNameMapping: {
    '^@shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
    '^@config/(.*)$': '<rootDir>/../../packages/config/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
