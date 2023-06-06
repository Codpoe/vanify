import path from 'upath';
import fs from 'fs-extra';
import { TEMP_SRC_DIR } from '../common/constants.js';
import { CSS_LANG, ResolvedConfig } from '../common/types.js';
import { getDepsMap } from './gen-deps-map.js';

function getStyleContent(
  cssLang: CSS_LANG,
  baseImport: string,
  deps: string[],
  hasOwnStyle: boolean
): string {
  let code = baseImport ? `import '../../${baseImport}';\n` : '';

  code += deps
    .map(
      dep =>
        `import '../../${dep}/style${
          cssLang === 'css' ? '' : `/${cssLang}`
        }';\n`
    )
    .join('');

  if (hasOwnStyle) {
    code += `import '../index.${cssLang}';\n`;
  }

  return code;
}

/**
 * Generate component style files based on the dependencies between components
 */
export async function genComponentStyle(config: ResolvedConfig) {
  const { lang: cssLang, base: cssBaseFile } = config.css;
  const depsMap = await getDepsMap();
  let baseImport = '';
  let compiledBaseImport = '';

  if (cssBaseFile) {
    const relativeCssBaseFile = path.relative(config.srcDir, cssBaseFile);
    baseImport = path.relative(config.srcDir, cssBaseFile);
    compiledBaseImport =
      cssLang !== 'css'
        ? path.changeExt(relativeCssBaseFile, '.css')
        : baseImport;
  }

  await Promise.all(
    config.components.map(async component => {
      const deps = depsMap[component];
      const styleDir = path.join(TEMP_SRC_DIR, component, 'style');

      const hasOwnStyle = fs.existsSync(
        path.join(TEMP_SRC_DIR, component, `index.${cssLang}`)
      );

      // <component>/style/index.ts
      // point to compiled css
      await fs.outputFile(
        path.join(styleDir, 'index.ts'),
        getStyleContent('css', compiledBaseImport, deps, hasOwnStyle)
      );

      // <component>/style/<cssLang>.ts
      // point to less or scss
      if (cssLang !== 'css') {
        await fs.outputFile(
          path.join(styleDir, `${cssLang}.ts`),
          getStyleContent(cssLang, baseImport, deps, hasOwnStyle)
        );
      }
    })
  );
}
