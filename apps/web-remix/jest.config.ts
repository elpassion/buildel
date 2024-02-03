/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  clearMocks: true,

  coverageProvider: "v8",

  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/app/$1",
    "^~/components/(.*)$": "<rootDir>/app/components/$1",
    "^~/test-utils/(.*)$": "<rootDir>/app/test-utils/$1",
  },
};

export default config;
