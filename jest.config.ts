import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  // Optional: Add a custom global setup for the backend app
  setupFiles: ["<rootDir>/setupTests.js"], // If you need any setup files globally
  // If you want to run tests in both backend and frontend:
  roots: ["<rootDir>/apps/backend/src", "<rootDir>/apps/frontend/src"], // Adjust if needed
  testMatch: ["**/apps/backend/**/*.test.ts", "**/apps/frontend/**/*.test.ts"], // Customize test patterns
};
