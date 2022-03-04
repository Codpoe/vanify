import { bundleRequire } from 'bundle-require';
import path from 'upath';
import fs from 'fs-extra';
import {
  COMPILE_EXCLUDE_DIRS,
  ROOT,
  VANTIFY_CONFIG_FILE,
} from './constants.js';
import { CSS_LANG, ResolvedConfig, UserConfig } from './types.js';
import { getComponentEntry, getPkgJson } from './utils.js';

function getComponents(srcDir: string): string[] {
  const dirs = fs.readdirSync(srcDir);
  const components: string[] = [];

  for (const dir of dirs) {
    if (COMPILE_EXCLUDE_DIRS.includes(dir)) {
      continue;
    }

    const componentEntry = getComponentEntry(srcDir, dir);

    if (componentEntry) {
      components.push(dir);
    }
  }

  return components;
}

function getCssBaseFile(srcDir: string, cssLang: CSS_LANG, base?: string) {
  const filePath = path.resolve(srcDir, base || `styles/base.${cssLang}`);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
}

export async function resolveConfig(): Promise<ResolvedConfig> {
  const config: UserConfig = await (
    await bundleRequire({ filepath: VANTIFY_CONFIG_FILE })
  ).mod?.default;

  const pkgJson = getPkgJson();
  const name = config.name || pkgJson?.name;

  if (!name) {
    throw new Error('`name` is required in vantify config or package.json');
  }

  const srcDir = path.resolve(ROOT, config.srcDir || 'src');
  const docsDir = path.resolve(ROOT, config.docsDir || 'docs');
  const cssLang = config.css?.lang || 'css';
  const cssBaseFile = getCssBaseFile(srcDir, cssLang, config.css?.base);

  return {
    namedExport: false,
    ...config,
    name,
    srcDir,
    docsDir,
    css: {
      lang: cssLang,
      base: cssBaseFile,
    },
    components: getComponents(srcDir),
  };
}

export async function defineConfig(config: UserConfig) {
  return config;
}
