/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/app/**/*.{ts,tsx}",
    // Exclude complex pages that require full integration/browser setup
    "!src/app/blog/**",
    "!src/app/visualify/**",
    "!src/app/tools/**",
    "!src/app/[owner]/**",
    "!src/app/page.tsx",
    "!src/app/layout.tsx",
    "!src/app/auth/**",
    "!src/app/api/blog/**",
    "!src/**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
