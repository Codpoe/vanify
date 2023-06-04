import path from 'upath';
import fs from 'fs-extra';
import swc, { ParserConfig } from '@swc/core';
import { ResolvedConfig } from '../common/types.js';
import { isDeclaration, isJS, isJSX } from '../common/utils.js';
import { ES_DIR, LIB_DIR, TEMP_SRC_DIR } from '../common/constants.js';

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

  const parserConfig: ParserConfig = isJS(filePath)
    ? {
        syntax: 'ecmascript',
        jsx: isJSX(filePath),
      }
    : {
        syntax: 'typescript',
        tsx: isJSX(filePath),
      };

  const { code } = await swc.transformFile(filePath, {
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
  });

  outputPath = path.changeExt(outputPath, '.js');
  await fs.outputFile(outputPath, code);
}
