import fs from 'fs-extra';
import { ResolvedConfig } from '../common/types.js';
import { getDirEntryFile, getPkgJson, pascalCase } from '../common/utils.js';
import { getDepsMap } from './gen-deps-map.js';

export interface GenPackageEntryOptions {
  outputPath?: string;
}

/**
 * Generate the entry script file for package
 */
export async function genPackageEntry(
  config: ResolvedConfig,
  options?: GenPackageEntryOptions
) {
  const packageEntryFile = getDirEntryFile(config.srcDir);

  // package entry exists (user custom package entry)
  if (packageEntryFile) {
    return;
  }

  const depsMap = await getDepsMap();
  const version: string | undefined = getPkgJson()?.version;

  let code = depsMap.flattened
    .map(
      component =>
        `export ${
          config.namedExport ? '*' : `{ default as ${pascalCase(component)} }`
        } from './${component}';\n`
    )
    .join('');

  if (version) {
    code += `\nexport const version = '${version}';\n`;
  }

  if (options?.outputPath) {
    return fs.outputFile(options.outputPath, code);
  }
  return code;
}
