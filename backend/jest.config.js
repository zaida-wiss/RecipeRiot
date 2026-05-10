module.exports = {
  // ts-jest gör att Jest kan köra TypeScript-testfiler direkt.
  preset: "ts-jest",
  testEnvironment: "node",
  // Kör bara filer som ligger i __tests__ och slutar med .test.ts.
  testMatch: ["**/__tests__**/*.test.ts"],
  // setup.ts startar och stänger testdatabasen runt testsviten.
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
};
