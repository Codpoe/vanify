import path from 'upath';
import fs from 'fs-extra';
import { ResolvedConfig } from '../common/types.js';
import { getDirStyleFile } from '../common/utils.js';
import { getDepsMap } from './gen-deps-map.js';

export interface GenPackageStyleOptions {
  pathResolver?: (filePath: string) => string;
  outputPath?: string;
}

/**
 * Generate the entry style file for package
 */
export async function genPackageStyle(
  config: ResolvedConfig,
  options?: GenPackageStyleOptions
) {
  const packageStyleFile = getDirStyleFile(config.srcDir);

  // package style exists (user custom package style)
  if (packageStyleFile) {
    return;
  }

  const depsMap = await getDepsMap();
  const { lang: cssLang } = config.css;

  let code = '';

  let { base: cssBaseFile } = config.css;
  if (cssBaseFile) {
    cssBaseFile;

    if (options?.pathResolver) {
      cssBaseFile = options.pathResolver(cssBaseFile);
    }

    code += `@import '${cssBaseFile}';\n`;
  }

  code += depsMap.flattened
    .map(component => {
      let filePath = path.join(config.srcDir, component, `index.${cssLang}`);

      if (!fs.existsSync(filePath)) {
        return;
      }

      if (options?.pathResolver) {
        filePath = options.pathResolver(filePath);
      }

      return `@import '${filePath}';\n`;
    })
    .filter((x): x is string => !!x)
    .join('');

  if (options?.outputPath) {
    return fs.outputFile(options.outputPath, code);
  }
  return code;
}
