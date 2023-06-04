import path from 'upath';
import fs from 'fs-extra';
import { loadConfig } from 'c12';
import { COMPONENT_EXCLUDE_DIRS, ROOT } from './constants.js';
import { CSS_LANG, ResolvedConfig, UserConfig } from './types.js';
import { getComponentEntry, getPkgJson } from './utils.js';

function getComponents(srcDir: string): string[] {
  const dirs = fs.readdirSync(srcDir);
  const components: string[] = [];

  for (const dir of dirs) {
    if (
      dir.startsWith('_') ||
      dir.startsWith('.') ||
      COMPONENT_EXCLUDE_DIRS.includes(dir)
    ) {
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
  const config = (
    await loadConfig<UserConfig>({
      cwd: ROOT,
      name: 'vanify',
      rcFile: false,
      defaults: {
        srcDir: 'src',
        docsDir: 'docs',
        css: { lang: 'css' },
        namedExport: true,
      },
    })
  ).config as ResolvedConfig | null;

  if (!config) {
    throw new Error('vanify config file is not found.');
  }

  const pkgJson = getPkgJson();
  const name = config.name || pkgJson?.name;

  if (!name) {
    throw new Error('`name` is required in vanify config or package.json');
  }

  const srcDir = path.resolve(ROOT, config.srcDir);
  const docsDir = path.resolve(ROOT, config.docsDir);
  const cssBaseFile = getCssBaseFile(srcDir, config.css.lang, config.css?.base);

  return {
    ...config,
    name,
    srcDir,
    docsDir,
    css: {
      ...config.css,
      base: cssBaseFile,
    },
    components: getComponents(srcDir),
  };
}

export async function defineConfig(config: UserConfig) {
  return config;
}
