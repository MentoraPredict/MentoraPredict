module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        types: ['jest', 'node'],
      },
    }],
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
