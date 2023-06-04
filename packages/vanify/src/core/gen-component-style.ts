import path from 'upath';
import fs from 'fs-extra';
import { TEMP_SRC_DIR } from '../common/constants.js';
import { CSS_LANG, ResolvedConfig } from '../common/types.js';
import { getDepsMap } from './gen-deps-map.js';

function getStyleContent(
  cssLang: CSS_LANG,
  deps: string[],
  hasOwnStyle: boolean
): string {
  let code = deps
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
  const { lang: cssLang } = config.css;
  const depsMap = await getDepsMap();

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
        getStyleContent('css', deps, hasOwnStyle)
      );

      // <component>/style/<cssLang>.ts
      // point to less or scss
      if (cssLang !== 'css') {
        await fs.outputFile(
          path.join(styleDir, `${cssLang}.ts`),
          getStyleContent(cssLang, deps, hasOwnStyle)
        );
      }
    })
  );
}
