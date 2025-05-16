module.exports = {
  // Répertoire où Jest doit chercher les fichiers de test
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],

  // Directories to automatically mock when importing from them
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Environnement de test
  testEnvironment: "node",

  // Couverture du code
  collectCoverage: false,
  collectCoverageFrom: [
    "back/controllers/**/*.js",
    "back/models/**/*.js",
    "projects.js",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Timeouts
  testTimeout: 10000,

  // Verbose output
  verbose: true,
};
