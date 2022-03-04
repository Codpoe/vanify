import path from 'upath';
import fs from 'fs-extra';
import { kebabCase, camelCase, upperFirst } from 'lodash-es';
import {
  COMPONENT_ENTRY_EXTS,
  JSX_REGEXP,
  ROOT,
  SCRIPT_EXTS,
  SCRIPT_REGEXP,
  STYLE_EXTS,
  STYLE_REGEXP,
} from './constants.js';

export type NodeEnv = 'production' | 'development' | 'test';

export function setNodeEnv(value: NodeEnv) {
  process.env.NODE_ENV = value;
}

/**
 * Calculate duration
 */
export function startClock() {
  const start = process.hrtime.bigint();

  return () => {
    const end = process.hrtime.bigint();
    const ms = Math.ceil(Number(end - start) / 1e6);
    const s = Math.ceil(ms / 1e3);
    return ms < 1e3 ? `${ms}ms` : `${s}s`;
  };
}

/**
 * Determine if the path is a type declaration file
 */
export function isDeclaration(filePath: string) {
  return filePath.endsWith('.d.ts');
}

/**
 * Determine if the path is a script file (ends with .js .jsx .ts .tsx)
 */
export function isScript(filePath: string) {
  return SCRIPT_REGEXP.test(filePath);
}

/**
 * Determine if the path is a js file (ends with .js)
 */
export function isJS(filePath: string) {
  return filePath.endsWith('.js');
}

/**
 * Determine if the path is a jsx file (ends with .jsx)
 */
export function isJSX(filePath: string) {
  return JSX_REGEXP.test(filePath);
}

/**
 * Determine if the path is a style file (ends with .css .less .scss)
 */
export function isStyle(filePath: string) {
  return STYLE_REGEXP.test(filePath);
}

/**
 * Determine if the path is a less file
 */
export function isLess(filePath: string) {
  return filePath.endsWith('.less');
}

/**
 * Determine if the path is a scss file
 */
export function isScss(filePath: string) {
  return filePath.endsWith('.scss');
}

/**
 * Determine if the path is a css file (ends with .css)
 */
export function isCss(filePath: string) {
  return filePath.endsWith('.css');
}

/**
 * Fill path with extensions.
 * If the file doesn't exist, it will return undefined
 */
export function fillExt(filePath: string, exts: string[]): string | undefined {
  for (const ext of exts) {
    if (filePath.endsWith(ext)) {
      return filePath;
    }

    let pathWithExt = `${filePath}${ext}`;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }

    pathWithExt = `${filePath}/index${ext}`;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }
}

/**
 * Fill path with script extensions (.js .jsx .ts .tsx)
 */
export function fillScriptExts(filePath: string) {
  return fillExt(filePath, SCRIPT_EXTS);
}

export function fillComponentEntryExts(filePath: string) {
  return fillExt(filePath, COMPONENT_ENTRY_EXTS);
}

/**
 * Get the entry file of the directory.
 * If the file doesn't exist, it will return undefined
 */
export function getDirEntryFile(srcDir: string): string | undefined {
  for (const ext of SCRIPT_EXTS) {
    const filePath = path.join(srcDir, `index${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
}

/**
 * Get the style file of the directory.
 * If the file doesn't exist, it will return undefined
 */
export function getDirStyleFile(srcDir: string): string | undefined {
  for (const ext of STYLE_EXTS) {
    const filePath = path.join(srcDir, `index${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
}

/**
 * Determines whether the code has a default export
 */
export function hasDefaultExport(code: string) {
  return code.includes('export default') || code.includes('export { default }');
}

export function getComponentEntry(srcDir: string, component: string) {
  for (const ext of COMPONENT_ENTRY_EXTS) {
    const filePath = path.join(srcDir, component, `index${ext}`);
    if (
      fs.existsSync(filePath) &&
      hasDefaultExport(fs.readFileSync(filePath, 'utf-8'))
    ) {
      return filePath;
    }
  }
}

/**
 * Get the content of user package.json
 */
export function getPkgJson(): Record<string, any> | undefined {
  const pkgJson = path.join(ROOT, 'package.json');
  if (fs.existsSync(pkgJson)) {
    return fs.readJsonSync(pkgJson, 'utf-8');
  }
}

export function pascalCase(str: string): string {
  return upperFirst(camelCase(str));
}

/**
 * Transform the keys of an object to kebab case
 * @example { fooBar: 'x' } -> { 'foo-bar': 'x' }
 */
export function kebabCaseObject<T extends Record<string, any>>(
  obj: T,
  keys?: (keyof T)[]
) {
  return Object.keys(obj).reduce<Record<string, any>>((res, key) => {
    if (!keys || keys.includes(key)) {
      const newKey = kebabCase(key);
      if (newKey) {
        res[newKey] = obj[key];
      }
    } else {
      res[key] = obj[key];
    }
    return res;
  }, {});
}
