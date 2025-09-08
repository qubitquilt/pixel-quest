/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "server",
      testEnvironment: "node",
      testMatch: ["<rootDir>/packages/server/**/*.test.ts"],
       transformIgnorePatterns: ["node_modules/(?!(@colyseus/testing|@colyseus/schema)/)"],
      setupFiles: ["<rootDir>/packages/server/jest.setup.ts"],
       transform: {
         '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/packages/server/tsconfig.json' }],
       },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/packages/$1",
        '^(\.{1,2}/.*)\.js$': '$1',
      },
    },
    {
      displayName: "client",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/packages/client/**/*.test.tsx"],
      transformIgnorePatterns: ["node_modules/(?!colyseus\\.js|@colyseus)/"],
      moduleNameMapper: {
        "^@/components/(.*)$": "<rootDir>/packages/client/app/components/$1",
        "^@/lib/(.*)$": "<rootDir>/packages/client/lib/$1",
        "^@/(.*)$": "<rootDir>/packages/$1",
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
    },
  ],
};
