import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import path from 'upath';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cliPkgPath = fileURLToPath(
  new URL('../../package.json', import.meta.url)
);
const cliPkgJson = fs.readJsonSync(cliPkgPath, 'utf-8');
export const CLI_VERSION = cliPkgJson.version;

const possibleConfigFileNames = ['.js', '.mjs', '.ts'].map(
  ext => `vantify.config${ext}`
);
export const VANTIFY_CONFIG_FILE = (function findVantifyConfigFile(
  dir: string
): string {
  for (const name of possibleConfigFileNames) {
    const configFile = path.join(dir, name);
    if (fs.pathExistsSync(configFile)) {
      return configFile;
    }
  }

  const parentDir = path.dirname(dir);
  if (dir === parentDir) {
    throw new Error('vantify config file is not found.');
  }

  return findVantifyConfigFile(parentDir);
})(process.cwd());

export const ROOT = path.dirname(VANTIFY_CONFIG_FILE);
export const ES_DIR = path.join(ROOT, 'es');
export const LIB_DIR = path.join(ROOT, 'lib');
export const DIST_DIR = path.join(ROOT, 'dist');
export const SITE_DIST_DIR = path.join(ROOT, 'site-dist');
export const TEMP_SRC_DIR = path.join(DIST_DIR, 'src');
export const DEPS_MAP_FILE = path.join(DIST_DIR, 'deps-map.json');

// config files
export const TS_CONFIG_FILE = path.join(ROOT, 'tsconfig.json');
export const TS_CONFIG_DECLARATION_FILE = path.join(
  ROOT,
  'tsconfig.declaration.json'
);
export const JEST_CONFIG_FILE = path.join(
  __dirname,
  '../../cjs/jest.config.cjs'
);

export const COMPONENT_ENTRY_EXTS = ['.js', '.ts', '.jsx', '.tsx', '.vue'];
export const SCRIPT_EXTS = ['.js', '.ts', '.jsx', '.tsx'];
export const STYLE_EXTS = ['.css', '.less', '.scss'];
export const SCRIPT_REGEXP = /\.(j|t)sx?$/;
export const JSX_REGEXP = /\.(j|t)sx$/;
export const STYLE_REGEXP = /\.(css|less|scss)$/;

export const COMPILE_EXCLUDE_DIRS = [
  '.DS_Store',
  'demos',
  'demo',
  'tests',
  'test',
  '__tests__',
];

export const COMPONENT_EXCLUDE_DIRS = COMPILE_EXCLUDE_DIRS.concat([
  'common',
  'utils',
  'styles',
  'assets',
]);
