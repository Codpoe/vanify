import fs from 'fs-extra';
import path from 'upath';
import { ResolvedConfig } from '../common/types.js';
import { DEPS_MAP_FILE } from '../common/constants.js';
import {
  fillScriptExts,
  getComponentEntry,
  isScript,
} from '../common/utils.js';

interface DepsMap {
  [key: string]: string[];
  flattened: string[];
}

// https://regexr.com/47jlq
const IMPORT_RE =
  /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from(\s+)?)|)(?:(?:".*?")|(?:'.*?'))[\s]*?(?:;|$|)/g;

function getImports(code: string): string[] {
  const imports = code.match(IMPORT_RE) || [];
  return imports
    .filter(x => !x.includes('import type'))
    .map(x => x.split(/['"]/)[1]);
}

function analyzeDeps(srcDir: string, filePath: string): string[] {
  const deps = getImports(fs.readFileSync(filePath, 'utf-8'))
    .map(x => {
      // not relative dependency
      if (!x.startsWith('.')) {
        return;
      }

      const importPath = path.join(filePath, '..', x);
      // not in temp src
      if (!importPath.startsWith(srcDir)) {
        return;
      }

      return path.extname(importPath) ? importPath : fillScriptExts(importPath);
    })
    .filter((n): n is string => typeof n === 'string');

  return [...new Set(deps)];
}

function extractComponentName(
  config: ResolvedConfig,
  dep: string
): string | undefined {
  const maybeComponentName = path.relative(config.srcDir, dep).split('/')[0];
  return config.components.find(name => maybeComponentName === name);
}

function collectDeps(config: ResolvedConfig, component: string): string[] {
  const deps = new Set<string>();
  const record = new Set<string>();

  function analyze(filePath: string) {
    if (record.has(filePath) || !isScript(filePath)) {
      return;
    }

    record.add(filePath);

    analyzeDeps(config.srcDir, filePath).forEach(dep => {
      // deep first
      analyze(dep);

      // if it is component dependency, add it
      const name = extractComponentName(config, dep);
      if (name && name !== component) {
        deps.add(name);
      }
    });
  }

  const componentEntry = getComponentEntry(config.srcDir, component);

  if (componentEntry) {
    analyze(componentEntry);
  }

  // uniq
  return [...deps];
}

function flattenDepsMap(depsMap: Record<string, string[]>) {
  const flattened: string[] = [];

  function add(name: string) {
    if (depsMap[name].length) {
      depsMap[name].forEach(add);
    }

    if (!flattened.includes(name)) {
      flattened.push(name);
    }
  }

  Object.keys(depsMap)
    .filter(x => x !== 'flattened')
    .forEach(add);

  return flattened;
}

export function getDepsMap(): Promise<DepsMap> {
  return fs.readJson(DEPS_MAP_FILE, 'utf-8');
}

/**
 * Generate dependency mapping between components
 */
export async function genDepsMap(config: ResolvedConfig): Promise<DepsMap> {
  const depsMap = config.components.reduce<DepsMap>(
    (res, component) => {
      res[component] = collectDeps(config, component);
      return res;
    },
    { flattened: [] }
  );

  depsMap.flattened = flattenDepsMap(depsMap);

  await fs.outputJson(DEPS_MAP_FILE, depsMap, { spaces: 2 });
  return depsMap;
}
