import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import path from 'upath';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cliPkgPath = fileURLToPath(
  new URL('../../package.json', import.meta.url)
);
const cliPkgJson = fs.readJsonSync(cliPkgPath, 'utf-8');
export const CLI_VERSION = cliPkgJson.version;

const possibleConfigFileNames = ['.js', '.mjs', '.cjs', '.ts'].map(
  ext => `vanify.config${ext}`
);
export const VANIFY_CONFIG_FILE = (function findVanifyConfigFile(
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
    throw new Error('vanify config file is not found.');
  }

  return findVanifyConfigFile(parentDir);
})(process.cwd());

export const ROOT = path.dirname(VANIFY_CONFIG_FILE);
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
export const RELEASE_IT_PLUGIN_FILE = path.join(
  __dirname,
  '../../config/release-it-plugin.js'
);
export const CHANGELOG_FILE = path.join(ROOT, 'CHANGELOG.md');

export const COMPONENT_ENTRY_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.vue'];
export const SCRIPT_EXTS = ['.js', '.ts', '.jsx', '.tsx'];
export const STYLE_EXTS = ['.css', '.less', '.scss'];
export const SCRIPT_REGEXP = /\.(j|t)sx?$/;
export const JSX_REGEXP = /\.(j|t)sx$/;
export const STYLE_REGEXP = /\.(css|less|scss)$/;
export const STYLE_IMPORT_REGEXP = new RegExp(
  `import\\s+('|")\\.\\/index(${STYLE_EXTS.join('|')})\\1;?`
);

export const COMPILE_EXCLUDE_DIRS = [
  '.DS_Store',
  'stories',
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
