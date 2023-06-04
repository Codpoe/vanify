import { createRequire } from 'module';
import path from 'upath';
import fs from 'fs-extra';
import { bundleAsync } from 'lightningcss';
import { ResolvedConfig } from '../common/types.js';
import { isCss, isLess, isScss } from '../common/utils.js';
import { ES_DIR, LIB_DIR, ROOT, TEMP_SRC_DIR } from '../common/constants.js';

const require = createRequire(import.meta.url);

async function compileLess(code: string, filePath: string): Promise<string> {
  const less = require('less');
  const { css } = await less.render(code, {
    filename: filePath,
    paths: [path.join(ROOT, 'node_modules')],
  });

  return css;
}

function findFileUrl(url: string) {
  if (url.startsWith('~')) {
    url = url.substring(1);

    if (!url.endsWith('.scss')) {
      url += '.scss';
    }

    url = require.resolve(url);
  }

  return new URL(url);
}

function compileSass(code: string, filePath: string): string {
  const sass = require('sass');
  const { css } = sass.compileString(code, {
    url: new URL(filePath),
    importer: { findFileUrl },
  });

  return css;
}

export async function compileStyle(config: ResolvedConfig, filePath: string) {
  const relativePath = path.relative(TEMP_SRC_DIR, filePath);
  const outputEsPath = path.join(ES_DIR, relativePath);
  const outputLibPath = path.join(LIB_DIR, relativePath);

  let code = await fs.readFile(filePath, 'utf-8');

  if (isLess(filePath)) {
    code = await compileLess(code, filePath);
  } else if (isScss(filePath)) {
    code = compileSass(code, filePath);
  }

  const { code: buffer } = await bundleAsync({
    targets: { chrome: 61, edge: 16, firefox: 60, safari: 11, ios_saf: 11 },
    drafts: { nesting: true, customMedia: true },
    minify: true,
    ...config.lightningcss,
    filename: filePath,
  });
  code = buffer.toString('utf-8');

  await Promise.all([
    ...(isCss(filePath)
      ? []
      : [fs.copy(filePath, outputEsPath), fs.copy(filePath, outputLibPath)]),
    fs.outputFile(path.changeExt(outputEsPath, '.css'), code),
    fs.outputFile(path.changeExt(outputLibPath, '.css'), code),
  ]);
}
