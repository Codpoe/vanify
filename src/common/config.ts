import { bundleRequire } from 'bundle-require';
import path from 'upath';
import fs from 'fs-extra';
import { ROOT, VANTIFY_CONFIG_FILE } from './constants.js';
import { ResolvedConfig, UserConfig } from './types.js';
import { getComponentEntry } from './utils.js';

function getComponents(srcDir: string): string[] {
  // TEMP
  const EXCLUDES = [
    '.DS_Store',
    'common',
    'utils',
    'styles',
    'tests',
    '__tests__',
  ];
  const dirs = fs.readdirSync(srcDir);
  const components: string[] = [];

  for (const dir of dirs) {
    if (EXCLUDES.includes(dir)) {
      continue;
    }

    const componentEntry = getComponentEntry(srcDir, dir);

    if (componentEntry) {
      components.push(dir);
    }
  }

  return components;
}

export async function resolveConfig(): Promise<ResolvedConfig> {
  const config: UserConfig = await (
    await bundleRequire({ filepath: VANTIFY_CONFIG_FILE })
  ).mod?.default;

  if (!config.name) {
    throw new Error('`name` is required in vantify config');
  }

  const srcDir = config.srcDir ?? path.join(ROOT, 'src');

  return {
    namedExport: false,
    srcDir,
    docsDir: path.join(ROOT, 'docs'),
    components: getComponents(srcDir),
    ...config,
  };
}

export async function defineConfig(config: UserConfig) {
  return config;
}
