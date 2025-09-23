module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/test/**/*.test.tsx"],
  testPathIgnorePatterns: ["/<rootDir>/e2e/"],
  transformIgnorePatterns: [
    "node_modules/(?!@colyseus\/|httpie)"
  ],
  moduleNameMapper: {
    "@/lib/(.*)": "<rootDir>/lib/$1",
    "@/shadcn/ui/(.*)": "<rootDir>/components/ui/$1",
    "@/pixel/components/(.*)": "<rootDir>/app/components/$1",
    "@/app/(.*)": "<rootDir>/app/$1",
    "@/components/ui/(.*)": "<rootDir>/components/ui/$1",
    "@/shared/(.*)": "<rootDir>/../shared/$1",
    '^(\.{1,2}/.*)\.js$': '$1',
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '@testing-library/jest-dom'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/*.d.ts',
    '!app/layout.tsx',
    '!app/page.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  coverageReporters: ['text', 'lcov']
};