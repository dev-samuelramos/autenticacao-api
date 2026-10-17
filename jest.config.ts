import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Diz ao Jest que arquivos .ts são módulos ES (acompanha o "type": "module" do package.json)
  extensionsToTreatAsEsm: ['.ts'],

  // ts-jest precisa rodar em modo ESM explicitamente
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  // Jest não entende nativamente o campo "imports" (#config/*, #database/*...) do package.json,
  // então precisamos mapear manualmente cada alias pra pasta correspondente em src/
  moduleNameMapper: {
    '^#config/(.*)\\.js$': '<rootDir>/src/config/$1',
    '^#database/(.*)\\.js$': '<rootDir>/src/database/$1',
    '^#errors/(.*)\\.js$': '<rootDir>/src/errors/$1',
    '^#middlewares/(.*)\\.js$': '<rootDir>/src/middlewares/$1',
    '^#controllers/(.*)\\.js$': '<rootDir>/src/controllers/$1',
    '^#repositories/(.*)\\.js$': '<rootDir>/src/repositories/$1',
    '^#services/(.*)\\.js$': '<rootDir>/src/services/$1',
  },

  testMatch: ['**/tests/**/*.spec.ts'],

  clearMocks: true,
};

export default config;