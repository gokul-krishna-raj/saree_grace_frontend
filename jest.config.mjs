import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  // next/jest resolves "@/*" via its SWC transform at compile time, which plain `import`
  // statements go through — but `jest.mock("@/...")` passes a raw string straight to Jest's
  // own resolver, which never sees that rewrite. Mapping it explicitly here fixes jest.mock().
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
