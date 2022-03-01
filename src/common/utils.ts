import path from 'upath';
import fs from 'fs-extra';
import {
  COMPONENT_ENTRY_EXTS,
  JSX_REGEXP,
  ROOT,
  SCRIPT_EXTS,
  SCRIPT_REGEXP,
  STYLE_REGEXP,
} from './constants.js';

export type NodeEnv = 'production' | 'development' | 'test';

export function setNodeEnv(value: NodeEnv) {
  process.env.NODE_ENV = value;
}

export function startClock() {
  const start = process.hrtime.bigint();

  return () => {
    const end = process.hrtime.bigint();
    const ms = Math.ceil(Number(end - start) / 1e6);
    const s = Math.ceil(ms / 1e3);
    return ms < 1e3 ? `${ms}ms` : `${s}s`;
  };
}

export function isDeclaration(filePath: string) {
  return filePath.endsWith('.d.ts');
}

export function isScript(filePath: string) {
  return SCRIPT_REGEXP.test(filePath);
}

export function isJS(filePath: string) {
  return filePath.endsWith('.js');
}

export function isJSX(filePath: string) {
  return JSX_REGEXP.test(filePath);
}

export function isStyle(filePath: string) {
  return STYLE_REGEXP.test(filePath);
}

export function isLess(filePath: string) {
  return filePath.endsWith('.less');
}

export function isScss(filePath: string) {
  return filePath.endsWith('.scss');
}

export function isCss(filePath: string) {
  return filePath.endsWith('.css');
}

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

export function fillScriptExts(filePath: string) {
  return fillExt(filePath, SCRIPT_EXTS);
}

export function fillComponentEntryExts(filePath: string) {
  return fillExt(filePath, COMPONENT_ENTRY_EXTS);
}

export function getPackageEntryFile(srcDir: string): string | undefined {
  for (const ext of SCRIPT_EXTS) {
    const filePath = path.join(srcDir, `index${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
}

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

export function getPkgJson(): Record<string, any> | undefined {
  const pkgJson = path.join(ROOT, 'package.json');
  if (fs.existsSync(pkgJson)) {
    return fs.readJsonSync(pkgJson, 'utf-8');
  }
}

export function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, x => '-' + x.toLowerCase());
}

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
