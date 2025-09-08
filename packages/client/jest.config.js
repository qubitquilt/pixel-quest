module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/ui/(.*)$': '<rootDir>/components/ui/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(colyseus\\.js|@colyseus/schema|@colyseus/httpie)/)',
  ],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
};