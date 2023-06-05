import path from 'upath';
import fs from 'fs-extra';
import swc, { ParserConfig } from '@swc/core';
import { ResolvedConfig } from '../common/types.js';
import {
  isComponentEntry,
  isDeclaration,
  isJS,
  isJSX,
} from '../common/utils.js';
import {
  ES_DIR,
  LIB_DIR,
  STYLE_IMPORT_REGEXP,
  TEMP_SRC_DIR,
} from '../common/constants.js';

export async function compileScript(
  config: ResolvedConfig,
  filePath: string,
  moduleType: 'es6' | 'commonjs'
) {
  let outputPath = path.join(
    moduleType === 'es6' ? ES_DIR : LIB_DIR,
    path.relative(TEMP_SRC_DIR, filePath)
  );

  if (isDeclaration(filePath)) {
    await fs.copy(filePath, outputPath);
    return;
  }

  let code = await fs.readFile(filePath, 'utf-8');

  if (isComponentEntry(config, filePath)) {
    code = code.replace(STYLE_IMPORT_REGEXP, '');
  }

  const parserConfig: ParserConfig = isJS(filePath)
    ? {
        syntax: 'ecmascript',
        jsx: isJSX(filePath),
      }
    : {
        syntax: 'typescript',
        tsx: isJSX(filePath),
      };

  ({ code } = await swc.transform(code, {
    ...config.swc,
    filename: filePath,
    jsc: {
      parser: parserConfig,
      target: 'es5',
      ...config.swc?.jsc,
    },
    module: {
      type: moduleType,
    },
  }));

  outputPath = path.changeExt(outputPath, '.js');
  await fs.outputFile(outputPath, code);
}
