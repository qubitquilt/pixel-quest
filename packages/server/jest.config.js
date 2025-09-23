
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  collectCoverageFrom: [
    'index.ts',
    'rooms/**/*.ts',
    '!test/**/*.ts',
    '!**/*.test.ts',
    '!**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/shared/(.*)$': '<rootDir>/../shared/$1'
  },
  detectOpenHandles: true
};
