/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "server",
      testEnvironment: "node",
      testMatch: ["<rootDir>/packages/server/test/**/*.test.ts"],
      transformIgnorePatterns: ["node_modules/(?!(@colyseus/testing|@colyseus/schema)/)"],
      setupFiles: ["<rootDir>/packages/server/jest.setup.ts"],
      transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/packages/server/tsconfig.json' }],
      },
      moduleNameMapper: {
        "@/pixel/components/*": "<rootDir>/packages/client/app/components/*",
        "@/shadcn/ui/*": "<rootDir>/packages/client/components/ui/*",
        "@/lib/*": "<rootDir>/packages/client/lib/*",
        "@/shared/*": "<rootDir>/packages/shared/*",
        '^(\.{1,2}/.*)\.js$': '$1',
      },
    },
    {
      displayName: "client",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/packages/client/test/**/*.test.tsx"],
      testPathIgnorePatterns: ["/packages/client/e2e/**"],
      transformIgnorePatterns: ["node_modules/(?!colyseus\\.js|@colyseus)/"],
      moduleNameMapper: {
        "@/pixel/components/*": "<rootDir>/packages/client/app/components/*",
        "@/shadcn/ui/*": "<rootDir>/packages/client/components/ui/*",
        "@/lib/*": "<rootDir>/packages/client/lib/*",
        "@/shared/*": "<rootDir>/packages/shared/*",
        '^(\.{1,2}/.*)\.js$': '$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/packages/client/tsconfig.json', jsx: 'react-jsx' }],
      },
      setupFilesAfterEnv: ['<rootDir>/packages/client/jest.setup.ts', '@testing-library/jest-dom'],
    },
  ],
};
