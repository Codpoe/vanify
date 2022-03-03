const path = require('upath');
const fs = require('fs-extra');

const possibleConfigFileNames = ['.js', '.mjs', '.ts'].map(
  ext => `vantify.config${ext}`
);
const VANTIFY_CONFIG_FILE = (function findVantifyConfigFile(dir) {
  for (const name of possibleConfigFileNames) {
    const configFile = path.join(dir, name);
    if (fs.pathExistsSync(configFile)) {
      return configFile;
    }
  }

  const parentDir = path.dirname(dir);
  if (dir === parentDir) {
    throw new Error('vantify config file is not found');
  }

  return findVantifyConfigFile(parentDir);
})(process.cwd());

const ROOT = path.dirname(VANTIFY_CONFIG_FILE);
const JEST_FILE_MOCK_FILE = path.join(__dirname, './jest.file-mock.cjs');
const JEST_STYLE_MOCK_FILE = path.join(__dirname, './jest.style-mock.cjs');
const JEST_TRANSFORMER_FILE = path.join(__dirname, './jest.transformer.cjs');

module.exports = {
  ROOT,
  JEST_FILE_MOCK_FILE,
  JEST_STYLE_MOCK_FILE,
  JEST_TRANSFORMER_FILE,
};
