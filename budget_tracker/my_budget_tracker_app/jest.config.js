module.exports = {
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    watch : false,
  };
  