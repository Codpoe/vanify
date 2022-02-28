const path = require('upath');
const fs = require('fs-extra');
const {
  ROOT,
  JEST_FILE_MOCK_FILE,
  JEST_STYLE_MOCK_FILE,
  JEST_TRANSFORMER_FILE,
} = require('./constants.cjs');

const defaultJestConfig = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss)$': JEST_STYLE_MOCK_FILE,
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      JEST_FILE_MOCK_FILE,
  },
  transform: {
    '^.+\\.(t|j)sx?$': [JEST_TRANSFORMER_FILE],
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/demo/**',
    '!**/test/**',
    '!**/__tests__/**',
  ],
  coverageReporters: ['html', 'lcov', 'text-summary'],
};

const userJestConfig = (() => {
  const filePath = path.join(ROOT, 'jest.config.js');
  if (fs.existsSync(filePath)) {
    return require(filePath);
  }
  return {};
})();

module.exports = {
  ...defaultJestConfig,
  ...userJestConfig,
};
