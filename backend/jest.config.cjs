module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "<rootDir>/tests/support/jest-ts-transformer.cjs",
  },
};
